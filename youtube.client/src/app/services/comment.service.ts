import { Injectable } from '@angular/core';
import { AuthService } from './AuthService ';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { BaseService } from './BaseService';
import { Observable } from 'rxjs';
import { CommentDto } from '../model/CommentDto';

@Injectable({
  providedIn: 'root'
})
export class CommentService extends BaseService {


  constructor(http: HttpClient,private authService: AuthService) { super(http)}
  rootController = `${environment.baseUrl}/api/CommentUser`;



  

  private createHeadersv(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token || ''}`,
       'Content-Type': 'application/json',
     
      Accept: 'application/json, text/plain, */*'
    });
  }


  getAllComments(): Observable<CommentDto[]> {
    return this.http.get<CommentDto[]>(`${this.rootController}/All`,{ headers: this.createHeadersv() });
  }

  // Get a comment by ID
  getCommentById(id: number): Observable<CommentDto> {
    return this.http.get<CommentDto>(`${this.rootController}/${id}`,{ headers: this.createHeadersv() });
  }

  // Add a new comment
  addComment(comment: CommentDto): Observable<CommentDto> {
    
    return this.http.post<CommentDto>(`${this.rootController}/Add`, comment, { headers: this.createHeadersv() });
  }

  getCommentsByVideoId(videoId: number): Observable<CommentDto[]> {
    return this.http.get<CommentDto[]>(`${this.rootController}/video/${videoId}`, { headers: this.createHeadersv() });
  }

  incrementLike(videoId: number): Observable<void> {
    
    return this.http.put<void>(`${this.rootController}/${videoId}/like`, {},{headers:this.createHeadersv()});
  }

  // Increment dislikes
  incrementDislike(videoId: number): Observable<void> {
    return this.http.put<void>(`${this.rootController}/${videoId}/dislike`,{},{headers:this.createHeadersv()});
  }
  
  
}
