import { Component } from '@angular/core';
import { GlobalService } from '../../../service/global.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { PopupServiceService } from '../../popup/popup-service.service';


@Component({
  selector: 'app-private-area',
  templateUrl: './private-area.component.html',
  styleUrl: './private-area.component.css'
})
export class PrivateAreaComponent {

  nc = false;
  pe = false;

constructor(private globalService: GlobalService, private http: HttpClient, private router: Router, private popup: PopupServiceService) { }

  loginFunction(email: string, password: string) {
    let res;
    let resp;
    const body = {email: email, password: password};
    this.http.post(this.globalService.url + "login/admin", body, {headers: this.globalService.headers, responseType: 'text'}).subscribe(response => {
      res = JSON.parse(response);
      resp = res["response"];
      if(resp == "NON TROVATO") {
        this.nc = true;
        this.pe = false;
      } else {
        if(resp == "NO"){
          this.pe = true;
          this.nc = false;
          this.popup.text = "PASSWORD ERRATA. SE HAI DIMENTICATO LA PASSWORD, BESTEMMIA."
          this.popup.openPopup();
        }
        else{
          this.globalService.userCode = res["codiceOperatore"];
          this.globalService.token = res["token"];
          this.globalService.admin = res["admin"];
          this.globalService.headers = new HttpHeaders({'Content-Type':'application/json; charset=utf-8','Authorization': `${this.globalService.token}`});
          this.router.navigateByUrl('/homeAdmin');
        }
      }
    });
    }

    back(){
      this.router.navigateByUrl('/');
    }


    navigateToPassworddimenticata() {
      this.router.navigateByUrl('passworddimenticata');
    }

}



