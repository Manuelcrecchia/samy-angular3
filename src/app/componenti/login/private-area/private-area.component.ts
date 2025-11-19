import { Component } from '@angular/core';
import { GlobalService } from '../../../service/global.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { PopupServiceService } from '../../popup/popup-service.service';
import { AuthServiceService } from '../../../auth-service.service';
import { BiometricService } from '../../../service/biometric.service';

@Component({
  selector: 'app-private-area',
  templateUrl: './private-area.component.html',
  styleUrl: './private-area.component.css',
})
export class PrivateAreaComponent {
  version = this.globalService.version;

  constructor(
    private globalService: GlobalService,
    private http: HttpClient,
    private router: Router,
    private popup: PopupServiceService,
    private authService: AuthServiceService,
    private bio: BiometricService
  ) {}

  async ngOnInit() {
    // --- Controllo versione ---
    const ok = await this.globalService.checkVersion();
    if (!ok) return this.globalService.logout();

    // --- Controllo biometria ---
    const available = await this.bio.isAvailable();
    if (!available) return;

    console.log('📲 Biometria disponibile, recupero credenziali...');

    const credentials = await this.bio.getCredentials();
    if (!credentials) {
      console.log('⚠️ Nessuna credenziale salvata');
      return;
    }

    console.log('🔐 Login biometrico con:', credentials.email);

    // 👇 Richiama la FUNZIONE che il tuo HTML si aspetta
    this.loginFunction(credentials.email, credentials.password, true);
  }

  /**
   * LOGIN STANDARD + BIOMETRICO
   */
  async loginFunction(email: string, password: string, automatic = false) {
    if (!email || !password) {
      this.popup.text = 'Inserisci email e password';
      this.popup.openPopup();
      return;
    }

    this.http
      .post(
        this.globalService.url + 'login/admin',
        { email, password },
        { headers: this.globalService.headers, responseType: 'text' }
      )
      .subscribe(async (response) => {
        const res = JSON.parse(response);
        const resp = res['response'];

        if (resp === 'NON TROVATO') {
          this.popup.text = 'UTENTE NON TROVATO.';
          this.popup.openPopup();
          return;
        }

        if (resp === 'NO') {
          this.popup.text = 'PASSWORD ERRATA.';
          this.popup.openPopup();
          return;
        }

        // --- LOGIN OK ---
        this.authService.email = email;
        this.authService.userCode = res['codiceOperatore'];
        this.authService.token = res['token'];
        this.authService.admin = res['admin'];

        console.log(automatic ? '🤖 Login automatico' : '📩 Login manuale');

        // 🔒 SALVA NEL KEYCHAIN SOLO SE È LOGIN MANUALE
        if (!automatic) {
          console.log('🔒 Salvo credenziali nel Keychain...');
          await this.bio.storeCredentials(email, password);
        }

        this.router.navigateByUrl('/homeAdmin');
      });
  }

  /**
   * PASSWORD DIMENTICATA
   */
  navigateToPassworddimenticata(email: string) {
    if (!email) {
      this.popup.text = 'Inserisci la tua email';
      this.popup.openPopup();
      return;
    }

    const body = { email };
    this.authService.email = email;

    this.http
      .post(this.globalService.url + 'admin/sendCode', body, {
        headers: this.globalService.headers,
        responseType: 'text',
      })
      .subscribe(() => {
        this.router.navigateByUrl('passworddimenticata');
      });
  }

  /**
   * Mostra/Nasconde password
   */
  togglePasswordVisibility(input: HTMLInputElement) {
    input.type = input.type === 'password' ? 'text' : 'password';
  }

  /**
   * Torna indietro
   */
  back() {
    this.router.navigateByUrl('/');
  }
}
