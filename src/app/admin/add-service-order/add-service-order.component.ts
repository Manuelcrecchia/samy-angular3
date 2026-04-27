import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalService } from '../../service/global.service';

@Component({
  selector: 'app-add-service-order',
  templateUrl: './add-service-order.component.html',
  styleUrls: ['./add-service-order.component.css'],
})
export class AddServiceOrderComponent implements OnInit, OnDestroy {
  customerQuery = '';
  customers: any[] = [];
  selectedCustomer: any = null;
  descrizione = '';
  data = '';
  ora = '';
  isEditMode = false;
  loadingOrder = false;
  orderId: number | null = null;
  loadingCustomers = false;
  saving = false;
  private searchTimer: ReturnType<typeof setTimeout> | null = null;
  private suppressNextSearch = false;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    public global: GlobalService,
  ) {}

  ngOnInit(): void {
    const id = Number.parseInt(this.route.snapshot.paramMap.get('id') || '', 10);
    if (Number.isInteger(id) && id > 0) {
      this.isEditMode = true;
      this.orderId = id;
      this.loadOrder();
    }
  }

  ngOnDestroy(): void {
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }
  }

  onCustomerQueryChange(value: string): void {
    if (this.isEditMode) {
      return;
    }

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
    if (this.isEditMode) {
      return;
    }

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

  private loadOrder(): void {
    if (!this.orderId) {
      return;
    }

    this.loadingOrder = true;
    this.http
      .get<any>(this.global.url + `service-orders/${this.orderId}`)
      .subscribe({
        next: (order) => {
          this.loadingOrder = false;
          const customer = order?.customer || { numeroCliente: order?.numeroCliente };
          this.selectedCustomer = customer;
          this.customerQuery = `${customer.numeroCliente || '-'} - ${this.customerName(customer)}`;
          this.descrizione = order?.descrizione || '';
          this.data = this.toInputDate(order?.scheduledStart);
          this.ora = this.toInputTime(order?.scheduledStart);
        },
        error: (err) => {
          console.error("Errore caricamento ordine di servizio:", err);
          this.loadingOrder = false;
          alert(err?.error?.error || "Errore nel caricamento dell'ordine di servizio.");
          this.goBack();
        },
      });
  }

  save(): void {
    if (!this.isEditMode && !this.selectedCustomer) {
      alert('Seleziona un cliente.');
      return;
    }

    if (!this.descrizione.trim() || (!this.isEditMode && (!this.data || !this.ora))) {
      alert('Descrizione, data e ora sono obbligatorie.');
      return;
    }

    this.saving = true;
    const url = this.isEditMode && this.orderId
      ? this.global.url + `service-orders/${this.orderId}`
      : this.global.url + 'service-orders';

    const payload = this.isEditMode
      ? {
          descrizione: this.descrizione.trim(),
        }
      : {
          numeroCliente: this.selectedCustomer.numeroCliente,
          descrizione: this.descrizione.trim(),
          scheduledStart: `${this.data}T${this.ora}:00`,
        };

    this.http.post(url, payload).subscribe({
      next: () => {
        this.saving = false;
        this.router.navigateByUrl('/service-orders');
      },
      error: (err) => {
        console.error(
          this.isEditMode
            ? 'Errore modifica ordine di servizio:'
            : 'Errore creazione ordine di servizio:',
          err,
        );
        this.saving = false;
        alert(
          err?.error?.error ||
            (this.isEditMode
              ? "Errore nella modifica dell'ordine di servizio."
              : "Errore nella creazione dell'ordine di servizio."),
        );
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

  isEmmeciCustomer(): boolean {
    return !!(
      this.selectedCustomer?.viaDiPartenza ||
      this.selectedCustomer?.viaDiArrivo ||
      this.selectedCustomer?.cittaDiPartenza ||
      this.selectedCustomer?.cittaDiArrivo
    );
  }

  samiAddress(): string {
    const customer = this.selectedCustomer || {};
    return [
      customer.selettorePrefissoVia,
      customer.via,
      customer.cap,
      customer.citta,
    ]
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

  private toInputDate(value: any): string {
    if (!value) return '';
    const parsed = new Date(value);
    if (isNaN(parsed.getTime())) return '';
    const pad = (part: number) => String(part).padStart(2, '0');
    return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}`;
  }

  private toInputTime(value: any): string {
    if (!value) return '';
    const parsed = new Date(value);
    if (isNaN(parsed.getTime())) return '';
    const pad = (part: number) => String(part).padStart(2, '0');
    return `${pad(parsed.getHours())}:${pad(parsed.getMinutes())}`;
  }
}
