import { HttpClient } from '@angular/common/http';
import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { GlobalService } from '../../service/global.service';
import { QuoteModelService } from '../../service/quote-model.service';
import { PopupServiceService } from '../../componenti/popup/popup-service.service';
import { DatePipe } from '@angular/common';
import { Location } from '@angular/common';
import { TenantService } from '../../service/tenant.service';

@Component({
  selector: 'app-add-quote',
  templateUrl: './add-quote.component.html',
  styleUrls: ['./add-quote.component.css'],
})
export class AddQuoteComponent {
  constructor(
    public globalService: GlobalService,
    private datePipe: DatePipe,
    public quoteModelService: QuoteModelService,
    public tenantService: TenantService,
    private http: HttpClient,
    private router: Router,
    private popup: PopupServiceService,
    private location: Location,
  ) {}

  stanzaSelezionata: string = '';

  nomiStanze: string[] = [
    'Ingresso',
    'Soggiorno',
    'Salotto',
    'Studio',
    'Tinello',
    'Cucina',
    'Camera matr.',
    'Cameretta',
    'Bagno',
    'Disimpegno',
    'Ripostiglio',
    'Terrazzo',
    'Giardino',
    'Garage',
    'Cantina',
    'Solaio',
  ];

  stanzeEOggettiList: { stanza: string; oggetti: string }[] = [];

  aggiornaListaStanze(): void {
    if (this.quoteModelService.tipoPreventivo === 'U') {
      this.nomiStanze = [
        'Ufficio Sala',
        'Sala Server',
        'Sala Ristoro',
        'Archivio',
        'Reception',
      ];
    } else {
      this.nomiStanze = [
        'Ingresso',
        'Soggiorno',
        'Salotto',
        'Studio',
        'Tinello',
        'Cucina',
        'Camera matr.',
        'Cameretta',
        'Bagno',
        'Disimpegno',
        'Ripostiglio',
        'Terrazzo',
        'Giardino',
        'Garage',
        'Cantina',
        'Solaio',
      ];
    }
  }

  aggiungiCampoStanza(): void {
    if (this.stanzeEOggettiList.length >= 10) {
      alert('Limite massimo di 10 stanze raggiunto');
      return;
    }

    if (!this.stanzaSelezionata) return;

    const numeroEsistenti = this.stanzeEOggettiList.filter((s) =>
      s.stanza.startsWith(this.stanzaSelezionata),
    ).length;

    const nomeStanza =
      numeroEsistenti > 0
        ? `${this.stanzaSelezionata} ${numeroEsistenti + 1}`
        : this.stanzaSelezionata;

    this.stanzeEOggettiList.push({ stanza: nomeStanza, oggetti: '' });
    this.stanzaSelezionata = '';
  }

  rimuoviStanzaEOggetti(index: number): void {
    this.stanzeEOggettiList.splice(index, 1);
  }

  serviziOptions = [
    'Spazzaggio e lavaggio pavimentazione',
    'Vuotatura cestini con relativa sostituzione dei sacchetti',
    'Pulizia ed igienizzazione dei servizi igenici',
    'Pulizia porte',
    'Pulizia dei vetri e relativi infisii interni ed esterni ove possibile',
    'Deragnatura generale',
    'Pulizia termosifoni e/o condizionatori',
    'Pulizia battiscopa',
  ];

  sameAddress = true;

  ngOnInit() {
    if (this.tenantService.isEmmeci) {
      this.aggiornaListaStanze();
    }
  }
  private buildSamiBody() {
    if (this.sameAddress) {
      this.quoteModelService.cittaDiFatturazione = this.quoteModelService.citta;
      this.quoteModelService.selettorePrefissoViaDiFatturazione =
        this.quoteModelService.selettorePrefissoVia;
      this.quoteModelService.viaDiFatturazione = this.quoteModelService.via;
      this.quoteModelService.capDiFatturazione = this.quoteModelService.cap;
    }

    return {
      codiceOperatore: this.globalService.userCode,
      tipoPreventivo: this.quoteModelService.tipoPreventivo,
      nominativo: this.quoteModelService.nominativo,
      cfpi: this.quoteModelService.cfpi,
      cittaDiFatturazione: this.quoteModelService.cittaDiFatturazione,
      selettorePrefissoViaDiFatturazione:
        this.quoteModelService.selettorePrefissoViaDiFatturazione,
      viaDiFatturazione: this.quoteModelService.viaDiFatturazione,
      capDiFatturazione: this.quoteModelService.capDiFatturazione,
      citta: this.quoteModelService.citta,
      selettorePrefissoVia: this.quoteModelService.selettorePrefissoVia,
      via: this.quoteModelService.via,
      cap: this.quoteModelService.cap,
      email: this.quoteModelService.email,
      telefono: this.quoteModelService.telefono,
      referente: this.quoteModelService.referente,
      descrizioneImmobile: this.quoteModelService.descrizioneImmobile,
      servizi: JSON.stringify(this.quoteModelService.servizi),
      interventi: JSON.stringify(this.quoteModelService.interventi),
      imponibile: Number(this.quoteModelService.imponibile || 0).toFixed(2),
      iva: this.quoteModelService.iva,
      pagamento: this.quoteModelService.pagamento,
      tempistica: this.quoteModelService.tempistica,
      dataInizioContratto:
        this.quoteModelService.dataInizioContrattoDate != null
          ? this.datePipe.transform(
              this.quoteModelService.dataInizioContrattoDate,
              'dd/MM/yyyy',
            )
          : this.quoteModelService.dataInizioContratto,
      durataContratto: this.quoteModelService.durataContratto,
      note: this.quoteModelService.note,
    };
  }

  private buildEmmeciBody() {
    return {
      codiceOperatore: this.globalService.userCode,
      data: this.quoteModelService.data,
      nominativo: this.quoteModelService.nominativo,
      cfpi: this.quoteModelService.cfpi,
      email: this.quoteModelService.email,
      telefono: this.quoteModelService.telefono,
      ragSociale: this.quoteModelService.ragSociale,

      cittaDiPartenza: this.quoteModelService.cittaDiPartenza,
      selettorePrefissoViaDiPartenza:
        this.quoteModelService.selettorePrefissoViaDiPartenza,
      viaDiPartenza: this.quoteModelService.viaDiPartenza,
      pianoDiPartenza: this.quoteModelService.pianoDiPartenza,
      occupazioneSuoloPubblicoDiPartenza:
        this.quoteModelService.occupazioneSuoloPubblicoDiPartenza,
      capDiPartenza: this.quoteModelService.capDiPartenza,

      cittaDiArrivo: this.quoteModelService.cittaDiArrivo,
      selettorePrefissoViaDiArrivo:
        this.quoteModelService.selettorePrefissoViaDiArrivo,
      viaDiArrivo: this.quoteModelService.viaDiArrivo,
      pianoDiArrivo: this.quoteModelService.pianoDiArrivo,
      occupazioneSuoloPubblicoDiArrivo:
        this.quoteModelService.occupazioneSuoloPubblicoDiArrivo,
      capDiArrivo: this.quoteModelService.capDiArrivo,

      altreDestinazioni: this.quoteModelService.altreDestinazioni,
      stanzeEOggetti: JSON.stringify(this.stanzeEOggettiList),
      lampadari: this.quoteModelService.lampadari,
      imballaggio: this.quoteModelService.imballaggio,
      smaltimentoMaterialiDiRisulta:
        this.quoteModelService.smaltimentoMaterialiDiRisulta,
      riposizionamentoContenutiDegliArredi:
        this.quoteModelService.riposizionamentoContenutiDegliArredi,
      smontaggioEImballaggioDegliArredi:
        this.quoteModelService.smontaggioEImballaggioDegliArredi,
      caricoSuNostroMezzoIdoneo:
        this.quoteModelService.caricoSuNostroMezzoIdoneo,
      trasporto: this.quoteModelService.trasporto,
      scaricoEConsegnaAlPiano: this.quoteModelService.scaricoEConsegnaAlPiano,
      montaggioDegliArredi: this.quoteModelService.montaggioDegliArredi,
      ausilioDiElevatoreEsternoOvePossibile:
        this.quoteModelService.ausilioDiElevatoreEsternoOvePossibile,
      assicurazioneControIRischiDiTrasporto:
        this.quoteModelService.assicurazioneControIRischiDiTrasporto,
      fornituraMaterialiDaImballo:
        this.quoteModelService.fornituraMaterialiDaImballo,
      imballaggioDeiContenuti: this.quoteModelService.imballaggioDeiContenuti,
      custodiaInDeposito: this.quoteModelService.custodiaInDeposito,
      ospCarico: this.quoteModelService.ospCarico,
      ospScarico: this.quoteModelService.ospScarico,

      prezzoTrasloco: this.quoteModelService.prezzoTrasloco,
      prezzoFornituraMaterialiDaImballo:
        this.quoteModelService.prezzoFornituraMaterialiDaImballo,
      prezzoImballaggioDeiContenuti:
        this.quoteModelService.prezzoImballaggioDeiContenuti,
      prezzoPassaggioInDeposito:
        this.quoteModelService.prezzoPassaggioInDeposito,
      prezzoOccupazioneSuoloPubblico:
        this.quoteModelService.prezzoOccupazioneSuoloPubblico,
      prezzoMensileCustodiaMobili:
        this.quoteModelService.prezzoMensileCustodiaMobili,

      pagamento: this.quoteModelService.pagamento,
      note: this.quoteModelService.note,
    };
  }

  addQuote() {
    if (
      this.tenantService.isSami &&
      this.quoteModelService.tipoPreventivo === ''
    ) {
      this.popup.text = 'INSERISCI IL TIPO DI PREVENTIVO';
      this.popup.openPopup();
      return;
    }

    const body = this.tenantService.isEmmeci
      ? this.buildEmmeciBody()
      : this.buildSamiBody();

    this.http
      .post(this.globalService.url + 'quotes/add', body, {
        headers: this.globalService.headers,
        responseType: 'text',
      })
      .subscribe({
        next: () => {
          this.quoteModelService.resetQuoteModel();
          this.router.navigateByUrl('/quotesHome', { replaceUrl: true });
        },
        error: (err) => {
          console.error('Errore addQuote:', err);

          let msg = 'ERRORE DURANTE IL SALVATAGGIO DEL PREVENTIVO';

          if (err?.error) {
            if (typeof err.error === 'string') {
              try {
                const parsed = JSON.parse(err.error);
                msg = parsed?.error || msg;
              } catch {
                msg = err.error;
              }
            } else if (typeof err.error === 'object') {
              msg = err.error?.error || msg;
            }
          }

          this.popup.text = msg.toUpperCase();
          this.popup.openPopup();
        },
      });
  }

  formatImponibile() {
    const value = this.quoteModelService.imponibile;
    const numberValue = parseFloat(value);
    if (!isNaN(numberValue)) {
      this.quoteModelService.imponibile = numberValue.toFixed(2);
    }
  }

  back() {
    this.router.navigateByUrl('/quotesHome');
  }

  @HostListener('window:popstate', ['$event'])
  onBrowserBackBtnClose(event: Event): void {
    event.preventDefault();
    this.quoteModelService.resetQuoteModel();
    this.location.replaceState('/quotesHome');
    this.router.navigateByUrl('/quotesHome');
  }
}
