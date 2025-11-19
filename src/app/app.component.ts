import { Component, HostListener } from '@angular/core';
import { AuthServiceService } from './auth-service.service';
import { GlobalService } from './service/global.service';
import { Router } from '@angular/router';
import { App as CapacitorApp } from '@capacitor/app';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'samyangularapp';
  constructor(private global: GlobalService, private router: Router) {
    if (this.global.forMobile) {
      this.router.navigate(['/loginPrivateArea']);
    }
  }
  ngOnInit() {
    CapacitorApp.addListener('backButton', ({ canGoBack }) => {
      // Se la pagina può tornare indietro → torna indietro
      if (canGoBack) {
        window.history.back();
        return;
      }

      // Se siamo nella root → NON chiudere l’app
      // (qui puoi persino mostrare il popup “vuoi uscire?”)
      console.log('🔙 Back disabilitato nella root');
    });
  }
}
