import { Component } from '@angular/core';
import { GlobalService } from '../../../service/global.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { PopupServiceService } from '../../popup/popup-service.service';

@Component({
  selector: 'app-cambiapassword',
  templateUrl: './cambiapassword.component.html',
  styleUrl: './cambiapassword.component.css'
})
export class CambiapasswordComponent {
  constructor(private globalService: GlobalService, private http: HttpClient, private router: Router, private popup: PopupServiceService) { }




  back(){
    this.router.navigateByUrl('/');
  }
}
