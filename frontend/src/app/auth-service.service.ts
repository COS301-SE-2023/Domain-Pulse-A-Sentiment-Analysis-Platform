import { Injectable } from '@angular/core';
import { AppApi } from './app.api';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private appApi: AppApi) {}

  isAuthenticated(): Observable<boolean> {
    return this.appApi.checkAuthenticate().pipe(
      map((res) => {
        console.log('in auth service');
        console.log(res);
        return res['status'] === 'SUCCESS';
      })
    );
  }
}
