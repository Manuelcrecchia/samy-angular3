import { Component, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { GlobalService } from '../../service/global.service';

@Component({
  selector: 'app-add-service-order',
  templateUrl: './add-service-order.component.html',
  styleUrls: ['./add-service-order.component.css'],
})
export class AddServiceOrderComponent implements OnDestroy {
  customerQuery = '';
  customers: any[] = [];
  selectedCustomer: any = null;
  descrizione = '';
  data = '';
  ora = '';
  loadingCustomers = false;
  saving = false;
  private searchTimer: ReturnType<typeof setTimeout> | null = null;
  private suppressNextSearch = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    public global: GlobalService,
  ) {}

  ngOnDestroy(): void {
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }
  }

  onCustomerQueryChange(value: string): void {
    this.customerQuery = value;

    if (this.suppressNextSearch) {
      this.suppressNextSearch = false;
      return;
    }

    this.selectedCustomer = null;

    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }

    const q = this.customerQuery.trim();
    if (!q) {
      this.customers = [];
      this.loadingCustomers = false;
      return;
    }

    this.searchTimer = setTimeout(() => this.searchCustomers(), 250);
  }

  searchCustomers(): void {
    const q = this.customerQuery.trim();
    if (!q) {
      this.customers = [];
      return;
    }

    this.loadingCustomers = true;
    this.http
      .get<any[]>(this.global.url + `service-orders/customers?q=${encodeURIComponent(q)}`)
      .subscribe({
        next: (customers) => {
          this.customers = customers || [];
          this.loadingCustomers = false;
        },
        error: (err) => {
          console.error('Errore ricerca clienti:', err);
          this.loadingCustomers = false;
          alert('Errore nella ricerca clienti.');
        },
      });
  }

  selectCustomer(customer: any): void {
    this.selectedCustomer = customer;
    this.suppressNextSearch = true;
    this.customerQuery = `${customer.numeroCliente} - ${this.customerName(customer)}`;
    this.customers = [];
  }

  save(): void {
    if (!this.selectedCustomer) {
      alert('Seleziona un cliente.');
      return;
    }

    if (!this.descrizione.trim() || !this.data || !this.ora) {
      alert('Descrizione, data e ora sono obbligatorie.');
      return;
    }

    this.saving = true;
    this.http
      .post(this.global.url + 'service-orders', {
        numeroCliente: this.selectedCustomer.numeroCliente,
        descrizione: this.descrizione.trim(),
        scheduledStart: `${this.data}T${this.ora}:00`,
      })
      .subscribe({
        next: () => {
          this.saving = false;
          this.router.navigateByUrl('/service-orders');
        },
        error: (err) => {
          console.error('Errore creazione ordine di servizio:', err);
          this.saving = false;
          alert(err?.error?.error || "Errore nella creazione dell'ordine di servizio.");
        },
      });
  }

  goBack(): void {
    this.router.navigateByUrl('/service-orders');
  }

  customerName(customer: any): string {
    return [customer?.nominativo, customer?.ragSociale]
      .filter(Boolean)
      .join(' ')
      .trim() || '-';
  }

  address(prefix: string): string {
    const customer = this.selectedCustomer || {};
    return [
      customer[`selettorePrefissoViaDi${prefix}`],
      customer[`viaDi${prefix}`],
      customer[`capDi${prefix}`],
      customer[`cittaDi${prefix}`],
    ]
      .filter(Boolean)
      .join(' ')
      .trim() || '-';
  }
}
