import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { User } from '../model/User';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, Observable, of, switchMap, tap } from 'rxjs';
import { LoginUser } from '../model/LoginUser';
import { Token } from '@angular/compiler';
import { BaseService } from './BaseService';
import { AuthService } from './AuthService ';
import { Profile } from '../model/Profile';

@Injectable({
  providedIn: 'root'
})
export class RegistrationService extends BaseService {
 // header: any;

  constructor(http: HttpClient,private authService: AuthService) { super(http)}
  rootController = `${environment.baseUrl}/api/User`;
  

  // CreateUser(company: User) {
  //   
  //   return this.http.post<string>(`${this.rootController}/CreateUser`, company);
  // }


  // login(user: LoginUser ): Observable<any> {
  //  
    
  //   return this.http.post<LoginUser>(`${this.rootController}/login`, user);
  // }
  login(user: LoginUser): Observable<any> {
 
    return this.http.post<any>(`${this.rootController}/login`, user).pipe(
      switchMap(loginResponse => {
        // Assuming loginResponse contains userId
        const userId = loginResponse.userId;
        this.authService.setUserId(userId);
        return this.getUserToken(userId).pipe(
          tap(tokenResponse => {
            console.log('User Token Response:', tokenResponse);
           
          }),
          
          
        );
      })
    );
  }

  CreateUser(userData: FormData): Observable<any> {
  
    return this.http.post(`${this.rootController}/CreateUserR`, userData);
}


getUserToken(userId: number): Observable<any> {

  return this.http.get<any>(`${this.rootController}/${userId}/token`).pipe(
    tap(response => {
   
      console.log('User Token Response:', response);
      this.authService.setToken(response.token);
      this.setAccessToken(response.token);
    })
  );
}

private createHeadersv(): HttpHeaders {
  const token = this.authService.getToken();
  return new HttpHeaders({
    Authorization: `Bearer ${token || ''}`,
    // 'Content-Type': 'application/json',
   
    Accept: 'application/json, text/plain, */*'
  });
}

getUserProfileById(userId: number): Observable<Profile> {
  
  return this.http.get<{ profilePic: string }>(`${this.rootController}/${userId}/GetUserById`, { headers: this.createHeadersv() }).pipe(
    map(response => {
      console.log('Profile Picture from API:', response); 
      
      // Accessing the profilePic property correctly
      const profilePicUrl = `${environment.baseUrl}${response.profilePic}`;
      console.log('Profile Picture URL:', profilePicUrl);
      
      return {
        ProfilePic: profilePicUrl,
      };
    }),
    catchError(error => {
      console.error('Error fetching user profile:', error);
      return of({ ProfilePic: '' }); // Return a default value in case of error
    })
  );
}



}


