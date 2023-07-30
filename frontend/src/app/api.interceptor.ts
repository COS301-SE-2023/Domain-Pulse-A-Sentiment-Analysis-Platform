import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class ApiInterceptor implements HttpInterceptor {
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const jwt = localStorage.getItem('JWT');
    if (jwt) {
      const modifiedReq = req.clone({
        url: req.url,
        headers: req.headers.set('authorization', 'Bearer ' + jwt),
      });
      return next.handle(modifiedReq);
    }

    return next.handle(req);
  }
}
