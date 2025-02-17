// frontend/src/app/components/gestione-employees/gestione-employees.component.ts
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EmployeeService } from '../../services/employee.service';
import { PayslipService } from '../../services/payslip.service';
import { Router } from '@angular/router'; // Import the Router module

@Component({
  selector: 'app-gestione-employees',
  templateUrl: './gestione-employees.component.html',
  styleUrls: ['./gestione-employees.component.css'],
})
export class GestioneEmployeesComponent implements OnInit {
  employees: any[] = [];
  payslips: any[] = [];

  constructor(
    private employeeService: EmployeeService,
    private http: HttpClient,
    private payslipService: PayslipService,
    private router: Router // Add the Router as a private property
  ) {}

  ngOnInit(): void {
    this.employeeService.employees$.subscribe((data) => {
      this.employees = data;
    });

    this.employeeService.loadEmployees();
    this.loadPayslips();
  }

  // Metodo per caricare le buste paga
  loadPayslips() {
    this.payslipService.getPayslips().subscribe(
      (data) => {
        this.payslips = data;
      },
      (error) => {
        console.error('Errore durante il caricamento delle buste paga:', error);
      }
    );
  }

  // Metodo per gestire la selezione del file
  onFileSelected(event: any, employee: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.sendPayslip(file, employee);
    }
  }

  // Metodo che viene chiamato quando clicchi sul bottone
  viewPayslips(employeeId: number): void {
    // Naviga alla rotta con il parametro id
    this.router.navigate([`/employee/${employeeId}/payslips`]);
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
        this.loadPayslips(); // Ricarica le buste paga dopo l'invio
      },
      (error) => {
        console.error('Errore durante l\'invio della busta paga:', error);
        alert('Errore durante l\'invio della busta paga');
      }
    );
  }
}
