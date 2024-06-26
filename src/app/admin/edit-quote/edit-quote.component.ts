import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { GlobalService } from '../../service/global.service';
import { QuoteModelService } from '../../service/quote-model.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-edit-quote',
  templateUrl: './edit-quote.component.html',
  styleUrls: ['./edit-quote.component.css']
})
export class EditQuoteComponent {

  constructor(public quoteModelService: QuoteModelService, private http: HttpClient, private globalService: GlobalService, private router: Router) {}

  ngOnInit(){
  }

  editQuote(){
    let body = {
      codiceOperatore: this.globalService.userCode,
      tipoPreventivo: this.quoteModelService.tipoPreventivo,
      numeropreventivo: this.quoteModelService.numeroPreventivo,
      data: this.quoteModelService.data,
      nominativo: this.quoteModelService.nominativo,
      codicefiscalepartitaiva: this.quoteModelService.cfpi,
      citta: this.quoteModelService.citta,
      selettoreprefissovia: this.quoteModelService.selettorePrefissoVia,
      via: this.quoteModelService.via,
      cap: this.quoteModelService.cap,
      email: this.quoteModelService.email,
      telefono: this.quoteModelService.telefono,
      referente: this.quoteModelService.referente,
      descrizioneimmobile: this.quoteModelService.descrizioneImmobile,
      servizi: this.quoteModelService.servizi,
      imponibile: this.quoteModelService.imponibile,
      iva: this.quoteModelService.iva,
      pagamento: this.quoteModelService.pagamento,
       note: this.quoteModelService.note,
    }
    this.http
      .post(this.globalService.url + 'admin/quotes/edit', body, {
        headers: this.globalService.headers,
        responseType: 'text',
      })
      .subscribe((response) => {
        this.router.navigateByUrl('/quotesHome');      })
   }
  }
