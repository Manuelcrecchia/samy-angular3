// src/app/componenti/scheda-cliente/scheda-cliente.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { GlobalService } from '../../service/global.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-scheda-cliente',
  templateUrl: './scheda-cliente.component.html',
  styleUrls: ['./scheda-cliente.component.css'],
})
export class SchedaClienteComponent implements OnInit {
  cliente: any | null = null;

  constructor(
    public globalService: GlobalService,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute
  ) {}
  ngOnInit(): void {
    const numeroCliente = this.route.snapshot.paramMap.get('numeroCliente');
    if (numeroCliente) {
      this.http
        .post(
          this.globalService.url + 'customers/getCustomer',
          {
            numeroCliente: numeroCliente,
          },
          {
            headers: this.globalService.headers,
          }
        )
        .subscribe({
          next: (res: any) => {
            this.cliente = res[0];
          },
          error: (err) => {
            console.error('Errore caricamento cliente:', err);
            alert('Errore durante il caricamento del cliente');
          },
        });
    }
  }
  parseJson(val: string): string[] {
    try {
      return JSON.parse(val || '[]');
    } catch {
      return [];
    }
  }

  isSami(): boolean {
    return this.cliente && (!!this.cliente.citta || !!this.cliente.via || !!this.cliente.cap);
  }

  isEmmeci(): boolean {
    return this.cliente && (!!this.cliente.cittaDiPartenza || !!this.cliente.viaDiPartenza || !!this.cliente.ragSociale || this.cliente.stanzeEOggetti);
  }

  parseStanzeEOggetti(value: any): any[] {
    if (!value) return [];
    try {
      const parsed = typeof value === 'string' ? JSON.parse(value) : value;
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  back() {
    this.router.navigateByUrl('/listCustomer');
  }
}
