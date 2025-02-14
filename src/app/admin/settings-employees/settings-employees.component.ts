import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GlobalService } from '../../service/global.service';
import { Router } from '@angular/router';
import { EmployeeService } from '../../services/employee.service'; // Importa il servizio

interface Employee {
  nome: string;
  cognome: string;
  email: string;
  cellulare: string;
}

@Component({
  selector: 'app-settings-employees',
  templateUrl: './settings-employees.component.html',
  styleUrls: ['./settings-employees.component.css'],
})
export class SettingsEmployeesComponent implements OnInit {
  employeesAdd: Employee = { nome: '', cognome: '', email: '', cellulare: '' }; // Oggetto per il form
  employeess: Employee[] = []; // Array per memorizzare i dipendenti

  constructor(
    private http: HttpClient,
    public globalService: GlobalService,
    private router: Router,
    private employeeService: EmployeeService // Inietta il servizio
  ) {}

  ngOnInit() {
    this.fetchEmployees(); // Carica i dipendenti all'inizio
  }

  fetchEmployees() {
    this.http.get(this.globalService.url + 'employees/getAll', {
      headers: this.globalService.headers,
      responseType: 'text',
    }).subscribe({
      next: (response) => {
        let data = JSON.parse(response);
        this.employeess = data; // Assegna i dati alla proprietà employeess
      },
      error: (error) => {
        console.error('Errore durante il recupero dei dipendenti:', error);
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

    this.http.post(this.globalService.url + 'employees/add', body, {
      headers: this.globalService.headers,
      responseType: 'text',
    }).subscribe({
      next: (res) => {
        console.log('Dipendente aggiunto con successo:', res);
        this.employeeService.addEmployee(body); // Aggiungi il dipendente al servizio
        this.employeesAdd = { nome: '', cognome: '', email: '', cellulare: '' }; // Resetta il form
      },
      error: (error) => {
        console.error('Errore durante l\'aggiunta del dipendente:', error);
      }
    });
  }
  deleteEmployees(i: number) {
    let body = { email: this.employeess[i].email };
    this.http.post(this.globalService.url + 'employees/delete', body, {
      headers: this.globalService.headers,
      responseType: 'text',
    }).subscribe({
      next: (res) => {
        console.log('Dipendente eliminato con successo:', res);
        this.employeess.splice(i, 1); // Rimuovi il dipendente dall'array
      },
      error: (error) => {
        console.error('Errore durante l\'eliminazione del dipendente:', error);
      }
    });
  }

  back() {
    this.router.navigateByUrl('/homeAdmin'); // Naviga alla pagina home
  }
}
