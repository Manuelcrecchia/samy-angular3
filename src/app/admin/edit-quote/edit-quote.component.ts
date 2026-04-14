import { HttpClient } from '@angular/common/http';
import { Component, HostListener } from '@angular/core';
import { GlobalService } from '../../service/global.service';
import { QuoteModelService } from '../../service/quote-model.service';
import { Router } from '@angular/router';
import { PopupServiceService } from '../../componenti/popup/popup-service.service';
import { DatePipe } from '@angular/common';
import { Location } from '@angular/common';
import { TenantService } from '../../service/tenant.service';

@Component({
  selector: 'app-edit-quote',
  templateUrl: './edit-quote.component.html',
  styleUrls: ['./edit-quote.component.css'],
})
export class EditQuoteComponent {
  constructor(
    public quoteModelService: QuoteModelService,
    public tenantService: TenantService,
    private datePipe: DatePipe,
    private http: HttpClient,
    private globalService: GlobalService,
    private router: Router,
    private popup: PopupServiceService,
    private location: Location,
  ) {}

  stanzaSelezionata: string = '';

  nomiStanze: string[] = [];
  serviziOptions: string[] = [];
  stanzeEOggettiList: { stanza: string; oggetti: string }[] = [];

  // Per EMMECI: mappa di frasi per stanza (roomId -> array di frasi)
  frasePerStanza: Map<number, string[]> = new Map();
  // Per EMMECI: mappa di stanze per ottenere l'ID da nome (nome -> id)
  stanzaMap: Map<string, number> = new Map();
  // Store all rooms for EMMECI
  private allRooms: any[] = [];

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

  sameAddress = false;

  ngOnInit() {
    this.loadQuoteSettings();

    if (this.tenantService.isEmmeci) {
      // Inizializza tipoPreventivo se non è impostato
      if (!this.quoteModelService.tipoPreventivo) {
        this.quoteModelService.tipoPreventivo = 'R';
      }

      const raw = this.quoteModelService.stanzeEOggetti;

      if (Array.isArray(raw)) {
        this.stanzeEOggettiList = raw;
      } else if (typeof raw === 'string' && raw.trim()) {
        try {
          const parsed = JSON.parse(raw);
          this.stanzeEOggettiList = Array.isArray(parsed) ? parsed : [];
        } catch {
          this.stanzeEOggettiList = [];
        }
      } else {
        this.stanzeEOggettiList = [];
      }

      this.updateNomiStanze();
    }
  }

  loadQuoteSettings(): void {
    // Carica frasi e stanze dal backend
    this.http
      .get<any[]>(this.globalService.url + 'admin/quote-settings/phrases', {
        headers: this.globalService.headers,
      })
      .subscribe({
        next: (phrases) => {
          if (this.tenantService.isEmmeci) {
            // Per EMMECI: filtra le frasi per stanza
            this.frasePerStanza.clear();
            this.serviziOptions = [];

            phrases.forEach((phrase) => {
              if (phrase.roomId) {
                if (!this.frasePerStanza.has(phrase.roomId)) {
                  this.frasePerStanza.set(phrase.roomId, []);
                }
                this.frasePerStanza.get(phrase.roomId)!.push(phrase.testo);
              }
            });
          } else {
            // Per SAMI: tutte le frasi senza stanza
            this.serviziOptions = phrases
              .filter((p) => !p.roomId)
              .map((p) => p.testo);
          }
        },
        error: (err) => {
          console.error('Errore caricamento frasi:', err);
        },
      });

    // Per EMMECI: carica anche le stanze
    if (this.tenantService.isEmmeci) {
      this.http
        .get<any[]>(this.globalService.url + 'admin/quote-settings/rooms', {
          headers: this.globalService.headers,
        })
        .subscribe({
          next: (rooms) => {
            this.allRooms = rooms;
            this.updateNomiStanze();
          },
          error: (err) => {
            console.error('Errore caricamento stanze:', err);
          },
        });
    }
  }

  // Aggiorna la lista di stanze in base al tipo preventivo corrente
  updateNomiStanze(): void {
    if (!this.tenantService.isEmmeci || this.allRooms.length === 0) return;

    // Se tipoPreventivo non è impostato, default a 'R' (Residenziale)
    const tipoPreventivo = this.quoteModelService.tipoPreventivo === 'U' ? 'U' : 'R';

    this.nomiStanze = this.allRooms
      .filter((r) => r.tipoPreventivo === tipoPreventivo)
      .map((r) => r.nome)
      .sort();

    // Ricrea mappa nome -> id
    this.stanzaMap.clear();
    this.allRooms.forEach((room) => {
      if (room.tipoPreventivo === tipoPreventivo) {
        this.stanzaMap.set(room.nome, room.id);
      }
    });
  }

  // Ritorna le frasi precompilate per una specifica stanza (EMMECI)
  getPhrasesForStanza(nomestanza: string): string[] {
    if (!nomestanza) return [];

    // Estrai il nome base della stanza (es: "Camera matrimoniale" da "Camera matrimoniale 1")
    const nomeBase = nomestanza.split(' ').slice(0, -1).join(' ') || nomestanza;
    const stanzaId = this.stanzaMap.get(nomeBase) || this.stanzaMap.get(nomestanza);

    if (!stanzaId) return [];
    return this.frasePerStanza.get(stanzaId) || [];
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
      numeroPreventivo: this.quoteModelService.numeroPreventivo,
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
      dataInizioContratto: this.quoteModelService.dataInizioContrattoDate
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
      numeroPreventivo: this.quoteModelService.numeroPreventivo,
      codiceOperatore:
        this.quoteModelService.codiceOperatore || this.globalService.userCode,
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

  editQuote() {
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
      .post(this.globalService.url + 'quotes/edit', body, {
        headers: this.globalService.headers,
        responseType: 'text',
      })
      .subscribe({
        next: () => {
          this.quoteModelService.resetQuoteModel();
          this.router.navigateByUrl('/quotesHome', { replaceUrl: true });
        },
        error: (err) => {
          console.error('Errore editQuote:', err);

          let msg = 'ERRORE DURANTE IL SALVATAGGIO DELLE MODIFICHE';

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

  back() {
    this.quoteModelService.resetQuoteModel();
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
