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
  cittaDiFatturazione = '';
  selettorePrefissoViaDiFatturazione = '';
  viaDiFatturazione = '';
  capDiFatturazione = '';
  citta = '';
  selettorePrefissoVia = '';
  via = '';
  cap = '';
  email = '';
  telefono = '';
  referente = '';
  descrizioneImmobile = '';
  servizi = ['', '', '', '', '', '', '', '', '', '', '', '', '', ''];
  interventi = ['', '', '', '', '', '', '', '', '', '', '', '', '', ''];

  imponibile = '0.00';
  iva = 'N';
  pagamento = '';
  tempistica = '';
  dataInizioContratto = '';
  dataInizioContrattoDate: Date | null = null;
  durataContratto = '';
  note = '';
  complete = '';

  constructor() {}

  resetQuoteModel() {
    this.numeroPreventivo = '';
    this.tipoPreventivo = '';
    this.codiceOperatore = '';
    this.data = '';
    this.nominativo = '';
    this.cfpi = '';
    this.cittaDiFatturazione = '';
    this.selettorePrefissoViaDiFatturazione = '';
    this.viaDiFatturazione = '';
    this.capDiFatturazione = '';
    this.citta = '';
    this.selettorePrefissoVia = '';
    this.via = '';
    this.cap = '';
    this.email = '';
    this.telefono = '';
    this.referente = '';
    this.descrizioneImmobile = '';
    this.servizi = ['', '', '', '', '', '', '', '', '', '', '', '', '', ''];
    this.interventi = ['', '', '', '', '', '', '', '', '', '', '', '', '', ''];
    this.imponibile = '0.00';
    this.iva = 'N';
    this.pagamento = '';
    this.tempistica = '';
    this.dataInizioContratto = '';
    this.dataInizioContrattoDate = null;
    this.durataContratto = '';
    this.note = '';
  }
}
