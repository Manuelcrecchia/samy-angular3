import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GlobalService } from './service/global.service';

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptorService implements HttpInterceptor {
  constructor(private globalService: GlobalService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.globalService.token;
    if (token) {
      const cloned = req.clone({
        headers: req.headers.set('Authorization', token)
      });
      return next.handle(cloned);
    }
    return next.handle(req);
  }
}
