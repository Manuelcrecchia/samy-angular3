import { Component } from '@angular/core';
import { PopupServiceService } from '../popup-service.service';

@Component({
  selector: 'app-popup-component',
  templateUrl: './popup-component.component.html',
  styleUrl: './popup-component.component.css'
})
export class PopupComponentComponent {
  constructor(private popup: PopupServiceService){}
  text = this.popup.text;
  closeDialog(){
    this.popup.closePopup();
  }
}
