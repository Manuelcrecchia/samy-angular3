import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './componenti/home/home.component';
import { CustomerAreaComponent } from './componenti/login/customer-area/customer-area.component';
import { PrivateAreaComponent } from './componenti/login/private-area/private-area.component';
import { HomeAdminComponent } from './admin/homeadmin/homeadmin.component'; // Fixed the import for HomeAdminComponent
import { UserSettingsComponent } from './admin/user-settings/user-settings.component';
import { EmployeesSettingsComponent } from './admin/employees-settings/employees-settings.component';


const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'loginCustomer', component: CustomerAreaComponent },
  { path: 'loginPrivateArea', component: PrivateAreaComponent },
  { path: 'homeAdmin', component: HomeAdminComponent },
  { path: 'userSettings', component: UserSettingsComponent }, // Fixed the import for HomeAdminComponent
  { path: 'employeesSettings', component: EmployeesSettingsComponent }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
