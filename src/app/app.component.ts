import { Component } from '@angular/core';
import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'samyangularapp';
  constructor() {}
  ngOnInit() {
    if (Capacitor.getPlatform() === 'web') {
      return;
    }

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
