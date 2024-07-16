import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { PatternValidator } from '@angular/forms';
import { Router } from '@angular/router';
import { GlobalService } from '../../service/global.service';
import { QuoteModelService } from '../../service/quote-model.service';

@Component({
  selector: 'app-add-quote',
  templateUrl: './add-quote.component.html',
  styleUrls: ['./add-quote.component.css'],
})
export class AddQuoteComponent {

  constructor(public globalService: GlobalService, public quoteModelService: QuoteModelService, private http: HttpClient, private router: Router){}

  ngOnInit(){
  }

  addQuote(){
    if(this.quoteModelService.tipoPreventivo == 
      ''){
          //INSERIRE UN ALERT PER AVVISARE DI IMMETERE IL CAMPO
    }
    else{

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
      imponibile: this.quoteModelService.imponibile,
      iva: this.quoteModelService.iva,
      pagamento: this.quoteModelService.pagamento,
      note : this.quoteModelService.note,
    }
    this.http
      .post(this.globalService.url + 'quotes/add', body, {
        headers: this.globalService.headers,
        responseType: 'text',
      })
      // ...
      .subscribe((response) => {
        this.router.navigateByUrl('/quotesHome');

      });
    }
   }

}
