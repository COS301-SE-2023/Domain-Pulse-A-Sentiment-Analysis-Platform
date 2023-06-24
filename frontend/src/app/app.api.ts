import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class AppApi {
  constructor(private http: HttpClient) {}
}
