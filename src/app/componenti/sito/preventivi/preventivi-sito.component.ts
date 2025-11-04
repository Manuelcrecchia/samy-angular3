import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GlobalService } from '../../../service/global.service';

@Component({
  selector: 'app-preventivi-sito',
  templateUrl: './preventivi-sito.component.html',
  styleUrls: ['./preventivi-sito.component.css'],
})
export class PreventiviSitoComponent {
  constructor(private http: HttpClient, private globalService: GlobalService) {}

  // eventuali metodi di navigazione, se già usati in altre pagine
  navigateToHomeSito() { window.location.href = '/'; }
  navigateToSanificazioni() { window.location.href = '/sanificazioni'; }
  navigateToUffici() { window.location.href = '/uffici'; }
  navigateToCondomini1() { window.location.href = '/condomini1'; }
  navigateToPalestra() { window.location.href = '/palestra'; }
  navigateToStraordinaria() { window.location.href = '/straordinaria'; }
  navigateToDomestica() { window.location.href = '/domestica'; }
}
