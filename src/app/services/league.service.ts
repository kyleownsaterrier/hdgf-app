import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type League = 'hdgf' | 'lavalinks';

export const LEAGUES: Record<League, { id: League; label: string; bagTagsId: string; leaderboardPrefix: string }> = {
  hdgf: {
    id: 'hdgf',
    label: 'HDGF',
    bagTagsId: 'bagtags-hdgf',
    leaderboardPrefix: 'hdgf-',
  },
  lavalinks: {
    id: 'lavalinks',
    label: 'Lavalinks',
    bagTagsId: 'bagtags-lavalinks',
    leaderboardPrefix: 'lavalinks-',
  },
};

@Injectable({ providedIn: 'root' })
export class LeagueService {
  private _league$ = new BehaviorSubject<League>('hdgf');
  readonly league$ = this._league$.asObservable();

  get current(): League { return this._league$.value; }
  get currentConfig() { return LEAGUES[this._league$.value]; }

  setLeague(league: League): void {
    this._league$.next(league);
  }
}
