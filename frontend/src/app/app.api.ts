import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class AppApi {
  private engineBaseUrl = `http://${window.location.hostname}:8001/`;
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
}
