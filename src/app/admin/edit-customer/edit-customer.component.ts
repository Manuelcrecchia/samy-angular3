import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { CustomerModelService } from '../../service/customer-model.service';
import { HttpClient } from '@angular/common/http';
import { GlobalService } from '../../service/global.service';
import { Location } from '@angular/common';
import { TenantService } from '../../service/tenant.service';

@Component({
  selector: 'app-edit-customer',
  templateUrl: './edit-customer.component.html',
  styleUrl: './edit-customer.component.css',
})
export class EditCustomerComponent {
  constructor(
    public customerModelService: CustomerModelService,
    public tenantService: TenantService,
    private http: HttpClient,
    private globalService: GlobalService,
    private router: Router,
    private location: Location,
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
      stanzeEOggetti: this.customerModelService.stanzeEOggetti,

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
        },
      });
  }

  back(): void {
    this.router.navigateByUrl('/listCustomer');
  }

  @HostListener('window:popstate', ['$event'])
  onBrowserBackBtnClose(event: Event): void {
    event.preventDefault();
    this.router.navigateByUrl('/listCustomer', { replaceUrl: true });
  }
}
