import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environment';

@Injectable()
export class ApiInterceptor implements HttpInterceptor {
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    let apiUrl: string;

    if (environment.environment === 'server') {
      // Use actual server URL for public environment
      apiUrl = 'https://api.example.com';
    } else {
      // Use localhost URL for private environment
      apiUrl = 'http://localhost';
    }

    if (environment.environment === 'local') {
      // Extract backend name from URL for private environment
      const urlParts = req.url.split('/');

      // Remove "/api/<backend_name>" part of the request URL
      const backend = urlParts[2];
      urlParts.splice(0, 3);
      // console.log('req.url: ' + req.url);
      //   console.log('backend: ' + backend);
      // console.log('urlParts: [' + urlParts + ']');

      switch (backend) {
        case 'domains':
          apiUrl += `:${environment.DOMAINS_PORT}`;
          break;
        case 'engine':
          apiUrl += `:${environment.ENGINE_PORT}`;
          break;
        case 'profiles':
          apiUrl += `:${environment.PROFILES_PORT}`;
          break;
        case 'sourceconnector':
          apiUrl += `:${environment.SOURCECONNECTOR_PORT}`;
          break;
        case 'warehouse':
          apiUrl += `:${environment.WAREHOUSE_PORT}`;
          break;
        default:
          // Handle any other cases or provide a default port
          console.error("invalid backend name '" + backend + "' in URL");
          break;
      }

      console.log('apiUrl: ' + apiUrl + '/' + urlParts.join('/'));

      const modifiedReq = req.clone({ url: apiUrl + '/' + urlParts.join('/') });
      return next.handle(modifiedReq);
    } else {
      return next.handle(req);
    }
  }
}
