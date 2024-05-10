import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './componenti/login/login.component';
import { HomeComponent } from './componenti/home/home.component';


import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonToggleGroup } from '@angular/material/button-toggle';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatSlideToggleModule,
    MatButtonToggleGroup
  ],
    providers: [
    ],
    bootstrap: [AppComponent]
  })
  // Remove the existing export statement for the AppModule class
  // export class AppModule { }
export class AppModule { }
