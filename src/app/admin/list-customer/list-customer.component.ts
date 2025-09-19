import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { GlobalService } from '../../service/global.service';
import { CustomerModelService } from '../../service/customer-model.service';
import { Component, Input } from '@angular/core';
import { saveAs } from 'file-saver';

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

  private normalize(s: string): string {
    return (s || '')
      .normalize('NFD')                // separa lettere e accenti
      .replace(/\p{Diacritic}/gu, '')  // elimina diacritici (es. è -> e)
      .toLowerCase()
      .trim();
  }
  
  searchNumeroCliente(v: string): void {
    const q = this.normalize(v);
    this.customersFrEnd = q
      ? this.customers.filter(c =>
          this.normalize(c?.numeroCliente?.toString()).startsWith(q)
        )
      : [...this.customers];
  }
  
  searchNominativo(v: string): void {
    const q = this.normalize(v);
    this.customersFrEnd = q
      ? this.customers.filter(c =>
          this.normalize(c?.nominativo).includes(q)
        )
      : [...this.customers];
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
        this.customerModelService.cittaDiFatturazione = cliente.cittaDiFatturazione;
        this.customerModelService.selettorePrefissoViaDiFatturazione = cliente.selettorePrefissoViaDiFatturazione;
        this.customerModelService.viaDiFatturazione = cliente.viaDiFatturazione;
        this.customerModelService.capDiFatturazione = cliente.capDiFatturazione;
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
        this.customerModelService.tempistica = cliente.tempistica;
        this.customerModelService.nOperatori = cliente.nOperatori;

        this.router.navigateByUrl('/editCustomer');
      }
    });
  }


  exportAndDeleteCustomer(customer: any): void {
    if (!confirm(`Vuoi esportare e cancellare il cliente "${customer.nominativo}"?`)) return;
  
    const body = {
      prefix: 'customer',
      id: customer.numeroCliente,
    };
  
    this.http.post(this.globalService.url + 'documents/exportAndDeleteUser', body, {
      headers: this.globalService.headers,
      responseType: 'blob'
    }).subscribe({
      next: (blob) => {
        const nomeFile = `cliente_${customer.numeroCliente}.zip`;
        saveAs(blob, nomeFile);
  
        alert('Cliente esportato e cancellato con successo.');
        this.ngOnInit();  // aggiorna la tabella
      },
      error: (err) => {
        console.error('Errore durante l\'esportazione/cancellazione:', err);
        alert('Errore durante l\'esportazione o eliminazione del cliente.');
      }
    });
  }
  

  applyFiltro(valore: string): void {
    switch (valore) {
      case 'chiave_si':
        this.customersFrEnd = this.customers.filter(c => c.key === true);
        break;
      case 'chiave_no':
        this.customersFrEnd = this.customers.filter(c => c.key === false);
        break;
      case 'ordinario':
        this.customersFrEnd = this.customers.filter(c => c.tipoCliente === 'O');
        break;
      case 'straordinario':
        this.customersFrEnd = this.customers.filter(c => c.tipoCliente === 'S');
        break;
      default:
        this.customersFrEnd = [...this.customers];
    }
  }



  navigateToAddCustomer(){
    this.router.navigateByUrl('/addCustomer');
  }
  viewDocuments(numeroCliente: string) {
    // Naviga o apri modale, a seconda di come gestisci i documenti
    this.router.navigate(['/documenti/client', numeroCliente]);}
    back(){
    this.router.navigateByUrl('/homeAdmin')
  }
}
