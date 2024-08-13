import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GlobalService } from '../../service/global.service';
import { Router } from '@angular/router'; // Import the Router module

@Component({
  selector: 'app-employees-settings',
  templateUrl: './employees-settings.component.html',
  styleUrl: './employees-settings.component.css'
})
export class EmployeesSettingsComponent {
  employeesAdd: {nome: string, cognome: string, email:string, cellulare:string} = {nome: '', cognome: '', email: '', cellulare: ''};
  employeess : {nome: string, cognome: string, email:string, cellulare:string}[] = []
  constructor(
    private http: HttpClient,
    public globalService: GlobalService,
    private router: Router // Add the Router module as a dependency
  ) {}
  ngOnInit() {
    this.http
      .get(this.globalService.url + 'employees/getAll', {
        headers: this.globalService.headers,
        responseType: 'text',
      })
      .subscribe((response) => {

        let data = JSON.parse(response);
        if (data.length > 0) {
          for (let i = 0; i < data.length; i++) {
            this.employeess[i] = data[i];
          }
        }
      });
  }

  ngOnChanges(){
    this.employeess = []
    this.http
      .get(this.globalService.url + 'employees/getAll', {
        headers: this.globalService.headers,
        responseType: 'text',
      })
      .subscribe((response) => {
        let data = JSON.parse(response);
        if (data.length > 0) {
          for (let i = 0; i < data.length; i++) {
            this.employeess[i] = data[i];
          }
        }
      });
  }

   addEmployees() {
    let body = {
      nome: this.employeesAdd.nome,
      cognome: this.employeesAdd.cognome,
      email: this.employeesAdd.email,
      codiceOperatore: this.employeesAdd.cellulare,
    };

    this.http
      .post(this.globalService.url + 'employees/add', body, {
        headers: this.globalService.headers,
        responseType: 'text',
      }).subscribe((res)=> {
  4    })
      this.ngOnChanges()
     ;
  }

   deleteEmployees(i: number)  {
    let body = { email: this.employeess[i].email };
    this.http
      .post(this.globalService.url + 'employees/delete', body, {
        headers: this.globalService.headers,
        responseType: 'text',
      }).subscribe((res)=> {
      })
      this.ngOnChanges();

  }
  back(){
    this.router.navigateByUrl('back'); // Navigate to the back page
  }
}
