import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GuestGuard implements CanActivate {
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
    this.redirect(`${window.location.protocol}//${currHost}/login?u=guest`)
    // Return false to prevent the route from being activated as the redirection will handle it
    return false;
  }

  redirect(str: string): void {
    window.location.href = str
  }
}
