import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { jwtDecode } from "jwt-decode";

@Injectable({
  providedIn: 'root'
})
export class AuthServiceService {
  private logoutTimer: any;
  private _token: string | null = sessionStorage.getItem('token') || null;
  private _userCode: string | null = sessionStorage.getItem('userCode') || null;
  private _admin: string | null = sessionStorage.getItem('admin') || null;
  private _email: string | null = sessionStorage.getItem('email') || null;

  constructor(private router: Router) {
    if (this._token) {
      const remainingTime = this.getTokenRemainingTime(this._token);
      this.setLogoutTimer(remainingTime);
    }
  }

  // Setter per il token e altri dati che salvano anche in sessionStorage
  set token(value: string | null) {
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
  get token(): string | null {
    return this._token;
  }

  set userCode(value: string | null) {
    this._userCode = value;
    if (value) sessionStorage.setItem('userCode', value);
    else sessionStorage.removeItem('userCode');
  }
  get userCode(): string | null {
    return this._userCode;
  }

  set admin(value: string | null) {
    this._admin = value;
    if (value) sessionStorage.setItem('admin', value);
    else sessionStorage.removeItem('admin');
  }
  get admin(): string | null {
    return this._admin;
  }

  set email(value: string | null) {
    this._email = value;
    if (value) sessionStorage.setItem('email', value);
    else sessionStorage.removeItem('email');
  }
  get email(): string | null {
    return this._email;
  }

  getTokenRemainingTime(token: string): number {
    try {
      const decodee = jwtDecode(token);
      if (!decodee || !decodee.exp) {
        console.error('[AuthService] Token decodificato senza exp');
        return 0;
      }
      const exp = decodee.exp * 1000;
      const remaining = exp - Date.now();
      return remaining > 0 ? remaining : 0;
    } catch (error) {
      console.error('[AuthService] Errore nella decodifica del token:', error);
      return 0;
    }
  }

  setLogoutTimer(remainingTime: number): void {
    this.clearLogoutTimer();
    console.log('[AuthService] Impostazione logout automatico in:', remainingTime, 'ms');
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
    console.log('[AuthService] Logout automatico eseguito');
    this.token = null;
    this.userCode = null;
    this.admin = null;
    this.email = null;
    this.router.navigate(['/']); // Aggiorna il percorso di login se necessario
  }
}
