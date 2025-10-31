import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { AuthServiceService } from '../auth-service.service';

@Injectable({
  providedIn: 'root',
})
export class GlobalService {
  url = 'http://192.168.200.128:5001/';
  //url = 'https://samipulizie.it:4000/';
  version = '1.4.47';

  constructor(private authService: AuthServiceService) {}

  checkVersion(): Promise<boolean> {
    return new Promise((resolve) => {
      fetch(this.url + 'api/version')
        .then((res) => res.json())
        .then((data) => {
          if (data.version !== this.version) {
            alert(
              `Versione non valida!\nApp: ${this.version}\nServer: ${data.version}`
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

  get admin(): string {
    return this.authService.admin || '';
  }

  get email(): string {
    return this.authService.email || '';
  }

  get headers(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json; charset=utf-8',
      Authorization: `${this.token}`,
    });
  }

  logout(): void {
    this.authService.logout(); // delega al servizio principale
  }
}
