import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PrivateAreaComponent } from './componenti/login/private-area/private-area.component';
import { PassworddimenticataComponent } from './componenti/login/passworddimenticata/passworddimenticata.component';

import { HomeAdminComponent } from './admin/homeadmin/homeadmin.component';
import { UserSettingsComponent } from './admin/user-settings/user-settings.component';

import { QuotesHomeComponent } from './admin/quotes-home/quotes-home.component';
import { AddQuoteComponent } from './admin/add-quote/add-quote.component';
import { EditQuoteComponent } from './admin/edit-quote/edit-quote.component';

import { AddCustomerComponent } from './admin/add-customer/add-customer.component';
import { ListCustomerComponent } from './admin/list-customer/list-customer.component';
import { EditCustomerComponent } from './admin/edit-customer/edit-customer.component';
import { SchedaClienteComponent } from './admin/scheda-cliente/scheda-cliente.component';
import { GestioneTagClienteComponent } from './gestione-tag-cliente/gestione-tag-cliente.component';

import { CambiapasswordComponent } from './componenti/admin/cambiapassword/cambiapassword.component';

import { CalendarHomeComponent } from './admin/calendar/calendar-home/calendar-home.component';

import { GestioneEmployeesComponent } from './admin/gestione-employees/gestione-employees.component';
import { SettingsEmployeesComponent } from './admin/settings-employees/settings-employees.component';

import { DocumentManagerComponent } from './admin/document-manager/document-manager.component';
import { ViewPdfComponent } from './admin/view-pdf/view-pdf.component';

import { ShiftHomeComponent } from './admin/shift-home/shift-home.component';
import { CreateShiftComponent } from './admin/create-shift/create-shift.component';

import { GestionePermessiComponent } from './admin/gestione-permessi/gestione-permessi.component';
import { GestioneAssenzeComponent } from './admin/gestione-assenze/gestione-assenze.component';
import { LeaveSettingsComponent } from './admin/leave-settings/leave-settings.component';

import { RiepilogoPresenzeEditabileComponent } from './admin/riepilogo-presenze-editabile/riepilogo-presenze-editabile.component';

import { TimbratureHomeComponent } from './admin/timbrature-home/timbrature-home.component';
import { TimbratureDettaglioComponent } from './admin/timbrature-dettaglio/timbrature-dettaglio.component';

// ✅ Documenti interni (assumo questo path; se diverso, aggiorna SOLO l'import)
import { InternalDocumentsComponent } from './admin/internal-documents/internal-documents.component';

import { AuthGuard } from './auth.guard';
import { AuthLevelGuard } from './auth-level.guard';

const routes: Routes = [
  { path: '', component: PrivateAreaComponent },
  { path: 'loginPrivateArea', component: PrivateAreaComponent },
  { path: 'passworddimenticata', component: PassworddimenticataComponent },

  // 🔹 ADMIN AREA
  {
    path: 'homeAdmin',
    component: HomeAdminComponent,
    canActivate: [AuthGuard, AuthLevelGuard],
    // accesso base pannello admin: uso EMPLOYEE_VIEW perché è una delle funzioni "core"
    data: { permission: 'EMPLOYEE_VIEW' },
  },

  // gestione amministratori
  {
    path: 'userSettings',
    component: UserSettingsComponent,
    canActivate: [AuthGuard, AuthLevelGuard],
    // pagina gestione admin → basta avere la visione admin (e poi bottoni in UI per create/edit/delete)
    data: { permission: 'ADMIN_VIEW' },
  },

  // preventivi
  {
    path: 'quotesHome',
    component: QuotesHomeComponent,
    canActivate: [AuthGuard, AuthLevelGuard],
    data: { permission: 'QUOTES_VIEW' },
  },
  {
    path: 'addQuote',
    component: AddQuoteComponent,
    canActivate: [AuthGuard, AuthLevelGuard],
    data: { permission: 'QUOTES_MANAGE' },
  },
  {
    path: 'editQuote',
    component: EditQuoteComponent,
    canActivate: [AuthGuard, AuthLevelGuard],
    data: { permission: 'QUOTES_MANAGE' },
  },

  // clienti
  {
    path: 'listCustomer',
    component: ListCustomerComponent,
    canActivate: [AuthGuard, AuthLevelGuard],
    data: { permission: 'CUSTOMERS_VIEW' },
  },
  {
    path: 'addCustomer',
    component: AddCustomerComponent,
    canActivate: [AuthGuard, AuthLevelGuard],
    data: { permission: 'CUSTOMERS_MANAGE' },
  },
  {
    path: 'editCustomer',
    component: EditCustomerComponent,
    canActivate: [AuthGuard, AuthLevelGuard],
    data: { permission: 'CUSTOMERS_MANAGE' },
  },
  {
    path: 'schedaCliente/:numeroCliente',
    component: SchedaClienteComponent,
    canActivate: [AuthGuard, AuthLevelGuard],
    data: { permission: 'CUSTOMERS_VIEW' },
  },
  {
    path: 'gestioneTagCliente/:id',
    component: GestioneTagClienteComponent,
    canActivate: [AuthGuard, AuthLevelGuard],
    data: { permission: 'CUSTOMERS_MANAGE' },
  },

  // dipendenti
  {
    path: 'gestioneemployees',
    component: GestioneEmployeesComponent,
    canActivate: [AuthGuard, AuthLevelGuard],
    data: { permission: 'EMPLOYEE_VIEW' },
  },
  {
    path: 'settingsemployees',
    component: SettingsEmployeesComponent,
    canActivate: [AuthGuard, AuthLevelGuard],
    data: { permission: 'EMPLOYEE_EDIT' },
  },

  // permessi/assenze dipendenti
  {
    path: 'gestionepermessi',
    component: GestionePermessiComponent,
    canActivate: [AuthGuard, AuthLevelGuard],
    data: { permission: 'EMPLOYEE_PERMITS_MANAGE' },
  },
  {
    path: 'gestioneassenze',
    component: GestioneAssenzeComponent,
    canActivate: [AuthGuard, AuthLevelGuard],
    data: { permission: 'EMPLOYEE_PERMITS_MANAGE' },
  },
  {
    path: 'leave-settings',
    component: LeaveSettingsComponent,
    canActivate: [AuthGuard, AuthLevelGuard],
    data: { permission: 'SETTINGS_ADMIN' },
  },

  // documenti dipendenti / clienti
  {
    path: 'documenti/employee/:id',
    component: DocumentManagerComponent,
    canActivate: [AuthGuard, AuthLevelGuard],
    data: { permission: 'EMPLOYEE_DOCS_MANAGE' },
  },
  {
    path: 'documenti/client/:id',
    component: DocumentManagerComponent,
    canActivate: [AuthGuard, AuthLevelGuard],
    // nel backend non esiste CUSTOMER_DOCS_MANAGE, quindi uso CUSTOMERS_MANAGE (esiste)
    data: { permission: 'CUSTOMERS_MANAGE' },
  },

  // documenti interni
  {
    path: 'internal-documents',
    component: InternalDocumentsComponent,
    canActivate: [AuthGuard, AuthLevelGuard],
    data: { permission: 'INTERNAL_DOCS_ACCESS' },
  },

  // pdf viewer (usato in più contesti → lo lascio “solo autenticato”)
  {
    path: 'view-pdf',
    component: ViewPdfComponent,
    canActivate: [AuthGuard],
  },

  // presenze
  {
    path: 'riepilogo-presenze-editabile',
    component: RiepilogoPresenzeEditabileComponent,
    canActivate: [AuthGuard, AuthLevelGuard],
    data: { permission: 'ATTENDANCE_MANAGE' },
  },

  // turni
  {
    path: 'admin/shifts',
    component: ShiftHomeComponent,
    canActivate: [AuthGuard, AuthLevelGuard],
    data: { permission: 'SHIFTS_VIEW' },
  },
  {
    path: 'admin/shifts/create',
    component: CreateShiftComponent,
    canActivate: [AuthGuard, AuthLevelGuard],
    data: { permission: 'SHIFTS_MANAGE' },
  },

  // calendario
  {
    path: 'calendarHome',
    component: CalendarHomeComponent,
    canActivate: [AuthGuard, AuthLevelGuard],
    data: { permission: 'CALENDAR_VIEW' },
  },

  // timbrature
  {
    path: 'timbratureHome',
    component: TimbratureHomeComponent,
    canActivate: [AuthGuard, AuthLevelGuard],
    data: { permission: 'STAMPING_VIEW' },
  },
  {
    path: 'timbratureDettaglio/:employeeId/:date',
    component: TimbratureDettaglioComponent,
    canActivate: [AuthGuard, AuthLevelGuard],
    data: { permission: 'STAMPING_VIEW' },
  },

  // cambio password (accesso base: basta essere loggato)
  {
    path: 'cambiapassword',
    component: CambiapasswordComponent,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
