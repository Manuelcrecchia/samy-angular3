import { HttpClient } from '@angular/common/http';
import { Component, HostListener } from '@angular/core';
import { GlobalService } from '../../service/global.service';
import { QuoteModelService } from '../../service/quote-model.service';
import { Router } from '@angular/router';
import { PopupServiceService } from '../../componenti/popup/popup-service.service';
import { DatePipe } from '@angular/common';
import { Location } from '@angular/common';

@Component({
  selector: 'app-edit-quote',
  templateUrl: './edit-quote.component.html',
  styleUrls: ['./edit-quote.component.css'],
})
export class EditQuoteComponent {
  constructor(
    public quoteModelService: QuoteModelService,
    private datePipe: DatePipe,
    private http: HttpClient,
    private globalService: GlobalService,
    private router: Router,
    private popup: PopupServiceService,
    private location: Location
  ) {}

serviziOptions = ["Spazzaggio e lavaggio pavimentazione",
                  "Vuotatura cestini con relativa sostituzione dei sacchetti",
                  "Pulizia ed igienizzazione dei servizi igenici",
                  "Pulizia porte",
                  "Pulizia dei vetri e relativi infisii interni ed esterni ove possibile",
                  "Deragnatura generale",
                  "Pulizia termosifoni e/o condizionatori",
                  "Pulizia battiscopa",
                ]

  ngOnInit() {}

  editQuote() {
    if (this.quoteModelService.tipoPreventivo == '') {
      this.popup.text = 'INSERISCI IL TIPO DI PREVENTIVO';
      this.popup.openPopup();
    } else {
      let body = {
        numeroPreventivo: this.quoteModelService.numeroPreventivo,
        codiceOperatore: this.globalService.userCode,
        tipoPreventivo: this.quoteModelService.tipoPreventivo,
        nominativo: this.quoteModelService.nominativo,
        cfpi: this.quoteModelService.cfpi,
        cittaDiFatturazione: this.quoteModelService.cittaDiFatturazione,
        selettorePrefissoViaDiFatturazione: this.quoteModelService.selettorePrefissoViaDiFatturazione,
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
        imponibile: Number(this.quoteModelService.imponibile).toFixed(2),
        iva: this.quoteModelService.iva,
        pagamento: this.quoteModelService.pagamento,
        tempistica: this.quoteModelService.tempistica,
        dataInizioContratto:
          this.quoteModelService.dataInizioContratto != ''
            ? this.datePipe.transform(
                this.quoteModelService.dataInizioContratto,
                'dd/MM/yyyy'
              )
            : this.quoteModelService.dataInizioContratto,
        durataContratto: this.quoteModelService.durataContratto,
        note: this.quoteModelService.note,
      };
      this.http
        .post(this.globalService.url + 'quotes/edit', body, {
          headers: this.globalService.headers,
          responseType: 'text',
        })
        .subscribe((response) => {
          this.quoteModelService.resetQuoteModel();
          this.router.navigateByUrl('/quotesHome', { replaceUrl: true });
        });
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
