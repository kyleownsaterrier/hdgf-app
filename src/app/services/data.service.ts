import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { generateClient } from 'aws-amplify/api';
import type { GraphQLResult } from '@aws-amplify/api-graphql';
import type { TableRow } from '../doubles/doubles.component';
import type { BagTagRow } from '../bag-tags/bag-tags.component';
import type { League } from './league.service';
import { LEAGUES } from './league.service';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface LeaderboardEntry {
  id: string;
  playerName: string;
  tagNum: number;
  lastPlayed: string;
  _version?: number;
}

const DOUBLES_ID = 'doubles-main';

// ── GraphQL strings ───────────────────────────────────────────────────────────
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

const LIST_LEADERBOARD = /* GraphQL */`
  query ListLeaderboardEntries($filter: ModelLeaderboardEntryFilterInput) {
    listLeaderboardEntries(filter: $filter, limit: 500) {
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
  private bagTagsTrigger$ = new Subject<{ rows: BagTagRow[]; league: League }>();

  constructor() {
    this.doublesTrigger$.pipe(debounceTime(800)).subscribe(p => this.executeSaveDoubles(p));
    this.bagTagsTrigger$.pipe(debounceTime(800)).subscribe(p => this.executeSaveBagTags(p));
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

  // ── BagTags (league-aware) ────────────────────────────────────────────────────

  autoSaveBagTags(rows: BagTagRow[], league: League): void {
    this.bagTagsSaveStatus = 'saving';
    this.bagTagsTrigger$.next({ rows, league });
  }

  async loadBagTags(league: League): Promise<BagTagRow[] | null> {
    const id = LEAGUES[league].bagTagsId;
    try {
      const res = await this.client.graphql({ query: GET_BAGTAGS, variables: { id } }) as GraphQLResult<any>;
      const rec = res.data?.getBagTagsTable;
      if (!rec) return null;
      return typeof rec.rows === 'string' ? JSON.parse(rec.rows) : (rec.rows ?? []);
    } catch (e) { console.warn('[DataService] loadBagTags:', e); return null; }
  }

  // ── Leaderboard (league-aware) ────────────────────────────────────────────────

  /** Load all entries for the given league (filtered by id prefix) */
  async loadLeaderboard(league: League): Promise<LeaderboardEntry[]> {
    const prefix = LEAGUES[league].leaderboardPrefix;
    try {
      // Filter server-side using the id prefix
      const res = await this.client.graphql({
        query: LIST_LEADERBOARD,
        variables: { filter: { id: { beginsWith: prefix } } }
      }) as GraphQLResult<any>;
      const items: LeaderboardEntry[] = (res.data?.listLeaderboardEntries?.items ?? [])
        .filter((e: any) => !e._deleted);
      return items.sort((a, b) => a.tagNum - b.tagNum);
    } catch (e) { console.warn('[DataService] loadLeaderboard:', e); return []; }
  }

  /** Search names within a specific league */
  async searchLeaderboardNames(query: string, league: League): Promise<LeaderboardEntry[]> {
    if (!query.trim()) return [];
    try {
      const all = await this.loadLeaderboard(league);
      const q = query.toLowerCase();
      return all.filter(e => e.playerName.toLowerCase().includes(q)).slice(0, 6);
    } catch { return []; }
  }

  /** Update leaderboard entries for a specific league */
  async updateLeaderboard(
    assignments: Array<{ playerName: string; tagNum: number }>,
    date: string,
    league: League
  ): Promise<void> {
    const prefix = LEAGUES[league].leaderboardPrefix;
    for (const a of assignments) {
      const id = prefix + a.playerName.trim().toLowerCase();
      if (!id) continue;
      try {
        const existing = await this.getLeaderboardEntry(id);
        if (existing) {
          await this.client.graphql({
            query: UPDATE_LEADERBOARD_ENTRY,
            variables: { input: { id, playerName: a.playerName.trim(), tagNum: a.tagNum, lastPlayed: date, _version: existing._version } }
          });
        } else {
          await this.client.graphql({
            query: CREATE_LEADERBOARD_ENTRY,
            variables: { input: { id, playerName: a.playerName.trim(), tagNum: a.tagNum, lastPlayed: date } }
          });
        }
      } catch (e) { console.error('[DataService] updateLeaderboard entry failed:', e); }
    }
  }

  /** Create or update a single leaderboard entry for a specific league */
  async upsertLeaderboardEntry(
    entry: { playerName: string; tagNum: number; lastPlayed: string },
    league: League
  ): Promise<LeaderboardEntry | null> {
    const prefix = LEAGUES[league].leaderboardPrefix;
    const id = prefix + entry.playerName.trim().toLowerCase();
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

  /** Delete a leaderboard entry by full id */
  async deleteLeaderboardEntry(id: string): Promise<boolean> {
    try {
      const existing = await this.getLeaderboardEntry(id);
      if (!existing) return true;
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
      const v = await this.fetchVersion(GET_DOUBLES, DOUBLES_ID, 'getDoublesTable');
      if (v !== null) {
        await this.client.graphql({ query: UPDATE_DOUBLES, variables: { input: { id: DOUBLES_ID, rows: rowsJson, caliPlayer: p.caliPlayer || null, _version: v } } });
      } else {
        await this.client.graphql({ query: CREATE_DOUBLES, variables: { input: { id: DOUBLES_ID, rows: rowsJson, caliPlayer: p.caliPlayer || null } } });
      }
      this.doublesSaveStatus = 'saved';
      setTimeout(() => { if (this.doublesSaveStatus === 'saved') this.doublesSaveStatus = 'idle'; }, 2500);
    } catch (e) { console.error('[DataService] saveDoubles:', e); this.doublesSaveStatus = 'error'; }
  }

  private async executeSaveBagTags(p: { rows: BagTagRow[]; league: League }): Promise<void> {
    const id = LEAGUES[p.league].bagTagsId;
    const rowsJson = JSON.stringify(p.rows.map(r => ({ id: r.id, value: r.value, score: r.score, tagNum: r.tagNum ?? null })));
    try {
      const v = await this.fetchVersion(GET_BAGTAGS, id, 'getBagTagsTable');
      if (v !== null) {
        await this.client.graphql({ query: UPDATE_BAGTAGS, variables: { input: { id, rows: rowsJson, _version: v } } });
      } else {
        await this.client.graphql({ query: CREATE_BAGTAGS, variables: { input: { id, rows: rowsJson } } });
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
