import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService, LeaderboardEntry } from '../services/data.service';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.css']
})
export class LeaderboardComponent implements OnInit {
  entries: LeaderboardEntry[] = [];
  loading = true;

  private data = inject(DataService);

  async ngOnInit(): Promise<void> {
    this.loading = true;
    this.entries = await this.data.loadLeaderboard();
    this.loading = false;
  }

  async refresh(): Promise<void> {
    this.loading = true;
    this.entries = await this.data.loadLeaderboard();
    this.loading = false;
  }

  formatDate(isoDate: string): string {
    if (!isoDate) return '—';
    try {
      const [year, month, day] = isoDate.split('-');
      return `${month}/${day}/${year}`;
    } catch { return isoDate; }
  }
}
