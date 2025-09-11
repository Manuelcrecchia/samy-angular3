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
  downloadName = 'document.pdf';

  constructor(
    private globalService: GlobalService,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  private sanitizeFilename(name: string): string {
    // rimuove caratteri non ammessi e comprime spazi
    const cleaned = name
      .replace(/[\/\\?%*:|"<>]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    // limita a 120 caratteri per sicurezza
    return cleaned.slice(0, 120) || 'document';
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const numeroPreventivo = params['numeroPreventivo'];
      if (!numeroPreventivo) return;

      // 1) prendo il nominativo per comporre il nome file
      const body = { numeroPreventivo };
      this.http.post(this.globalService.url + 'quotes/getQuote', body, {
        headers: this.globalService.headers,
        responseType: 'text',
      }).subscribe(resp => {
        if (resp === 'Unauthorized') {
          this.router.navigateByUrl('/');
          return;
        }
        const quote = JSON.parse(resp)[0];
        const nominativo = String(quote?.nominativo ?? '').trim();
        const base = this.sanitizeFilename(`${numeroPreventivo} ${nominativo}`);
        this.downloadName = `${base}.pdf`;
      });

      // 2) prendo il PDF base64
      this.http.post(this.globalService.url + 'pdfs/sendQuote', body, {
        headers: this.globalService.headers,
        responseType: 'text'
      }).subscribe(response => {
        if (response !== 'Unauthorized') {
          this.pdfPrev = response; // base64
        } else {
          this.router.navigateByUrl('/');
        }
      });
    });
  }
  back(){
    this.router.navigateByUrl('/quotesHome');
  }
}
