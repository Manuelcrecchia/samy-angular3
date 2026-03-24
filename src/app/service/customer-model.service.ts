import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CustomerModelService {
  // comuni
  numeroCliente = '';
  nominativo = '';
  numeroPreventivo = ''; // popolato dal flusso preventivo → cliente
  cfpi = '';
  email = '';
  telefono = '';
  pagamento = '';
  note = '';
  tempistica = '';
  nOperatori = '';

  // SAMI
  tipoCliente = '';
  cittaDiFatturazione = '';
  selettorePrefissoViaDiFatturazione = '';
  viaDiFatturazione = '';
  capDiFatturazione = '';
  citta = '';
  selettorePrefissoVia = '';
  via = '';
  cap = '';
  referente = '';
  descrizioneImmobile = '';
  servizi = ['', '', '', '', '', '', '', '', '', '', '', '', '', ''];
  interventi = ['', '', '', '', '', '', '', '', '', '', '', '', '', ''];
  imponibile = '0.00';
  iva = 'N';
  key: boolean = false;

  // EMMECI
  codiceOperatore = '';
  data = '';
  ragSociale = '';

  cittaDiPartenza = '';
  selettorePrefissoViaDiPartenza = '';
  viaDiPartenza = '';
  pianoDiPartenza = '';
  occupazioneSuoloPubblicoDiPartenza = '';
  capDiPartenza = '';

  cittaDiArrivo = '';
  selettorePrefissoViaDiArrivo = '';
  viaDiArrivo = '';
  pianoDiArrivo = '';
  occupazioneSuoloPubblicoDiArrivo = '';
  capDiArrivo = '';

  altreDestinazioni = '';
  stanzeEOggetti = '';

  lampadari = false;
  imballaggio = false;
  smaltimentoMaterialiDiRisulta = false;
  riposizionamentoContenutiDegliArredi = false;
  smontaggioEImballaggioDegliArredi = false;
  caricoSuNostroMezzoIdoneo = false;
  trasporto = false;
  scaricoEConsegnaAlPiano = false;
  montaggioDegliArredi = false;
  ausilioDiElevatoreEsternoOvePossibile = false;
  assicurazioneControIRischiDiTrasporto = false;
  fornituraMaterialiDaImballo = false;
  imballaggioDeiContenuti = false;
  custodiaInDeposito = false;
  ospCarico = false;
  ospScarico = false;

  prezzoTrasloco = 0;
  prezzoFornituraMaterialiDaImballo = 0;
  prezzoImballaggioDeiContenuti = 0;
  prezzoPassaggioInDeposito = 0;
  prezzoOccupazioneSuoloPubblico = 0;
  prezzoMensileCustodiaMobili = 0;

  reset() {
    this.numeroCliente = '';
    this.nominativo = '';
    this.numeroPreventivo = '';
    this.cfpi = '';
    this.email = '';
    this.telefono = '';
    this.pagamento = '';
    this.note = '';
    this.tempistica = '';
    this.nOperatori = '';

    this.tipoCliente = '';
    this.cittaDiFatturazione = '';
    this.selettorePrefissoViaDiFatturazione = '';
    this.viaDiFatturazione = '';
    this.capDiFatturazione = '';
    this.citta = '';
    this.selettorePrefissoVia = '';
    this.via = '';
    this.cap = '';
    this.referente = '';
    this.descrizioneImmobile = '';
    this.servizi = ['', '', '', '', '', '', '', '', '', '', '', '', '', ''];
    this.interventi = ['', '', '', '', '', '', '', '', '', '', '', '', '', ''];
    this.imponibile = '0.00';
    this.iva = 'N';
    this.key = false;

    this.codiceOperatore = '';
    this.data = '';
    this.ragSociale = '';

    this.cittaDiPartenza = '';
    this.selettorePrefissoViaDiPartenza = '';
    this.viaDiPartenza = '';
    this.pianoDiPartenza = '';
    this.occupazioneSuoloPubblicoDiPartenza = '';
    this.capDiPartenza = '';

    this.cittaDiArrivo = '';
    this.selettorePrefissoViaDiArrivo = '';
    this.viaDiArrivo = '';
    this.pianoDiArrivo = '';
    this.occupazioneSuoloPubblicoDiArrivo = '';
    this.capDiArrivo = '';

    this.altreDestinazioni = '';
    this.stanzeEOggetti = '';

    this.lampadari = false;
    this.imballaggio = false;
    this.smaltimentoMaterialiDiRisulta = false;
    this.riposizionamentoContenutiDegliArredi = false;
    this.smontaggioEImballaggioDegliArredi = false;
    this.caricoSuNostroMezzoIdoneo = false;
    this.trasporto = false;
    this.scaricoEConsegnaAlPiano = false;
    this.montaggioDegliArredi = false;
    this.ausilioDiElevatoreEsternoOvePossibile = false;
    this.assicurazioneControIRischiDiTrasporto = false;
    this.fornituraMaterialiDaImballo = false;
    this.imballaggioDeiContenuti = false;
    this.custodiaInDeposito = false;
    this.ospCarico = false;
    this.ospScarico = false;

    this.prezzoTrasloco = 0;
    this.prezzoFornituraMaterialiDaImballo = 0;
    this.prezzoImballaggioDeiContenuti = 0;
    this.prezzoPassaggioInDeposito = 0;
    this.prezzoOccupazioneSuoloPubblico = 0;
    this.prezzoMensileCustodiaMobili = 0;
  }

  constructor() {}
}
