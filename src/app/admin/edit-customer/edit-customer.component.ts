import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomerModelService } from '../../service/customer-model.service';
import { HttpClient } from '@angular/common/http';
import { GlobalService } from '../../service/global.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-edit-customer',
  templateUrl: './edit-customer.component.html',
  styleUrl: './edit-customer.component.css'
})
export class EditCustomerComponent {
  constructor(
    public customerModelService: CustomerModelService,
    private http: HttpClient,
    private globalService: GlobalService,
    private router: Router,
    private location: Location
  ) {}

  editCustomer(): void {
    const body = {
      numeroCliente: String(this.customerModelService.numeroCliente).trim(),
      tipoCliente: this.customerModelService.tipoCliente,
      nominativo: this.customerModelService.nominativo,
      cfpi: this.customerModelService.cfpi,
      citta: this.customerModelService.citta,
      selettorePrefissoVia: this.customerModelService.selettorePrefissoVia,
      via: this.customerModelService.via,
      cap: this.customerModelService.cap,
      email: this.customerModelService.email,
      telefono: this.customerModelService.telefono,
      referente: this.customerModelService.referente,
      descrizioneImmobile: this.customerModelService.descrizioneImmobile,
      servizi: JSON.stringify(this.customerModelService.servizi),
      interventi: JSON.stringify(this.customerModelService.interventi),
      imponibile: this.customerModelService.imponibile,
      iva: this.customerModelService.iva,
      pagamento: this.customerModelService.pagamento,
      note: this.customerModelService.note,
      key: this.customerModelService.key,
      tempistica: this.customerModelService.tempistica,
      nOperatori: this.customerModelService.nOperatori
    };


    this.http.post(this.globalService.url + 'customers/edit', body, {
      headers: this.globalService.headers,
      responseType: 'text',
    }).subscribe({
      next: (response) => {
        this.customerModelService.reset();
        this.router.navigateByUrl('/listCustomer');
      },
      error: (err) => {
        console.error("Errore durante l'aggiornamento:", err);
      }
    });
  }


  back(): void {
    this.router.navigateByUrl('/listCustomer');
  }

  @HostListener('window:popstate', ['$event'])
  onBrowserBackBtnClose(event: Event): void {
    event.preventDefault();
    this.router.navigateByUrl('/listCustomer', { replaceUrl: true });
  }

}
