import { Component, OnInit, ViewChild } from '@angular/core';
import { GlobalService } from '../../service/global.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NgxExtendedPdfViewerComponent } from 'ngx-extended-pdf-viewer';

@Component({
  selector: 'app-view-pdf',
  templateUrl: './view-pdf.component.html',
  styleUrls: ['./view-pdf.component.css'],
})
export class ViewPdfComponent implements OnInit {
  pdfPrev: string = '';
  downloadName = 'document.pdf';

  numeroPreventivo!: string;

  constructor(
    private globalService: GlobalService,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  private sanitizeFilename(name: string): string {
    const cleaned = name
      .replace(/[\/\\?%*:|"<>]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return cleaned.slice(0, 120) || 'document';
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const numeroPreventivo = params['numeroPreventivo'];
      if (!numeroPreventivo) return;

      const body = { numeroPreventivo };
      this.numeroPreventivo = params['numeroPreventivo'];

      // Nome file
      this.http
        .post(this.globalService.url + 'quotes/getQuote', body, {
          headers: this.globalService.headers,
          responseType: 'text',
        })
        .subscribe((resp) => {
          if (resp === 'Unauthorized') {
            this.router.navigateByUrl('/');
            return;
          }
          const quote = JSON.parse(resp)[0];
          const nominativo = String(quote?.nominativo ?? '').trim();
          const base = this.sanitizeFilename(
            `${numeroPreventivo} ${nominativo}`
          );
          this.downloadName = `${base}.pdf`;
        });

      // PDF base64
      this.http
        .post(this.globalService.url + 'pdfs/sendQuote', body, {
          headers: this.globalService.headers,
          responseType: 'text',
        })
        .subscribe((response) => {
          if (response !== 'Unauthorized') {
            this.pdfPrev = response;
          } else {
            this.router.navigateByUrl('/');
          }
        });
    });
  }

  back() {
    this.router.navigateByUrl('/quotesHome');
  }

  downloadPdf() {
    const body = { numeroPreventivo: this.numeroPreventivo };

    this.http
      .post(this.globalService.url + 'quotes/downloadSecure', body, {
        headers: this.globalService.headers,
        responseType: 'blob',
      })
      .subscribe(
        (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = this.downloadName;
          a.click();
          window.URL.revokeObjectURL(url);
        },
        (err) => console.error('Errore download:', err)
      );
  }
  printPdf() {
    const body = { numeroPreventivo: this.numeroPreventivo };

    this.http
      .post(this.globalService.url + 'quotes/downloadSecure', body, {
        headers: this.globalService.headers,
        responseType: 'blob',
      })
      .subscribe(
        (blob) => {
          const pdfUrl = URL.createObjectURL(blob);

          // Apri in nuova scheda
          const newWindow = window.open(pdfUrl);

          if (!newWindow) {
            alert(
              '⚠️ Il browser ha bloccato il popup. Attiva i popup per permettere la stampa.'
            );
            return;
          }

          // Aspettiamo che la nuova scheda abbia caricato il PDF
          newWindow.onload = () => {
            newWindow.focus();

            // Provare in loop perché Safari impiega sempre tempo
            const tryPrint = setInterval(() => {
              try {
                newWindow.print();
                clearInterval(tryPrint);
              } catch {}
            }, 300);
          };
        },
        (err) => console.error('Errore stampa:', err)
      );
  }
}
