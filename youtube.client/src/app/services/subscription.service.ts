import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './AuthService ';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { Subscribed } from '../model/Subscribed';
import { BaseService } from './BaseService';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService extends BaseService{
  private apiUrl = `${environment.baseUrl}/api/Subscribed`;

  constructor(http: HttpClient, private authService: AuthService) {super(http); }

  private createHeadersv(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token || ''}`,
       'Content-Type': 'application/json',
     
      Accept: 'application/json, text/plain, */*'
    });
  }
  subscribe(userId: number, subscribeby: number | null): Observable<Subscribed> {
    return this.http.post<Subscribed>(`${this.apiUrl}/${userId}/add/${subscribeby}`, {}, { headers: this.createHeadersv() });
  }

  getAll(): Observable<Subscribed[]> {
    return this.http.get<Subscribed[]>(`${this.apiUrl}/all`, { headers: this.createHeadersv() });
}

isUserSubscribed(userId: number,subscribeby: number): Observable<boolean> {
  return this.http.get<boolean>(`${this.apiUrl}/is-subscribed/${userId}/${subscribeby}`,{ headers: this.createHeadersv() });
}

}
