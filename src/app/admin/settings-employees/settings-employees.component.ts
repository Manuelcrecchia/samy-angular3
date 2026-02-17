import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GlobalService } from '../../service/global.service';
import { Router } from '@angular/router';
import { saveAs } from 'file-saver';

interface Employee {
  id: number; // ✅ serve per /edit
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
  employeesAdd: Omit<Employee, 'id'> = {
    nome: '',
    cognome: '',
    email: '',
    cellulare: '',
  };
  employeess: Employee[] = [];

  editingIndex: number | null = null;
  employeeEdit: any = {};
  private employeeEditOriginal: any = {};

  constructor(
    private http: HttpClient,
    public globalService: GlobalService,
    private router: Router,
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
          const data = JSON.parse(response);
          this.employeess = data;
        },
        error: (error) => {
          console.error('Errore durante il recupero dei dipendenti:', error);
        },
      });
  }

  startEdit(i: number) {
    this.editingIndex = i;
    this.employeeEditOriginal = { ...this.employeess[i] };
    this.employeeEdit = { ...this.employeess[i] };
  }

  cancelEdit() {
    this.editingIndex = null;
    this.employeeEdit = {};
    this.employeeEditOriginal = {};
  }

  saveEdit() {
    if (this.editingIndex === null) return;

    const body = {
      id: this.employeeEdit.id,
      nome: this.employeeEdit.nome,
      cognome: this.employeeEdit.cognome,
      email: this.employeeEdit.email,
      cellulare: this.employeeEdit.cellulare,
      // password opzionale se vuoi: password: this.employeeEdit.password
    };

    this.http
      .post(this.globalService.url + 'employees/edit', body, {
        headers: this.globalService.headers,
        responseType: 'text',
      })
      .subscribe({
        next: () => {
          this.cancelEdit();
          this.fetchEmployees();
        },
        error: (err) => {
          console.error('Errore modifica dipendente:', err);
          alert('Errore durante la modifica dipendente');
        },
      });
  }

  addEmployees() {
    const body = {
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
        next: () => {
          this.employeesAdd = {
            nome: '',
            cognome: '',
            email: '',
            cellulare: '',
          };
          this.fetchEmployees();
        },
        error: (error) => {
          console.error("Errore durante l'aggiunta del dipendente:", error);
        },
      });
  }

  exportAndArchiveEmployee(emp: any): void {
    if (
      !confirm(
        `Vuoi esportare e ARCHIVIARE il dipendente "${emp.nome} ${emp.cognome}"?\n\n` +
          `Lo storico (turni, presenze, timbrature) rimarrà nel sistema.`,
      )
    )
      return;

    const body = {
      employeeId: emp.id,
    };

    this.http
      // Compatibilità: l'endpoint non elimina più, esporta + disattiva.
      .post(this.globalService.url + 'employees/exportAndDeleteUser', body, {
        headers: this.globalService.headers,
        responseType: 'blob',
      })
      .subscribe({
        next: (blob) => {
          const nomeFile = `dipendente_${emp.nome}_${emp.cognome}.zip`;
          saveAs(blob, nomeFile);

          alert('Dipendente esportato e archiviato con successo.');
          this.ngOnInit(); // aggiorna la lista
        },
        error: (err) => {
          console.error('Errore:', err);
          alert('Errore durante esportazione/archiviazione dipendente.');
        },
      });
  }

  back() {
    this.router.navigateByUrl('/homeAdmin');
  }
}
