import { Injectable } from '@angular/core';
import { AuthService } from './AuthService ';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BaseService } from './BaseService';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { NotificationVideo } from '../model/Notification';


@Injectable({
  providedIn: 'root'
})
export class NotifyService extends BaseService{

  constructor(http: HttpClient,private authService: AuthService) { super(http)}
  rootController = `${environment.baseUrl}/api/Notification`;



  

  private createHeadersv(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token || ''}`,
       'Content-Type': 'application/json',
     
      Accept: 'application/json, text/plain, */*'
    });
  }


  getAllNotification(): Observable<NotificationVideo[]> {
    return this.http.get<NotificationVideo[]>(`${this.rootController}/All`,{ headers: this.createHeadersv() });
  }

  // Get a comment by ID
  getNotificationById(id: number): Observable<NotificationVideo> {
    return this.http.get<NotificationVideo>(`${this.rootController}/${id}`,{ headers: this.createHeadersv() });
  }

  // Add a new comment
  addNotification(comment: NotificationVideo): Observable<NotificationVideo> {
    
    return this.http.post<NotificationVideo>(`${this.rootController}/Add`, comment, { headers: this.createHeadersv() });
  }
}
