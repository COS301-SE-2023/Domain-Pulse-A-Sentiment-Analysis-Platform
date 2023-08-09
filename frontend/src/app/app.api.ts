import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

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

  getDomainInfo(domainID: string): Observable<any> {
    const getDomainInfoUrl = this.domainBaseUrl + 'domains/get_domain';
    return this.http.post(
      getDomainInfoUrl,
      { id: domainID },
      { withCredentials: true }
    );
  }

  getAggregatedDomainData(sourceIds: string[]): Observable<any> {
    const getAggregatedDomainDataUrl =
      this.warehouseBaseUrl + 'query/get_domain_dashboard/';
    const body = {
      source_ids: sourceIds,
    };
    return this.http.post(getAggregatedDomainDataUrl, body, {
      withCredentials: true,
    });
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
    domainID: string,
    domainName: string,
    domainImageUrl: string,
    domainDescrption: string,    
  ): Observable<any> {
    const editDomainUrl = this.domainBaseUrl + 'domains/edit_domain';
    const body = {
      id: domainID,
      name: domainName,
      icon: domainImageUrl,
      description: domainDescrption,      
    };
    return this.http.post(editDomainUrl, body, { withCredentials: true });
  }

  removeDomain(domainID: string): Observable<any> {
    const removeDomainUrl = this.domainBaseUrl + 'domains/delete_domain';
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
    domainID: string,
    sourceName: string,
    sourceImageUrl: string,
    params: any
  ): Observable<any> {
    const addSourceUrl = this.domainBaseUrl + 'domains/add_source';

    const body = {
      id: domainID,
      source_name: sourceName,
      source_icon: sourceImageUrl,
      params: params,
    }

    return this.http.post(addSourceUrl, body, { withCredentials: true });
  }

  editSource(sourceId: string, sourceName: string): Observable<any> {
    const editSourceUrl = this.domainBaseUrl + 'domains/edit_source';
    const body = {
      source_id: sourceId,
      name: sourceName,
    };

    return this.http.post(editSourceUrl, body, { withCredentials: true });
  }

  deleteSource(domainID: string, sourceID: string): Observable<any> {
    const deleteSourceUrl = this.domainBaseUrl + 'domains/remove_source';
    const body = {
      id: domainID,
      source_id: sourceID,
    };

    return this.http.post(deleteSourceUrl, body, { withCredentials: true });
  }

  refreshSourceInfo(sourceID: string, roomID: string): Observable<any> {
    const refreshSourceInfoUrl = this.warehouseBaseUrl + 'query/refresh_source/';
    const body = {
      source_id: sourceID,
      room_id: roomID,
    }

    return this.http.post(refreshSourceInfoUrl, body, { withCredentials: true });
  }

  getSourceInfo(sourceID: number): Observable<any> {
    const getSourceInfoUrl = this.domainBaseUrl + 'domains/get_source';
    return this.http.post(
      getSourceInfoUrl,
      { id: sourceID },
      { withCredentials: true }
    );
  }

  getSourceSentimentData(sourceID: string): Observable<any> {
    const getOverallSentimentScoresUrl =
      this.warehouseBaseUrl + 'query/get_source_dashboard/';
    const body = {
      source_id: sourceID,
    };

    return this.http.post(getOverallSentimentScoresUrl, body);
  }

  checkAuthenticate(): Observable<any> {
    const checkAuthenticateUrl =
      this.profilesBaseUrl + 'check/check_logged_in/';
    return this.http.post(checkAuthenticateUrl, {}, { withCredentials: true });
  }

  logOut(): Observable<any> {
    const logOutUrl = this.profilesBaseUrl + 'profiles/logout_user';
    return this.http.post(logOutUrl, {}, { withCredentials: true });
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

  changePassword(
    userId: number,
    oldPassword: string,
    newPassword: string
  ): Observable<any> {
    const changePasswordUrl = this.profilesBaseUrl + 'profiles/change_password';
    const body = {
      id: userId,
      oldpassword: oldPassword,
      newpassword: newPassword,
    };
    return this.http.post(changePasswordUrl, body, { withCredentials: true });
  }

  deleteUser(username: string, password: string): Observable<any> {
    const deleteUserUrl = this.profilesBaseUrl + 'profiles/delete_user';
    const body = {
      username: username,
      password: password,
    };
    return this.http.post(deleteUserUrl, body, { withCredentials: true });
  }

  changeProfileIcon(profileID: number, profilePicture: string): Observable<any> {
    const changeProfilePictureUrl = this.profilesBaseUrl + 'profiles/edit_profile_picture';
    const body = {
      id: profileID,
      pictureURL: profilePicture,
    };
    return this.http.post(changeProfilePictureUrl, body, { withCredentials: true });

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

  getProfile(profileID: number): Observable<any> {
    const getProfileUrl = this.profilesBaseUrl + 'profiles/get_profile';
    const body = {
      id: profileID,
    };
    // send with credentials enabled
    return this.http.post(getProfileUrl, body, {
      withCredentials: true,
    });
  }

  //gte user
  getUserByID(userID: number): Observable<any> {
    const getUserUrl = this.profilesBaseUrl + 'profiles/get_user_by_id';
    const body = {
      id: userID,
    };
    // send with credentials enabled
    return this.http.post(getUserUrl, body, {
      withCredentials: true,
    });
  }

  changeMode(profileID: number): Observable<any> {
    const changeModeUrl = this.profilesBaseUrl + 'profiles/swap_mode';
    const body = {
      id: profileID,
    };
    // send with credentials enabled
    return this.http.post(changeModeUrl, body, {
      withCredentials: true,
    });
  }

}
