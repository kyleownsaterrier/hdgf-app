import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="phone-shell">
      <div class="app-screen">
        <router-outlet></router-outlet>
      </div>
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
      <div class="home-area"><div class="home-pill"></div></div>
    </div>
  `,
  styleUrls: ['./app.component.css']
})
export class AppComponent {}
