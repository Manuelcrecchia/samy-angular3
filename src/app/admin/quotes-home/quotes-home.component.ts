import { HttpClient } from '@angular/common/http';
import { Component, HostListener, Input } from '@angular/core';
import { Router } from '@angular/router';
import { NgxExtendedPdfViewerService } from 'ngx-extended-pdf-viewer';
import { GlobalService } from '../../service/global.service';
import { QuoteModelService } from '../../service/quote-model.service';
import { PopupServiceService } from '../../componenti/popup/popup-service.service';





@Component({
  selector: 'app-quotes-home',
  templateUrl: './quotes-home.component.html',
  styleUrl: './quotes-home.component.css'
})
export class QuotesHomeComponent   {@Input() color: any;
  numeroClienteSelezionato = '';

  quotesFrEnd: {
    numeroPreventivo: string;
    nominativo: string;
  }[] = [];

  pdfPrev!: string;
  pdfTsSelezionato = false;

  constructor(  private http: HttpClient,
    private pdfService: NgxExtendedPdfViewerService,
    private globalService: GlobalService,
    private router: Router,
    private quoteModel: QuoteModelService,
    private popup: PopupServiceService,
  
   ){}


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

searchNumeroPreventivo(value: string){

  if(value == ""){
    this.ngOnInit();
  }
  else{

    this.quotesFrEnd = this.quotesFrEnd.filter(quote => quote.numeroPreventivo.startsWith(value))
    if(this.quotesFrEnd.length>0){
    this.changePdf(this.quotesFrEnd[0].numeroPreventivo)} else {this.pdfPrev = ""}
  }
}

searchNominativo(value: string){

  if(value == ""){
    this.ngOnInit();
  }
  else{
    this.quotesFrEnd = this.quotesFrEnd.filter(quote => quote.nominativo.startsWith(value))
    if(this.quotesFrEnd.length>0){
      this.changePdf(this.quotesFrEnd[0].numeroPreventivo)} else {this.pdfPrev = ""}
  }
}

navigateToEditQuote(numeroPreventivo: string){
  const body = { numeroPreventivo: numeroPreventivo };
this.http
          .post(
            this.globalService.url + 'quotes/getQuote',
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
              let quoteJson = (JSON.parse(response)[0]);
              this.quoteModel.numeroPreventivo = quoteJson["numeroPreventivo"];
              this.quoteModel.codiceOperatore = quoteJson["codiceOperatore"];
              this.quoteModel.tipoPreventivo = quoteJson["tipoPreventivo"];
              this.quoteModel.data = quoteJson["data"];
              this.quoteModel.nominativo = quoteJson["nominativo"];
              this.quoteModel.cfpi = quoteJson["cfpi"];
              this.quoteModel.citta = quoteJson["citta"];
              this.quoteModel.selettorePrefissoVia = quoteJson["selettorePrefissoVia"];
              this.quoteModel.via = quoteJson["via"];
              this.quoteModel.cap = quoteJson["cap"];
              this.quoteModel.email = quoteJson["email"];
              this.quoteModel.telefono = quoteJson["telefono"];
              this.quoteModel.referente = quoteJson["referente"];
              this.quoteModel.descrizioneImmobile = quoteJson["descrizioneImmobile"];
              this.quoteModel.servizi = JSON.parse(quoteJson["servizi"]);
              this.quoteModel.interventi = JSON.parse(quoteJson["interventi"]);
              this.quoteModel.imponibile = quoteJson["imponibile"];
              this.quoteModel.iva = quoteJson["iva"];
              this.quoteModel.pagamento = quoteJson["pagamento"];
              this.quoteModel.note = quoteJson["note"];

              this.router.navigateByUrl('/editQuote');
            }
          });
}
delete(numeroPreventivo: string){
  const body = { numeroPreventivo: numeroPreventivo };

  this.http
  .post(
    this.globalService.url + 'quotes/delete',
    body, {
      headers: this.globalService.headers,
      responseType: 'text',
    })
    .subscribe((response)=>{
      if(response == 'Unauthorized') {
        this.router.navigateByUrl('/')
      }
      else {
      this.ngOnInit();
      }
    })
}

conferm(numeroPreventivo: string){
  const body = { numeroPreventivo: numeroPreventivo };

  this.http
  .post(
    this.globalService.url + 'quotes/conferm',
    body, {
      headers: this.globalService.headers,
      responseType: 'text',
    })
    .subscribe((response)=>{
      if(response == 'Unauthorized') {
        this.router.navigateByUrl('/')
      }
      else {
        this.pdfPrev = '';
      this.ngOnInit();
      }
    })
}


invio(numeroPreventivo: string){
  const body = { numeroPreventivo: numeroPreventivo };
this.http
  .post(
    this.globalService.url + 'quotes/sendPdf',
    body, {
      headers: this.globalService.headers,
      responseType: 'text',
    })
    .subscribe((response)=>{
      if(response == 'Unauthorized') {
        this.router.navigateByUrl('/')
      }
      else {
        if(response == 'NO'){
          this.popup.text = 'NEL PREVENTIVO NON E PRESENTE LA MAIL';
        this.popup.openPopup();
        }
        else {
          this.popup.text = 'INVIO DELLE MAIL RIUSCITO';
        this.popup.openPopup();
        }
      }
    })
}

back(){
  this.router.navigateByUrl('/homeAdmin') 
}

@HostListener('window:popstate', ['$event'])
  onBrowserBackBtnClose(event:Event){
    event.preventDefault();
    this.router.navigateByUrl('/homeAdmin')
  }


}
