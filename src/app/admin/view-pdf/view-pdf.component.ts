import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../../service/global.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-view-pdf',
  templateUrl: './view-pdf.component.html',
  styleUrls: ['./view-pdf.component.css']
})
export class ViewPdfComponent implements OnInit {
  pdfPrev: string = "";

  constructor(
    private globalService: GlobalService,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const numeroPreventivo = params['numeroPreventivo'];
      if (numeroPreventivo) {
        const body = { numeroPreventivo: numeroPreventivo };
        console.log("pronto per la richiesta");
        this.http.post(this.globalService.url + 'pdfs/sendQuote', body, { headers: this.globalService.headers, responseType: 'text' })
          .subscribe(response => {
            if (response !== 'Unauthorized') {
              console.log("richietsa pdf effetuata");
              this.pdfPrev = response;
            } else {
              this.router.navigateByUrl('/');            }
          });
      }
    });
  }
  back(){
    this.router.navigateByUrl('/quotesHome');
  }
}
