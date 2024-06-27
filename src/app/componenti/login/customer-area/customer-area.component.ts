import { Component } from '@angular/core';
import { GlobalService } from '../../../service/global.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
@Component({
  selector: 'app-customer-area',
  templateUrl: './customer-area.component.html',
  styleUrl: './customer-area.component.css'
})
export class CustomerAreaComponent {

constructor(private globalService: GlobalService, private http: HttpClient, private router: Router) { }

nc = false;
pe = false;

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
      }
      else{
        if(resp == "NO"){
          this.pe = true;
          this.nc = false;
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
}
