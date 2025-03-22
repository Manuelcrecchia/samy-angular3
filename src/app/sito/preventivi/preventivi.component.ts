import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GlobalService } from '../../service/global.service';

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

  // Variabili per gestire il checkbox e il popup della Privacy Policy
  privacyAccepted = false;
  showPrivacyModal = false;

  constructor(private http: HttpClient, private globalService: GlobalService) {}

  // Evento mousedown sul checkbox: se la privacy non è ancora accettata, si apre il popup
  onPrivacyMouseDown(event: MouseEvent): void {
    if (!this.privacyAccepted) {
      event.preventDefault(); // Impedisce il toggle automatico del checkbox
      this.showPrivacyModal = true;
    }
  }

  // Metodo invocato quando l'utente clicca su "Accetto" nel popup
  acceptPrivacy(): void {
    this.privacyAccepted = true;
    this.showPrivacyModal = false;
  }

  onSubmit() {
    if (!this.privacyAccepted) {
      alert('Devi accettare la Privacy Policy per procedere.');
      return;
    }

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
