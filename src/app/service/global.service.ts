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
  headers = new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8', 'Authorization': `${this.token}` });

  //TEST

  //url = "http://192.168.1.172:5000/";


  //PROD

  url = "https://samipulizie.it:4000/";
}
