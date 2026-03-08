import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { AuthServiceService } from '../auth-service.service';
import { TenantService } from './tenant.service';

@Injectable({
  providedIn: 'root',
})
export class GlobalService {
  version = '2.0';

  constructor(
    private authService: AuthServiceService,
    private tenantService: TenantService,
  ) {}

  get url(): string {
    const host = window.location.hostname.toLowerCase();

    if (host.includes('localhost') || host.includes('127.0.0.1')) {
      console.log('DEVI AVVIARE ANGULAR CON IL COMANDO --host');
      return '';
    }

    if (this.tenantService.isEmmeci) {
      return 'https://nodeemmeci.mvtechcore.it/';
    }

    return 'https://nodesami.mvtechcore.it/';
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
