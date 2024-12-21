import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

export class GlobalService {
  constructor(private http: HttpClient,) { }

  token: string = "";
  userCode: string = "";
  admin: string = "";
  email: string = "";
  headers = new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8', 'Authorization': `${this.token}` });

  url = "https://samipulizie.it:4000/";

  //url = "http://192.168.1.5:5000/";

  //https://betterprogramming.pub/how-to-convert-your-angular-application-to-a-native-mobile-app-android-and-ios-c212b38976df

}
