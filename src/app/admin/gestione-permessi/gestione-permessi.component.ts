import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GlobalService } from '../../service/global.service'; // Adjust the path as necessary
import { Router } from '@angular/router'; // già incluso se non lo hai
@Component({
  selector: 'app-gestione-permessi',
  templateUrl: './gestione-permessi.component.html',
  styleUrls: ['./gestione-permessi.component.css']
})
export class GestionePermessiComponent implements OnInit {
  leaveRequests: any[] = [];
  loading = false;

  constructor(private http: HttpClient, private globalService: GlobalService,   private router: Router ) {}

  ngOnInit(): void {
    this.caricaPermessi();
  }

  caricaPermessi(): void {
    this.loading = true;
    this.http.get<any[]>(this.globalService.url + 'permission').subscribe({
      next: (res) => {
        this.leaveRequests = res.filter(p => p.stato === 'in attesa');
        this.loading = false;
      },
      error: (err) => {
        console.error('Errore nel recupero dei permessi:', err);
        this.loading = false;
      }
    });
  }

  accetta(req: any): void {
    this.http.post(this.globalService.url + 'permission/accept', { id: req.id }).subscribe({
      next: () => {
        alert('Permesso accettato e aggiunto al calendario');
        this.caricaPermessi(); // Ricarica la lista
      },
      error: (err) => {
        alert('Errore durante l’accettazione');
        console.error(err);
      }
    });
  }


  rifiuta(id: number): void {
    this.http.post(this.globalService.url + 'permission/reject', { id }).subscribe({
      next: () => {
        alert('Permesso rifiutato');
        this.caricaPermessi();
      },
      error: (err) => {
        alert('Errore durante il rifiuto');
        console.error(err);
      }
    });
  }
  goBack(): void {
    this.router.navigate(['homeAdmin']); // o il percorso che vuoi
  }
}
