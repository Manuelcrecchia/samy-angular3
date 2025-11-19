import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GlobalService } from '../../service/global.service';
import { Router } from '@angular/router';
import { saveAs } from 'file-saver';

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
  employeesAdd: Employee = { nome: '', cognome: '', email: '', cellulare: '' };
  employeess: Employee[] = [];

  constructor(
    private http: HttpClient,
    public globalService: GlobalService,
    private router: Router
  ) {}

  ngOnInit() {
    this.fetchEmployees();
  }

  fetchEmployees() {
    this.http
      .get(this.globalService.url + 'employees/getAll', {
        headers: this.globalService.headers,
        responseType: 'text',
      })
      .subscribe({
        next: (response) => {
          // Converti la risposta da testo a JSON come fai in AddQuoteComponent
          let data = JSON.parse(response);
          this.employeess = data;
        },
        error: (error) => {
          console.error('Errore durante il recupero dei dipendenti:', error);
        },
      });
  }

  addEmployees() {
    let body = {
      nome: this.employeesAdd.nome,
      cognome: this.employeesAdd.cognome,
      email: this.employeesAdd.email,
      cellulare: this.employeesAdd.cellulare,
    };

    this.http
      .post(this.globalService.url + 'employees/add', body, {
        headers: this.globalService.headers,
        responseType: 'text',
      })
      .subscribe({
        next: (res) => {
          // Svuota il form
          this.employeesAdd = {
            nome: '',
            cognome: '',
            email: '',
            cellulare: '',
          };
          // Aggiorna la lista
          this.ngOnInit();
        },
        error: (error) => {
          console.error("Errore durante l'aggiunta del dipendente:", error);
        },
      });
  }

  exportAndDeleteEmployee(emp: any): void {
    if (
      !confirm(
        `Vuoi esportare e cancellare il dipendente "${emp.nome} ${emp.cognome}"?`
      )
    )
      return;

    const body = {
      employeeId: emp.id,
    };

    this.http
      .post(this.globalService.url + 'employees/exportAndDeleteUser', body, {
        headers: this.globalService.headers,
        responseType: 'blob',
      })
      .subscribe({
        next: (blob) => {
          const nomeFile = `dipendente_${emp.nome}_${emp.cognome}.zip`;
          saveAs(blob, nomeFile);

          alert('Dipendente esportato e cancellato con successo.');
          this.ngOnInit(); // aggiorna la lista
        },
        error: (err) => {
          console.error('Errore:', err);
          alert('Errore durante esportazione/eliminazione dipendente.');
        },
      });
  }

  back() {
    this.router.navigateByUrl('/homeAdmin');
  }
}
