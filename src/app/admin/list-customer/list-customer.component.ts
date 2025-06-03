import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { GlobalService } from '../../service/global.service';
import { CustomerModelService } from '../../service/customer-model.service';
import { Component, Input } from '@angular/core';
@Component({
  selector: 'app-list-customer',
  templateUrl: './list-customer.component.html',
  styleUrl: './list-customer.component.css'
})
export class ListCustomerComponent {
  customers: any[] = [];
  customersFrEnd: any[] = [];

  constructor(
    private http: HttpClient,
    public globalService: GlobalService,
    private router: Router,
    private customerModelService: CustomerModelService,

  ) {}

  ngOnInit(): void {
    this.getCustomers();
  }

  getCustomers(): void {
    this.http.get(this.globalService.url + "customers/getAll", {
      headers: this.globalService.headers,
      responseType: "text"
    }).subscribe({
      next: (response) => {
        try {
          const data = JSON.parse(response);
          this.customers = data;
          this.customersFrEnd = data;
        } catch (err) {
          console.error("Errore nel parse JSON dei clienti:", err);
        }
      },
      error: (err) => console.error("Errore nel recupero clienti:", err)
    });
  }

  searchNumeroCliente(value: string): void {
    this.customersFrEnd = value ? this.customers.filter(c => c.numeroCliente.toString().startsWith(value)) : [...this.customers];
  }

  searchNominativo(value: string): void {
    this.customersFrEnd = value ? this.customers.filter(c => c.nominativo.toLowerCase().startsWith(value.toLowerCase())) : [...this.customers];
  }

  navigateToEditCustomer(numeroCliente: string): void {
    const body = { numeroCliente };
  
    this.http.post(this.globalService.url + 'customers/getCustomer', body, {
      headers: this.globalService.headers,
      responseType: 'text',
    }).subscribe((response) => {
      if (response === 'Unauthorized') {
        this.router.navigateByUrl('/');
      } else {
        const cliente = JSON.parse(response)[0];
        this.customerModelService.numeroCliente = cliente.numeroCliente;
        this.customerModelService.tipoCliente = cliente.tipoCliente;
        this.customerModelService.nominativo = cliente.nominativo;
        this.customerModelService.cfpi = cliente.cfpi;
        this.customerModelService.citta = cliente.citta;
        this.customerModelService.selettorePrefissoVia = cliente.selettorePrefissoVia;
        this.customerModelService.via = cliente.via;
        this.customerModelService.cap = cliente.cap;
        this.customerModelService.email = cliente.email;
        this.customerModelService.telefono = cliente.telefono;
        this.customerModelService.referente = cliente.referente;
        this.customerModelService.descrizioneImmobile = cliente.descrizioneImmobile;
        this.customerModelService.servizi = JSON.parse(cliente.servizi || '[]');
        this.customerModelService.interventi = JSON.parse(cliente.interventi || '[]');
        this.customerModelService.imponibile = parseFloat(cliente.imponibile).toFixed(2);
        this.customerModelService.iva = cliente.iva;
        this.customerModelService.pagamento = cliente.pagamento;
        this.customerModelService.note = cliente.note;
        this.customerModelService.key = cliente.key;
  
        this.router.navigateByUrl('/editCustomer');
      }
    });
  }
  

  deleteCustomer(numeroCliente: string): void {
    if (!confirm("Sei sicuro di voler eliminare questo cliente?")) return;
  
    this.http.post(this.globalService.url + "customers/delete", { numeroCliente }, {
      headers: this.globalService.headers,
      responseType: "text"
    }).subscribe({
      next: () => {
        this.customers = this.customers.filter(c => c.numeroCliente !== numeroCliente);
        this.customersFrEnd = [...this.customers];
      },
      error: (err) => {
        console.error("Errore eliminazione cliente:", err);
        alert("Errore durante l'eliminazione");
      }
    });
  }
  

  navigateToAddCustomer(){
    this.router.navigateByUrl('/addCustomer');
  }

}
