import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class AppApi {
  private engineBaseUrl = `http://${window.location.hostname}:8001/`;
  private profilesBaseUrl = `http://${window.location.hostname}:8002/`;

  private warehouseBaseUrl = `http://${window.location.hostname}:8004/`;
  private getDomainsUrl = 'domains/get_domains';

  constructor(private http: HttpClient) {}

  getDomainIDs(userId: number): Observable<any> {
    const body = {
      id: userId,
    };

    return this.http.post(
      this.profilesBaseUrl + 'profiles/get_domains_for_user',
      body,
      { withCredentials: true }
    );
  }

  getDomainInfo(domainID: number): Observable<any> {
    const getDomainInfoUrl = this.profilesBaseUrl + 'profiles/get_domain';
    return this.http.post(
      getDomainInfoUrl,
      { id: domainID },
      { withCredentials: true }
    );
  }

  addDomain(
    domainName: string,
    domainDescrption: string,
    domainImageUrl: string
  ): Observable<any> {
    const addDomainUrl = this.profilesBaseUrl + 'profiles/create_domain';
    const body = {
      name: domainName,
      description: domainDescrption,
      icon: domainImageUrl,
    };

    return this.http.post(addDomainUrl, body, { withCredentials: true });
  }

  // such a tragedy that this doesnt happen in the backend
  linkDomainToProfile(domainID: number, profileID: number): Observable<any> {
    const linkDomainToProfileUrl =
      this.profilesBaseUrl + 'profiles/add_domain_to_profile';
    const body = {
      domain_id: domainID,
      id: profileID,
    };

    return this.http.post(linkDomainToProfileUrl, body, {
      withCredentials: true,
    });
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

  getSourceInfo(sourceID: number): Observable<any> {
    const getSourceInfoUrl = this.profilesBaseUrl + 'profiles/get_source';
    return this.http.post(
      getSourceInfoUrl,
      { id: sourceID },
      { withCredentials: true }
    );
  }

  getOverallSentimentScores(domainID: number): Observable<any> {
    const getOverallSentimentScoresUrl =
      this.warehouseBaseUrl + 'query/get_source_dashboard/';
    const body = {
      source_id: domainID,
    };

    return this.http.post(getOverallSentimentScoresUrl, body);
  }

  checkAuthenticate(): Observable<any> {
    const checkAuthenticateUrl =
      this.profilesBaseUrl + 'profiles/check_logged_in';
    return this.http.post(checkAuthenticateUrl, {}, { withCredentials: true });
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
    // send with credentials enabled
    return this.http.post(attemptPsswdLoginUrl, body, {
      withCredentials: true,
    });
  }
}
