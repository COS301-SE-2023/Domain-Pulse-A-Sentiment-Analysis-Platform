import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environment';

@Injectable()
export class AppApi {
  private engineBaseUrl = `/api/engine/`;
  private profilesBaseUrl = `/api/profiles/`;
  private warehouseBaseUrl = `/api/warehouse/`;
  private domainBaseUrl = `/api/domains/`;

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
    const getDomainInfoUrl = this.domainBaseUrl + 'domains/get_domain';
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
    const addDomainUrl = this.domainBaseUrl + 'domains/create_domain';
    const body = {
      name: domainName,
      description: domainDescrption,
      icon: domainImageUrl,
    };

    return this.http.post(addDomainUrl, body, { withCredentials: true });
  }

  editDomain(
    domainID: number,
    domainName: string,
    domainDescrption: string,
    domainImageUrl: string
  ): Observable<any> {
    const editDomainUrl = this.domainBaseUrl + 'domains/edit_domain';
    const body = {};
    alert('FIND THE CORRECT BODY FOR THIS CODE');
    return this.http.post(editDomainUrl, body, { withCredentials: true });
  }

  removeDomain(domainID: number): Observable<any> {
    const removeDomainUrl = this.domainBaseUrl + 'domains/remove_domain';
    const body = {
      id: domainID,
    };
    return this.http.post(removeDomainUrl, body, { withCredentials: true });
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
    const addSourceUrl = this.profilesBaseUrl + 'profiles/add_source';
    const randomInteger = Math.floor(Math.random() * 1000000);
    const body = {
      domain_id: domainID,
      source_id: randomInteger,
      // icon: sourceImageUrl,
    };

    return this.http.post(addSourceUrl, body, { withCredentials: true });
  }

  getSourceInfo(sourceID: number): Observable<any> {
    const getSourceInfoUrl = this.profilesBaseUrl + 'profiles/get_source';
    return this.http.post(
      getSourceInfoUrl,
      { id: sourceID },
      { withCredentials: true }
    );
  }

  getSourceSentimentData(domainID: number): Observable<any> {
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
