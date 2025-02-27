import { Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { GlobalService } from "../../service/global.service";

@Component({
  selector: "app-gestione-employees",
  templateUrl: "./gestione-employees.component.html",
  styleUrls: ["./gestione-employees.component.css"]
})
export class GestioneEmployeesComponent implements OnInit {
  employees: any[] = [];

  constructor(
    private http: HttpClient,
    public globalService: GlobalService
  ) {}

  ngOnInit(): void {
    this.getEmployees();
  }

  // Carica la lista dei dipendenti
  getEmployees(): void {
    this.http.get(this.globalService.url + "employees/getAll", {
      headers: this.globalService.headers,
      responseType: "text"
    }).subscribe({
      next: (response) => {
        try {
          let data = JSON.parse(response);
          this.employees = data;
          console.log("Dipendenti caricati:", data);
        } catch (error) {
          console.error("Errore nel parse JSON dei dipendenti:", error);
        }
      },
      error: (error) => {
        console.error("Errore nel recupero dei dipendenti:", error);
      }
    });
  }

  // Invia una busta paga al backend
  onFileSelected(event: any, employee: any): void {
    const file = event.target.files[0];
    if (!file) {
      return;
    }
  
    const formData = new FormData();
    formData.append("payslip", file);
    formData.append("email", employee);
  
    // Non forzare header Content-Type
    this.http.post(this.globalService.url + "payslips/upload", formData)
      .subscribe({
        next: (resp) => {
          console.log("Busta paga inviata con successo:", resp);
          alert("Busta paga inviata con successo!");
        },
        error: (err) => {
          console.error("Errore nell'invio della busta paga:", err);
        }
      });
  }
  

  // Ottiene la lista di buste paga di un dipendente
  viewPayslips(employeeId: number): void {
    this.http.post(this.globalService.url + "pdfs/list", { employeeId }, {
      headers: this.globalService.headers,
      responseType: "text"
    }).subscribe({
      next: (response) => {
        console.log("Buste paga caricate:", response);
        // Se vuoi, fai JSON.parse(response) se il server restituisce un JSON
      },
      error: (error) => {
        console.error("Errore nel recupero delle buste paga:", error);
      }
    });
  }

  // (Facoltativo) Download di una singola busta paga
  downloadPayslip(employeeId: number, filename: string): void {
    this.http.get(
      this.globalService.url + "pdfs/download?employeeId=" + employeeId + "&filename=" + filename,
      { headers: this.globalService.headers, responseType: "blob" }
    ).subscribe({
      next: (blob) => {
        // Crea un URL Blob e avvia il download
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        link.click();
        window.URL.revokeObjectURL(url);
        console.log("Download completato");
      },
      error: (error) => {
        console.error("Errore nel download della busta paga:", error);
      }
    });
  }
}
