import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../services/data.service';

export interface TableRow {
  id: number;
  leftValue: string;
  rightValue: string;
}

@Component({
  selector: 'app-editable-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './editable-table.component.html',
  styleUrls: ['./editable-table.component.css']
})
export class EditableTableComponent implements OnInit {
  rows: TableRow[] = [];
  nextId = 1;
  shuffleCount = 0;
  shuffleFlash = false;
  caliPlayerValue = '';
  caliPlayerVisible = false;
  caliBannerFlash = false;

  private data = inject(DataService);
  get saveStatus() { return this.data.doublesSaveStatus; }

  async ngOnInit(): Promise<void> {
    const saved = await this.data.loadDoubles();
    if (saved && saved.rows.length > 0) {
      this.rows = saved.rows;
      this.nextId = Math.max(...saved.rows.map(r => r.id)) + 1;
      this.caliPlayerValue = saved.caliPlayer;
      this.caliPlayerVisible = !!saved.caliPlayer.trim();
    } else {
      this.addRow();
    }
  }

  private save(): void {
    this.data.autoSaveDoubles(this.rows, this.caliPlayerValue);
  }

  onInput(): void { this.save(); }

  addRow(leftValue = '', rightValue = ''): void {
    this.rows.push({ id: this.nextId++, leftValue, rightValue });
    this.save();
  }

  deleteLastRow(): void {
    if (this.rows.length > 1) { this.rows.pop(); this.save(); }
  }

  shuffleColumnB(): void {
    const values = this.rows.map(r => r.rightValue);
    for (let i = values.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [values[i], values[j]] = [values[j], values[i]];
    }
    this.rows.forEach((r, i) => r.rightValue = values[i]);
    this.shuffleCount++;
    this.shuffleFlash = true;
    setTimeout(() => this.shuffleFlash = false, 800);
    this.save();
  }

  clearAll(): void {
    this.rows.forEach(r => { r.leftValue = ''; r.rightValue = ''; });
    this.save();
  }

  clearCell(row: TableRow, col: 'left' | 'right'): void {
    if (col === 'left') row.leftValue = ''; else row.rightValue = '';
    this.save();
  }

  promoteToCaliplayer(row: TableRow): void {
    this.caliPlayerValue = row.rightValue;
    row.rightValue = '';
    this.caliPlayerVisible = true;
    this.caliBannerFlash = true;
    setTimeout(() => this.caliBannerFlash = false, 600);
    this.save();
  }

  removeCaliPlayer(): void {
    const val = this.caliPlayerValue;
    this.caliPlayerValue = '';
    this.caliPlayerVisible = false;
    if (val.trim()) {
      const emptyRow = this.rows.find(r => !r.rightValue.trim());
      if (emptyRow) emptyRow.rightValue = val; else this.addRow('', val);
    }
    this.save();
  }

  onKeyDown(event: KeyboardEvent, rowIndex: number, col: 'left' | 'right'): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (col === 'left') {
        this.focusCell(rowIndex, 'right');
      } else {
        if (rowIndex === this.rows.length - 1) this.addRow();
        setTimeout(() => this.focusCell(rowIndex + 1, 'left'), 10);
      }
    }
    if (event.key === 'Tab' && col === 'right' && !event.shiftKey && rowIndex === this.rows.length - 1) {
      event.preventDefault();
      this.addRow();
      setTimeout(() => this.focusCell(rowIndex + 1, 'left'), 10);
    }
  }

  private focusCell(rowIndex: number, col: 'left' | 'right'): void {
    const el = document.querySelector<HTMLInputElement>(`[data-row="${rowIndex}"][data-col="${col}"]`);
    el?.focus();
  }

  trackById(_i: number, row: TableRow): number { return row.id; }

  get filledRowCount(): number {
    return this.rows.filter(r => r.leftValue.trim() || r.rightValue.trim()).length;
  }
}
