import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { TableRow } from '../editable-table/editable-table.component';
import { BagTagRow } from '../bag-tags/bag-tags.component';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

// ── GraphQL mutation strings ────────────────────────────────────────────────
const SAVE_DOUBLES = `
  mutation SaveDoublesTable($id: ID!, $rows: [DoublesRowInput!]!, $caliPlayer: String) {
    saveDoublesTable(id: $id, rows: $rows, caliPlayer: $caliPlayer) {
      id
      updatedAt
    }
  }
`;

const SAVE_BAG_TAGS = `
  mutation SaveBagTagsTable($id: ID!, $rows: [BagTagRowInput!]!) {
    saveBagTagsTable(id: $id, rows: $rows) {
      id
      updatedAt
    }
  }
`;

const GET_DOUBLES = `
  query GetDoublesTable($id: ID!) {
    getDoublesTable(id: $id) {
      id
      caliPlayer
      rows { id leftValue rightValue }
      updatedAt
    }
  }
`;

const GET_BAG_TAGS = `
  query GetBagTagsTable($id: ID!) {
    getBagTagsTable(id: $id) {
      id
      rows { id value score tagNum }
      updatedAt
    }
  }
`;

@Injectable({ providedIn: 'root' })
export class DataService {

  // Save status observables for UI
  doublesSaveStatus: SaveStatus = 'idle';
  bagTagsSaveStatus: SaveStatus = 'idle';

  // Debounce triggers
  private doublesTrigger$ = new Subject<{ rows: TableRow[]; caliPlayer: string }>();
  private bagTagsTrigger$ = new Subject<BagTagRow[]>();

  constructor() {
    // Doubles: debounce 800ms then save
    this.doublesTrigger$
      .pipe(debounceTime(800))
      .subscribe(payload => this.executeSaveDoubles(payload));

    // Bag Tags: debounce 800ms then save
    this.bagTagsTrigger$
      .pipe(debounceTime(800))
      .subscribe(rows => this.executeSaveBagTags(rows));
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  /** Queue a debounced save for the Doubles table */
  autoSaveDoubles(rows: TableRow[], caliPlayer: string): void {
    this.doublesSaveStatus = 'saving';
    this.doublesTrigger$.next({ rows, caliPlayer });
  }

  /** Queue a debounced save for the Bag Tags table */
  autoSaveBagTags(rows: BagTagRow[]): void {
    this.bagTagsSaveStatus = 'saving';
    this.bagTagsTrigger$.next(rows);
  }

  /** Load the Doubles table from AppSync on startup */
  async loadDoubles(): Promise<{ rows: TableRow[]; caliPlayer: string } | null> {
    try {
      const data = await this.gql(GET_DOUBLES, {
        id: environment.appSync.doublesTableId
      });
      const table = data?.getDoublesTable;
      if (!table) return null;
      return {
        rows: table.rows,
        caliPlayer: table.caliPlayer ?? ''
      };
    } catch (e) {
      console.warn('Could not load Doubles table:', e);
      return null;
    }
  }

  /** Load the Bag Tags table from AppSync on startup */
  async loadBagTags(): Promise<BagTagRow[] | null> {
    try {
      const data = await this.gql(GET_BAG_TAGS, {
        id: environment.appSync.bagTagsTableId
      });
      return data?.getBagTagsTable?.rows ?? null;
    } catch (e) {
      console.warn('Could not load Bag Tags table:', e);
      return null;
    }
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private async executeSaveDoubles(payload: { rows: TableRow[]; caliPlayer: string }): Promise<void> {
    try {
      await this.gql(SAVE_DOUBLES, {
        id: environment.appSync.doublesTableId,
        rows: payload.rows.map(r => ({
          id: r.id,
          leftValue: r.leftValue,
          rightValue: r.rightValue
        })),
        caliPlayer: payload.caliPlayer || null
      });
      this.doublesSaveStatus = 'saved';
      setTimeout(() => { if (this.doublesSaveStatus === 'saved') this.doublesSaveStatus = 'idle'; }, 2500);
    } catch (e) {
      console.error('Failed to save Doubles table:', e);
      this.doublesSaveStatus = 'error';
    }
  }

  private async executeSaveBagTags(rows: BagTagRow[]): Promise<void> {
    try {
      await this.gql(SAVE_BAG_TAGS, {
        id: environment.appSync.bagTagsTableId,
        rows: rows.map(r => ({
          id: r.id,
          value: r.value,
          score: r.score,
          tagNum: r.tagNum ?? null
        }))
      });
      this.bagTagsSaveStatus = 'saved';
      setTimeout(() => { if (this.bagTagsSaveStatus === 'saved') this.bagTagsSaveStatus = 'idle'; }, 2500);
    } catch (e) {
      console.error('Failed to save Bag Tags table:', e);
      this.bagTagsSaveStatus = 'error';
    }
  }

  /** Raw GraphQL fetch against AppSync */
  private async gql(query: string, variables: Record<string, unknown> = {}): Promise<any> {
    const res = await fetch(environment.appSync.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': environment.appSync.apiKey
      },
      body: JSON.stringify({ query, variables })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json.errors?.length) throw new Error(json.errors[0].message);
    return json.data;
  }
}
