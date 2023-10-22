import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InfoGaurd implements CanActivate {
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    // Perform the redirection
    const currHost = window.location.host;
    this.redirect(this.decideNewUrl(currHost));
    // Return false to prevent the route from being activated as the redirection will handle it
    return false;
  }

  decideNewUrl(currHost: string): string {
    if (currHost == 'localhost:4200' || currHost == 'localhost:7998') {
      // the below should not be hardcoded
      return `http://localhost:7998/info/index.html`;
    } else {
      return `${window.location.protocol}//${currHost}/info/index.html`;
    }
  }

  redirect(str: string): void {
    window.location.href = str
  }
}
