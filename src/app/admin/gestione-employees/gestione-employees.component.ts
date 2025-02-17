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

  constructor(
    private employeeService: EmployeeService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.employeeService.employees$.subscribe((data) => {
      this.employees = data;
    });

    this.employeeService.loadEmployees();
  }

  // Metodo per gestire la selezione del file
  onFileSelected(event: any, employee: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.sendPayslip(file, employee);
    }
  }

  // Metodo per inviare la busta paga
  sendPayslip(file: File, employee: any) {
    const formData = new FormData();
    formData.append('payslip', file);
    formData.append('email', employee.email);

    this.http.post('http://localhost:5000/send-payslip', formData).subscribe(
      (response: any) => {
        console.log('Busta paga inviata con successo:', response);
        alert('Busta paga inviata con successo!');
      },
      (error) => {
        console.error('Errore durante l\'invio della busta paga:', error);
        alert('Errore durante l\'invio della busta paga');
      }
    );
  }
}

