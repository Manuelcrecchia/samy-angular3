import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PrivateAreaComponent } from './componenti/login/private-area/private-area.component';
import { HomeAdminComponent } from './admin/homeadmin/homeadmin.component';
import { UserSettingsComponent } from './admin/user-settings/user-settings.component';
import { HomesitoComponent } from './componenti/sito/homesito/homesito.component';
import { QuotesHomeComponent } from './admin/quotes-home/quotes-home.component';
import { AddQuoteComponent } from './admin/add-quote/add-quote.component';
import { EditQuoteComponent } from './admin/edit-quote/edit-quote.component';
import { AddCustomerComponent } from './admin/add-customer/add-customer.component';
import { ListCustomerComponent } from './admin/list-customer/list-customer.component';
import { SanificazioniComponent } from './componenti/sito/sanificazioni/sanificazioni.component';
import { UfficiComponent } from './componenti/sito/uffici/uffici.component';
import { Condomini1Component } from './componenti/condomini1/condomini1.component';
import { PalestraComponent } from './componenti/sito/palestra/palestra.component';
import { StraordinariaComponent } from './componenti/sito/straordinaria/straordinaria.component';
import { DomesticaComponent } from './componenti/sito/domestica/domestica.component';
import { PassworddimenticataComponent } from './componenti/login/passworddimenticata/passworddimenticata.component';
import { CambiapasswordComponent } from './componenti/admin/cambiapassword/cambiapassword.component';
import { CalendarHomeComponent } from './admin/calendar/calendar-home/calendar-home.component';
import { PrivacyComponent } from './sito/privacy/privacy.component';
import { PreventiviComponent } from './sito/preventivi/preventivi.component';
import { NavbarComponent } from './sito/navbar/navbar.component';
import { GestioneEmployeesComponent } from './admin/gestione-employees/gestione-employees.component';
import { SettingsEmployeesComponent } from './admin/settings-employees/settings-employees.component';
import { DocumentManagerComponent } from './admin/document-manager/document-manager.component';
import { ViewPdfComponent } from './admin/view-pdf/view-pdf.component';
import { BlogComponent } from './componenti/sito/blog/blog.component';
import { ConvenzioniPromozioniComponent } from './componenti/sito/convenzioni-promozioni/convenzioni-promozioni.component';
import { EditCustomerComponent } from './admin/edit-customer/edit-customer.component';
import { SchedaClienteComponent } from './admin/scheda-cliente/scheda-cliente.component';
import { ShiftHomeComponent } from './admin/shift-home/shift-home.component';
import { CreateShiftComponent } from './admin/create-shift/create-shift.component';
import { GestionePermessiComponent } from './admin/gestione-permessi/gestione-permessi.component';
import { RiepilogoPresenzeComponent } from './admin/riepilogo-presenze/riepilogo-presenze.component';
import { TimbratureHomeComponent } from './admin/timbrature-home/timbrature-home.component';
import { TimbratureDettaglioComponent } from './admin/timbrature-dettaglio/timbrature-dettaglio.component';
import { PreventiviSitoComponent } from '../../src/app/componenti/sito/preventivi/preventivi-sito.component';

import { AuthGuard } from './auth.guard';
import { AuthLevelGuard } from './auth-level.guard';
import { GestioneAssenzeComponent } from './admin/gestione-assenze/gestione-assenze.component';
import { LeaveSettingsComponent } from './admin/leave-settings/leave-settings.component';
import { GestioneTagClienteComponent } from './gestione-tag-cliente/gestione-tag-cliente.component';
import { MobileGuard } from './mobile.guard';
import { RiepilogoPresenzeEditabileComponent } from './admin/riepilogo-presenze-editabile/riepilogo-presenze-editabile.component';

const routes: Routes = [
  { path: '', component: HomesitoComponent, canActivate: [MobileGuard] },
  {
    path: 'homeSito',
    component: HomesitoComponent,
    canActivate: [MobileGuard],
  },
  { path: 'loginPrivateArea', component: PrivateAreaComponent },
  { path: 'privacy', component: PrivacyComponent, canActivate: [MobileGuard] },
  {
    path: 'preventivi',
    component: PreventiviComponent,
    canActivate: [MobileGuard],
  },
  { path: 'navbar', component: NavbarComponent, canActivate: [MobileGuard] },
  { path: 'blog', component: BlogComponent, canActivate: [MobileGuard] },
  {
    path: 'convenzioni-promozioni',
    component: ConvenzioniPromozioniComponent,
    canActivate: [MobileGuard],
  },
  {
    path: 'sanificazioni',
    component: SanificazioniComponent,
    canActivate: [MobileGuard],
  },
  { path: 'uffici', component: UfficiComponent, canActivate: [MobileGuard] },
  {
    path: 'condomini1',
    component: Condomini1Component,
    canActivate: [MobileGuard],
  },
  {
    path: 'palestra',
    component: PalestraComponent,
    canActivate: [MobileGuard],
  },
  {
    path: 'straordinaria',
    component: StraordinariaComponent,
    canActivate: [MobileGuard],
  },
  {
    path: 'domestica',
    component: DomesticaComponent,
    canActivate: [MobileGuard],
  },
  {
    path: 'preventivi-sito',
    component: PreventiviSitoComponent,
    canActivate: [MobileGuard],
  },
  { path: 'passworddimenticata', component: PassworddimenticataComponent },

  // 🔹 ADMIN AREA
  {
    path: 'homeAdmin',
    component: HomeAdminComponent,
    canActivate: [AuthGuard, AuthLevelGuard],
    data: { level: 'B' },
  },
  {
    path: 'userSettings',
    component: UserSettingsComponent,
    canActivate: [AuthGuard, AuthLevelGuard],
    data: { level: 'S' },
  },
  {
    path: 'quotesHome',
    component: QuotesHomeComponent,
    canActivate: [AuthGuard, AuthLevelGuard],
    data: { level: 'B' },
  },
  {
    path: 'addQuote',
    component: AddQuoteComponent,
    canActivate: [AuthGuard, AuthLevelGuard],
    data: { level: 'B' },
  },
  {
    path: 'editQuote',
    component: EditQuoteComponent,
    canActivate: [AuthGuard, AuthLevelGuard],
    data: { level: 'B' },
  },
  {
    path: 'listCustomer',
    component: ListCustomerComponent,
    canActivate: [AuthGuard, AuthLevelGuard],
    data: { level: 'B' },
  },
  {
    path: 'addCustomer',
    component: AddCustomerComponent,
    canActivate: [AuthGuard, AuthLevelGuard],
    data: { level: 'A' },
  },
  {
    path: 'gestioneemployees',
    component: GestioneEmployeesComponent,
    canActivate: [AuthGuard, AuthLevelGuard],
    data: { level: 'B' },
  },
  {
    path: 'gestioneassenze',
    component: GestioneAssenzeComponent,
    canActivate: [AuthGuard, AuthLevelGuard],
    data: { level: 'A' }, // ✅ Solo Admin e Superadmin
  },
  {
    path: 'gestioneTagCliente/:id',
    component: GestioneTagClienteComponent,
    canActivate: [AuthGuard, AuthLevelGuard],
    data: { level: 'A' },
  },

  {
    path: 'settingsemployees',
    component: SettingsEmployeesComponent,
    canActivate: [AuthGuard, AuthLevelGuard],
    data: { level: 'A' },
  },
  {
    path: 'documenti/employee/:id',
    component: DocumentManagerComponent,
    canActivate: [AuthGuard, AuthLevelGuard],
    data: { level: 'A' },
  },
  {
    path: 'documenti/client/:id',
    component: DocumentManagerComponent,
    canActivate: [AuthGuard, AuthLevelGuard],
    data: { level: 'A' },
  },
  {
    path: 'view-pdf',
    component: ViewPdfComponent,
    canActivate: [AuthGuard, AuthLevelGuard],
    data: { level: 'B' },
  },
  {
    path: 'editCustomer',
    component: EditCustomerComponent,
    canActivate: [AuthGuard, AuthLevelGuard],
    data: { level: 'A' },
  },
  {
    path: 'riepilogo-presenze',
    component: RiepilogoPresenzeComponent,
    canActivate: [AuthGuard, AuthLevelGuard],
    data: { level: 'B' },
  },
  {
    path: 'riepilogo-presenze-editabile',
    component: RiepilogoPresenzeEditabileComponent,
    canActivate: [AuthGuard, AuthLevelGuard],
    data: { level: 'A' },
  },
  {
    path: 'schedaCliente/:numeroCliente',
    component: SchedaClienteComponent,
    canActivate: [AuthGuard, AuthLevelGuard],
    data: { level: 'B' },
  },
  {
    path: 'admin/shifts',
    component: ShiftHomeComponent,
    canActivate: [AuthGuard, AuthLevelGuard],
    data: { level: 'B' },
  },
  {
    path: 'admin/shifts/create',
    component: CreateShiftComponent,
    canActivate: [AuthGuard, AuthLevelGuard],
    data: { level: 'A' },
  },
  {
    path: 'gestionepermessi',
    component: GestionePermessiComponent,
    canActivate: [AuthGuard, AuthLevelGuard],
    data: { level: 'A' },
  },
  {
    path: 'cambiapassword',
    component: CambiapasswordComponent,
    canActivate: [AuthGuard, AuthLevelGuard],
    data: { level: 'B' },
  },
  {
    path: 'calendarHome',
    component: CalendarHomeComponent,
    canActivate: [AuthGuard, AuthLevelGuard],
    data: { level: 'B' },
  },

  // 🔹 TIMBRATURE SOLO SUPERADMIN
  {
    path: 'timbratureHome',
    component: TimbratureHomeComponent,
    canActivate: [AuthGuard, AuthLevelGuard],
    data: { level: 'S' },
  },
  {
    path: 'timbratureDettaglio/:employeeId/:date',
    component: TimbratureDettaglioComponent,
    canActivate: [AuthGuard, AuthLevelGuard],
    data: { level: 'S' },
  },
  {
    path: 'leave-settings',
    component: LeaveSettingsComponent,
    canActivate: [AuthGuard, AuthLevelGuard],
    data: { level: 'S' }, // 👑 Solo Superadmin
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
