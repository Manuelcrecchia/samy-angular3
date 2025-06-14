import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class QuoteModelService {
  numeroPreventivo = '';
  tipoPreventivo = '';
  codiceOperatore = '';
  data = '';
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
  tempistica = "";
  dataInizioContratto = "";
  durataContratto = "";
  note= '';
  complete = false;

  constructor() {}

  resetQuoteModel(){
    this.numeroPreventivo = '';
    this.tipoPreventivo = '';
    this.codiceOperatore = '';
    this.data = '';
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
    this.servizi = ['','','','','','','','','','','','','',''];
    this.interventi = ['','','','','','','','','','','','','',''];
    this.imponibile = '0.00';
    this.iva = 'N';
    this.pagamento = '';
    this.tempistica = '';
    this.note = '';
  }
}
