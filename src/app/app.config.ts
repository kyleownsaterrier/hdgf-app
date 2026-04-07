import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { DoublesComponent } from './doubles/doubles.component';
import { BagTagsComponent } from './bag-tags/bag-tags.component';
import { LeaderboardComponent } from './leaderboard/leaderboard.component';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter([
      { path: '', redirectTo: 'doubles', pathMatch: 'full' },
      { path: 'doubles', component: DoublesComponent },
      { path: 'bag-tags', component: BagTagsComponent },
      { path: 'leaderboard', component: LeaderboardComponent },
    ])
  ]
};
