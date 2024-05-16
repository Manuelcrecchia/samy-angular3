import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {

  constructor() { }

token: string = "";
userCode: string = "";
admin: string = "";

headers = new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8', 'Authorization': `${this.token}` });

url = "http://192.168.1.172:4000/";
}
