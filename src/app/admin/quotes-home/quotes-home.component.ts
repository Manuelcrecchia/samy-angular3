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

  redQuotes: {
    numeroCliente: string;
    nome: string;
    cognome: string;
    ragioneSociale: string;
  }[] = [];

  quotesFrEnd: {
    numeroCliente: string;
    nome: string;
    cognome: string;
    ragioneSociale: string;
  }[] = [];

  saveQuotesFrEnd: {
    numeroCliente: string;
    nome: string;
    cognome: string;
    ragioneSociale: string;
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
    .get(this.globalService.url + 'admin/quotes/getAllRed', {
      headers: this.globalService.headers,
      responseType: 'text',
    })
    .subscribe((response) => {
      this.redQuotes = JSON.parse(response).reverse()

          if (this.quotesFrEnd.length > 0) {
            this.numeroClienteSelezionato = this.quotesFrEnd[0].numeroCliente;
            const body = { numeroCliente: this.quotesFrEnd[0].numeroCliente };
            let allOfficeNumCli: string[];

                  this.http
                    .post(
                      this.globalService.url + 'admin/pdfs/sendQuote',
                      body,
                      {
                        headers: this.globalService.headers,
                        responseType: 'text',
                      }
                    )
                    .subscribe((response) => {
                      response == 'Unauthorized'
                        ? this.router.navigateByUrl('/')
                        : (this.pdfPrev = response);
                      this.http
                        .post(
                          this.globalService.url +
                          'admin/pdfs/sendTechnicalSpecification',
                          body,
                          {
                            headers: this.globalService.headers,
                            responseType: 'text',
                          }
                        )
                        .subscribe((response) => {
                          response == 'Unauthorized'
                            ? this.router.navigateByUrl('/')
                            : (this.pdfTs = response);
                        });
                    });
                }
              });
          }

changePdf(numeroCliente: string) {
  this.numeroClienteSelezionatoBool = true;
  this.numeroClienteSelezionato = numeroCliente;
  const body = { numeroCliente: this.numeroClienteSelezionato };
        this.http
          .post(this.globalService.url + 'admin/pdfs/sendQuote', body, {
            headers: this.globalService.headers,
            responseType: 'text',
          })
          .subscribe((response) => {
            response == 'Unauthorized'
              ? this.router.navigateByUrl('/')
              : (this.pdfPrev = response);
            this.http
              .post(
                this.globalService.url +
                'admin/pdfs/sendTechnicalSpecification',
                body,
                {
                  headers: this.globalService.headers,
                  responseType: 'text',
                }
              )
              .subscribe((response) => {
                response == 'Unauthorized'
                  ? this.router.navigateByUrl('/')
                  : (this.pdfTs = response);
              });
          });
      }

filterFunction(e: Event, n: number) {
    switch (n) {
      case 1: {
        if ((<HTMLInputElement>e.target).value == '') {
          console.log("in")
          this.quotesFrEnd = this.saveQuotesFrEnd;
        }
        else {
          for (let i = 0; i < this.saveQuotesFrEnd.length; i++) {
            console.log(this.saveQuotesFrEnd)
            if (
              !this.quotesFrEnd[i].numeroCliente.startsWith(
                (<HTMLInputElement>e.target).value
              )
            ) {
              this.quotesFrEnd.splice(i, 1);
            }
          }
        }

        break;
      }
      // case 2: {
      //   if (
      //     this.redQuotes[i].nome.startsWith(
      //       (<HTMLInputElement>e.target).value.toUpperCase()
      //     )
      //   ) {
      //     this.quotesFrEnd.push(this.redQuotes[i]);
      //   }
      //   break;
      // }
      // case 3: {
      //   if (
      //     this.redQuotes[i].cognome.startsWith(
      //       (<HTMLInputElement>e.target).value.toUpperCase()
      //     )
      //   ) {
      //     this.quotesFrEnd.push(this.redQuotes[i]);
      //   }
      //   break;
      // }
      // case 4: {
      //   if (
      //     this.redQuotes[i].ragioneSociale.startsWith(
      //       (<HTMLInputElement>e.target).value.toUpperCase()
      //     )
      //   ) {
      //     this.quotesFrEnd.push(this.redQuotes[i]);
      //   }
      //   break;
      // }
      default: {
        console.log("default")
        this.quotesFrEnd = this.saveQuotesFrEnd;

        break;
      }
    }
}

ngOnChanges() {
  switch (this.color) {
    case 'red': {
      this.http
        .get(this.globalService.url + 'admin/quotes/getAllRed', {
          headers: this.globalService.headers,
          responseType: 'text',
        })
        .subscribe((response) => {
          this.redQuotes = JSON.parse(response).reverse();
          const body = { numeroCliente: this.quotesFrEnd[0].numeroCliente };
                      this.http
                        .post(
                          this.globalService.url + 'admin/pdfs/sendQuote',
                          body,
                          {
                            headers: this.globalService.headers,
                            responseType: 'text',
                          }
                        )
                        .subscribe((response) => {
                          response == 'Unauthorized'
                            ? this.router.navigateByUrl('/')
                            : (this.pdfPrev = response);
                          this.http
                            .post(
                              this.globalService.url +
                              'admin/pdfs/sendTechnicalSpecification',
                              body,
                              {
                                headers: this.globalService.headers,
                                responseType: 'text',
                              }
                            )
                            .subscribe((response) => {
                              response == 'Unauthorized'
                                ? this.router.navigateByUrl('/')
                                : (this.pdfTs = response);
                            });
                        });
                    }
              )


      break;
    }
    case 'yellow': {
      this.http
        .get(this.globalService.url + 'admin/quotes/getAllYellow', {
          headers: this.globalService.headers,
          responseType: 'text',
        })
        .subscribe((response) => {
          this.redQuotes = JSON.parse(response).reverse();
          const body = { numeroCliente: this.quotesFrEnd[0].numeroCliente };
                      this.http
                        .post(
                          this.globalService.url + 'admin/pdfs/sendQuote',
                          body,
                          {
                            headers: this.globalService.headers,
                            responseType: 'text',
                          }
                        )
                        .subscribe((response) => {
                          response == 'Unauthorized'
                            ? this.router.navigateByUrl('/')
                            : (this.pdfPrev = response);
                          this.http
                            .post(
                              this.globalService.url +
                              'admin/pdfs/sendTechnicalSpecification',
                              body,
                              {
                                headers: this.globalService.headers,
                                responseType: 'text',
                              }
                            )
                            .subscribe((response) => {
                              response == 'Unauthorized'
                                ? this.router.navigateByUrl('/')
                                : (this.pdfTs = response);
                            });
                        });
                    }
              )


      break;
    }
    case 'green': {
      this.http
        .get(this.globalService.url + 'admin/quotes/getAllGreen', {
          headers: this.globalService.headers,
          responseType: 'text',
        })
        .subscribe((response) => {
          this.redQuotes = JSON.parse(response).reverse();
          const body = { numeroCliente: this.quotesFrEnd[0].numeroCliente };
                      this.http
                        .post(
                          this.globalService.url + 'admin/pdfs/sendQuote',
                          body,
                          {
                            headers: this.globalService.headers,
                            responseType: 'text',
                          }
                        )
                        .subscribe((response) => {
                          response == 'Unauthorized'
                            ? this.router.navigateByUrl('/')
                            : (this.pdfPrev = response);
                          this.http
                            .post(
                              this.globalService.url +
                              'admin/pdfs/sendTechnicalSpecification',
                              body,
                              {
                                headers: this.globalService.headers,
                                responseType: 'text',
                              }
                            )
                            .subscribe((response) => {
                              response == 'Unauthorized'
                                ? this.router.navigateByUrl('/')
                                : (this.pdfTs = response);
                            });
                        });
                    }
              )


      break;
    }
  }
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
          allOfficeNumCli += allOfficeNumCliJ[i]['numeroCliente'];
        }
      } else {
        allOfficeNumCli = [];
      }
      const body = { numeroCliente: this.numeroClienteSelezionato };

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
          this.ngOnChanges();
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
          allOfficeNumCli += allOfficeNumCliJ[i]['numeroCliente'];
        }
      } else {
        allOfficeNumCli = [];
      }
      const body = { numeroCliente: this.numeroClienteSelezionato };

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

  const body = { numeroCliente: this.numeroClienteSelezionato };
}
}
