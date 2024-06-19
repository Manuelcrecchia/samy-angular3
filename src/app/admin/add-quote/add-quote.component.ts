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

  navigateToAddQuote(){
    this.router.navigateByUrl('/addQuote');
  }

  ngOnInit(){
  }

  addQuote(){
    let body = {
      codiceOperatore: this.globalService.userCode,
      tipoPreventivo: this.quoteModelService.tipoPreventivo,
      numeropreventivo: this.quoteModelService.numeroPreventivo,
      data: this.quoteModelService.data,
      nominativo: this.quoteModelService.nominativo,
      cfpi: this.quoteModelService.cfpi,
      citta: this.quoteModelService.citta,
      selettoreprefissovia: this.quoteModelService.selettorePrefissoVia,
      via: this.quoteModelService.via,
      cup: this.quoteModelService.cup,
      email: this.quoteModelService.email,
      telefono: this.quoteModelService.telefono,
      referente: this.quoteModelService.referente,
      descrizioneimmmobile: this.quoteModelService.descrizioneImmmobile,
      servizi: this.quoteModelService.servizi,
      imponibile: this.quoteModelService.imponibile,
      iva: this.quoteModelService.iva,
      pagamento: this.quoteModelService.pagamento,
      note : this.quoteModelService.note,
      stato: this.quoteModelService.stato,
    }
    this.http
      .post(this.globalService.url + 'admin/quotes/add', body, {
        headers: this.globalService.headers,
        responseType: 'text',
      })
      .subscribe((response) => {
        this.router.navigateByUrl('/quotesHome');
      })
   }

}
