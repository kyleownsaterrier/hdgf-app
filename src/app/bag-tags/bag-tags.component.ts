import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService, LeaderboardEntry } from '../services/data.service';
import { LeagueService, LEAGUES } from '../services/league.service';
import type { League } from '../services/league.service';

export interface BagTagRow {
  id: number;
  value: string;
  score: string;
  tagNum: number | null;
}

export interface AssignmentResult {
  player: BagTagRow;
  oldTag: number;
  newTag: number;
  score: string;
  changed: boolean;
}

@Component({
  selector: 'app-bag-tags',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bag-tags.component.html',
  styleUrls: ['./bag-tags.component.css']
})
export class BagTagsComponent implements OnInit {
  rows: BagTagRow[] = [];
  nextId = 1;
  showResults = false;
  results: AssignmentResult[] = [];
  leaderboardUpdateStatus: 'idle' | 'saving' | 'done' | 'error' = 'idle';
  suggestions: LeaderboardEntry[] = [];
  activeSuggestionRowId: number | null = null;
  readonly leagues = LEAGUES;

  private data = inject(DataService);
  private leagueSvc = inject(LeagueService);

  get saveStatus() { return this.data.bagTagsSaveStatus; }
  get activeLeague(): League { return this.leagueSvc.current; }
  get leagueLabel(): string { return LEAGUES[this.activeLeague].label; }

  async ngOnInit(): Promise<void> {
    await this.loadForLeague();
  }

  async setLeague(league: League): Promise<void> {
    if (league === this.activeLeague) return;
    this.dismissSuggestions();
    this.showResults = false;
    this.leagueSvc.setLeague(league);
    await this.loadForLeague();
  }

  private async loadForLeague(): Promise<void> {
    const saved = await this.data.loadBagTags(this.activeLeague);
    if (saved && saved.length > 0) {
      this.rows = saved;
      this.nextId = Math.max(...saved.map(r => r.id)) + 1;
    } else {
      this.rows = [];
      this.nextId = 1;
      this.addRow();
    }
  }

  private save(): void { this.data.autoSaveBagTags(this.rows, this.activeLeague); }
  onInput(): void { this.save(); }

  addRow(value = '', score = ''): void {
    this.rows.push({ id: this.nextId++, value, score, tagNum: null });
    this.save();
  }
  deleteLastRow(): void { if (this.rows.length > 1) { this.rows.pop(); this.save(); } }
  deleteAll(): void { this.rows = [{ id: this.nextId++, value: '', score: '', tagNum: null }]; this.save(); }
  clearCell(row: BagTagRow): void { row.value = ''; this.save(); }

  getDisplayNum(row: BagTagRow, index: number): number {
    return row.tagNum !== null ? row.tagNum : index + 1;
  }
  setTagNum(row: BagTagRow, index: number, val: string): void {
    const n = parseInt(val, 10);
    if (!isNaN(n) && n > 0) { row.tagNum = n; this.save(); }
  }
  validateTagNum(row: BagTagRow, index: number, el: HTMLInputElement): void {
    const n = parseInt(el.value, 10);
    if (!isNaN(n) && n > 0) { row.tagNum = n; el.value = String(n); }
    else el.value = String(this.getDisplayNum(row, index));
    this.save();
  }
  isNegative(score: string): boolean { return score.trim().startsWith('-'); }
  toggleSign(row: BagTagRow): void {
    const s = row.score.trim();
    if (!s) return;
    row.score = s.startsWith('-') ? s.slice(1) : '-' + s;
    this.save();
  }

  // ── Autocomplete ────────────────────────────────────────────────────────────

  async onPlayerInput(row: BagTagRow): Promise<void> {
    this.save();
    const trimmed = row.value.trim();
    if (!trimmed) { this.suggestions = []; this.activeSuggestionRowId = null; return; }
    this.activeSuggestionRowId = row.id;
    this.suggestions = await this.data.searchLeaderboardNames(trimmed, this.activeLeague);
    const exact = this.suggestions.find(s => s.playerName.toLowerCase() === trimmed.toLowerCase());
    if (exact) {
      row.tagNum = exact.tagNum;
      this.suggestions = [];
      this.activeSuggestionRowId = null;
      this.save();
    }
  }

  selectSuggestion(row: BagTagRow, entry: LeaderboardEntry): void {
    row.value = entry.playerName;
    row.tagNum = entry.tagNum;
    this.suggestions = [];
    this.activeSuggestionRowId = null;
    this.save();
  }

  dismissSuggestions(): void { this.suggestions = []; this.activeSuggestionRowId = null; }

  // ── Assign Tags ─────────────────────────────────────────────────────────────

  assignTags(): void {
    const eligible = this.rows.filter(r => r.value.trim());
    if (!eligible.length) return;
    const tagPool = eligible.map(r => r.tagNum !== null ? r.tagNum : (this.rows.indexOf(r) + 1)).sort((a, b) => a - b);
    const sorted = [...eligible].sort((a, b) => {
      const sa = a.score !== '' ? parseFloat(a.score) : Infinity;
      const sb = b.score !== '' ? parseFloat(b.score) : Infinity;
      if (sa !== sb) return sa - sb;
      return (a.tagNum ?? this.rows.indexOf(a) + 1) - (b.tagNum ?? this.rows.indexOf(b) + 1);
    });
    this.results = sorted.map((player, i) => {
      const oldTag = player.tagNum !== null ? player.tagNum : (this.rows.indexOf(player) + 1);
      const newTag = tagPool[i];
      return { player, oldTag, newTag, score: player.score || '—', changed: oldTag !== newTag };
    });
    this.leaderboardUpdateStatus = 'idle';
    this.showResults = true;
  }

  async updateLeaderboard(): Promise<void> {
    this.leaderboardUpdateStatus = 'saving';
    const today = new Date().toISOString().split('T')[0];
    const assignments = this.results.map(r => ({ playerName: r.player.value, tagNum: r.newTag }));
    try {
      await this.data.updateLeaderboard(assignments, today, this.activeLeague);
      this.leaderboardUpdateStatus = 'done';
    } catch { this.leaderboardUpdateStatus = 'error'; }
  }

  closeResults(): void { this.showResults = false; this.leaderboardUpdateStatus = 'idle'; }

  onKeyDown(event: KeyboardEvent, rowIndex: number): void {
    if (event.key === 'Escape') { this.dismissSuggestions(); return; }
    if (event.key === 'Enter') {
      event.preventDefault();
      this.dismissSuggestions();
      if (rowIndex === this.rows.length - 1) {
        this.addRow();
        setTimeout(() => this.focusRow(rowIndex + 1), 10);
      } else { this.focusRow(rowIndex + 1); }
    }
  }

  private focusRow(index: number): void {
    const inputs = document.querySelectorAll<HTMLInputElement>('.bt-input');
    if (inputs[index]) inputs[index].focus();
  }

  trackById(_i: number, row: BagTagRow): number { return row.id; }
  get filledCount(): number { return this.rows.filter(r => r.value.trim()).length; }
}
