import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { AuthServiceService } from '../auth-service.service';
import { TenantService } from './tenant.service';

@Injectable({
  providedIn: 'root',
})
export class GlobalService {
  version = '3.6';

  constructor(
    private authService: AuthServiceService,
    private tenantService: TenantService,
  ) {}

  get url(): string {
    const host = window.location.hostname.toLowerCase();

    if (
      host.includes('localhost') ||
      host.includes('127.0.0.1') ||
      host.includes('emmeci.local') ||
      host.includes('sami.local')
    ) {
      return 'http://localhost:5001/';
    }

    if (this.tenantService.isEmmeci) {
      return 'https://nodeemmeci.mvtechcore.it/';
      //return 'http://nodeemmeci.mvtechcore.it:5001/';
    }

    return 'https://nodesami.mvtechcore.it/';
    //return 'http://nodesami.mvtechcore.it:5001/';
  }

  checkVersion(): Promise<boolean> {
    return new Promise((resolve) => {
      fetch(this.url + 'api/version')
        .then((res) => res.json())
        .then((data) => {
          if (data.version !== this.version) {
            alert(
              `Versione non valida!\nApp: ${this.version}\nServer: ${data.version}`,
            );
            resolve(false);
            this.logout();
          } else {
            resolve(true);
          }
        })
        .catch(() => {
          alert('Impossibile verificare la versione del server.');
          resolve(false);
        });
    });
  }

  get token(): string {
    return this.authService.token || '';
  }

  get userCode(): string {
    return this.authService.userCode || '';
  }

  get permissions(): string[] {
    return this.authService.permissions || [];
  }

  hasPermission(key: string): boolean {
    return this.permissions.includes(key);
  }

  get email(): string {
    return this.authService.email || '';
  }

  get headers(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json; charset=utf-8',
      Authorization: `Bearer ${this.token}`,
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
