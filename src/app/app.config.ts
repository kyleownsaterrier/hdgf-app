import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { EditableTableComponent } from './editable-table/editable-table.component';
import { BagTagsComponent } from './bag-tags/bag-tags.component';
import { LeaderboardComponent } from './leaderboard/leaderboard.component';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter([
      { path: '', redirectTo: 'doubles', pathMatch: 'full' },
      { path: 'doubles', component: EditableTableComponent },
      { path: 'bag-tags', component: BagTagsComponent },
      { path: 'leaderboard', component: LeaderboardComponent },
    ])
  ]
};
