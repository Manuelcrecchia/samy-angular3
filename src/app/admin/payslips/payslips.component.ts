import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { GlobalService } from "../../service/global.service";

@Component({
  selector: "app-payslips",
  templateUrl: "./payslips.component.html",
  styleUrls: ["./payslips.component.css"]
})
export class PayslipsComponent implements OnInit {
  payslips: any[] = [];
  pdfBase64: string = "";
  empEmail: string = ""; // Recuperata dai parametri di rotta

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    public globalService: GlobalService
  ) {}

  ngOnInit(): void {
    // 1) Leggiamo il param 'empEmail' dalla rotta: /payslips/:empEmail
    this.empEmail = this.route.snapshot.paramMap.get("empEmail") || "";
    console.log("DEBUG - EmpEmail dai parametri di rotta:", this.empEmail);

    // 2) Carichiamo l'elenco buste se la mail non è vuota
    if (this.empEmail) {
      this.loadPayslips();
    } else {
      console.error("Nessuna mail passata nella rotta /payslips/:empEmail");
    }
  }

  // Carica la lista di buste paga dal server
  loadPayslips(): void {
    const body = { empEmail: this.empEmail };
    this.http.post(
      this.globalService.url + "payslips/list",
      body,
      {
        headers: this.globalService.headers,
        responseType: "text"
      }
    ).subscribe({
      next: (response) => {
        try {
          const data = JSON.parse(response);
          this.payslips = data;
          console.log("Buste paga caricate:", data);
        } catch (error) {
          console.error("Errore parse buste paga:", error);
        }
      },
      error: (err) => {
        console.error("Errore nel recupero delle buste paga:", err);
      }
    });
  }

  // Seleziona un file => carica il PDF in base64
  selectPayslip(filename: string): void {
    const body = { empEmail: this.empEmail, filename };
    this.http.post(
      this.globalService.url + "payslips/getPdf",
      body,
      {
        headers: this.globalService.headers,
        responseType: "text"
      }
    ).subscribe({
      next: (base64) => {
        this.pdfBase64 = base64;
        console.log("PDF in base64:", base64);
      },
      error: (err) => {
        console.error("Errore nel caricamento del PDF:", err);
      }
    });
  }

  // Download classico (opzionale)
  downloadPayslip(filename: string): void {
    const url = this.globalService.url + `payslips/download?empEmail=${this.empEmail}&filename=${filename}`;
    window.open(url, "_blank");
  }

  deletePayslip(filename: string): void {
    // Chiedi conferma all'utente (facoltativo)
    const conferma = confirm("Sei sicuro di voler eliminare questa busta paga?");
    if (!conferma) {
      return;
    }
  
    // Chiamiamo la rotta "POST /payslips/delete"
    const body = { empEmail: this.empEmail, filename };
    this.http.post(
      this.globalService.url + "payslips/delete",
      body,
      {
        headers: this.globalService.headers,
        responseType: "text"
      }
    ).subscribe({
      next: (resp) => {
        console.log("Busta paga eliminata con successo:", resp);
        // Rimuoviamo localmente la busta paga dalla lista
        this.payslips = this.payslips.filter((p) => p.filename !== filename);
        // Se vuoi ricaricare la lista da zero:
        // this.loadPayslips();
      },
      error: (err) => {
        console.error("Errore nell'eliminazione della busta paga:", err);
      }
    });
  }
  

  // Torna alla home
  back(): void {
    this.router.navigateByUrl("/homeAdmin");
  }
}
