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
  @Input() color: any;
  numeroClienteSelezionato = '';

  customersFrEnd: {
    numeroCliente: string;
    nominativo: string;
    email: string;
    telefono: string;
  }[] = [];

  constructor(  private http: HttpClient,
    private globalService: GlobalService,
    private router: Router,
    private customerModel: CustomerModelService,
   ){}

navigateToAddCustomer(){
  this.router.navigateByUrl('/addCustomer');
}


ngOnInit() {
  this.http
    .get(this.globalService.url + 'customers/getAll', {
      headers: this.globalService.headers,
      responseType: 'text',
    })
    .subscribe((response) => {
      this.customersFrEnd = JSON.parse(response).reverse()

      if (this.customersFrEnd.length > 0) {
        this.numeroClienteSelezionato = this.customersFrEnd[0].numeroCliente;
        const body = { numeroPreventivo: this.customersFrEnd[0].numeroCliente };
      }
    });
}


searchNumeroCliente(value: string){

  if(value == ""){
    this.ngOnInit();
  }
  else{

    this.customersFrEnd = this.customersFrEnd.filter(customer => customer.numeroCliente.startsWith(value))
  }
}

searchNominativo(value: string){

  if(value == ""){
    this.ngOnInit();
  }
  else{
    this.customersFrEnd = this.customersFrEnd.filter(customer => customer.nominativo.startsWith(value))

  }
}

navigateToEditCustomer(numeroCliente: string){
  const body = { numeroCliente: numeroCliente };
this.http
          .post(
            this.globalService.url + 'quotes/getCustomer',
            body,
            {
              headers: this.globalService.headers,
              responseType: 'text',
            }
          )
          .subscribe((response) => {
            if(response == 'Unauthorized') {
              this.router.navigateByUrl('/')
            }
            else {
              let customerJson = (JSON.parse(response)[0]);
              this.customerModel.numeroCliente = customerJson["numeroCliente"];
              this.customerModel.tipoCliente= customerJson["tipoCliente"];
              this.customerModel.nominativo= customerJson["nominativo"];
              this.customerModel.cfpi = customerJson["cfpi"];
              this.customerModel.citta = customerJson["citta"];
              this.customerModel.selettorePrefissoVia = customerJson["selettorePrefissoVia"];
              this.customerModel.via = customerJson["via"];
              this.customerModel.cap = customerJson["cap"];
              this.customerModel.email = customerJson["email"];
              this.customerModel.telefono = customerJson["telefono"];
              this.customerModel.referente = customerJson["referente"];
              this.customerModel.descrizioneImmobile = customerJson["descrizioneImmobile"];
              this.customerModel.servizi = JSON.parse(customerJson["servizi"]);
              this.customerModel.interventi = JSON.parse(customerJson["interventi"]);
              this.customerModel.imponibile = customerJson["imponibile"];
              this.customerModel.iva = customerJson["iva"];
              this.customerModel.pagamento = customerJson["pagamento"];
              this.customerModel.note = customerJson["note"];

              this.router.navigateByUrl('/editCustomer');
            }
          });
}
delete(numeroCliente: string){
  const body = { numeroCliente: numeroCliente };

  this.http
  .post(
    this.globalService.url + 'customers/delete',
    body, {
      headers: this.globalService.headers,
      responseType: 'text',
    })
    .subscribe((response)=>{
      if(response == 'Unauthorized') {
        this.router.navigateByUrl('/')
      }
      else {
      this.ngOnInit();
      }
    })
}


navigateToMenageCustomer(numeroCliente: string){
  const body = { numeroCliente: numeroCliente };
this.http
          .post(
            this.globalService.url + 'customers/getCustomer',
            body,
            {
              headers: this.globalService.headers,
              responseType: 'text',
            }
          )
          .subscribe((response) => {
            if(response == 'Unauthorized') {
              this.router.navigateByUrl('/')
            }
            else {
              let customerJson = (JSON.parse(response)[0]);
              this.customerModel.numeroCliente = customerJson["numeroCliente"];
              this.customerModel.tipoCliente= customerJson["tipoCliente"];
              this.customerModel.nominativo= customerJson["nominativo"];
              this.customerModel.cfpi = customerJson["cfpi"];
              this.customerModel.citta = customerJson["citta"];
              this.customerModel.selettorePrefissoVia = customerJson["selettorePrefissoVia"];
              this.customerModel.via = customerJson["via"];
              this.customerModel.cap = customerJson["cap"];
              this.customerModel.email = customerJson["email"];
              this.customerModel.telefono = customerJson["telefono"];
              this.customerModel.referente = customerJson["referente"];
              this.customerModel.descrizioneImmobile = customerJson["descrizioneImmobile"];
              this.customerModel.servizi = JSON.parse(customerJson["servizi"]);
              this.customerModel.interventi = JSON.parse(customerJson["interventi"]);
              this.customerModel.imponibile = customerJson["imponibile"];
              this.customerModel.iva = customerJson["iva"];
              this.customerModel.pagamento = customerJson["pagamento"];
              this.customerModel.note = customerJson["note"];

              this.router.navigateByUrl('/menageCustomer');
            }
          });
}
}
