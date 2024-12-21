import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GlobalService } from '../../service/global.service'; // Per l'URL e gli headers

@Component({
  selector: 'app-preventivi',
  templateUrl: './preventivi.component.html',
  styleUrls: ['./preventivi.component.css'],
})
export class PreventiviComponent {
  formData = {
    nome: '',
    cognome: '',
    indirizzo: '',
    email: '',
    telefono: '',
    descrizione: '',
  };

  constructor(private http: HttpClient, private globalService: GlobalService) {}

  onSubmit() {
    const url = `${this.globalService.url}email/send`; // Endpoint backend

    const body = this.formData;

    this.http.post(url, body).subscribe({
      next: (response) => {
        alert('Email inviata con successo!');
      },
      error: (error) => {
        console.error('Errore durante l\'invio dell\'email:', error);
        alert('Si è verificato un errore durante l\'invio dell\'email.');
      },
    });
  }
}
