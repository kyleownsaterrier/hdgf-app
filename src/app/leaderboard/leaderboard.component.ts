import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService, LeaderboardEntry } from '../services/data.service';
import { LeagueService, LEAGUES } from '../services/league.service';
import type { League } from '../services/league.service';

interface EditableEntry extends LeaderboardEntry {
  editing: boolean;
  editName: string;
  editTag: number;
  editDate: string;
  saving: boolean;
  deleting: boolean;
}

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.css']
})
export class LeaderboardComponent implements OnInit {
  entries: EditableEntry[] = [];
  loading = true;
  addingNew = false;
  newEntry = { playerName: '', tagNum: null as number | null, lastPlayed: this.todayStr() };
  addSaving = false;
  readonly leagues = LEAGUES;

  private data = inject(DataService);
  private leagueSvc = inject(LeagueService);

  get activeLeague(): League { return this.leagueSvc.current; }
  get leagueLabel(): string { return LEAGUES[this.activeLeague].label; }

  async ngOnInit(): Promise<void> { await this.load(); }

  async setLeague(league: League): Promise<void> {
    if (league === this.activeLeague) return;
    this.cancelAllEdits();
    this.leagueSvc.setLeague(league);
    await this.load();
  }

  async load(): Promise<void> {
    this.loading = true;
    const raw = await this.data.loadLeaderboard(this.activeLeague);
    this.entries = raw.map(e => this.toEditable(e));
    this.loading = false;
  }

  async refresh(): Promise<void> { await this.load(); }

  // ── Inline edit ─────────────────────────────────────────────────────────────

  startEdit(entry: EditableEntry): void {
    this.cancelAllEdits();
    entry.editing = true;
    entry.editName = entry.playerName;
    entry.editTag = entry.tagNum;
    entry.editDate = entry.lastPlayed;
  }

  cancelEdit(entry: EditableEntry): void { entry.editing = false; }

  async saveEdit(entry: EditableEntry): Promise<void> {
    if (!entry.editName.trim() || !entry.editTag) return;
    entry.saving = true;
    const result = await this.data.upsertLeaderboardEntry(
      { playerName: entry.editName.trim(), tagNum: entry.editTag, lastPlayed: entry.editDate },
      this.activeLeague
    );
    if (result) {
      entry.playerName = result.playerName;
      entry.tagNum = result.tagNum;
      entry.lastPlayed = result.lastPlayed;
      entry.id = result.id;
    }
    entry.editing = false;
    entry.saving = false;
    this.entries.sort((a, b) => a.tagNum - b.tagNum);
  }

  async deleteEntry(entry: EditableEntry): Promise<void> {
    entry.deleting = true;
    const ok = await this.data.deleteLeaderboardEntry(entry.id);
    if (ok) this.entries = this.entries.filter(e => e.id !== entry.id);
    else entry.deleting = false;
  }

  // ── Add new ─────────────────────────────────────────────────────────────────

  startAdd(): void {
    this.cancelAllEdits();
    this.newEntry = { playerName: '', tagNum: null, lastPlayed: this.todayStr() };
    this.addingNew = true;
  }

  cancelAdd(): void { this.addingNew = false; }

  async saveNew(): Promise<void> {
    if (!this.newEntry.playerName.trim() || !this.newEntry.tagNum) return;
    this.addSaving = true;
    const result = await this.data.upsertLeaderboardEntry(
      { playerName: this.newEntry.playerName.trim(), tagNum: this.newEntry.tagNum, lastPlayed: this.newEntry.lastPlayed },
      this.activeLeague
    );
    if (result) {
      this.entries.push(this.toEditable(result));
      this.entries.sort((a, b) => a.tagNum - b.tagNum);
    }
    this.addingNew = false;
    this.addSaving = false;
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────

  private cancelAllEdits(): void {
    this.entries.forEach(e => { e.editing = false; });
    this.addingNew = false;
  }

  private toEditable(e: LeaderboardEntry): EditableEntry {
    return { ...e, editing: false, editName: e.playerName, editTag: e.tagNum, editDate: e.lastPlayed, saving: false, deleting: false };
  }

  private todayStr(): string { return new Date().toISOString().split('T')[0]; }

  formatDate(isoDate: string): string {
    if (!isoDate) return '—';
    try { const [y, m, d] = isoDate.split('-'); return `${m}/${d}/${y}`; }
    catch { return isoDate; }
  }

  trackById(_i: number, e: EditableEntry): string { return e.id; }
}
