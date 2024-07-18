import { NgModule, Component } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustomerAreaComponent } from './componenti/login/customer-area/customer-area.component';
import { PrivateAreaComponent } from './componenti/login/private-area/private-area.component';
import { HomeAdminComponent } from './admin/homeadmin/homeadmin.component'; // Fixed the import for HomeAdminComponent
import { UserSettingsComponent } from './admin/user-settings/user-settings.component';
import { EmployeesSettingsComponent } from './admin/employees-settings/employees-settings.component';
import { HomesitoComponent } from './componenti/sito/homesito/homesito.component';
import { QuotesHomeComponent } from './admin/quotes-home/quotes-home.component'; // Import the missing QuotesHomeComponent
import { AddQuoteComponent } from './admin/add-quote/add-quote.component';
import { EditQuoteComponent } from './admin/edit-quote/edit-quote.component';
import { CaricaFileComponent } from './admin/carica-file/carica-file.component';
import { MenageCustomerComponent } from './admin/menage-customer/menage-customer.component';
import { AddCustomerComponent } from './admin/add-customer/add-customer.component';
import { ListCustomerComponent } from './admin/list-customer/list-customer.component';


const routes: Routes = [
  { path: '', component: HomesitoComponent },
  { path: 'loginCustomer', component: CustomerAreaComponent },
  { path: 'loginPrivateArea', component: PrivateAreaComponent },
  { path: 'homeAdmin', component: HomeAdminComponent },
  { path: 'userSettings', component: UserSettingsComponent },
  { path: 'employeesSettings', component: EmployeesSettingsComponent },
  { path: 'quotesHome', component: QuotesHomeComponent },
  { path: 'addQuote', component: AddQuoteComponent },
  { path: 'editQuote', component: EditQuoteComponent }, // Fixed the component name to 'EditQuoteComponent'
  { path: 'caricaFile', component: CaricaFileComponent }, // Fixed the component name to 'EditQuoteComponent'
  { path: 'listCustomer', component: ListCustomerComponent }, // Fixed the component name to 'EditQuoteComponent'
  { path: 'addCustomer', component: AddCustomerComponent }, // Fixed the component name to 'EditQuoteComponent' { path: 'addCustomer', component: AddCustomerComponent }, // Fixed the component name to 'EditQuoteComponent'
  { path: 'menageCustomer', component: MenageCustomerComponent }, // Fixed the component name to 'EditQuoteComponent'

];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
