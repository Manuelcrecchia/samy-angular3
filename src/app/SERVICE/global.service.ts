import { HttpHeaders } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {

  constructor(    private http: HttpClient,
    ) { }

  token: string = "";
  userCode: string = "";
  admin: string = "";

  headers = new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8', 'Authorization': `${this.token}` });

  url = "http://192.168.1.9:4000/";




      }
