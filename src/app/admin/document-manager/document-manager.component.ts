import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { GlobalService } from '../../service/global.service';

@Component({
  selector: 'app-document-manager',
  templateUrl: './document-manager.component.html',
  styleUrls: ['./document-manager.component.css']
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    public globalService: GlobalService
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

    this.http.get(this.globalService.url + endpoint, {
      headers: this.globalService.headers,
      responseType: 'text'
    }).subscribe({
      next: (res) => {
        try {
          const users = JSON.parse(res);
          const user = this.isCustomer
            ? users.find((u: any) => u.numeroCliente == this.userId)
            : users.find((u: any) => u.id == this.userId);
          this.email = user?.email || '';
        } catch (err) {
          console.error("Errore nel parsing dell'email:", err);
        }
      }
    });
  }

  sendFileMail(filename: string): void {
    if (!this.selectedFolder) return alert("Seleziona una cartella");
    if (!this.email) return alert("Email utente non disponibile");

    const body = this.getPayload({ folder: this.selectedFolder, filename });

    this.http.post(this.globalService.url + 'documents/sendDocumentMail', body, {
      headers: this.globalService.headers,
      responseType: 'text'
    }).subscribe({
      next: () => alert("Email inviata con successo!"),
      error: () => alert("Errore durante l'invio dell'email")
    });
  }

  loadFolders(): void {
    const body = this.getPayload();
    this.http.post(this.globalService.url + 'documents/folders', body, {
      headers: this.globalService.headers,
      responseType: 'text'
    }).subscribe({
      next: (res) => {
        try {
          this.folders = JSON.parse(res);
        } catch {
          console.error("Errore nel parsing delle cartelle");
        }
      }
    });
  }

  createFolder(): void {
    if (!this.newFolderName.trim()) return alert("Inserisci un nome");

    const body = this.getPayload({ folder: this.newFolderName.trim() });
    this.http.post(this.globalService.url + 'documents/createFolder', body, {
      headers: this.globalService.headers,
      responseType: 'text'
    }).subscribe(() => {
      this.newFolderName = '';
      this.loadFolders();
    });
  }

  deleteFolder(folder: string): void {
    if (!confirm(`Vuoi eliminare la cartella "${folder}"?`)) return;

    const body = this.getPayload({ folder });
    this.http.post(this.globalService.url + 'documents/deleteFolder', body, {
      headers: this.globalService.headers,
      responseType: 'text'
    }).subscribe(() => {
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
    this.http.post(this.globalService.url + 'documents/list', body, {
      headers: this.globalService.headers,
      responseType: 'text'
    }).subscribe({
      next: (res) => {
        try {
          this.files = JSON.parse(res);
        } catch {
          console.error("Errore parsing file lista");
        }
      }
    });
  }

  uploadFile(event: any): void {
    const file = event.target.files[0];
    if (!file || !this.selectedFolder) return alert("Seleziona una cartella e un file");

    const formData = new FormData();
    formData.append("document", file);
    formData.append("folder", this.selectedFolder);
    formData.append(this.isCustomer ? "numeroCliente" : "employeeId", this.userId);
    formData.append("prefix", this.prefix);

    this.http.post(this.globalService.url + 'documents/upload', formData)
      .subscribe({
        next: () => {
          alert("Documento caricato!");
          this.loadFiles();
        },
        error: (err) => {
          console.error("Errore upload:", err);
          alert("Errore durante l'upload");
        }
      });
  }

  selectFile(filename: string): void {
    const body = this.getPayload({ folder: this.selectedFolder, filename });
    this.http.post(this.globalService.url + 'documents/getPdf', body, {
      headers: this.globalService.headers,
      responseType: 'text'
    }).subscribe((base64) => this.pdfBase64 = base64);
  }

  downloadFile(filename: string): void {
    const paramName = this.isCustomer ? "numeroCliente" : "employeeId";
    const url = `${this.globalService.url}documents/download?${paramName}=${this.userId}&folder=${this.selectedFolder}&filename=${filename}&prefix=${this.prefix}`;
    window.open(url, "_blank");
  }

  deleteFile(filename: string): void {
    if (!confirm(`Eliminare il file "${filename}"?`)) return;

    const body = this.getPayload({ folder: this.selectedFolder, filename });
    this.http.post(this.globalService.url + 'documents/delete', body, {
      headers: this.globalService.headers,
      responseType: 'text'
    }).subscribe(() => {
      this.files = this.files.filter(f => f.filename !== filename);
      if (this.pdfBase64 === filename) this.pdfBase64 = '';
    });
  }

  back(): void {
    this.router.navigateByUrl("/homeAdmin");
  }
}
