import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustomerAreaComponent } from './componenti/login/customer-area/customer-area.component';
import { PrivateAreaComponent } from './componenti/login/private-area/private-area.component';
import { HomeAdminComponent } from './admin/homeadmin/homeadmin.component';
import { UserSettingsComponent } from './admin/user-settings/user-settings.component';
import { HomesitoComponent } from './componenti/sito/homesito/homesito.component';
import { QuotesHomeComponent } from './admin/quotes-home/quotes-home.component';
import { AddQuoteComponent } from './admin/add-quote/add-quote.component';
import { EditQuoteComponent } from './admin/edit-quote/edit-quote.component';
import { CaricaFileComponent } from './admin/carica-file/carica-file.component';
import { MenageCustomerComponent } from './admin/menage-customer/menage-customer.component';
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
import { AuthGuard } from './auth.guard';
import { ViewPdfComponent } from './admin/view-pdf/view-pdf.component';
import { BlogComponent } from './componenti/sito/blog/blog.component';
import { ConvenzioniPromozioniComponent } from './componenti/sito/convenzioni-promozioni/convenzioni-promozioni.component';
import { EditCustomerComponent } from './admin/edit-customer/edit-customer.component';
import { SchedaClienteComponent } from './admin/scheda-cliente/scheda-cliente.component';

const routes: Routes = [
  { path: '', component: HomesitoComponent },
  { path: 'homeSito', component: HomesitoComponent },
  { path: 'loginCustomer', component: CustomerAreaComponent },
  { path: 'loginPrivateArea', component: PrivateAreaComponent },
  { path: 'homeAdmin', component: HomeAdminComponent, canActivate: [AuthGuard] },
  { path: 'userSettings', component: UserSettingsComponent, canActivate: [AuthGuard] },
  { path: 'quotesHome', component: QuotesHomeComponent, canActivate: [AuthGuard] },
  { path: 'addQuote', component: AddQuoteComponent, canActivate: [AuthGuard] },
  { path: 'editQuote', component: EditQuoteComponent, canActivate: [AuthGuard] },
  { path: 'caricaFile', component: CaricaFileComponent, canActivate: [AuthGuard] },
  { path: 'listCustomer', component: ListCustomerComponent, canActivate: [AuthGuard] },
  { path: 'addCustomer', component: AddCustomerComponent, canActivate: [AuthGuard] },
  { path: 'menageCustomer', component: MenageCustomerComponent, canActivate: [AuthGuard] },
  { path: 'sanificazioni', component: SanificazioniComponent },
  { path: 'uffici', component: UfficiComponent },
  { path: 'condomini1', component: Condomini1Component },
  { path: 'palestra', component: PalestraComponent },
  { path: 'straordinaria', component: StraordinariaComponent },
  { path: 'domestica', component: DomesticaComponent },
  { path: 'passworddimenticata', component: PassworddimenticataComponent },
  { path: 'cambiapassword', component: CambiapasswordComponent, canActivate: [AuthGuard] },
  { path: 'calendarHome', component: CalendarHomeComponent, canActivate: [AuthGuard] },
  { path: 'privacy', component: PrivacyComponent },
  { path: 'preventivi', component: PreventiviComponent },
  { path: 'navbar', component: NavbarComponent },
  { path: 'gestioneemployees', component: GestioneEmployeesComponent, canActivate: [AuthGuard] },
  { path: 'settingsemployees', component: SettingsEmployeesComponent, canActivate: [AuthGuard] },
  { path: 'documenti/employee/:id', component: DocumentManagerComponent, canActivate: [AuthGuard] },
  { path: 'documenti/client/:id', component: DocumentManagerComponent, canActivate: [AuthGuard] },
    { path: 'view-pdf', component: ViewPdfComponent, canActivate: [AuthGuard] },
  { path: 'blog', component: BlogComponent },
  { path: 'convenzioni-promozioni', component: ConvenzioniPromozioniComponent},
  { path: 'editCustomer', component: EditCustomerComponent, canActivate: [AuthGuard] },
  { path: 'schedaCliente/:numeroCliente', component: SchedaClienteComponent },



];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
