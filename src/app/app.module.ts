import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CustomerAreaComponent } from './componenti/login/customer-area/customer-area.component';
import { HomeComponent } from './componenti/home/home.component';
import { PrivateAreaComponent } from './componenti/login/private-area/private-area.component';
import { HomeAdminComponent } from './admin/homeadmin/homeadmin.component';
import { GlobalService } from './service/global.service';

import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonToggleGroup, MatButtonToggleModule } from '@angular/material/button-toggle';
import { HttpClientModule } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { UserSettingsComponent } from './admin/user-settings/user-settings.component';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    CustomerAreaComponent,
    PrivateAreaComponent,
    HomeAdminComponent,
    UserSettingsComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatSlideToggleModule,
    MatButtonToggleGroup,
    HttpClientModule,
    MatFormFieldModule,
    FormsModule,
    MatSelectModule,
    MatButtonToggleModule

  ],
    providers: [
      GlobalService
    ],
    bootstrap: [AppComponent]
  })
  // Remove the existing export statement for the AppModule class
  // export class AppModule { }
export class AppModule { }
export class YourModule { }
