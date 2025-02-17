import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-payslips',
  templateUrl:'./payslips.component.html',
  styleUrls: ['./payslips.component.css']
})
export class PayslipsComponent implements OnInit {
  payslips: any[] = [];
  empId: string = '';
  constructor(
    private route: ActivatedRoute,  // Per ottenere l'ID dal parametro della rotta
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const empId = this.route.snapshot.paramMap.get('id');  // Ottieni l'ID dalla rotta
    if (empId) {
      this.loadPayslips(empId);  // Passa l'ID del dipendente alla funzione per caricare le buste paga
    }
  }

  loadPayslips(empId: string): void {
    // Effettua una richiesta GET per ottenere le buste paga
    this.http.get<any[]>(`/api/payslips/${empId}`).subscribe(
      (payslips: any[]) => {
        this.payslips = payslips;  // Salva le buste paga nella variabile
      },
      (error) => {
        console.error('Errore durante il recupero delle buste paga:', error);
      }
    );
  }
}

