import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { AuthServiceService } from '../auth-service.service';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {
  // Se devi switchare tra locale e produzione
  //url = "http://192.168.1.172:5000/";
   url = "https://samipulizie.it:4000/";
  version = "1.1.0";

  constructor(private authService: AuthServiceService) {}

  get token(): string {
    return this.authService.token || '';
  }

  get userCode(): string {
    return this.authService.userCode || '';
  }

  get admin(): string {
    return this.authService.admin || '';
  }

  get email(): string {
    return this.authService.email || '';
  }

  get headers(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json; charset=utf-8',
      'Authorization': `${this.token}`
    });
  }

  logout(): void {
    this.authService.logout(); // delega al servizio principale
  }
}
