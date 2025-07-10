import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { jwtDecode } from "jwt-decode";

@Injectable({
  providedIn: 'root'
})
export class GlobalService {
  private _token: string = sessionStorage.getItem('token') || "";
  private _userCode: string = sessionStorage.getItem('userCode') || "";
  private _admin: string = sessionStorage.getItem('admin') || "";
  private _email: string = sessionStorage.getItem('email') || "";

  url = "https://samipulizie.it:4000/";
  //url = "http://192.168.1.22:5000/";

  private logoutTimer: any;

  constructor(private http: HttpClient, private router: Router) {
    if (this._token) {
      const remainingTime = this.getTokenRemainingTime(this._token);
      this.setLogoutTimer(remainingTime);
    }
  }

  get token(): string {
    return this._token;
  }
  set token(value: string) {
    this._token = value;
    if (value) {
      sessionStorage.setItem('token', value);
      const remainingTime = this.getTokenRemainingTime(value);
      this.setLogoutTimer(remainingTime);
    } else {
      sessionStorage.removeItem('token');
      this.clearLogoutTimer();
    }
  }

  get userCode(): string {
    return this._userCode;
  }
  set userCode(value: string) {
    this._userCode = value;
    if (value) sessionStorage.setItem('userCode', value);
    else sessionStorage.removeItem('userCode');
  }

  get admin(): string {
    return this._admin;
  }
  set admin(value: string) {
    this._admin = value;
    if (value) sessionStorage.setItem('admin', value);
    else sessionStorage.removeItem('admin');
  }

  get email(): string {
    return this._email;
  }
  set email(value: string) {
    this._email = value;
    if (value) sessionStorage.setItem('email', value);
    else sessionStorage.removeItem('email');
  }

  get headers(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json; charset=utf-8',
      'Authorization': `${this.token}`
    });
  }

  getTokenRemainingTime(token: string): number {
    try {
      const decodee: any = jwtDecode(token);
      if (!decodee || !decodee.exp) {
        console.error('[GlobalService] Token decodificato senza exp');
        return 0;
      }
      const exp = decodee.exp * 1000;
      const remaining = exp - Date.now();
      return remaining > 0 ? remaining : 0;
    } catch (error) {
      console.error('[GlobalService] Errore nella decodifica del token:', error);
      return 0;
    }
  }

  setLogoutTimer(remainingTime: number): void {
    this.clearLogoutTimer();
    console.log('[GlobalService] Impostazione logout automatico in:', remainingTime, 'ms');
    this.logoutTimer = setTimeout(() => {
      this.logout();
    }, remainingTime);
  }

  clearLogoutTimer(): void {
    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer);
      this.logoutTimer = null;
    }
  }

  logout(): void {
    console.log('[GlobalService] Logout automatico eseguito');
    this.token = "";
    this.userCode = "";
    this.admin = "";
    this.email = "";
    this.router.navigate(['/']);
  }
}
