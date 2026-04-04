import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { generateClient } from 'aws-amplify/api';
import type { GraphQLResult } from '@aws-amplify/api-graphql';
import type { TableRow } from '../editable-table/editable-table.component';
import type { BagTagRow } from '../bag-tags/bag-tags.component';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface LeaderboardEntry {
  id: string;         // playerName.toLowerCase() — stable upsert key
  playerName: string;
  tagNum: number;
  lastPlayed: string; // ISO date string YYYY-MM-DD
  _version?: number;
}

const DOUBLES_ID = 'doubles-main';
const BAGTAGS_ID = 'bagtags-main';

// ── Doubles / BagTags queries ─────────────────────────────────────────────────
const GET_DOUBLES = /* GraphQL */`
  query GetDoublesTable($id: ID!) {
    getDoublesTable(id: $id) { id rows caliPlayer _version updatedAt }
  }`;
const CREATE_DOUBLES = /* GraphQL */`
  mutation CreateDoublesTable($input: CreateDoublesTableInput!) {
    createDoublesTable(input: $input) { id _version updatedAt }
  }`;
const UPDATE_DOUBLES = /* GraphQL */`
  mutation UpdateDoublesTable($input: UpdateDoublesTableInput!) {
    updateDoublesTable(input: $input) { id _version updatedAt }
  }`;

const GET_BAGTAGS = /* GraphQL */`
  query GetBagTagsTable($id: ID!) {
    getBagTagsTable(id: $id) { id rows _version updatedAt }
  }`;
const CREATE_BAGTAGS = /* GraphQL */`
  mutation CreateBagTagsTable($input: CreateBagTagsTableInput!) {
    createBagTagsTable(input: $input) { id _version updatedAt }
  }`;
const UPDATE_BAGTAGS = /* GraphQL */`
  mutation UpdateBagTagsTable($input: UpdateBagTagsTableInput!) {
    updateBagTagsTable(input: $input) { id _version updatedAt }
  }`;

// ── Leaderboard queries ───────────────────────────────────────────────────────
const LIST_LEADERBOARD = /* GraphQL */`
  query ListLeaderboardEntries {
    listLeaderboardEntries(limit: 500) {
      items { id playerName tagNum lastPlayed _version _deleted }
    }
  }`;
const GET_LEADERBOARD_ENTRY = /* GraphQL */`
  query GetLeaderboardEntry($id: ID!) {
    getLeaderboardEntry(id: $id) { id playerName tagNum lastPlayed _version }
  }`;
const CREATE_LEADERBOARD_ENTRY = /* GraphQL */`
  mutation CreateLeaderboardEntry($input: CreateLeaderboardEntryInput!) {
    createLeaderboardEntry(input: $input) { id playerName tagNum lastPlayed _version }
  }`;
const UPDATE_LEADERBOARD_ENTRY = /* GraphQL */`
  mutation UpdateLeaderboardEntry($input: UpdateLeaderboardEntryInput!) {
    updateLeaderboardEntry(input: $input) { id playerName tagNum lastPlayed _version }
  }`;

const DELETE_LEADERBOARD_ENTRY = /* GraphQL */`
  mutation DeleteLeaderboardEntry($input: DeleteLeaderboardEntryInput!) {
    deleteLeaderboardEntry(input: $input) { id _version }
  }`;

@Injectable({ providedIn: 'root' })
export class DataService {
  doublesSaveStatus: SaveStatus = 'idle';
  bagTagsSaveStatus: SaveStatus = 'idle';

  private client = generateClient();
  private doublesTrigger$ = new Subject<{ rows: TableRow[]; caliPlayer: string }>();
  private bagTagsTrigger$ = new Subject<BagTagRow[]>();

  constructor() {
    this.doublesTrigger$.pipe(debounceTime(800)).subscribe(p => this.executeSaveDoubles(p));
    this.bagTagsTrigger$.pipe(debounceTime(800)).subscribe(r => this.executeSaveBagTags(r));
  }

  // ── Doubles ──────────────────────────────────────────────────────────────────

  autoSaveDoubles(rows: TableRow[], caliPlayer: string): void {
    this.doublesSaveStatus = 'saving';
    this.doublesTrigger$.next({ rows, caliPlayer });
  }

  async loadDoubles(): Promise<{ rows: TableRow[]; caliPlayer: string } | null> {
    try {
      const res = await this.client.graphql({ query: GET_DOUBLES, variables: { id: DOUBLES_ID } }) as GraphQLResult<any>;
      const rec = res.data?.getDoublesTable;
      if (!rec) return null;
      return {
        rows: typeof rec.rows === 'string' ? JSON.parse(rec.rows) : (rec.rows ?? []),
        caliPlayer: rec.caliPlayer ?? ''
      };
    } catch (e) { console.warn('[DataService] loadDoubles:', e); return null; }
  }

  // ── BagTags ──────────────────────────────────────────────────────────────────

  autoSaveBagTags(rows: BagTagRow[]): void {
    this.bagTagsSaveStatus = 'saving';
    this.bagTagsTrigger$.next(rows);
  }

  async loadBagTags(): Promise<BagTagRow[] | null> {
    try {
      const res = await this.client.graphql({ query: GET_BAGTAGS, variables: { id: BAGTAGS_ID } }) as GraphQLResult<any>;
      const rec = res.data?.getBagTagsTable;
      if (!rec) return null;
      return typeof rec.rows === 'string' ? JSON.parse(rec.rows) : (rec.rows ?? []);
    } catch (e) { console.warn('[DataService] loadBagTags:', e); return null; }
  }

  // ── Leaderboard ───────────────────────────────────────────────────────────────

  /** Fetch all non-deleted leaderboard entries, sorted by tagNum asc */
  async loadLeaderboard(): Promise<LeaderboardEntry[]> {
    try {
      const res = await this.client.graphql({ query: LIST_LEADERBOARD }) as GraphQLResult<any>;
      const items: LeaderboardEntry[] = (res.data?.listLeaderboardEntries?.items ?? [])
        .filter((e: any) => !e._deleted);
      return items.sort((a, b) => a.tagNum - b.tagNum);
    } catch (e) { console.warn('[DataService] loadLeaderboard:', e); return []; }
  }

  /**
   * Upsert leaderboard entries for a set of assignment results.
   * id = playerName.toLowerCase() so the same player is always updated, not duplicated.
   */
  async updateLeaderboard(
    assignments: Array<{ playerName: string; tagNum: number }>,
    date: string
  ): Promise<void> {
    for (const a of assignments) {
      const id = a.playerName.trim().toLowerCase();
      if (!id) continue;
      try {
        // Try to get existing entry for its _version
        const existing = await this.getLeaderboardEntry(id);
        if (existing) {
          await this.client.graphql({
            query: UPDATE_LEADERBOARD_ENTRY,
            variables: {
              input: { id, playerName: a.playerName.trim(), tagNum: a.tagNum, lastPlayed: date, _version: existing._version }
            }
          });
        } else {
          await this.client.graphql({
            query: CREATE_LEADERBOARD_ENTRY,
            variables: {
              input: { id, playerName: a.playerName.trim(), tagNum: a.tagNum, lastPlayed: date }
            }
          });
        }
      } catch (e) { console.error('[DataService] updateLeaderboard entry failed:', e); }
    }
  }

  /** Search leaderboard entries whose name contains the query (case-insensitive) */
  async searchLeaderboardNames(query: string): Promise<LeaderboardEntry[]> {
    if (!query.trim()) return [];
    try {
      const all = await this.loadLeaderboard();
      const q = query.toLowerCase();
      return all
        .filter(e => e.playerName.toLowerCase().includes(q))
        .slice(0, 6);
    } catch { return []; }
  }

  /** Create or update a single leaderboard entry */
  async upsertLeaderboardEntry(entry: { playerName: string; tagNum: number; lastPlayed: string }): Promise<LeaderboardEntry | null> {
    const id = entry.playerName.trim().toLowerCase();
    if (!id) return null;
    try {
      const existing = await this.getLeaderboardEntry(id);
      if (existing) {
        const res = await this.client.graphql({
          query: UPDATE_LEADERBOARD_ENTRY,
          variables: { input: { id, playerName: entry.playerName.trim(), tagNum: entry.tagNum, lastPlayed: entry.lastPlayed, _version: existing._version } }
        }) as GraphQLResult<any>;
        return res.data?.updateLeaderboardEntry ?? null;
      } else {
        const res = await this.client.graphql({
          query: CREATE_LEADERBOARD_ENTRY,
          variables: { input: { id, playerName: entry.playerName.trim(), tagNum: entry.tagNum, lastPlayed: entry.lastPlayed } }
        }) as GraphQLResult<any>;
        return res.data?.createLeaderboardEntry ?? null;
      }
    } catch (e) { console.error('[DataService] upsertLeaderboardEntry:', e); return null; }
  }

  /** Delete a leaderboard entry by id */
  async deleteLeaderboardEntry(id: string): Promise<boolean> {
    try {
      const existing = await this.getLeaderboardEntry(id);
      if (!existing) return true; // already gone
      await this.client.graphql({
        query: DELETE_LEADERBOARD_ENTRY,
        variables: { input: { id, _version: existing._version } }
      });
      return true;
    } catch (e) { console.error('[DataService] deleteLeaderboardEntry:', e); return false; }
  }

  private async getLeaderboardEntry(id: string): Promise<LeaderboardEntry | null> {
    try {
      const res = await this.client.graphql({ query: GET_LEADERBOARD_ENTRY, variables: { id } }) as GraphQLResult<any>;
      return res.data?.getLeaderboardEntry ?? null;
    } catch { return null; }
  }

  // ── Private save executors ────────────────────────────────────────────────────

  private async executeSaveDoubles(p: { rows: TableRow[]; caliPlayer: string }): Promise<void> {
    const rowsJson = JSON.stringify(p.rows.map(r => ({ id: r.id, leftValue: r.leftValue, rightValue: r.rightValue })));
    try {
      const existing = await this.fetchVersion(GET_DOUBLES, DOUBLES_ID, 'getDoublesTable');
      if (existing !== null) {
        await this.client.graphql({ query: UPDATE_DOUBLES, variables: { input: { id: DOUBLES_ID, rows: rowsJson, caliPlayer: p.caliPlayer || null, _version: existing } } });
      } else {
        await this.client.graphql({ query: CREATE_DOUBLES, variables: { input: { id: DOUBLES_ID, rows: rowsJson, caliPlayer: p.caliPlayer || null } } });
      }
      this.doublesSaveStatus = 'saved';
      setTimeout(() => { if (this.doublesSaveStatus === 'saved') this.doublesSaveStatus = 'idle'; }, 2500);
    } catch (e) { console.error('[DataService] saveDoubles:', e); this.doublesSaveStatus = 'error'; }
  }

  private async executeSaveBagTags(rows: BagTagRow[]): Promise<void> {
    const rowsJson = JSON.stringify(rows.map(r => ({ id: r.id, value: r.value, score: r.score, tagNum: r.tagNum ?? null })));
    try {
      const existing = await this.fetchVersion(GET_BAGTAGS, BAGTAGS_ID, 'getBagTagsTable');
      if (existing !== null) {
        await this.client.graphql({ query: UPDATE_BAGTAGS, variables: { input: { id: BAGTAGS_ID, rows: rowsJson, _version: existing } } });
      } else {
        await this.client.graphql({ query: CREATE_BAGTAGS, variables: { input: { id: BAGTAGS_ID, rows: rowsJson } } });
      }
      this.bagTagsSaveStatus = 'saved';
      setTimeout(() => { if (this.bagTagsSaveStatus === 'saved') this.bagTagsSaveStatus = 'idle'; }, 2500);
    } catch (e) { console.error('[DataService] saveBagTags:', e); this.bagTagsSaveStatus = 'error'; }
  }

  private async fetchVersion(query: string, id: string, key: string): Promise<number | null> {
    try {
      const res = await this.client.graphql({ query, variables: { id } }) as GraphQLResult<any>;
      return res.data?.[key]?._version ?? null;
    } catch { return null; }
  }
}
