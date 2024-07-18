import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CustomerModelService {

  numeroCliente = '';
  tipoCliente = '';
  nominativo = '';
  cfpi = '';
  citta = '';
  selettorePrefissoVia = '';
  via = '';
  cap = '';
  email = '';
  telefono = '';
  referente = '';
  descrizioneImmobile= '';
  servizi = ['','','','','','','','','','','','','',''];
  interventi = ['','','','','','','','','','','','','',''];

  imponibile = "0.00";
  iva= "N";
  pagamento = "";
  note= '';
  password='';

  constructor() { }
}
