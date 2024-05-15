import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './componenti/home/home.component';
import { CustomerAreaComponent } from './componenti/login/customer-area/customer-area.component';
import { PrivateAreaComponent } from './componenti/login/private-area/private-area.component';
import { HomeadminComponent } from './admin/homeadmin/homeadmin.component'; // Fixed the import for AdminAreaComponent

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'loginCustomer', component: CustomerAreaComponent },
  { path: 'loginPrivateArea', component: PrivateAreaComponent },
  { path: 'homeAdmin', component: HomeadminComponent }, // Fixed the import for AdminAreaComponent
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
