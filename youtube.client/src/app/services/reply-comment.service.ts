import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseService } from './BaseService';
import { AuthService } from './AuthService ';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { ReplyDto } from '../model/ReplyDto';

@Injectable({
  providedIn: 'root'
})
export class ReplyCommentService  extends BaseService {

  constructor(http: HttpClient,private authService: AuthService) { super(http)}
  rootController = `${environment.baseUrl}/api/CommentReply`;



  

  private createHeadersv(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token || ''}`,
       'Content-Type': 'application/json',
     
      Accept: 'application/json, text/plain, */*'
    });
  }

  getAllReply(): Observable<ReplyDto[]> {
    return this.http.get<ReplyDto[]>(`${this.rootController}/All`,{ headers: this.createHeadersv() });
  }

  // Get a comment by ID
  getReplyById(id: number): Observable<ReplyDto> {
    return this.http.get<ReplyDto>(`${this.rootController}/${id}`,{ headers: this.createHeadersv() });
  }

  // Add a new comment
  addReply(commentId: number,comment: ReplyDto): Observable<ReplyDto> {
    
    return this.http.post<ReplyDto>(`${this.rootController}/${commentId}/Add`, comment, { headers: this.createHeadersv() });
  }

  getRepliesForComment(commentId: number): Observable<ReplyDto[]> {
    return this.http.get<ReplyDto[]>(`${this.rootController}/replies/${commentId}`, { headers: this.createHeadersv() });
  } 


  incrementLike(replyId: number): Observable<void> {
    
    return this.http.put<void>(`${this.rootController}/${replyId}/like`, {},{headers:this.createHeadersv()});
  }

  // Increment dislikes
  incrementDislike(replyId: number): Observable<void> {
    return this.http.put<void>(`${this.rootController}/${replyId}/dislike`,{},{headers:this.createHeadersv()});
  }

}
