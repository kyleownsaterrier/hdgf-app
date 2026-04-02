import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { generateClient } from 'aws-amplify/api';
import type { GraphQLResult } from '@aws-amplify/api-graphql';
import type { TableRow } from '../editable-table/editable-table.component';
import type { BagTagRow } from '../bag-tags/bag-tags.component';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

const DOUBLES_ID = 'doubles-main';
const BAGTAGS_ID = 'bagtags-main';

// ── Queries — always fetch _version so updates/deletes pass conflict check ───
const GET_DOUBLES = /* GraphQL */`
  query GetDoublesTable($id: ID!) {
    getDoublesTable(id: $id) { id rows caliPlayer _version updatedAt }
  }`;

const GET_BAGTAGS = /* GraphQL */`
  query GetBagTagsTable($id: ID!) {
    getBagTagsTable(id: $id) { id rows _version updatedAt }
  }`;

// ── Mutations ─────────────────────────────────────────────────────────────────
const CREATE_DOUBLES = /* GraphQL */`
  mutation CreateDoublesTable($input: CreateDoublesTableInput!) {
    createDoublesTable(input: $input) { id _version updatedAt }
  }`;

const UPDATE_DOUBLES = /* GraphQL */`
  mutation UpdateDoublesTable($input: UpdateDoublesTableInput!) {
    updateDoublesTable(input: $input) { id _version updatedAt }
  }`;

const CREATE_BAGTAGS = /* GraphQL */`
  mutation CreateBagTagsTable($input: CreateBagTagsTableInput!) {
    createBagTagsTable(input: $input) { id _version updatedAt }
  }`;

const UPDATE_BAGTAGS = /* GraphQL */`
  mutation UpdateBagTagsTable($input: UpdateBagTagsTableInput!) {
    updateBagTagsTable(input: $input) { id _version updatedAt }
  }`;

@Injectable({ providedIn: 'root' })
export class DataService {
  doublesSaveStatus: SaveStatus = 'idle';
  bagTagsSaveStatus: SaveStatus = 'idle';

  private client = generateClient();

  private doublesTrigger$ = new Subject<{ rows: TableRow[]; caliPlayer: string }>();
  private bagTagsTrigger$ = new Subject<BagTagRow[]>();

  constructor() {
    this.doublesTrigger$.pipe(debounceTime(800))
      .subscribe(p => this.executeSaveDoubles(p));
    this.bagTagsTrigger$.pipe(debounceTime(800))
      .subscribe(r => this.executeSaveBagTags(r));
  }

  // ── Public ──────────────────────────────────────────────────────────────────

  autoSaveDoubles(rows: TableRow[], caliPlayer: string): void {
    this.doublesSaveStatus = 'saving';
    this.doublesTrigger$.next({ rows, caliPlayer });
  }

  autoSaveBagTags(rows: BagTagRow[]): void {
    this.bagTagsSaveStatus = 'saving';
    this.bagTagsTrigger$.next(rows);
  }

  async loadDoubles(): Promise<{ rows: TableRow[]; caliPlayer: string } | null> {
    try {
      const res = await this.client.graphql({
        query: GET_DOUBLES, variables: { id: DOUBLES_ID }
      }) as GraphQLResult<any>;
      const rec = res.data?.getDoublesTable;
      if (!rec) return null;
      return {
        rows: typeof rec.rows === 'string' ? JSON.parse(rec.rows) : (rec.rows ?? []),
        caliPlayer: rec.caliPlayer ?? ''
      };
    } catch (e) {
      console.warn('[DataService] loadDoubles:', e);
      return null;
    }
  }

  async loadBagTags(): Promise<BagTagRow[] | null> {
    try {
      const res = await this.client.graphql({
        query: GET_BAGTAGS, variables: { id: BAGTAGS_ID }
      }) as GraphQLResult<any>;
      const rec = res.data?.getBagTagsTable;
      if (!rec) return null;
      return typeof rec.rows === 'string' ? JSON.parse(rec.rows) : (rec.rows ?? []);
    } catch (e) {
      console.warn('[DataService] loadBagTags:', e);
      return null;
    }
  }

  // ── Private ──────────────────────────────────────────────────────────────────

  private async executeSaveDoubles(p: { rows: TableRow[]; caliPlayer: string }): Promise<void> {
    const rowsJson = JSON.stringify(
      p.rows.map(r => ({ id: r.id, leftValue: r.leftValue, rightValue: r.rightValue }))
    );
    try {
      // Always fetch live _version immediately before writing
      const existing = await this.fetchDoubles();

      if (existing) {
        // Record exists — update with live _version to satisfy conflict check
        await this.client.graphql({
          query: UPDATE_DOUBLES,
          variables: {
            input: {
              id: DOUBLES_ID,
              rows: rowsJson,
              caliPlayer: p.caliPlayer || null,
              _version: existing._version
            }
          }
        });
      } else {
        // First save — create the record
        await this.client.graphql({
          query: CREATE_DOUBLES,
          variables: { input: { id: DOUBLES_ID, rows: rowsJson, caliPlayer: p.caliPlayer || null } }
        });
      }

      this.doublesSaveStatus = 'saved';
      setTimeout(() => { if (this.doublesSaveStatus === 'saved') this.doublesSaveStatus = 'idle'; }, 2500);
    } catch (e: any) {
      console.error('[DataService] saveDoubles:', e);
      this.doublesSaveStatus = 'error';
    }
  }

  private async executeSaveBagTags(rows: BagTagRow[]): Promise<void> {
    const rowsJson = JSON.stringify(
      rows.map(r => ({ id: r.id, value: r.value, score: r.score, tagNum: r.tagNum ?? null }))
    );
    try {
      // Always fetch live _version immediately before writing
      const existing = await this.fetchBagTags();

      if (existing) {
        await this.client.graphql({
          query: UPDATE_BAGTAGS,
          variables: {
            input: {
              id: BAGTAGS_ID,
              rows: rowsJson,
              _version: existing._version
            }
          }
        });
      } else {
        await this.client.graphql({
          query: CREATE_BAGTAGS,
          variables: { input: { id: BAGTAGS_ID, rows: rowsJson } }
        });
      }

      this.bagTagsSaveStatus = 'saved';
      setTimeout(() => { if (this.bagTagsSaveStatus === 'saved') this.bagTagsSaveStatus = 'idle'; }, 2500);
    } catch (e: any) {
      console.error('[DataService] saveBagTags:', e);
      this.bagTagsSaveStatus = 'error';
    }
  }

  // Fetch just the id + _version for conflict resolution
  private async fetchDoubles(): Promise<{ _version: number } | null> {
    try {
      const res = await this.client.graphql({
        query: GET_DOUBLES, variables: { id: DOUBLES_ID }
      }) as GraphQLResult<any>;
      const rec = res.data?.getDoublesTable;
      return rec ? { _version: rec._version } : null;
    } catch {
      return null;
    }
  }

  private async fetchBagTags(): Promise<{ _version: number } | null> {
    try {
      const res = await this.client.graphql({
        query: GET_BAGTAGS, variables: { id: BAGTAGS_ID }
      }) as GraphQLResult<any>;
      const rec = res.data?.getBagTagsTable;
      return rec ? { _version: rec._version } : null;
    } catch {
      return null;
    }
  }
}
