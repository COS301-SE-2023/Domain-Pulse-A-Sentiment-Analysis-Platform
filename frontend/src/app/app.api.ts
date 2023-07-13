import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class AppApi {
  private engineBaseUrl = `http://${window.location.hostname}:8001/`;
  private profilesBaseUrl = `http://${window.location.hostname}:8002/`;
  private getDomainsUrl = 'domains/get_domains';

  constructor(private http: HttpClient) {}

  getDomains(userId: number): Observable<any> {
    return this.http.get(
      this.engineBaseUrl + this.getDomainsUrl + '/' + userId
    );
  }

  addSource(
    domainID: number,
    sourceName: string,
    sourceImageUrl: string
  ): Observable<any> {
    const addSourceUrl =
      this.engineBaseUrl +
      `domains/add_source/1/${domainID}/${sourceName}/${sourceImageUrl}`;
    return this.http.get(addSourceUrl);
  }

  checkAuthenticate(): Observable<any> {
    const checkAuthenticateUrl =
      this.profilesBaseUrl + 'profiles/check_logged_in';
    return this.http.post(checkAuthenticateUrl, {});
  }

  registerUser(
    username: string,
    email: string,
    password: string
  ): Observable<any> {
    const registerUserUrl = this.profilesBaseUrl + 'profiles/create_user';
    const body = {
      username: username,
      email: email,
      password: password,
    };
    return this.http.post(registerUserUrl, body);
  }

  attemptPsswdLogin(username: string, password: string): Observable<any> {
    const attemptPsswdLoginUrl = this.profilesBaseUrl + 'profiles/login_user';
    const body = {
      username: username,
      password: password,
    };
    return this.http.post(attemptPsswdLoginUrl, body);
  }
}
