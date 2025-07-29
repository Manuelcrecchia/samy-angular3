import { HttpClient } from '@angular/common/http';
import { Component, HostListener, Input, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgxExtendedPdfViewerService } from 'ngx-extended-pdf-viewer';
import { GlobalService } from '../../service/global.service';
import { QuoteModelService } from '../../service/quote-model.service';
import { PopupServiceService } from '../../componenti/popup/popup-service.service';
import { DxSchedulerComponent } from "devextreme-angular";
import { AutomaticAddInspectionToCalendarService } from '../../service/automatic-add-inspection-to-calendar.service';
import { Location } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CustomerModelService } from '../../service/customer-model.service';


@Component({
  selector: 'app-quotes-home',
  templateUrl: './quotes-home.component.html',
  styleUrl: './quotes-home.component.css'
})
export class QuotesHomeComponent   {@Input() color: any;
  numeroClienteSelezionato = '';
  showCompletedQuotes = false;
  quotesFrEnd: {
    numeroPreventivo: string;
    nominativo: string;
    complete: string;
  }[] = [];
  

  pdfPrev!: string;
  pdfTsSelezionato = false;
  @ViewChild(DxSchedulerComponent, { static: false }) scheduler!: DxSchedulerComponent;

  constructor(private http: HttpClient,private snackBar: MatSnackBar,
    private pdfService: NgxExtendedPdfViewerService,
    private globalService: GlobalService,
    private router: Router,
    private quoteModel: QuoteModelService,
    private popup: PopupServiceService,
    private automaticAddInspectionToCalendarService: AutomaticAddInspectionToCalendarService,
    private location: Location,
    private customerModelService : CustomerModelService
   ){}

addInspection(numeroPreventivo: string, nominativo: string) {
  this.automaticAddInspectionToCalendarService.pass = true;
  this.automaticAddInspectionToCalendarService.nominativo = nominativo;
  this.automaticAddInspectionToCalendarService.numeroPreventivo = numeroPreventivo;
  let body = { numeroPreventivo: numeroPreventivo };
  this.http
    .post(this.globalService.url + 'quotes/getQuote', body,{
      headers: this.globalService.headers,
      responseType: 'text',
    })
    .subscribe((response) => {
      let temp = JSON.parse(response)
      this.automaticAddInspectionToCalendarService.telefono = temp[0].telefono;
      this.router.navigateByUrl('/calendarHome');
    }
    );}

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
      const allQuotes = JSON.parse(response) as any[];

      const filteredQuotes = this.showCompletedQuotes
  ? allQuotes.filter(q => q.complete === 'A' || q.complete === 'R')
  : allQuotes.filter(q => !q.complete || q.complete === '');


      this.quotesFrEnd = filteredQuotes.sort(
        (a, b) => parseInt(b.numeroPreventivo) - parseInt(a.numeroPreventivo)
      );

      if (this.quotesFrEnd.length > 0) {
        this.pdfTsSelezionato = true;
        this.numeroClienteSelezionato = this.quotesFrEnd[0].numeroPreventivo;
      }
    });
}


viewPdf(numeroPreventivo:string){
  this.router.navigate(['/view-pdf'], { queryParams: { numeroPreventivo } });}

searchNumeroPreventivo(value: string){

  if(value == ""){
    this.ngOnInit();
  }
  else{

    this.quotesFrEnd = this.quotesFrEnd.filter(quote => quote.numeroPreventivo.startsWith(value))
  }
}

searchNominativo(value: string){
  if (value === "") {
    this.ngOnInit();
  } else {
    const lowerValue = value.toLowerCase();
    this.quotesFrEnd = this.quotesFrEnd.filter(quote =>
      quote.nominativo.toLowerCase().startsWith(lowerValue)
    );
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
              this.quoteModel.cittaDiFatturazione = quoteJson["cittaDiFatturazione"];
              this.quoteModel.selettorePrefissoViaDiFatturazione = quoteJson["selettorePrefissoViaDiFatturazione"];
              this.quoteModel.viaDiFatturazione = quoteJson["viaDiFatturazione"];
              this.quoteModel.capDiFatturazione = quoteJson["capDiFatturazione"];
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
              this.quoteModel.imponibile = parseFloat(quoteJson["imponibile"]).toFixed(2);
              this.quoteModel.iva = quoteJson["iva"];
              this.quoteModel.pagamento = quoteJson["pagamento"];
              this.quoteModel.tempistica = quoteJson["tempistica"];
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

conferm(numeroPreventivo: string) {
  const body = { numeroPreventivo };

  this.http
    .post(this.globalService.url + 'quotes/getQuote', body, {
      headers: this.globalService.headers,
      responseType: 'text',
    })
    .subscribe((response) => {
      if (response === 'Unauthorized') {
        this.router.navigateByUrl('/');
        return;
      }

      const quote = JSON.parse(response)[0];

      // Popola il modello per la pagina AddCustomer
      this.customerModelService.tipoCliente = quote.tipoPreventivo;
      this.customerModelService.nominativo = quote.nominativo;
      this.customerModelService.cfpi = quote.cfpi;
      this.customerModelService.cittaDiFatturazione = quote.cittaDiFatturazione;
      this.customerModelService.selettorePrefissoViaDiFatturazione = quote.selettorePrefissoViaDiFatturazione;
      this.customerModelService.viaDiFatturazione = quote.viaDiFatturazione;
      this.customerModelService.capDiFatturazione = quote.capDiFatturazione;
      this.customerModelService.citta = quote.citta;
      this.customerModelService.selettorePrefissoVia = quote.selettorePrefissoVia;
      this.customerModelService.via = quote.via;
      this.customerModelService.cap = quote.cap;
      this.customerModelService.email = quote.email;
      this.customerModelService.telefono = quote.telefono;
      this.customerModelService.referente = quote.referente;
      this.customerModelService.descrizioneImmobile = quote.descrizioneImmobile;
      this.customerModelService.servizi = JSON.parse(quote.servizi);
      this.customerModelService.interventi = JSON.parse(quote.interventi);
      this.customerModelService.imponibile = parseFloat(quote.imponibile).toFixed(2);
      this.customerModelService.iva = quote.iva;
      this.customerModelService.pagamento = quote.pagamento;
      this.customerModelService.tempistica = quote.tempistica;
      this.customerModelService.note = quote.note;

      // ✅ Imposta complete = true nel backend
      this.http.post(this.globalService.url + 'quotes/setComplete', { numeroPreventivo }, {
        headers: this.globalService.headers,
        responseType: 'text'
      }).subscribe(() => {
        // Naviga alla pagina di aggiunta cliente
        this.router.navigateByUrl('/addCustomer');
      });
    });

}

refuse(numeroPreventivo: string) {
  const body = { numeroPreventivo };

  this.http
    .post(this.globalService.url + 'quotes/setRefused', body, {
      headers: this.globalService.headers,
      responseType: 'text',
    })
    .subscribe((response) => {
      if (response === 'Unauthorized') {
        this.router.navigateByUrl('/');
      } else {
        this.ngOnInit();
      }
    });
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

// invioWhatsApp(numeroPreventivo: string) {
//   const body = { numeroPreventivo: numeroPreventivo };
//   this.http
//     .post(
//       this.globalService.url + 'quotes/sendWhatsApp',
//       body,
//       {
//         headers: this.globalService.headers,
//         responseType: 'text',
//       }
//     )
//     .subscribe((response) => {
//       if (response == 'Unauthorized') {
//         this.router.navigateByUrl('/');
//       } else {
//         if (response == 'NO') {
//           this.popup.text = 'NEL PREVENTIVO NON È PRESENTE UN NUMERO DI TELEFONO';
//           this.popup.openPopup();
//         } else {
//           this.popup.text = 'INVIO SU WHATSAPP RIUSCITO';
//           this.popup.openPopup();
//         }
//       }
//     });
// }



back(){
  this.router.navigateByUrl('/homeAdmin')
}

@HostListener('window:popstate', ['$event'])
  onBrowserBackBtnClose(event: Event): void {
    event.preventDefault();
    this.location.replaceState('/homeAdmin');
    this.router.navigateByUrl('/homeAdmin');
  }


}
