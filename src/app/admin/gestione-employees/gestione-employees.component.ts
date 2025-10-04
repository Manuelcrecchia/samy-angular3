import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GlobalService } from '../../service/global.service';
import { Router } from '@angular/router';
import { CategoriaModalComponent } from './categoria-modal/categoria-modal.component';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-gestione-employees',
  templateUrl: './gestione-employees.component.html',
  styleUrls: ['./gestione-employees.component.css'],
})
export class GestioneEmployeesComponent implements OnInit {
  employees: any[] = [];

  constructor(
    private http: HttpClient,
    public globalService: GlobalService,
    private router: Router,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.getEmployees();
  }

  // Carica la lista dei dipendenti
  getEmployees(): void {
    this.http
      .get(this.globalService.url + 'employees/getAll', {
        headers: this.globalService.headers,
        responseType: 'text',
      })
      .subscribe({
        next: (response) => {
          try {
            let data = JSON.parse(response);
            this.employees = data;
          } catch (error) {
            console.error('Errore nel parse JSON dei dipendenti:', error);
          }
        },
        error: (error) => {
          console.error('Errore nel recupero dei dipendenti:', error);
        },
      });
  }

  // Ottiene la lista di buste paga di un dipendente
  goToDocument(id: string): void {
    this.router.navigate(['/documenti/employee', id]);
  }

  apriCategoria(emp: any) {
    const modalRef = this.modalService.open(CategoriaModalComponent, {
      size: 'md',
      backdrop: 'static',
    });
    modalRef.componentInstance.emp = emp;

    modalRef.result.then(
      (res) => {
        if (res) {
          console.log('Categoria aggiunta per', emp.nome);
          // puoi aggiornare la tabella o mostrare un toast
        }
      },
      () => {}
    );
  }

  back() {
    this.router.navigateByUrl('/homeAdmin');
  }
}
