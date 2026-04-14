import { Component, HostListener, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CustomerModelService } from '../../service/customer-model.service';
import { HttpClient } from '@angular/common/http';
import { GlobalService } from '../../service/global.service';
import { Location } from '@angular/common';
import { TenantService } from '../../service/tenant.service';
import { PopupServiceService } from '../../componenti/popup/popup-service.service';

@Component({
  selector: 'app-edit-customer',
  templateUrl: './edit-customer.component.html',
  styleUrl: './edit-customer.component.css',
})
export class EditCustomerComponent {
  stanzaSelezionata: string = '';

  nomiStanze: string[] = [];
  serviziOptions: string[] = [];
  stanzeEOggettiList: { stanza: string; oggetti: string }[] = [];

  frasePerStanza: Map<number, string[]> = new Map();
  stanzaMap: Map<string, number> = new Map();
  private allRooms: any[] = [];

  ngOnInit(): void {
    this.loadQuoteSettings();
    // Carica il cliente dal database per assicurarsi di avere i dati più recenti
    const numeroCliente = this.customerModelService.numeroCliente;
    if (numeroCliente) {
      this.caricaClienteFromDb(numeroCliente);
    }
    this.caricaStanzeEOggetti();

    if (this.tenantService.isEmmeci) {
      // Inizializza tipoCliente se non è impostato
      if (!this.customerModelService.tipoCliente) {
        this.customerModelService.tipoCliente = 'R';
      }
      this.updateNomiStanze();
    }
  }

  loadQuoteSettings(): void {
    this.http
      .get<any[]>(this.globalService.url + 'admin/quote-settings/phrases', {
        headers: this.globalService.headers,
      })
      .subscribe({
        next: (phrases) => {
          if (this.tenantService.isEmmeci) {
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
            this.serviziOptions = phrases
              .filter((p) => !p.roomId)
              .map((p) => p.testo);
          }
        },
        error: (err) => {
          console.error('Errore caricamento frasi:', err);
        },
      });

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

  updateNomiStanze(): void {
    if (!this.tenantService.isEmmeci || this.allRooms.length === 0) return;

    const tipoPreventivo = this.customerModelService.tipoCliente === 'U' ? 'U' : 'R';

    this.nomiStanze = this.allRooms
      .filter((r) => r.tipoPreventivo === tipoPreventivo)
      .map((r) => r.nome)
      .sort();

    this.stanzaMap.clear();
    this.allRooms.forEach((room) => {
      if (room.tipoPreventivo === tipoPreventivo) {
        this.stanzaMap.set(room.nome, room.id);
      }
    });
  }

  getPhrasesForStanza(nomestanza: string): string[] {
    if (!nomestanza) return [];

    const nomeBase = nomestanza.split(' ').slice(0, -1).join(' ') || nomestanza;
    const stanzaId = this.stanzaMap.get(nomeBase) || this.stanzaMap.get(nomestanza);

    if (!stanzaId) return [];
    return this.frasePerStanza.get(stanzaId) || [];
  }

  private caricaClienteFromDb(numeroCliente: string): void {
    this.http
      .post(this.globalService.url + 'customers/getCustomer', { numeroCliente }, {
        headers: this.globalService.headers,
      })
      .subscribe({
        next: (res: any) => {
          if (res && res[0]) {
            const cliente = res[0];
            // Aggiorna il customerModelService con i dati dal database
            this.customerModelService.numeroCliente = cliente.numeroCliente;
            this.customerModelService.tipoCliente = cliente.tipoCliente;
            this.customerModelService.nominativo = cliente.nominativo;
            this.customerModelService.cfpi = cliente.cfpi;
            this.customerModelService.email = cliente.email;
            this.customerModelService.telefono = cliente.telefono;
            this.customerModelService.pagamento = cliente.pagamento;
            this.customerModelService.note = cliente.note;
            this.customerModelService.key = cliente.key;
            this.customerModelService.tempistica = cliente.tempistica;
            this.customerModelService.nOperatori = cliente.nOperatori;

            // SAMI fields
            this.customerModelService.cittaDiFatturazione = cliente.cittaDiFatturazione;
            this.customerModelService.selettorePrefissoViaDiFatturazione = cliente.selettorePrefissoViaDiFatturazione;
            this.customerModelService.viaDiFatturazione = cliente.viaDiFatturazione;
            this.customerModelService.capDiFatturazione = cliente.capDiFatturazione;
            this.customerModelService.citta = cliente.citta;
            this.customerModelService.selettorePrefissoVia = cliente.selettorePrefissoVia;
            this.customerModelService.via = cliente.via;
            this.customerModelService.cap = cliente.cap;
            this.customerModelService.referente = cliente.referente;
            this.customerModelService.descrizioneImmobile = cliente.descrizioneImmobile;
            this.customerModelService.servizi = cliente.servizi;
            this.customerModelService.interventi = cliente.interventi;
            this.customerModelService.imponibile = cliente.imponibile;
            this.customerModelService.iva = cliente.iva;

            // EMMECI fields
            this.customerModelService.ragSociale = cliente.ragSociale;
            this.customerModelService.codiceOperatore = cliente.codiceOperatore;
            this.customerModelService.data = cliente.data;
            this.customerModelService.cittaDiPartenza = cliente.cittaDiPartenza;
            this.customerModelService.selettorePrefissoViaDiPartenza = cliente.selettorePrefissoViaDiPartenza;
            this.customerModelService.viaDiPartenza = cliente.viaDiPartenza;
            this.customerModelService.pianoDiPartenza = cliente.pianoDiPartenza;
            this.customerModelService.occupazioneSuoloPubblicoDiPartenza = cliente.occupazioneSuoloPubblicoDiPartenza;
            this.customerModelService.capDiPartenza = cliente.capDiPartenza;
            this.customerModelService.cittaDiArrivo = cliente.cittaDiArrivo;
            this.customerModelService.selettorePrefissoViaDiArrivo = cliente.selettorePrefissoViaDiArrivo;
            this.customerModelService.viaDiArrivo = cliente.viaDiArrivo;
            this.customerModelService.pianoDiArrivo = cliente.pianoDiArrivo;
            this.customerModelService.occupazioneSuoloPubblicoDiArrivo = cliente.occupazioneSuoloPubblicoDiArrivo;
            this.customerModelService.capDiArrivo = cliente.capDiArrivo;
            this.customerModelService.altreDestinazioni = cliente.altreDestinazioni;
            this.customerModelService.stanzeEOggetti = cliente.stanzeEOggetti;

            // Boolean fields
            this.customerModelService.lampadari = cliente.lampadari;
            this.customerModelService.imballaggio = cliente.imballaggio;
            this.customerModelService.smaltimentoMaterialiDiRisulta = cliente.smaltimentoMaterialiDiRisulta;
            this.customerModelService.riposizionamentoContenutiDegliArredi = cliente.riposizionamentoContenutiDegliArredi;
            this.customerModelService.smontaggioEImballaggioDegliArredi = cliente.smontaggioEImballaggioDegliArredi;
            this.customerModelService.caricoSuNostroMezzoIdoneo = cliente.caricoSuNostroMezzoIdoneo;
            this.customerModelService.trasporto = cliente.trasporto;
            this.customerModelService.scaricoEConsegnaAlPiano = cliente.scaricoEConsegnaAlPiano;
            this.customerModelService.montaggioDegliArredi = cliente.montaggioDegliArredi;
            this.customerModelService.ausilioDiElevatoreEsternoOvePossibile = cliente.ausilioDiElevatoreEsternoOvePossibile;
            this.customerModelService.assicurazioneControIRischiDiTrasporto = cliente.assicurazioneControIRischiDiTrasporto;
            this.customerModelService.fornituraMaterialiDaImballo = cliente.fornituraMaterialiDaImballo;
            this.customerModelService.imballaggioDeiContenuti = cliente.imballaggioDeiContenuti;
            this.customerModelService.custodiaInDeposito = cliente.custodiaInDeposito;
            this.customerModelService.ospCarico = cliente.ospCarico;
            this.customerModelService.ospScarico = cliente.ospScarico;
            this.customerModelService.prezzoTrasloco = cliente.prezzoTrasloco;
            this.customerModelService.prezzoFornituraMaterialiDaImballo = cliente.prezzoFornituraMaterialiDaImballo;
            this.customerModelService.prezzoImballaggioDeiContenuti = cliente.prezzoImballaggioDeiContenuti;
            this.customerModelService.prezzoPassaggioInDeposito = cliente.prezzoPassaggioInDeposito;
            this.customerModelService.prezzoOccupazioneSuoloPubblico = cliente.prezzoOccupazioneSuoloPubblico;
            this.customerModelService.prezzoMensileCustodiaMobili = cliente.prezzoMensileCustodiaMobili;

            // Dopo aver caricato i dati, parsa le stanzeEOggetti
            this.caricaStanzeEOggetti();
            this.updateNomiStanze();
          }
        },
        error: (err) => {
          console.error('Errore caricamento cliente:', err);
        },
      });
  }

  caricaStanzeEOggetti(): void {
    const raw = this.customerModelService.stanzeEOggetti;
    if (!raw) {
      this.stanzeEOggettiList = [];
      return;
    }
    try {
      const parsed = typeof raw === 'string' ? JSON.parse(raw as string) : raw;
      this.stanzeEOggettiList = Array.isArray(parsed) ? parsed : [];
    } catch {
      this.stanzeEOggettiList = [];
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

  constructor(
    public customerModelService: CustomerModelService,
    public tenantService: TenantService,
    private http: HttpClient,
    private globalService: GlobalService,
    private router: Router,
    private location: Location,
    private route: ActivatedRoute,
    private popup: PopupServiceService,
  ) {}

  private buildSamiBody() {
    return {
      numeroCliente: String(this.customerModelService.numeroCliente).trim(),
      tipoCliente: this.customerModelService.tipoCliente,
      nominativo: this.customerModelService.nominativo,
      cfpi: this.customerModelService.cfpi,
      cittaDiFatturazione: this.customerModelService.cittaDiFatturazione,
      selettorePrefissoViaDiFatturazione:
        this.customerModelService.selettorePrefissoViaDiFatturazione,
      viaDiFatturazione: this.customerModelService.viaDiFatturazione,
      capDiFatturazione: this.customerModelService.capDiFatturazione,
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
      imponibile: Number(this.customerModelService.imponibile || 0).toFixed(2),
      iva: this.customerModelService.iva,
      pagamento: this.customerModelService.pagamento,
      note: this.customerModelService.note,
      key: this.customerModelService.key,
      tempistica: this.customerModelService.tempistica,
      nOperatori: this.customerModelService.nOperatori,
    };
  }

  private buildEmmeciBody() {
    return {
      numeroCliente: String(this.customerModelService.numeroCliente).trim(),
      codiceOperatore:
        this.customerModelService.codiceOperatore ||
        this.globalService.userCode,
      data: this.customerModelService.data,
      nominativo: this.customerModelService.nominativo,
      cfpi: this.customerModelService.cfpi,
      email: this.customerModelService.email,
      telefono: this.customerModelService.telefono,
      ragSociale: this.customerModelService.ragSociale,

      cittaDiPartenza: this.customerModelService.cittaDiPartenza,
      selettorePrefissoViaDiPartenza:
        this.customerModelService.selettorePrefissoViaDiPartenza,
      viaDiPartenza: this.customerModelService.viaDiPartenza,
      pianoDiPartenza: this.customerModelService.pianoDiPartenza,
      occupazioneSuoloPubblicoDiPartenza:
        this.customerModelService.occupazioneSuoloPubblicoDiPartenza,
      capDiPartenza: this.customerModelService.capDiPartenza,

      cittaDiArrivo: this.customerModelService.cittaDiArrivo,
      selettorePrefissoViaDiArrivo:
        this.customerModelService.selettorePrefissoViaDiArrivo,
      viaDiArrivo: this.customerModelService.viaDiArrivo,
      pianoDiArrivo: this.customerModelService.pianoDiArrivo,
      occupazioneSuoloPubblicoDiArrivo:
        this.customerModelService.occupazioneSuoloPubblicoDiArrivo,
      capDiArrivo: this.customerModelService.capDiArrivo,

      altreDestinazioni: this.customerModelService.altreDestinazioni,
      stanzeEOggetti: JSON.stringify(this.stanzeEOggettiList),

      lampadari: this.customerModelService.lampadari,
      imballaggio: this.customerModelService.imballaggio,
      smaltimentoMaterialiDiRisulta:
        this.customerModelService.smaltimentoMaterialiDiRisulta,
      riposizionamentoContenutiDegliArredi:
        this.customerModelService.riposizionamentoContenutiDegliArredi,
      smontaggioEImballaggioDegliArredi:
        this.customerModelService.smontaggioEImballaggioDegliArredi,
      caricoSuNostroMezzoIdoneo:
        this.customerModelService.caricoSuNostroMezzoIdoneo,
      trasporto: this.customerModelService.trasporto,
      scaricoEConsegnaAlPiano:
        this.customerModelService.scaricoEConsegnaAlPiano,
      montaggioDegliArredi: this.customerModelService.montaggioDegliArredi,
      ausilioDiElevatoreEsternoOvePossibile:
        this.customerModelService.ausilioDiElevatoreEsternoOvePossibile,
      assicurazioneControIRischiDiTrasporto:
        this.customerModelService.assicurazioneControIRischiDiTrasporto,
      fornituraMaterialiDaImballo:
        this.customerModelService.fornituraMaterialiDaImballo,
      imballaggioDeiContenuti:
        this.customerModelService.imballaggioDeiContenuti,
      custodiaInDeposito: this.customerModelService.custodiaInDeposito,
      ospCarico: this.customerModelService.ospCarico,
      ospScarico: this.customerModelService.ospScarico,

      prezzoTrasloco: this.customerModelService.prezzoTrasloco,
      prezzoFornituraMaterialiDaImballo:
        this.customerModelService.prezzoFornituraMaterialiDaImballo,
      prezzoImballaggioDeiContenuti:
        this.customerModelService.prezzoImballaggioDeiContenuti,
      prezzoPassaggioInDeposito:
        this.customerModelService.prezzoPassaggioInDeposito,
      prezzoOccupazioneSuoloPubblico:
        this.customerModelService.prezzoOccupazioneSuoloPubblico,
      prezzoMensileCustodiaMobili:
        this.customerModelService.prezzoMensileCustodiaMobili,

      pagamento: this.customerModelService.pagamento,
      note: this.customerModelService.note,
      tempistica: this.customerModelService.tempistica,
      nOperatori: this.customerModelService.nOperatori,
    };
  }

  editCustomer(): void {
    const body = this.tenantService.isEmmeci
      ? this.buildEmmeciBody()
      : this.buildSamiBody();

    this.http
      .post(this.globalService.url + 'customers/edit', body, {
        headers: this.globalService.headers,
        responseType: 'text',
      })
      .subscribe({
        next: () => {
          this.customerModelService.reset();
          this.router.navigateByUrl('/listCustomer');
        },
        error: (err) => {
          console.error("Errore durante l'aggiornamento:", err);
          const msg = this.parseServerError(err);
          alert(msg);
        },
      });
  }

  back(): void {
    this.customerModelService.reset();
    this.router.navigateByUrl('/listCustomer');
  }

  private parseServerError(err: any): string {
    try {
      const body = typeof err.error === 'string' ? JSON.parse(err.error) : err.error;
      if (body?.error) return body.error;
    } catch {}
    if (err.status === 0) return 'Impossibile connettersi al server';
    return 'Errore durante il salvataggio. Riprova.';
  }

  @HostListener('window:popstate', ['$event'])
  onBrowserBackBtnClose(event: Event): void {
    event.preventDefault();
    this.customerModelService.reset();
    this.router.navigateByUrl('/listCustomer', { replaceUrl: true });
  }
}
