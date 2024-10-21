import { HttpClient, HttpHeaders } from '@angular/common/http';
//import { Token } from '@angular/compiler';
import { Injectable } from '@angular/core';
import { Token } from '../model/Token';

@Injectable({
  providedIn: 'root'
})
export class BaseService {
  protected accessToken: string | null = null;
 

  constructor(protected http: HttpClient) {
    this.accessToken = localStorage.getItem('accessToken'); 
   
  }
  protected createHeaders(): HttpHeaders {
   
    const headers = new HttpHeaders({
      Authorization: 'Bearer ' + this.accessToken,
      'Content-Type': 'application/json',
      Accept: 'application/json, text/plain, */*'
    });
    
   
    return headers;
  }
  setAccessToken(token: Token) {
    this.accessToken = token.token;
    localStorage.setItem('accessToken', token.token); // Save to local storage
  }
}
