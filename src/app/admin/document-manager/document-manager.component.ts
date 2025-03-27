import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { GlobalService } from '../../service/global.service';

@Component({
  selector: 'app-document-manager',
  templateUrl: './document-manager.component.html',
  styleUrls: ['./document-manager.component.css']
})
export class DocumentManagerComponent implements OnInit {
  empEmail: string = '';
  folders: string[] = [];
  selectedFolder: string = '';
  files: any[] = [];
  pdfBase64: string = '';
  newFolderName: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    public globalService: GlobalService
  ) {}

  ngOnInit(): void {
    // Recupera l'email dell'employee dalla rotta (ad es. /adminpayslips/:empEmail)
    this.empEmail = this.route.snapshot.paramMap.get('empEmail') || '';
    if (this.empEmail) {
      this.loadFolders();
    } else {
      console.error("Email dell'employee non presente nella rotta.");
    }
  }

  sendFileMail(filename: string): void {
    if (!this.selectedFolder) {
      alert("Seleziona prima una cartella");
      return;
    }
    const body = { empEmail: this.empEmail, folder: this.selectedFolder, filename };
    this.http.post(this.globalService.url + 'adminpayslips/sendFileMail', body, {
      headers: this.globalService.headers,
      responseType: 'text'
    }).subscribe({
      next: (resp) => {
        console.log("Documento inviato via email:", resp);
        alert("Documento inviato via email con successo!");
      },
      error: (err) => {
        console.error("Errore nell'invio del documento via email:", err);
        alert("Errore nell'invio del documento via email");
      }
    });
  }


  // Carica la lista delle cartelle per l'employee
  loadFolders(): void {
    const body = { empEmail: this.empEmail };
    this.http.post(this.globalService.url + 'adminpayslips/folders', body, {
      headers: this.globalService.headers,
      responseType: 'text'
    }).subscribe({
      next: (response) => {
        try {
          const data = JSON.parse(response);
          this.folders = data;
          console.log("Cartelle caricate:", data);
        } catch (error) {
          console.error("Errore nel parsing delle cartelle:", error);
        }
      },
      error: (error) => {
        console.error("Errore nel caricamento delle cartelle:", error);
      }
    });
  }

  // Crea una nuova cartella per l'employee
  createFolder(): void {
    if (!this.newFolderName.trim()) {
      alert("Inserisci un nome per la cartella");
      return;
    }
    const body = { empEmail: this.empEmail, folder: this.newFolderName.trim() };
    this.http.post(this.globalService.url + 'adminpayslips/createFolder', body, {
      headers: this.globalService.headers,
      responseType: 'text'
    }).subscribe({
      next: (resp) => {
        console.log("Cartella creata:", resp);
        this.newFolderName = '';
        this.loadFolders();
      },
      error: (err) => {
        console.error("Errore nella creazione della cartella:", err);
      }
    });
  }

  // Elimina una cartella (e tutti i file in essa contenuti)
  deleteFolder(folder: string): void {
    if (!confirm(`Sei sicuro di voler eliminare la cartella "${folder}"? Tutti i file in essa contenuti verranno eliminati.`)) {
      return;
    }
    const body = { empEmail: this.empEmail, folder };
    this.http.post(this.globalService.url + 'adminpayslips/deleteFolder', body, {
      headers: this.globalService.headers,
      responseType: 'text'
    }).subscribe({
      next: (resp) => {
        console.log("Cartella eliminata:", resp);
        if (folder === this.selectedFolder) {
          this.selectedFolder = '';
          this.files = [];
          this.pdfBase64 = '';
        }
        this.loadFolders();
      },
      error: (err) => {
        console.error("Errore nell'eliminazione della cartella:", err);
      }
    });
  }

  // Seleziona una cartella e carica i file al suo interno
  selectFolder(folder: string): void {
    this.selectedFolder = folder;
    this.loadFiles(folder);
    this.pdfBase64 = '';
  }

  // Carica la lista dei file in una determinata cartella
  loadFiles(folder: string): void {
    const body = { empEmail: this.empEmail, folder };
    this.http.post(this.globalService.url + 'adminpayslips/list', body, {
      headers: this.globalService.headers,
      responseType: 'text'
    }).subscribe({
      next: (response) => {
        try {
          const data = JSON.parse(response);
          this.files = data;
          console.log("File caricati per la cartella " + folder + ":", data);
        } catch (error) {
          console.error("Errore nel parsing dei file:", error);
        }
      },
      error: (error) => {
        console.error("Errore nel caricamento dei file:", error);
      }
    });
  }

  // Upload di un file nella cartella selezionata
  uploadFile(event: any): void {
    const file = event.target.files[0];
    if (!file) return;
    if (!this.selectedFolder) {
      alert("Seleziona prima una cartella");
      return;
    }
    const formData = new FormData();
    formData.append("document", file);
    formData.append("email", this.empEmail);
    formData.append("folder", this.selectedFolder);

    this.http.post(this.globalService.url + 'adminpayslips/upload', formData)
      .subscribe({
        next: (resp) => {
          console.log("Documento caricato con successo:", resp);
          alert("Documento caricato con successo!");
          this.loadFiles(this.selectedFolder);
        },
        error: (err) => {
          console.error("Errore nell'upload del documento:", err);
        }
      });
  }

  // Seleziona un file per visualizzarlo in PDF
  selectFile(filename: string): void {
    const body = { empEmail: this.empEmail, folder: this.selectedFolder, filename };
    this.http.post(this.globalService.url + 'adminpayslips/getPdf', body, {
      headers: this.globalService.headers,
      responseType: 'text'
    }).subscribe({
      next: (base64) => {
        this.pdfBase64 = base64;
        console.log("Documento in base64 caricato:", base64.substring(0, 30) + '...');
      },
      error: (err) => {
        console.error("Errore nel caricamento del documento:", err);
      }
    });
  }

  // Download del file (apre una nuova finestra/tab)
  downloadFile(filename: string): void {
    const url = this.globalService.url + `adminpayslips/download?empEmail=${this.empEmail}&folder=${this.selectedFolder}&filename=${filename}`;
    window.open(url, "_blank");
  }

  // Elimina un file
  deleteFile(filename: string): void {
    if (!confirm(`Sei sicuro di voler eliminare il file "${filename}"?`)) {
      return;
    }
    const body = { empEmail: this.empEmail, folder: this.selectedFolder, filename };
    this.http.post(this.globalService.url + 'adminpayslips/delete', body, {
      headers: this.globalService.headers,
      responseType: 'text'
    }).subscribe({
      next: (resp) => {
        console.log("Documento eliminato con successo:", resp);
        this.files = this.files.filter(file => file.filename !== filename);
        if (this.pdfBase64 && this.pdfBase64 === filename) {
          this.pdfBase64 = '';
        }
      },
      error: (err) => {
        console.error("Errore nell'eliminazione del documento:", err);
      }
    });
  }

  back(): void {
    this.router.navigateByUrl("/homeAdmin");
  }
}
