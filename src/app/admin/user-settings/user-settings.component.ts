import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GlobalService } from '../../service/global.service';
import { Router } from '@angular/router';

interface AdminRow {
  id: number;
  nome: string;
  cognome: string;
  email: string;
  codiceOperatore: string;
  admin: string;
}

@Component({
  selector: 'app-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrl: './user-settings.component.css',
})
export class UserSettingsComponent {
  adminOptions = ['U', 'C'];
  adminAdd: {
    nome: string;
    cognome: string;
    email: string;
    codiceOperatore: string;
    admin: string;
  } = { nome: '', cognome: '', email: '', codiceOperatore: '', admin: 'U' };
  admins: AdminRow[] = [];

  editingIndex: number | null = null;
  adminEdit: any = {}; // buffer edit
  private adminEditOriginal: any = {}; // per annulla

  constructor(
    private http: HttpClient,
    public globalService: GlobalService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.fetchAdmins();
  }

  fetchAdmins() {
    this.http
      .get(this.globalService.url + 'admin/getAll', {
        headers: this.globalService.headers,
        responseType: 'text',
      })
      .subscribe((response) => {
        const data = JSON.parse(response);
        this.admins = data;
      });
  }

  ngOnChanges() {
    this.fetchAdmins();
  }

  addAdmin() {
    const body = {
      nome: this.adminAdd.nome,
      cognome: this.adminAdd.cognome,
      email: this.adminAdd.email,
      codiceOperatore: this.adminAdd.codiceOperatore,
      admin: this.adminAdd.admin,
    };

    this.http
      .post(this.globalService.url + 'admin/add', body, {
        headers: this.globalService.headers,
        responseType: 'text',
      })
      .subscribe(() => {
        // reset form
        this.adminAdd = {
          nome: '',
          cognome: '',
          email: '',
          codiceOperatore: '',
          admin: 'B',
        };
        this.fetchAdmins();
      });
  }

  deleteAdmin(i: number) {
    const body = { email: this.admins[i].email };
    this.http
      .post(this.globalService.url + 'admin/delete', body, {
        headers: this.globalService.headers,
        responseType: 'text',
      })
      .subscribe(() => {
        // se stavi editando quello stesso record, esci
        if (this.editingIndex === i) this.cancelEditAdmin();
        this.fetchAdmins();
      });
  }

  startEditAdmin(i: number) {
    this.editingIndex = i;
    this.adminEditOriginal = { ...this.admins[i] };
    this.adminEdit = { ...this.admins[i], password: '' }; // password vuota di default
  }

  cancelEditAdmin() {
    this.editingIndex = null;
    this.adminEdit = {};
    this.adminEditOriginal = {};
  }

  saveEditAdmin() {
    if (this.editingIndex === null) return;

    const body: any = {
      id: this.adminEdit.id,
      nome: this.adminEdit.nome,
      cognome: this.adminEdit.cognome,
      email: this.adminEdit.email,
      codiceOperatore: this.adminEdit.codiceOperatore,
      admin: this.adminEdit.admin,
    };

    // manda la password solo se compilata
    if (this.adminEdit.password && this.adminEdit.password.trim().length > 0) {
      body.password = this.adminEdit.password;
    }

    this.http
      .post(this.globalService.url + 'admin/edit', body, {
        headers: this.globalService.headers,
        responseType: 'text',
      })
      .subscribe({
        next: () => {
          this.cancelEditAdmin();
          this.fetchAdmins();
        },
        error: (err) => {
          console.error('Errore modifica admin:', err);
          alert('Errore durante la modifica admin');
        },
      });
  }

  back() {
    this.router.navigateByUrl('/homeAdmin');
  }
}
