import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../services/data.service';

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

  private data = inject(DataService);
  get saveStatus() { return this.data.bagTagsSaveStatus; }

  async ngOnInit(): Promise<void> {
    const saved = await this.data.loadBagTags();
    if (saved && saved.length > 0) {
      this.rows = saved;
      this.nextId = Math.max(...saved.map((r: BagTagRow) => r.id)) + 1;
    } else {
      this.addRow();
    }
  }

  private triggerSave(): void {
    this.data.autoSaveBagTags(this.rows);
  }

  addRow(value = '', score = ''): void {
    this.rows.push({ id: this.nextId++, value, score, tagNum: null });
    this.triggerSave();
  }

  deleteLastRow(): void {
    if (this.rows.length > 1) { this.rows.pop(); this.triggerSave(); }
  }

  clearCell(row: BagTagRow): void {
    row.value = '';
    this.triggerSave();
  }

  onCellInput(): void {
    this.triggerSave();
  }

  getDisplayNum(row: BagTagRow, index: number): number {
    return row.tagNum !== null ? row.tagNum : index + 1;
  }

  setTagNum(row: BagTagRow, index: number, val: string): void {
    const n = parseInt(val, 10);
    if (!isNaN(n) && n > 0) { row.tagNum = n; this.triggerSave(); }
  }

  validateTagNum(row: BagTagRow, index: number, el: HTMLInputElement): void {
    const n = parseInt(el.value, 10);
    if (!isNaN(n) && n > 0) {
      row.tagNum = n;
      el.value = String(n);
    } else {
      el.value = String(this.getDisplayNum(row, index));
    }
    this.triggerSave();
  }

  isNegative(score: string): boolean {
    return score.trim().startsWith('-');
  }

  toggleSign(row: BagTagRow): void {
    const s = row.score.trim();
    if (!s) return;
    row.score = s.startsWith('-') ? s.slice(1) : '-' + s;
    this.triggerSave();
  }

  // ── Tag Assignment ──────────────────────────────
  assignTags(): void {
    const eligible = this.rows.filter(r => r.value.trim());
    if (eligible.length === 0) return;

    const tagPool = eligible
      .map((r) => r.tagNum !== null ? r.tagNum : (this.rows.indexOf(r) + 1))
      .sort((a, b) => a - b);

    const sorted = [...eligible].sort((a, b) => {
      const sa = a.score !== '' ? parseFloat(a.score) : Infinity;
      const sb = b.score !== '' ? parseFloat(b.score) : Infinity;
      if (sa !== sb) return sa - sb;
      const ta = a.tagNum !== null ? a.tagNum : (this.rows.indexOf(a) + 1);
      const tb = b.tagNum !== null ? b.tagNum : (this.rows.indexOf(b) + 1);
      return ta - tb;
    });

    this.results = sorted.map((player, i) => {
      const oldTag = player.tagNum !== null ? player.tagNum : (this.rows.indexOf(player) + 1);
      const newTag = tagPool[i];
      return { player, oldTag, newTag, score: player.score !== '' ? player.score : '—', changed: oldTag !== newTag };
    });

    this.showResults = true;
  }

  closeResults(): void { this.showResults = false; }

  onKeyDown(event: KeyboardEvent, rowIndex: number): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (rowIndex === this.rows.length - 1) {
        this.addRow();
        setTimeout(() => this.focusRow(rowIndex + 1), 10);
      } else {
        this.focusRow(rowIndex + 1);
      }
    }
  }

  private focusRow(index: number): void {
    const inputs = document.querySelectorAll<HTMLInputElement>('.bt-input');
    if (inputs[index]) inputs[index].focus();
  }

  trackById(_index: number, row: BagTagRow): number { return row.id; }

  get filledCount(): number {
    return this.rows.filter(r => r.value.trim()).length;
  }
}
