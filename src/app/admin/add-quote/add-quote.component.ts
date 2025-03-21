import { HttpClient } from '@angular/common/http';
import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { GlobalService } from '../../service/global.service';
import { QuoteModelService } from '../../service/quote-model.service';
import { PopupServiceService } from '../../componenti/popup/popup-service.service';
import { DatePipe } from '@angular/common';
import { Location } from '@angular/common';
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
    private http: HttpClient,
    private router: Router,
    private popup: PopupServiceService,
    private location: Location
  ) {}

  ngOnInit() {}

  addQuote() {
    if (this.quoteModelService.tipoPreventivo == '') {
      this.popup.text = 'INSERISCI IL TIPO DI PREVENTIVO';
      this.popup.openPopup();
    } else {
      let body = {
        codiceOperatore: this.globalService.userCode,
        tipoPreventivo: this.quoteModelService.tipoPreventivo,
        nominativo: this.quoteModelService.nominativo,
        cfpi: this.quoteModelService.cfpi,
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
        .post(this.globalService.url + 'quotes/add', body, {
          headers: this.globalService.headers,
          responseType: 'text',
        })
        // ...
        .subscribe((response) => {
          this.quoteModelService.resetQuoteModel();
          this.router.navigateByUrl('/quotesHome');
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
