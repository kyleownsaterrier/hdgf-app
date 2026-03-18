import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="phone-shell">

      <!-- Dynamic Island -->
      <div class="dynamic-island">
        <div class="di-sensor"></div>
        <div class="di-camera"></div>
      </div>

      <!-- Status Bar -->
      <div class="status-bar">
        <span class="status-time" id="status-time">9:41</span>
        <div class="status-icons">
          <svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor">
            <rect x="0" y="7.5" width="3" height="3.5" rx="0.6"/>
            <rect x="4.5" y="5" width="3" height="6" rx="0.6"/>
            <rect x="9" y="2.5" width="3" height="8.5" rx="0.6"/>
            <rect x="13.5" y="0" width="3" height="11" rx="0.6"/>
          </svg>
          <svg width="16" height="12" viewBox="0 0 20 14" fill="none">
            <path d="M10 10.5a2 2 0 1 1 0 4 2 2 0 0 1 0-4z" fill="currentColor"/>
            <path d="M4.5 7.5C6.2 5.8 7.9 5 10 5s3.8.8 5.5 2.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
            <path d="M1 4C3.8 1.3 6.7 0 10 0s6.2 1.3 9 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
          </svg>
          <svg width="26" height="12" viewBox="0 0 26 12" fill="none">
            <rect x="0.5" y="0.5" width="22" height="11" rx="3.5" stroke="currentColor" stroke-opacity="0.3"/>
            <rect x="2" y="2" width="17" height="8" rx="2" fill="currentColor"/>
            <path d="M24.5 4v4c1-1 1-3 0-4z" fill="currentColor" fill-opacity="0.35"/>
          </svg>
        </div>
      </div>

      <!-- Routed Page -->
      <div class="app-screen">
        <router-outlet></router-outlet>
      </div>

      <!-- Tab Bar -->
      <div class="tab-bar">
        <a class="tab-btn" routerLink="/doubles" routerLinkActive="active">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
          </svg>
          <span>Doubles</span>
        </a>
        <a class="tab-btn" routerLink="/bag-tags" routerLinkActive="active">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
            <line x1="7" y1="7" x2="7.01" y2="7"/>
          </svg>
          <span>Bag Tags</span>
        </a>
      </div>

      <!-- Home Indicator -->
      <div class="home-area">
        <div class="home-pill"></div>
      </div>

    </div>
  `,
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  ngOnInit() {
    this.updateClock();
    setInterval(() => this.updateClock(), 15000);
  }
  updateClock() {
    const now = new Date();
    const h = now.getHours() % 12 || 12;
    const m = String(now.getMinutes()).padStart(2, '0');
    const el = document.getElementById('status-time');
    if (el) el.textContent = `${h}:${m}`;
  }
}
