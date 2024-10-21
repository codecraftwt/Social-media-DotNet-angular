import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { User } from '../model/User';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, forkJoin, map, Observable, of, switchMap, tap } from 'rxjs';
import { LoginUser } from '../model/LoginUser';
import { Token } from '@angular/compiler';
import { BaseService } from './BaseService';
import { AuthService } from './AuthService ';
import { Profile } from '../model/Profile';
import { EditProfile } from '../model/EditProfile';

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
    
      // Accessing the profilePic property correctly
      const profilePicUrl = `${environment.baseUrl}${response.profilePic}`;
    
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

private createHeadersP(): HttpHeaders {
  const token = this.authService.getToken();
  return new HttpHeaders({
    Authorization: `Bearer ${token || ''}`,
    // 'Content-Type': 'application/json',
   
    Accept: 'application/json, text/plain, */*'
  });
}

getUser(id: number): Observable<EditProfile> {

  return this.http.get<EditProfile>(`${this.rootController}/${id}/GetUser`, { headers: this.createHeadersP() });
}


updateUser(id: number, userData: FormData): Observable<any> {
  return this.http.put(`${this.rootController}/${id}/UpdateUserData`, userData, { headers: this.createHeadersP() });
}

getUserNameById(userId: number): Observable<string> {
 
  return this.http.get<{ username: string }>(`${this.rootController}/${userId}/username`, { headers: this.createHeadersP() }).pipe(
    tap(response => {
     
    }),
    map(response => response.username), // Extract the username from the response
    catchError(error => {
     
      return of(''); // Return an empty string or a default value in case of error
    })
  );
  
}

deleteUser(id:number):Observable<any>{
  return this.http.delete(`${this.rootController}/${id}/delete`,{ headers: this.createHeadersP()})
}

getAll(): Observable<EditProfile[]> {
  return this.http.get<EditProfile[]>(`${this.rootController}/All`, { headers: this.createHeadersP() }).pipe(
    
    map(users => {
      const profilePicRequests = users.map(user => 
        this.getUserProfileById(user.id).pipe(
          map(profile => ({ ...user, profilePic: profile.ProfilePic })) 
        )
      );

      
      return forkJoin(profilePicRequests); 
    }),
    
    switchMap(profilePicObservables => profilePicObservables), 
    catchError(error => {
      console.error('Error fetching all users:', error);
      return of([]); 
    })
  );
}

}


