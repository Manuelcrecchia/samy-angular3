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
  cup = '';
  email = '';
   telefono = '';
  referente = '';
  descrizioneImmmobile= '';
  servizi = '';

  imponibile = "0.00";
  iva= "N";
  pagamento = "";
  note= '';
  stato = "R";

  constructor() {}
}
