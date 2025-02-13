import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-gestione-employees',
  templateUrl: './gestione-employees.component.html',
  styleUrl: './gestione-employees.component.css'
})
export class GestioneEmployeesComponent implements OnInit {
  employees: any[] = []; // Array per salvare i dati dei dipendenti

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadEmployees();
  }

  // Funzione per caricare i dipendenti dal server
  loadEmployees() {
    const apiUrl = 'https://tuo-server/api/employees'; // Cambia con l'endpoint del tuo server
    this.http.get(apiUrl).subscribe(
      (response: any) => {
        this.employees = response; // Salva i dati nella variabile employees
      },
      (error) => {
        console.error('Errore durante il caricamento dei dipendenti:', error);
      }
    );
  }

  // Funzione per modificare un dipendente
  editEmployee(employee: any) {
    console.log('Modifica dipendente:', employee);
    // Implementa la logica per la modifica
  }
  addEmployee(employee: any) {
    console.log('Aggiungi dipendente:', employee);
    // Implementa la logica per la modifica
  }

  // Funzione per eliminare un dipendente
  deleteEmployee(employee: any) {
    const apiUrl = `https://tuo-server/api/employees/${employee.id}`; // Endpoint per eliminare
    this.http.delete(apiUrl).subscribe(
      () => {
        console.log('Dipendente eliminato:', employee);
        this.loadEmployees(); // Ricarica i dipendenti
      },
      (error) => {
        console.error('Errore durante l\'eliminazione del dipendente:', error);
      }
    );
  }

  // Funzione per inviare la busta paga
  sendPayslip(employee: any) {
    const apiUrl = `https://tuo-server/api/employees/${employee.id}/sendPayslip`; // Endpoint per inviare busta paga
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



