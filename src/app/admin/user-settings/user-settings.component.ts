import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GlobalService } from '../../service/global.service';

@Component({
  selector: 'app-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrl: './user-settings.component.css'
})
export class UserSettingsComponent {

  adminOptions = ['U', 'C'];
  adminAdd: {nome: string, cognome: string, email:string, codiceOperatore:string, admin: string} = {nome: '', cognome: '', email: '', codiceOperatore: '', admin: 'U'};
  admins : {nome: string, cognome: string, email:string, codiceOperatore:string, admin: string}[] = []
  constructor(
    private http: HttpClient,
    public globalService: GlobalService,
  ) {}
  ngOnInit() {
    this.http
      .get(this.globalService.url + 'admin/getAll', {
        headers: this.globalService.headers,
        responseType: 'text',
      })
      .subscribe((response) => {

        let data = JSON.parse(response);
        console.log(data);
        if (data.length > 0) {
          for (let i = 0; i < data.length; i++) {
            this.admins[i] = data[i];
          }
        }
      });
  }
  
  ngOnChanges(){
    this.admins = []
    this.http
      .get(this.globalService.url + 'admin/getAll', {
        headers: this.globalService.headers,
        responseType: 'text',
      })
      .subscribe((response) => {
        let data = JSON.parse(response);
        if (data.length > 0) {
          for (let i = 0; i < data.length; i++) {
            this.admins[i] = data[i];
          }
        }
      });
  }
  
   addAdmin() {
    let body = {
      nome: this.adminAdd.nome,
      cognome: this.adminAdd.cognome,
      email: this.adminAdd.email,
      codiceOperatore: this.adminAdd.codiceOperatore,
      admin: "S"
    };
  
    this.http
      .post(this.globalService.url + 'admin/add', body, {
        headers: this.globalService.headers,
        responseType: 'text',
      }).subscribe((res)=> {
  4    })
      this.ngOnChanges()
     ;
  }
  
   deleteAdmin(i: number)  {
    let body = { email: this.admins[i].email };
    this.http
      .post(this.globalService.url + 'admin/delete', body, {
        headers: this.globalService.headers,
        responseType: 'text',
      }).subscribe((res)=> {
      })
      this.ngOnChanges();
      
  }
  
  } 
