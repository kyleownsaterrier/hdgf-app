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

// Amplify @model auto-generates createXxx / updateXxx / getXxx mutations & queries.
const CREATE_DOUBLES = /* GraphQL */`
  mutation CreateDoublesTable($input: CreateDoublesTableInput!) {
    createDoublesTable(input: $input) { id updatedAt }
  }`;

const UPDATE_DOUBLES = /* GraphQL */`
  mutation UpdateDoublesTable($input: UpdateDoublesTableInput!) {
    updateDoublesTable(input: $input) { id updatedAt }
  }`;

const GET_DOUBLES = /* GraphQL */`
  query GetDoublesTable($id: ID!) {
    getDoublesTable(id: $id) { id rows caliPlayer updatedAt }
  }`;

const CREATE_BAGTAGS = /* GraphQL */`
  mutation CreateBagTagsTable($input: CreateBagTagsTableInput!) {
    createBagTagsTable(input: $input) { id updatedAt }
  }`;

const UPDATE_BAGTAGS = /* GraphQL */`
  mutation UpdateBagTagsTable($input: UpdateBagTagsTableInput!) {
    updateBagTagsTable(input: $input) { id updatedAt }
  }`;

const GET_BAGTAGS = /* GraphQL */`
  query GetBagTagsTable($id: ID!) {
    getBagTagsTable(id: $id) { id rows updatedAt }
  }`;

const DELETE_DOUBLES = /* GraphQL */`
  mutation DeleteDoublesTable($input: DeleteDoublesTableInput!) {
    deleteDoublesTable(input: $input) { id }
  }`;

const DELETE_BAGTAGS = /* GraphQL */`
  mutation DeleteBagTagsTable($input: DeleteBagTagsTableInput!) {
    deleteBagTagsTable(input: $input) { id }
  }`;

@Injectable({ providedIn: 'root' })
export class DataService {
  doublesSaveStatus: SaveStatus = 'idle';
  bagTagsSaveStatus: SaveStatus = 'idle';

  private client = generateClient();
  private doublesExists = false;
  private bagTagsExists = false;

  private doublesTrigger$ = new Subject<{ rows: TableRow[]; caliPlayer: string }>();
  private bagTagsTrigger$ = new Subject<BagTagRow[]>();

  constructor() {
    this.doublesTrigger$.pipe(debounceTime(800))
      .subscribe(p => this.executeSaveDoubles(p));
    this.bagTagsTrigger$.pipe(debounceTime(800))
      .subscribe(r => this.executeSaveBagTags(r));
  }

  // ── Public ─────────────────────────────────────────────────────────────────

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
      this.doublesExists = true;
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
      this.bagTagsExists = true;
      return typeof rec.rows === 'string' ? JSON.parse(rec.rows) : (rec.rows ?? []);
    } catch (e) {
      console.warn('[DataService] loadBagTags:', e);
      return null;
    }
  }

  // ── Private ─────────────────────────────────────────────────────────────────

  private async executeSaveDoubles(p: { rows: TableRow[]; caliPlayer: string }): Promise<void> {
    const input = {
      id: DOUBLES_ID,
      rows: JSON.stringify(p.rows.map(r => ({ id: r.id, leftValue: r.leftValue, rightValue: r.rightValue }))),
      caliPlayer: p.caliPlayer || null
    };
    try {
      // 1. Delete the existing record to fully clear it
      if (this.doublesExists) {
        await this.client.graphql({ query: DELETE_DOUBLES, variables: { input: { id: DOUBLES_ID } } });
      }
      // 2. Re-create with current data
      await this.client.graphql({ query: CREATE_DOUBLES, variables: { input } });
      this.doublesExists = true;
      this.doublesSaveStatus = 'saved';
      setTimeout(() => { if (this.doublesSaveStatus === 'saved') this.doublesSaveStatus = 'idle'; }, 2500);
    } catch (e: any) {
      console.error('[DataService] saveDoubles:', e);
      this.doublesSaveStatus = 'error';
    }
  }

  private async executeSaveBagTags(rows: BagTagRow[]): Promise<void> {
    const input = {
      id: BAGTAGS_ID,
      rows: JSON.stringify(rows.map(r => ({ id: r.id, value: r.value, score: r.score, tagNum: r.tagNum ?? null })))
    };
    try {
      // 1. Delete the existing record to fully clear it
      if (this.bagTagsExists) {
        await this.client.graphql({ query: DELETE_BAGTAGS, variables: { input: { id: BAGTAGS_ID } } });
      }
      // 2. Re-create with current data
      await this.client.graphql({ query: CREATE_BAGTAGS, variables: { input } });
      this.bagTagsExists = true;
      this.bagTagsSaveStatus = 'saved';
      setTimeout(() => { if (this.bagTagsSaveStatus === 'saved') this.bagTagsSaveStatus = 'idle'; }, 2500);
    } catch (e: any) {
      console.error('[DataService] saveBagTags:', e);
      this.bagTagsSaveStatus = 'error';
    }
  }

  private isConditionalError(e: any): boolean {
    return JSON.stringify(e).includes('ConditionalCheckFailedException');
  }
}
