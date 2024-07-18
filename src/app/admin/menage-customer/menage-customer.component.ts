import { HttpClient } from '@angular/common/http';
import { GlobalService } from '../../service/global.service';
import { Router } from '@angular/router';
import { Component } from '@angular/core';
import {CustomerModelService} from '../../service/customer-model.service'


@Component({
  selector: 'app-menage-customer',
  templateUrl: './menage-customer.component.html',
  styleUrl: './menage-customer.component.css'
})
export class MenageCustomerComponent {
  
  constructor(public customerModelService: CustomerModelService, private http: HttpClient, private globalService: GlobalService, private router: Router) {}


















  conferm(numeroPreventivo: string){
    const body = { numeroPreventivo: numeroPreventivo };
  
    this.http
    .post(
      this.globalService.url + 'quotes/conferm',
      body, {
        headers: this.globalService.headers,
        responseType: 'text',
      })
      .subscribe((response)=>{
        if(response == 'Unauthorized') {
          this.router.navigateByUrl('/')
        }
      })
  
      }
  }



