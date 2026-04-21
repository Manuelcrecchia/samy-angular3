import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { GlobalService } from '../../service/global.service';

@Component({
  selector: 'app-service-orders',
  templateUrl: './service-orders.component.html',
  styleUrls: ['./service-orders.component.css'],
})
export class ServiceOrdersComponent implements OnInit {
  orders: any[] = [];
  search = '';
  loading = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    public global: GlobalService,
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    const q = encodeURIComponent(this.search.trim());
    const url = this.global.url + `service-orders${q ? `?q=${q}` : ''}`;

    this.http.get<any[]>(url).subscribe({
      next: (orders) => {
        this.orders = orders || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Errore caricamento ordini di servizio:', err);
        this.loading = false;
        alert('Errore nel caricamento degli ordini di servizio.');
      },
    });
  }

  addOrder(): void {
    this.router.navigateByUrl('/service-orders/add');
  }

  goBack(): void {
    this.router.navigateByUrl('/homeAdmin');
  }

  customerName(order: any): string {
    const customer = order?.customer || {};
    return [customer.nominativo, customer.ragSociale]
      .filter(Boolean)
      .join(' ')
      .trim() || '-';
  }
}
