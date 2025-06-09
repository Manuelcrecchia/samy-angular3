import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { GlobalService } from '../../service/global.service';
import { CustomerModelService } from '../../service/customer-model.service';
@Component({
  selector: 'app-add-customer',
  templateUrl: './add-customer.component.html',
  styleUrl: './add-customer.component.css'
})
export class AddCustomerComponent {
  constructor(public globalService: GlobalService, public customerModelService: CustomerModelService, private http: HttpClient, private router: Router){}

  ngOnInit(){
  }
  addCustomer(): void {
    if (this.customerModelService.tipoCliente === '') {
      alert('Compilare il campo tipo cliente.');
      return;
    }

    const body = {
      codiceOperatore: this.globalService.userCode,
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
      tempistica: this.customerModelService.tempistica
    };

    this.http.post(this.globalService.url + 'customers/add', body, {
      headers: this.globalService.headers,
      responseType: 'text'
    }).subscribe({
      next: (res) => {
        console.log('Cliente aggiunto:', res);
        this.customerModelService.reset();
        setTimeout(() => {
          this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
            this.router.navigate(['/addCustomer']);
          });
        }, 0);
      },
      error: (err) => {
        console.error('Errore durante il salvataggio del cliente:', err);
        alert('Errore durante il salvataggio del cliente. Controlla i dati e riprova.');
      }
    });
  }



   back(){
    this.router.navigateByUrl('/listCustomer')
  }
}
