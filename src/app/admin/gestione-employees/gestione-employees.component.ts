import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EmployeeService } from '../../services/employee.service';

@Component({
  selector: 'app-gestione-employees',
  templateUrl: './gestione-employees.component.html',
  styleUrls: ['./gestione-employees.component.css'],
})
export class GestioneEmployeesComponent implements OnInit {
  employees: any[] = [];

  constructor(private employeeService: EmployeeService, private http: HttpClient) {} // Add 'http' as a dependency

  ngOnInit(): void {
    this.employeeService.employees$.subscribe((data) => {
      console.log('Dipendenti ricevuti:', data); // Debug
      this.employees = data;
    });

    this.employeeService.loadEmployees();
  }
  // Funzione per modificare un dipendente
  editEmployee(employee: any) {
    console.log('Modifica dipendente:', employee);
    // Implementa la logica per la modifica
  }

  // Funzione per eliminare un dipendente
  deleteEmployee(employee: any) {
    this.employeeService.deleteEmployee(employee.email); // Rimuovi il dipendente
  }

  // Funzione per inviare la busta paga
  sendPayslip(employee: any) {
    const apiUrl = `https://tuo-server/api/employees/${employee.id}/sendPayslip`;
    this.http.post(apiUrl, {}).subscribe(
      () => {
        console.log('Busta paga inviata a:', employee.nome);
      },
      (error) => {
        console.error('Errore durante l\'invio della busta paga:', error);
      }
    );
  }
}

