import { Component } from '@angular/core';
import { GlobalService } from '../../../service/global.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { PopupServiceService } from '../../popup/popup-service.service';

@Component({
  selector: 'app-passworddimenticata',
  templateUrl: './passworddimenticata.component.html',
  styleUrl: './passworddimenticata.component.css'
})
export class PassworddimenticataComponent {
  constructor(private globalService: GlobalService, private http: HttpClient, private router: Router, private popup: PopupServiceService) { }







  back(){
    this.router.navigateByUrl('/');
  }

}
