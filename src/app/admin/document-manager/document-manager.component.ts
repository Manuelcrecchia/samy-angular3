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
      .subscribe(() => {
        this.newFolderName = '';
        this.loadFolders();
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
      .subscribe(() => {
        if (folder === this.selectedFolder) {
          this.selectedFolder = '';
          this.files = [];
          this.pdfBase64 = '';
        }
        this.loadFolders();
      });
  }

  selectFolder(folder: string): void {
    this.selectedFolder = folder;
    this.loadFiles();
    this.pdfBase64 = '';
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
      });
  }

  selectFile(filename: string): void {
    this.currentFilename = filename; // 👈 IMPORTANTE

    const body = this.getPayload({ folder: this.selectedFolder, filename });

    this.http
      .post(this.globalService.url + 'documents/getPdf', body, {
        headers: this.globalService.headers,
        responseType: 'text',
      })
      .subscribe((base64) => (this.pdfBase64 = base64));
  }

  downloadCurrentFile(filename: string): void {
    const body = this.getPayload({ folder: this.selectedFolder, filename });

    this.http
      .post(this.globalService.url + 'documents/downloadSecure', body, {
        headers: this.globalService.headers,
        responseType: 'blob',
      })
      .subscribe((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
      });
  }

  printFile(filename: string): void {
    const body = this.getPayload({
      folder: this.selectedFolder,
      filename,
    });

    this.http
      .post(this.globalService.url + 'documents/downloadSecure', body, {
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
        (err) => console.error('Errore stampa:', err),
      );
  }

  deleteFile(filename: string): void {
    if (!confirm(`Eliminare il file "${filename}"?`)) return;

    const body = this.getPayload({ folder: this.selectedFolder, filename });

    this.http
      .post(this.globalService.url + 'documents/delete', body, {
        headers: this.globalService.headers,
        responseType: 'text',
      })
      .subscribe(() => {
        this.files = this.files.filter((f) => f.filename !== filename);
        if (this.currentFilename === filename) this.pdfBase64 = '';
      });
  }

  back(): void {
    this.router.navigateByUrl('/homeAdmin');
  }
}
