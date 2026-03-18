import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

  // Tag number editor
  editorOpenId: number | null = null;
  editorValue = 1;
  editorTop = 0;
  editorLeft = 0;

  // Results modal
  showResults = false;
  results: AssignmentResult[] = [];

  ngOnInit(): void {
    this.addRow();
  }

  addRow(value = '', score = ''): void {
    this.rows.push({ id: this.nextId++, value, score, tagNum: null });
  }

  deleteLastRow(): void {
    if (this.rows.length > 1) this.rows.pop();
  }

  clearCell(row: BagTagRow): void {
    row.value = '';
  }

  getDisplayNum(row: BagTagRow, index: number): number {
    return row.tagNum !== null ? row.tagNum : index + 1;
  }

  isCustom(row: BagTagRow): boolean {
    return row.tagNum !== null;
  }

  // ── Tag Assignment ────────────────────────────────
  assignTags(): void {
    const eligible = this.rows.filter(r => r.value.trim());
    if (eligible.length === 0) return;

    const tagPool = eligible.map((r, _) =>
      r.tagNum !== null ? r.tagNum : (this.rows.indexOf(r) + 1)
    ).sort((a, b) => a - b);

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
      return {
        player,
        oldTag,
        newTag,
        score: player.score !== '' ? player.score : '—',
        changed: oldTag !== newTag
      };
    });

    this.showResults = true;
  }

  closeResults(): void {
    this.showResults = false;
  }

  // ── Tag Number Editor ─────────────────────────────
  openEditor(row: BagTagRow, index: number, badgeEl: EventTarget | null): void {
    this.editorOpenId = row.id;
    this.editorValue = row.tagNum !== null ? row.tagNum : index + 1;
    if (!badgeEl) return;
    const el = badgeEl as HTMLElement;
    const shellEl = el.closest('.phone-shell') as HTMLElement;
    const rect = el.getBoundingClientRect();
    const shellRect = shellEl.getBoundingClientRect();
    let left = rect.left - shellRect.left - 80;
    if (left < 8) left = 8;
    if (left + 160 > 393 - 8) left = 393 - 8 - 160;
    this.editorTop = rect.bottom - shellRect.top + 6;
    this.editorLeft = left;
  }

  spinNum(delta: number): void {
    this.editorValue = Math.max(1, Math.min(999, this.editorValue + delta));
  }

  confirmNum(): void {
    const row = this.rows.find(r => r.id === this.editorOpenId);
    if (row) row.tagNum = Math.max(1, Math.min(999, this.editorValue));
    this.editorOpenId = null;
  }

  resetNum(): void {
    const row = this.rows.find(r => r.id === this.editorOpenId);
    if (row) row.tagNum = null;
    this.editorOpenId = null;
  }

  closeEditor(): void {
    this.editorOpenId = null;
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent): void {
    if (this.editorOpenId === null) return;
    const target = e.target as HTMLElement;
    if (!target.closest('.bt-num-editor') && !target.closest('.bt-tag-num')) {
      this.editorOpenId = null;
    }
  }

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

  trackById(_index: number, row: BagTagRow): number {
    return row.id;
  }

  get filledCount(): number {
    return this.rows.filter(r => r.value.trim()).length;
  }
}
