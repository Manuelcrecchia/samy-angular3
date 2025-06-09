// src/app/componenti/scheda-cliente/scheda-cliente.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { GlobalService } from '../../service/global.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-scheda-cliente',
  templateUrl: './scheda-cliente.component.html',
  styleUrls: ['./scheda-cliente.component.css']
})
export class SchedaClienteComponent implements OnInit {
  cliente: any = {};

  constructor(public globalService: GlobalService, private http: HttpClient, private router: Router, private route: ActivatedRoute){}
  ngOnInit(): void {
    const numeroCliente = this.route.snapshot.paramMap.get('numeroCliente');
    if (numeroCliente) {
      this.http.post(this.globalService.url + 'customers/getCustomer', {
        numeroCliente: numeroCliente
      }, {
        headers: this.globalService.headers
      }).subscribe((res: any) => {
        this.cliente = res[0];
      });
    }
  }
  parseJson(val: string): string[] {
    try {
      return JSON.parse(val || '[]');
    } catch {
      return [];
    }
  }


  back(){
    this.router.navigateByUrl('/listCustomer')
  }
}
