import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SurveyRedirectGuard {
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    const sourceId = route.paramMap.get('source_id') || '';
    const sourceName = route.paramMap.get('source_name') || '';

    // Perform the redirection
    const currHost = window.location.host;
    this.redirect(this.decideNewUrl(currHost, sourceId, sourceName));
    // Return false to prevent the route from being activated as the redirection will handle it
    return false;
  }

  decideNewUrl(currHost: string, sourceId: string, sourceName: string): string {
    if (currHost == 'localhost:4200') {
      // the below should not be hardcoded
      return `http://localhost:8004/ingest/post-review/${sourceId}/${sourceName}`;
    } else {
      return `${window.location.protocol}//${currHost}/ingest/post-review/${sourceId}/${sourceName}`;
    }
  }

  redirect(str: string): void {
    window.location.href = str
  }
}
