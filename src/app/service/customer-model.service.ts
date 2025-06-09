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
  key: boolean = false; // <- campo che ci interessa
  tempistica: string = '';




  reset() {
    this.numeroCliente = '';
    this.tipoCliente = 'O';
    this.nominativo = '';
    this.cfpi = '';
    this.citta = '';
    this.selettorePrefissoVia = '';
    this.via = '';
    this.cap = '';
    this.email = '';
    this.telefono = '';
    this.referente = '';
    this.descrizioneImmobile = '';
    this.servizi = Array(14).fill('');
    this.interventi = Array(14).fill('');
    this.imponibile = '';
    this.iva = 'N';
    this.pagamento = '';
    this.note = '';
    this.key = false;
    this.tempistica = '';
  }

  constructor() { }
}
