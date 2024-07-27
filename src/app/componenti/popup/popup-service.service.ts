import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PopupComponentComponent } from './popup-component/popup-component.component';

@Injectable({
  providedIn: 'root'
})
export class PopupServiceService {

  text = '';

  constructor(private dialog: MatDialog) { }

  openPopup() {
    this.dialog.open(PopupComponentComponent);
  }

  closePopup() {
    this.dialog.closeAll();
  }
}
