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
              this.pdfPrev = response
            }
          });
      }
    });
}

deleteQuote() {
  let allOfficeNumCli: string[];
  this.http //Richiesta al database di tutti i numeri clienti degli uffici
    .get(this.globalService.url + 'admin/officeQuotes/getAllNumCli', {
      headers: this.globalService.headers,
      responseType: 'text',
    })
    .subscribe((response) => {
      let allOfficeNumCliJ = JSON.parse(response);
      if (allOfficeNumCliJ.length != 0) {
        for (let i = 0; i < allOfficeNumCliJ.length; i++) {
          allOfficeNumCli += allOfficeNumCliJ[i]['numeroPreventivo'];
        }
      } else {
        allOfficeNumCli = [];
      }
      const body = { numeroPreventivo: this.numeroClienteSelezionato };

      if (allOfficeNumCli.includes(this.numeroClienteSelezionato)) {
        this.http
          .post(this.globalService.url + 'admin/officeQuotes/delete', body, {
            headers: this.globalService.headers,
            responseType: 'text',
          })
          .subscribe((response) => {
          });
      } else {
        this.http
          .post(this.globalService.url + 'admin/quotes/delete', body, {
            headers: this.globalService.headers,
            responseType: 'text',
          })
          .subscribe((response) => {
          });
      }
      this.http
        .post(this.globalService.url + 'admin/technicalSpecification/delete', body, {
          headers: this.globalService.headers,
          responseType: 'text',
        })
        .subscribe((response) => {
          this.ngOnInit();
        })
    }); //Fine richiesta al database di tutti i numeri clienti degli uffici
}

setQuoteToGreen() {
  let allOfficeNumCli: string[];
  this.http //Richiesta al database di tutti i numeri clienti degli uffici
    .get(this.globalService.url + 'admin/officeQuotes/getAllNumCli', {
      headers: this.globalService.headers,
      responseType: 'text',
    })
    .subscribe((response) => {
      let allOfficeNumCliJ = JSON.parse(response);
      if (allOfficeNumCliJ.length != 0) {
        for (let i = 0; i < allOfficeNumCliJ.length; i++) {
          allOfficeNumCli += allOfficeNumCliJ[i]['numeroPreventivo'];
        }
      } else {
        allOfficeNumCli = [];
      }
      const body = { numeroPreventivo: this.numeroClienteSelezionato };

      if (allOfficeNumCli.includes(this.numeroClienteSelezionato)) {

        this.http
          .post(this.globalService.url + 'admin/officeQuotes/setToGreen', body, {
            headers: this.globalService.headers,
            responseType: 'text',
          })
          .subscribe((response) => {
            this.ngOnInit();
          });
      } else {
        this.http
          .post(
            this.globalService.url + 'admin/quotes/setToGreen',
            body,
            {
              headers: this.globalService.headers,
              responseType: 'text',
            }
          )
          .subscribe((response) => {
            this.router.navigateByUrl('/quotesHome');
          });
      }
    }); //Fine richiesta al database di tutti i numeri clienti degli uffic

  const body = { numeroPreventivo: this.numeroClienteSelezionato };
}
}
