import { HttpClient } from '@angular/common/http';
import { Component, HostListener } from '@angular/core';
import { GlobalService } from '../../service/global.service';
import { QuoteModelService } from '../../service/quote-model.service';
import { Router } from '@angular/router';
import { PopupServiceService } from '../../componenti/popup/popup-service.service';


@Component({
  selector: 'app-edit-quote',
  templateUrl: './edit-quote.component.html',
  styleUrls: ['./edit-quote.component.css']
})
export class EditQuoteComponent {

  constructor(public quoteModelService: QuoteModelService, private http: HttpClient, private globalService: GlobalService, private router: Router, private popup: PopupServiceService) {}

  ngOnInit(){

  }

  editQuote(){


    if(this.quoteModelService.tipoPreventivo == ''){
      this.popup.text = 'INSERISCI IL TIPO DI PREVENTIVO';
          this.popup.openPopup();
    }
    else{
    let body = {
      numeroPreventivo: this.quoteModelService.numeroPreventivo,
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
      imponibile: this.quoteModelService.imponibile,
      iva: this.quoteModelService.iva,
      pagamento: this.quoteModelService.pagamento,
      note : this.quoteModelService.note,
    }
    this.http
      .post(this.globalService.url + 'quotes/edit', body, {
        headers: this.globalService.headers,
        responseType: 'text',
      })
      .subscribe((response) => {
        this.quoteModelService.resetQuoteModel();
        this.router.navigateByUrl('/quotesHome');
       });
      }
   }

   back(){
    this.router.navigateByUrl('/quotesHome');
   }

   @HostListener('window:popstate', ['$event'])
  onBrowserBackBtnClose(event:Event){
    event.preventDefault();
    this.quoteModelService.resetQuoteModel();
    this.router.navigateByUrl('/quotesHome');
  }
  }
