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

  addCustomer(){
    if(this.customerModelService.tipoCliente == 
      ''){
          //INSERIRE UN ALERT PER AVVISARE DI IMMETERE IL CAMPO
    }
    else{

    let body = {
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
      note : this.customerModelService.note,
      key : this.customerModelService.key
    }
    this.http
      .post(this.globalService.url + 'customers/add', body, {
        headers: this.globalService.headers,
        responseType: 'text',
      })
      // ...
      .subscribe((response) => {
        this.router.navigateByUrl('/listCustomer', { replaceUrl: true });

      });
    }
   }
}
