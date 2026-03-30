import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { generateClient } from 'aws-amplify/api';
import type { GraphQLResult } from '@aws-amplify/api-graphql';
import { TableRow } from '../editable-table/editable-table.component';
import { BagTagRow } from '../bag-tags/bag-tags.component';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

// ── Fixed record IDs — one record per table ─────────────────────────────────
const DOUBLES_ID  = 'doubles-main';
const BAGTAGS_ID  = 'bagtags-main';

// ── GraphQL strings ──────────────────────────────────────────────────────────
const SAVE_DOUBLES = /* GraphQL */ `
  mutation SaveDoubles($id: ID!, $rows: AWSJSON!, $caliPlayer: String) {
    saveDoubles(id: $id, rows: $rows, caliPlayer: $caliPlayer) {
      id updatedAt
    }
  }
`;

const GET_DOUBLES = /* GraphQL */ `
  query GetDoubles($id: ID!) {
    getDoubles(id: $id) {
      id rows caliPlayer updatedAt
    }
  }
`;

const SAVE_BAGTAGS = /* GraphQL */ `
  mutation SaveBagTags($id: ID!, $rows: AWSJSON!) {
    saveBagTags(id: $id, rows: $rows) {
      id updatedAt
    }
  }
`;

const GET_BAGTAGS = /* GraphQL */ `
  query GetBagTags($id: ID!) {
    getBagTags(id: $id) {
      id rows updatedAt
    }
  }
`;

@Injectable({ providedIn: 'root' })
export class DataService {

  doublesSaveStatus: SaveStatus = 'idle';
  bagTagsSaveStatus: SaveStatus = 'idle';

  private client = generateClient();

  private doublesTrigger$ = new Subject<{ rows: TableRow[]; caliPlayer: string }>();
  private bagTagsTrigger$ = new Subject<BagTagRow[]>();

  constructor() {
    console.debug('[DataService] Amplify GraphQL client initialized:', this.client);
    this.doublesTrigger$
      .pipe(debounceTime(800))
      .subscribe(payload => this.executeSaveDoubles(payload));

    this.bagTagsTrigger$
      .pipe(debounceTime(800))
      .subscribe(rows => this.executeSaveBagTags(rows));
  }

  // ── Public API ─────────────────────────────────────────────────────────────

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
      const result = await this.client.graphql({
        query: GET_DOUBLES,
        variables: { id: DOUBLES_ID }
      }) as GraphQLResult<any>;

      const table = result.data?.getDoubles;
      if (!table) return null;

      // rows is stored as AWSJSON string — parse it
      const rows: TableRow[] = typeof table.rows === 'string'
        ? JSON.parse(table.rows)
        : table.rows ?? [];

      return { rows, caliPlayer: table.caliPlayer ?? '' };
    } catch (e) {
      console.warn('[DataService] loadDoubles failed:', e);
      return null;
    }
  }

  async loadBagTags(): Promise<BagTagRow[] | null> {
    try {
      const result = await this.client.graphql({
        query: GET_BAGTAGS,
        variables: { id: BAGTAGS_ID }
      }) as GraphQLResult<any>;

      const table = result.data?.getBagTags;
      if (!table) return null;

      const rows: BagTagRow[] = typeof table.rows === 'string'
        ? JSON.parse(table.rows)
        : table.rows ?? [];

      return rows;
    } catch (e) {
      console.warn('[DataService] loadBagTags failed:', e);
      return null;
    }
  }

  // ── Private ────────────────────────────────────────────────────────────────

  private async executeSaveDoubles(payload: { rows: TableRow[]; caliPlayer: string }): Promise<void> {
    try {
      await this.client.graphql({
        query: SAVE_DOUBLES,
        variables: {
          id: DOUBLES_ID,
          // Serialize rows array as JSON string (AWSJSON scalar)
          rows: JSON.stringify(payload.rows.map(r => ({
            id: r.id,
            leftValue: r.leftValue,
            rightValue: r.rightValue
          }))),
          caliPlayer: payload.caliPlayer || null
        }
      });
      this.doublesSaveStatus = 'saved';
      setTimeout(() => { if (this.doublesSaveStatus === 'saved') this.doublesSaveStatus = 'idle'; }, 2500);
    } catch (e) {
      console.error('[DataService] saveDoubles failed:', e);
      this.doublesSaveStatus = 'error';
    }
  }

  private async executeSaveBagTags(rows: BagTagRow[]): Promise<void> {
    try {
      await this.client.graphql({
        query: SAVE_BAGTAGS,
        variables: {
          id: BAGTAGS_ID,
          rows: JSON.stringify(rows.map(r => ({
            id: r.id,
            value: r.value,
            score: r.score,
            tagNum: r.tagNum ?? null
          })))
        }
      });
      this.bagTagsSaveStatus = 'saved';
      setTimeout(() => { if (this.bagTagsSaveStatus === 'saved') this.bagTagsSaveStatus = 'idle'; }, 2500);
    } catch (e) {
      console.error('[DataService] saveBagTags failed:', e);
      this.bagTagsSaveStatus = 'error';
    }
  }
}
