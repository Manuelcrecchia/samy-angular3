import { HttpClient } from '@angular/common/http';
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { NgxExtendedPdfViewerService } from 'ngx-extended-pdf-viewer';
import { GlobalService } from '../../service/global.service';
import { QuoteModelService } from '../../service/quote-model.service';

@Component({
  selector: 'app-quotes-home',
  templateUrl: './quotes-home.component.html',
  styleUrl: './quotes-home.component.css'
})
export class QuotesHomeComponent   {@Input() color: any;
  numeroClienteSelezionato = '';
  numeroClienteSelezionatoBool = false;

  quotesFrEnd: {
    numeroPreventivo: string;
    nominativo: string;
  }[] = [];

  pdfPrev!: string;
  pdfTs!: string;
  pdfTsSelezionato = false;

  data!: QuoteModelService;


  constructor(  private http: HttpClient,
    private pdfService: NgxExtendedPdfViewerService,
    private globalService: GlobalService,
    private router: Router,
    private quoteModel: QuoteModelService,
   ){}
   navigateToeditQuote(){
     this.router.navigateByUrl('/editQuote');
   }
navigateToAddQuote(){
  this.router.navigateByUrl('/addQuote');
}


ngOnInit() {
  this.http
    .get(this.globalService.url + 'quotes/getAll', {
      headers: this.globalService.headers,
      responseType: 'text',
    })
    .subscribe((response) => {
      this.quotesFrEnd = JSON.parse(response).reverse()

      if (this.quotesFrEnd.length > 0) {
        this.pdfTsSelezionato = true
        this.numeroClienteSelezionato = this.quotesFrEnd[0].numeroPreventivo;
        const body = { numeroPreventivo: this.quotesFrEnd[0].numeroPreventivo };
        this.http
          .post(
            this.globalService.url + 'pdfs/sendQuote',
            body,
            {
              headers: this.globalService.headers,
              responseType: 'text',
            }
          )
          .subscribe((response) => {
            if(response == 'Unauthorized') {
              this.router.navigateByUrl('/')
            }
            else {
              this.pdfTsSelezionato = true;
              this.pdfPrev = response;
            }
          });
      }
    });
}

changePdf(numeroPreventivo: string){

const body = { numeroPreventivo: numeroPreventivo };
this.http
          .post(
            this.globalService.url + 'pdfs/sendQuote',
            body,
            {
              headers: this.globalService.headers,
              responseType: 'text',
            }
          )
          .subscribe((response) => {
            if(response == 'Unauthorized') {
              this.router.navigateByUrl('/')
            }
            else {
              this.pdfTsSelezionato = true;
              this.pdfPrev = response;
            }
          });
}

navigateToEditQuote(numeroPreventivo: string){}
delete(numeroPreventivo: string){
  
}
}
