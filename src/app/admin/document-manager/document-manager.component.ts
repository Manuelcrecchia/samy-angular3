import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { GlobalService } from '../../service/global.service';

@Component({
  selector: 'app-document-manager',
  templateUrl: './document-manager.component.html',
  styleUrls: ['./document-manager.component.css'],
})
export class DocumentManagerComponent implements OnInit {
  userId: string = '';
  isCustomer: boolean = false;
  prefix: 'employee' | 'customer' = 'employee';

  folders: string[] = [];
  selectedFolder: string = '';
  files: any[] = [];
  pdfBase64: string = '';
  newFolderName: string = '';
  email: string = '';

  currentFilename: string = ''; // 👈 NECESSARIO PER STAMPA E DOWNLOAD CORRETTI
  fileType: 'pdf' | 'image' | 'signed' | 'other' = 'other';
  imageBase64: string = '';
  fileBlob: Blob | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    public globalService: GlobalService,
  ) {}

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id') || '';
    this.isCustomer = this.route.snapshot.url[1].path === 'client';
    this.prefix = this.isCustomer ? 'customer' : 'employee';

    this.loadFolders();
    this.loadEmailIfNeeded();
  }

  private getPayload(extra: any = {}) {
    return this.isCustomer
      ? { numeroCliente: this.userId, prefix: this.prefix, ...extra }
      : { employeeId: this.userId, prefix: this.prefix, ...extra };
  }

  private loadEmailIfNeeded() {
    const endpoint = this.isCustomer ? 'customers/getAll' : 'employees/getAll';

    this.http
      .get(this.globalService.url + endpoint, {
        headers: this.globalService.headers,
        responseType: 'text',
      })
      .subscribe({
        next: (res) => {
          try {
            const users = JSON.parse(res);
            const user = this.isCustomer
              ? users.find((u: any) => u.numeroCliente == this.userId)
              : users.find((u: any) => u.id == this.userId);
            this.email = user?.email || '';
          } catch (err) {
            console.error('Errore parsing email:', err);
          }
        },
        error: (err) => {
          console.error('Errore caricamento email:', err);
          alert('Errore durante il caricamento dei dati');
        },
      });
  }

  sendFileMail(filename: string): void {
    if (!this.selectedFolder) return alert('Seleziona una cartella');
    if (!this.email) return alert('Email utente non disponibile');

    const body = this.getPayload({ folder: this.selectedFolder, filename });

    this.http
      .post(this.globalService.url + 'documents/sendDocumentMail', body, {
        headers: this.globalService.headers,
        responseType: 'text',
      })
      .subscribe({
        next: () => alert('Email inviata con successo!'),
        error: () => alert('Errore durante invio email'),
      });
  }

  loadFolders(): void {
    const body = this.getPayload();

    this.http
      .post(this.globalService.url + 'documents/folders', body, {
        headers: this.globalService.headers,
        responseType: 'text',
      })
      .subscribe({
        next: (res) => {
          try {
            this.folders = JSON.parse(res);
          } catch {}
        },
        error: (err) => {
          console.error('Errore caricamento cartelle:', err);
          alert('Errore durante il caricamento dei dati');
        },
      });
  }

  createFolder(): void {
    if (!this.newFolderName.trim()) return alert('Inserisci un nome');

    const body = this.getPayload({ folder: this.newFolderName.trim() });

    this.http
      .post(this.globalService.url + 'documents/createFolder', body, {
        headers: this.globalService.headers,
        responseType: 'text',
      })
      .subscribe({
        next: () => {
          this.newFolderName = '';
          this.loadFolders();
        },
        error: (err) => {
          console.error('Errore creazione cartella:', err);
          alert(this.parseServerError(err));
        },
      });
  }

  deleteFolder(folder: string): void {
    if (!confirm(`Eliminare la cartella "${folder}"?`)) return;

    const body = this.getPayload({ folder });

    this.http
      .post(this.globalService.url + 'documents/deleteFolder', body, {
        headers: this.globalService.headers,
        responseType: 'text',
      })
      .subscribe({
        next: () => {
          if (folder === this.selectedFolder) {
            this.selectedFolder = '';
            this.files = [];
            this.clearFilePreview();
          }
          this.loadFolders();
        },
        error: (err) => {
          console.error('Errore eliminazione cartella:', err);
          alert(this.parseServerError(err));
        },
      });
  }

  selectFolder(folder: string): void {
    this.selectedFolder = folder;
    this.loadFiles();
    this.clearFilePreview();
  }

  private clearFilePreview(): void {
    this.pdfBase64 = '';
    this.imageBase64 = '';
    this.fileBlob = null;
    this.currentFilename = '';
    this.fileType = 'other';
  }

  loadFiles(): void {
    const body = this.getPayload({ folder: this.selectedFolder });

    this.http
      .post(this.globalService.url + 'documents/list', body, {
        headers: this.globalService.headers,
        responseType: 'text',
      })
      .subscribe({
        next: (res) => {
          try {
            this.files = JSON.parse(res);
          } catch {}
        },
        error: (err) => {
          console.error('Errore caricamento file:', err);
          alert('Errore durante il caricamento dei dati');
        },
      });
  }

  uploadFile(event: any): void {
    const file = event.target.files[0];
    if (!file || !this.selectedFolder)
      return alert('Seleziona una cartella e un file');

    const formData = new FormData();
    formData.append('document', file);
    formData.append('folder', this.selectedFolder);
    formData.append(
      this.isCustomer ? 'numeroCliente' : 'employeeId',
      this.userId,
    );
    formData.append('prefix', this.prefix);

    this.http
      .post(this.globalService.url + 'documents/upload', formData)
      .subscribe({
        next: () => {
          alert('Documento caricato!');
          this.loadFiles();
        },
        error: (err) => {
          console.error('Errore upload documento:', err);
          alert(this.parseServerError(err));
        },
      });
  }

  private getFileType(filename: string): 'pdf' | 'image' | 'signed' | 'other' {
    const lower = filename.toLowerCase();
    const ext = lower.split('.').pop() || '';
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
    if (lower.endsWith('.p7m')) return 'signed';
    if (ext === 'pdf') return 'pdf';
    if (imageExts.includes(ext)) return 'image';
    return 'other';
  }

  selectFile(filename: string): void {
    this.clearFilePreview();
    this.currentFilename = filename; // 👈 IMPORTANTE
    this.fileType = this.getFileType(filename);

    const body = this.getPayload({ folder: this.selectedFolder, filename });

    // For all file types, fetch as blob first to store it
    this.http
      .post(this.globalService.url + 'documents/downloadSecure', body, {
        headers: this.globalService.headers,
        responseType: 'blob',
      })
      .subscribe({
        next: (blob) => {
          this.fileBlob = blob;

          if (this.fileType === 'pdf') {
            // Convert blob to base64 for PDF viewer
            const reader = new FileReader();
            reader.onload = () => {
              this.pdfBase64 = (reader.result as string).split(',')[1];
            };
            reader.readAsDataURL(blob);
          } else if (this.fileType === 'image') {
            // Convert blob to base64 for image preview
            const reader = new FileReader();
            reader.onload = () => {
              this.imageBase64 = reader.result as string;
            };
            reader.readAsDataURL(blob);
          }
        },
        error: (err) => {
          console.error('Errore caricamento file:', err);
          alert('Errore durante il caricamento dei dati');
        },
      });
  }

  downloadCurrentFile(filename: string): void {
    const body = this.getPayload({ folder: this.selectedFolder, filename });

    this.http
      .post(this.globalService.url + 'documents/downloadSecure', body, {
        headers: this.globalService.headers,
        responseType: 'blob',
      })
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
          console.error('Errore download file:', err);
          alert('Errore durante il download del file');
        },
      });
  }

  printFile(filename: string): void {
    const type = this.getFileType(filename);

    if (filename.toLowerCase().endsWith('.p7m')) {
      alert('I file .p7m non possono essere stampati direttamente. Scaricali e aprili con un verificatore di firma digitale.');
      return;
    }

    const body = this.getPayload({
      folder: this.selectedFolder,
      filename,
    });

    this.http
      .post(this.globalService.url + 'documents/downloadSecure', body, {
        headers: this.globalService.headers,
        responseType: 'blob',
      })
      .subscribe({
        next: (blob) => {
          const printableBlob =
            type === 'pdf'
              ? new Blob([blob], { type: 'application/pdf' })
              : type === 'image'
                ? new Blob([blob], { type: blob.type || 'image/png' })
                : blob;
          const pdfUrl = URL.createObjectURL(printableBlob);

          // Apri in nuova scheda
          const newWindow = window.open(pdfUrl);

          if (!newWindow) {
            alert(
              '⚠️ Popup bloccato dal browser. Consenti i popup per la stampa.',
            );
            return;
          }

          // Safari ha bisogno di un piccolo delay
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
          console.error('Errore stampa:', err);
          alert('Errore durante la stampa del file');
        },
      });
  }

  deleteFile(filename: string): void {
    if (!confirm(`Eliminare il file "${filename}"?`)) return;

    const body = this.getPayload({ folder: this.selectedFolder, filename });

    this.http
      .post(this.globalService.url + 'documents/delete', body, {
        headers: this.globalService.headers,
        responseType: 'text',
      })
      .subscribe({
        next: () => {
          this.files = this.files.filter((f) => f.filename !== filename);
          if (this.currentFilename === filename) this.clearFilePreview();
        },
        error: (err) => {
          console.error('Errore eliminazione file:', err);
          alert(this.parseServerError(err));
        },
      });
  }

  back(): void {
    this.router.navigateByUrl('/homeAdmin');
  }

  private parseServerError(err: any): string {
    try {
      const body = typeof err.error === 'string' ? JSON.parse(err.error) : err.error;
      if (body?.error) return body.error;
    } catch {}
    if (err.status === 0) return 'Impossibile connettersi al server';
    return 'Errore imprevisto. Riprova.';
  }
}
