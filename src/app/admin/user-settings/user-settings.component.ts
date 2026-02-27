import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GlobalService } from '../../service/global.service';
import { Router } from '@angular/router';

interface PermissionOption {
  key: string;
  label: string;
}

interface AdminRow {
  id: number;
  nome: string;
  cognome: string;
  email: string;
  codiceOperatore: string;
  permissions: string[];
}

@Component({
  selector: 'app-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.css'],
})
export class UserSettingsComponent implements OnInit {
  // Lista permessi disponibili (presa dal backend)
  permissionOptions: PermissionOption[] = [];

  adminAdd: {
    nome: string;
    cognome: string;
    email: string;
    codiceOperatore: string;
    permissions: string[];
  } = {
    nome: '',
    cognome: '',
    email: '',
    codiceOperatore: '',
    permissions: [],
  };

  admins: AdminRow[] = [];

  editingIndex: number | null = null;
  adminEdit: any = {}; // buffer edit
  private adminEditOriginal: any = {};

  permissionGroups: Array<{
    title: string;
    items: PermissionOption[];
  }> = [];

  private permissionDeps: Record<string, string[]> = {
    // child -> parents (se selezioni child, seleziona anche parents)
    QUOTES_MANAGE: ['QUOTES_VIEW'],
    CUSTOMERS_MANAGE: ['CUSTOMERS_VIEW'],
    SHIFTS_MANAGE: ['SHIFTS_VIEW'],
    ATTENDANCE_MANAGE: ['ATTENDANCE_VIEW'],
    STAMPING_MANAGE: ['STAMPING_VIEW'],
    CALENDAR_EVENT_MANAGE: ['CALENDAR_VIEW'],

    // admin: se vuoi, puoi legare CREATE/EDIT/DELETE a VIEW
    ADMIN_CREATE: ['ADMIN_VIEW'],
    ADMIN_EDIT: ['ADMIN_VIEW'],
    ADMIN_DELETE: ['ADMIN_VIEW'],

    EMPLOYEE_CREATE: ['EMPLOYEE_VIEW'],
    EMPLOYEE_EDIT: ['EMPLOYEE_VIEW'],
    EMPLOYEE_DELETE: ['EMPLOYEE_VIEW'],
    EMPLOYEE_DOCS_MANAGE: ['EMPLOYEE_VIEW'],
    EMPLOYEE_PERMITS_MANAGE: ['EMPLOYEE_VIEW'],
  };

  constructor(
    private http: HttpClient,
    public globalService: GlobalService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.fetchPermissionOptions();
    this.fetchAdmins();
  }

  fetchPermissionOptions() {
    this.http
      .get(this.globalService.url + 'admin/permissions/list', {
        headers: this.globalService.headers,
        responseType: 'text',
      })
      .subscribe({
        next: (response) => {
          let parsed: any;
          try {
            parsed = JSON.parse(response);
          } catch {
            parsed = response;
          }

          // ✅ deve diventare SEMPRE un array [{key,label}, ...]
          const arr = Array.isArray(parsed)
            ? parsed
            : Array.isArray(parsed?.data)
              ? parsed.data
              : Array.isArray(parsed?.permissions)
                ? parsed.permissions
                : parsed && typeof parsed === 'object'
                  ? Object.values(parsed)
                  : [];

          this.permissionOptions = arr;
          this.permissionGroups = this.buildPermissionGroups(
            this.permissionOptions,
          );
        },
        error: (err) => {
          console.error('Errore permissions/list:', err);
          this.permissionOptions = [];
        },
      });
  }

  togglePermission(target: { permissions: string[] }, key: string) {
    if (!target.permissions) target.permissions = [];
    const idx = target.permissions.indexOf(key);
    if (idx >= 0) target.permissions.splice(idx, 1);
    else target.permissions.push(key);
  }

  fetchAdmins() {
    this.http
      .get(this.globalService.url + 'admin/getAll', {
        headers: this.globalService.headers,
        responseType: 'text',
      })
      .subscribe({
        next: (response) => {
          let parsed: any;
          try {
            parsed = JSON.parse(response);
          } catch {
            parsed = response;
          }

          const arr = Array.isArray(parsed)
            ? parsed
            : Array.isArray(parsed?.data)
              ? parsed.data
              : Array.isArray(parsed?.admins)
                ? parsed.admins
                : [];

          // ✅ QUI È LA FIX VERA
          this.admins = arr.map((a: any) => ({
            ...a,
            permissions: Array.isArray(a.permissions)
              ? a.permissions
              : typeof a.permissions === 'string'
                ? JSON.parse(a.permissions || '[]')
                : [],
          }));
        },
        error: (err) => {
          console.error('Errore admin/getAll:', err);
          this.admins = [];
        },
      });
  }

  private buildPermissionGroups(options: PermissionOption[]) {
    const byKey = new Map(options.map((o) => [o.key, o]));

    const pick = (keys: string[]) =>
      keys.map((k) => byKey.get(k)).filter(Boolean) as PermissionOption[];

    return [
      {
        title: 'Amministratori',
        items: pick([
          'ADMIN_VIEW',
          'ADMIN_CREATE',
          'ADMIN_EDIT',
          'ADMIN_DELETE',
          'SETTINGS_ADMIN',
        ]),
      },
      {
        title: 'Dipendenti',
        items: pick([
          'EMPLOYEE_VIEW',
          'EMPLOYEE_CREATE',
          'EMPLOYEE_EDIT',
          'EMPLOYEE_DELETE',
          'EMPLOYEE_DOCS_MANAGE',
          'EMPLOYEE_PERMITS_MANAGE',
        ]),
      },
      { title: 'Documenti interni', items: pick(['INTERNAL_DOCS_ACCESS']) },
      { title: 'Preventivi', items: pick(['QUOTES_VIEW', 'QUOTES_MANAGE']) },
      { title: 'Clienti', items: pick(['CUSTOMERS_VIEW', 'CUSTOMERS_MANAGE']) },
      { title: 'Turni', items: pick(['SHIFTS_VIEW', 'SHIFTS_MANAGE']) },
      {
        title: 'Presenze',
        items: pick(['ATTENDANCE_VIEW', 'ATTENDANCE_MANAGE']),
      },
      {
        title: 'Timbrature',
        items: pick(['STAMPING_VIEW', 'STAMPING_MANAGE']),
      },
      {
        title: 'Calendario',
        items: pick(['CALENDAR_VIEW', 'CALENDAR_EVENT_MANAGE']),
      },
    ].filter((g) => g.items.length > 0);
  }

  private ensurePermissionDeps(
    target: { permissions: string[] },
    key: string,
    checked: boolean,
  ) {
    if (!target.permissions) target.permissions = [];

    if (checked) {
      // child selezionato -> aggiungi parent
      const parents = this.permissionDeps[key] || [];
      for (const p of parents) {
        if (!target.permissions.includes(p)) target.permissions.push(p);
      }
    } else {
      // parent tolto -> togli anche i children che dipendono da lui
      const children = Object.keys(this.permissionDeps).filter((child) =>
        (this.permissionDeps[child] || []).includes(key),
      );
      for (const c of children) {
        const idx = target.permissions.indexOf(c);
        if (idx >= 0) target.permissions.splice(idx, 1);
      }
    }
  }

  addAdmin() {
    const body = {
      nome: this.adminAdd.nome,
      cognome: this.adminAdd.cognome,
      email: this.adminAdd.email,
      codiceOperatore: this.adminAdd.codiceOperatore,
      permissions: this.adminAdd.permissions || [],
    };

    this.http
      .post(this.globalService.url + 'admin/add', body, {
        headers: this.globalService.headers,
        responseType: 'text',
      })
      .subscribe({
        next: () => {
          this.adminAdd = {
            nome: '',
            cognome: '',
            email: '',
            codiceOperatore: '',
            permissions: [],
          };
          this.fetchAdmins();
        },
        error: (err) => {
          console.error('Errore creazione admin:', err);
          alert('Errore durante la creazione admin');
        },
      });
  }

  deleteAdmin(i: number) {
    const body = { email: this.admins[i].email };
    this.http
      .post(this.globalService.url + 'admin/delete', body, {
        headers: this.globalService.headers,
        responseType: 'text',
      })
      .subscribe({
        next: () => {
          if (this.editingIndex === i) this.cancelEditAdmin();
          this.fetchAdmins();
        },
        error: (err) => {
          console.error('Errore cancellazione admin:', err);
          alert('Errore durante la cancellazione admin');
        },
      });
  }

  startEditAdmin(i: number) {
    this.editingIndex = i;
    this.adminEditOriginal = { ...this.admins[i] };
    this.adminEdit = {
      ...this.admins[i],
      permissions: [...(this.admins[i].permissions || [])],
      password: '',
    };
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
      permissions: this.adminEdit.permissions || [],
    };

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
