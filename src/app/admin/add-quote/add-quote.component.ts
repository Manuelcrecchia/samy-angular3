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

    let serviziJson: string[] = [];
    serviziJson.concat(this.quoteModelService.servizi[0]);
    serviziJson.concat(this.quoteModelService.servizi[1]);

    let interventiJson: string[] = [];
    interventiJson.concat(this.quoteModelService.interventi[0]);
    interventiJson.concat(this.quoteModelService.interventi[1]);

    let body = {
      codiceOperatore: this.globalService.userCode,
      tipoPreventivo: this.quoteModelService.tipoPreventivo,
      nominativo: this.quoteModelService.nominativo,
      cfpi: this.quoteModelService.cfpi,
      citta: this.quoteModelService.citta,
      selettoreprefissovia: this.quoteModelService.selettorePrefissoVia,
      via: this.quoteModelService.via,
      cap: this.quoteModelService.cap,
      email: this.quoteModelService.email,
      telefono: this.quoteModelService.telefono,
      referente: this.quoteModelService.referente,
      descrizioneimmmobile: this.quoteModelService.descrizioneImmmobile,
      servizi: serviziJson[0],
      interventi: interventiJson[0],
      imponibile: this.quoteModelService.imponibile,
      iva: this.quoteModelService.iva,
      pagamento: this.quoteModelService.pagamento,
      note : this.quoteModelService.note,
    }
    console.log(body);
    this.http
      .post(this.globalService.url + 'quotes/add', body, {
        headers: this.globalService.headers,
        responseType: 'text',
      })
      // ...
      .subscribe((response) => {
        console.log(response);
        this.router.navigateByUrl('/quotesHome');

      });
   }

}
