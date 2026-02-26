import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { GlobalService } from '../../service/global.service';

@Component({
  selector: 'app-internal-documents',
  templateUrl: './internal-documents.component.html',
  styleUrls: ['./internal-documents.component.scss'],
})
export class InternalDocumentsComponent implements OnInit {
  folders: string[] = [];
  selectedFolder: string = '';
  files: any[] = [];
  pdfBase64: string = '';
  newFolderName: string = '';

  currentFilename: string = '';

  constructor(
    private router: Router,
    private http: HttpClient,
    public globalService: GlobalService,
  ) {}

  ngOnInit(): void {
    this.loadFolders();
  }

  // ============ FOLDERS ============

  loadFolders(): void {
    this.http
      .post(
        this.globalService.url + 'admin/internal-documents/folders',
        {},
        {
          headers: this.globalService.headers,
          responseType: 'text',
        },
      )
      .subscribe({
        next: (res) => {
          try {
            this.folders = JSON.parse(res) || [];
          } catch {
            this.folders = [];
          }
        },
        error: (err) => {
          console.error('FOLDERS ERROR:', err);
          this.folders = [];
        },
      });
  }

  createFolder(): void {
    const folder = (this.newFolderName || '').trim();
    if (!folder) return alert('Inserisci un nome');

    this.http
      .post(
        this.globalService.url + 'admin/internal-documents/createFolder',
        { folder },
        {
          headers: this.globalService.headers,
          responseType: 'text',
        },
      )
      .subscribe({
        next: () => {
          this.newFolderName = '';
          this.loadFolders();
        },
        error: (err) => {
          console.error('CREATE FOLDER ERROR:', err);
          alert('Errore creazione cartella');
        },
      });
  }

  deleteFolder(folder: string): void {
    if (!confirm(`Eliminare la cartella "${folder}"?`)) return;

    this.http
      .post(
        this.globalService.url + 'admin/internal-documents/deleteFolder',
        { folder },
        {
          headers: this.globalService.headers,
          responseType: 'text',
        },
      )
      .subscribe({
        next: () => {
          if (folder === this.selectedFolder) {
            this.selectedFolder = '';
            this.files = [];
            this.pdfBase64 = '';
            this.currentFilename = '';
          }
          this.loadFolders();
        },
        error: (err) => {
          console.error('DELETE FOLDER ERROR:', err);
          alert('Errore eliminazione cartella');
        },
      });
  }

  selectFolder(folder: string): void {
    this.selectedFolder = folder;
    this.pdfBase64 = '';
    this.currentFilename = '';
    this.loadFiles();
  }

  // ============ FILES ============

  loadFiles(): void {
    if (!this.selectedFolder) {
      this.files = [];
      return;
    }

    const body = { folder: this.selectedFolder };

    this.http
      .post(this.globalService.url + 'admin/internal-documents/list', body, {
        headers: this.globalService.headers,
        responseType: 'text',
      })
      .subscribe({
        next: (res) => {
          try {
            this.files = JSON.parse(res) || [];
          } catch {
            this.files = [];
          }
        },
        error: (err) => {
          console.error('LIST ERROR:', err);
          this.files = [];
          alert('Errore caricamento files');
        },
      });
  }

  uploadFile(event: any): void {
    const file = event?.target?.files?.[0];
    if (!file || !this.selectedFolder) {
      return alert('Seleziona una cartella e un file');
    }

    const formData = new FormData();
    formData.append('document', file);
    formData.append('folder', this.selectedFolder);

    // IDENTICO employees: niente headers custom e niente responseType
    this.http
      .post(
        this.globalService.url + 'admin/internal-documents/upload',
        formData,
      )
      .subscribe({
        next: () => {
          alert('Documento caricato!');
          this.loadFiles();
          // reset input
          try {
            event.target.value = '';
          } catch {}
        },
        error: (err) => {
          console.error('UPLOAD ERROR:', err);
          alert('Errore upload');
        },
      });
  }

  selectFile(filename: string): void {
    if (!this.selectedFolder) return;
    this.currentFilename = filename;

    const body = { folder: this.selectedFolder, filename };

    this.http
      .post(this.globalService.url + 'admin/internal-documents/getPdf', body, {
        headers: this.globalService.headers,
        responseType: 'text',
      })
      .subscribe({
        next: (base64) => (this.pdfBase64 = base64 || ''),
        error: (err) => {
          console.error('GETPDF ERROR:', err);
          alert('Errore apertura PDF');
        },
      });
  }

  downloadCurrentFile(filename: string): void {
    if (!this.selectedFolder) return;

    const body = { folder: this.selectedFolder, filename };

    this.http
      .post(
        this.globalService.url + 'admin/internal-documents/downloadSecure',
        body,
        {
          headers: this.globalService.headers,
          responseType: 'blob',
        },
      )
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          a.click();
          window.URL.revokeObjectURL(url);
        },
        error: (err) => {
          console.error('DOWNLOAD ERROR:', err);
          alert('Errore download');
        },
      });
  }

  printFile(filename: string): void {
    if (!this.selectedFolder) return;

    const body = { folder: this.selectedFolder, filename };

    this.http
      .post(
        this.globalService.url + 'admin/internal-documents/downloadSecure',
        body,
        {
          headers: this.globalService.headers,
          responseType: 'blob',
          observe: 'response',
        },
      )
      .subscribe({
        next: async (resp) => {
          const ct = resp.headers.get('content-type') || '';
          const blob = resp.body as Blob;

          // Se NON è un pdf, quasi sicuramente è un testo di errore (ERR/Unauthorized ecc.)
          if (!ct.includes('pdf')) {
            try {
              const txt = await blob.text();
              console.error('PRINT returned non-pdf:', ct, txt);
              alert(
                'Stampa fallita: il server non ha restituito un PDF.\nControlla console (PRINT returned non-pdf).',
              );
            } catch {
              alert('Stampa fallita: risposta non valida dal server.');
            }
            return;
          }

          // Forza tipo PDF
          const pdfBlob = new Blob([blob], { type: 'application/pdf' });
          const pdfUrl = URL.createObjectURL(pdfBlob);
          const newWindow = window.open(pdfUrl);

          if (!newWindow) {
            alert(
              '⚠️ Popup bloccato dal browser. Consenti i popup per la stampa.',
            );
            return;
          }

          newWindow.onload = () => {
            newWindow.focus();
            const tryPrint = setInterval(() => {
              try {
                newWindow.print();
                clearInterval(tryPrint);
              } catch {}
            }, 300);
          };
        },
        error: (err) => {
          console.error('PRINT ERROR:', err);
          alert('Errore stampa');
        },
      });
  }

  deleteFile(filename: string): void {
    if (!this.selectedFolder) return;
    if (!confirm(`Eliminare il file "${filename}"?`)) return;

    const body = { folder: this.selectedFolder, filename };

    this.http
      .post(this.globalService.url + 'admin/internal-documents/delete', body, {
        headers: this.globalService.headers,
        responseType: 'text',
      })
      .subscribe({
        next: () => {
          this.files = this.files.filter((f: any) => f.filename !== filename);
          if (this.currentFilename === filename) {
            this.currentFilename = '';
            this.pdfBase64 = '';
          }
        },
        error: (err) => {
          console.error('DELETE FILE ERROR:', err);
          alert('Errore eliminazione file');
        },
      });
  }

  // ============ UI UTILS ============

  prettySize(bytes: number): string {
    if (bytes === null || bytes === undefined) return '';
    const units = ['B', 'KB', 'MB', 'GB'];
    let v = bytes;
    let i = 0;
    while (v >= 1024 && i < units.length - 1) {
      v /= 1024;
      i++;
    }
    return `${v.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
  }

  back(): void {
    this.router.navigateByUrl('/homeAdmin');
  }
}
