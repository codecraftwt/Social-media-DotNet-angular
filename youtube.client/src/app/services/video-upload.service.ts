import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { VideoUpload } from '../model/VideoUpload';
import { BaseService } from './BaseService';
import { AuthService } from './AuthService ';

@Injectable({
  providedIn: 'root'
})
export class VideoUploadService  {
  private apiUrl = `${environment.baseUrl}/api/Videos`;
  userId: number | null;
  private tokenKey = 'userToken';
  constructor(private http: HttpClient, private authService: AuthService) {
    // Call the base class constructor first
    this.userId = this.authService.getUserId(); // Now it's safe to use 'this'
    this.tokenKey = this.authService.getToken() || '';
    console.log('Current User ID:', this.userId);
  }
  ngOnInit(): void {
  
    this.userId = this.authService.getUserId();
    console.log('Current User ID:', this.userId);
  }

  private createHeaders(): HttpHeaders {
 
    const token = this.authService.getToken();
    console.log('Retrieved Access Token:', this.tokenKey);
    return new HttpHeaders({
      Authorization: `Bearer ${token || ''}`,
      'Content-Type': 'application/json',
      Accept: 'application/json, text/plain, */*'
    });
  }

  // uploadVideo(file: File): Observable<any> {
  //  
  //   const formData = new FormData();

  //   formData.append('fileupload', file); 
  //   return this.http.post(`${this.apiUrl}/upload`, formData);
  // }
  

  // getVideos(): Observable<string[]> {
  //   return this.http.get<string[]>(`${this.apiUrl}/getVideos`).pipe(
  //     map(videoFiles => videoFiles.map(video => `${environment.baseUrl}/${video}`)) // Adjust the path as needed
  //   );
  // }
  


  uploadVideo(userId: number,videoFile: File, thumbnailFile: File, title:string,videoDescription:string): Observable<any> {
  debugger
    const formData = new FormData();
    formData.append('userId',userId.toString())
    formData.append('fileupload', videoFile);
    formData.append('thumbnailUpload', thumbnailFile);
    formData.append('title', title);
    formData.append('description',videoDescription)
    
    return this.http.post(`${this.apiUrl}/UploadVideo`, formData,{headers:this.createHeadersVideo()});
  }

  private createHeadersVideo(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token || ''}`,
      Accept: 'application/json, text/plain, */*'
    });
  }
  

  getVideos(): Observable<VideoUpload[]> {

    return this.http.get<VideoUpload[]>(`${this.apiUrl}/GetVideoAll`, {
      headers:this.createHeaders() // Pass the headers here
    }).pipe(
      tap(response => console.log('API Response:', response)), 
      map(videoFiles => videoFiles.map(video => {
        const Url = `${environment.baseUrl}/${video.url}`; // Use 'video.url'
        const Thumbnail = `${environment.baseUrl}/${video.thumbnail}`; // Use 'video.thumbnail'
        console.log('Video URL:', Url); // Log constructed video URL
        console.log('Thumbnail URL:', Thumbnail); // Log constructed thumbnail URL
        return {
          ...video, 
          url: Url,
          thumbnail: Thumbnail,
          Likes: video.likes || 0,       // Ensure Likes is set
          Dislikes: video.dislikes || 0,   // Ensure Dislikes is set
          Views: video.views || 0   ,
          title : video.title,
          description : video.description
        };
      }))
    );
  }
    
 

  incrementLike(videoId: number): Observable<void> {
    
    return this.http.put<void>(`${this.apiUrl}/${videoId}/like`, {},{headers:this.createHeaders()});
  }

  // Increment dislikes
  incrementDislike(videoId: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${videoId}/dislike`,{},{headers:this.createHeaders()});
  }

  // Increment views
  // incrementView(videoId: number): Observable<void> {
  //   return this.http.put<void>(`${this.apiUrl}/${videoId}/view`,{}, {headers:this.createHeaders()});
  // }


  incrementView(videoId : number,UserId:number):Observable<void>{
    return this.http.put<void>(`${this.apiUrl}/${UserId}/view/${videoId}`,{},{headers:this.createHeaders()})
  }


  getUserVideos(Id: number): Observable<VideoUpload[]> {
    debugger
    return this.http.get<VideoUpload[]>(`${this.apiUrl}/${Id}/GetVideosByUserId`, {
      headers:this.createHeaders() // Pass the headers here
    }).pipe(
      tap(response => console.log('API Response:', response)), 
      map(videoFiles => videoFiles.map(video => {
        const Url = `${environment.baseUrl}/${video.url}`; // Use 'video.url'
        const Thumbnail = `${environment.baseUrl}/${video.thumbnail}`; // Use 'video.thumbnail'
        console.log('Video URL:', Url); // Log constructed video URL
        console.log('Thumbnail URL:', Thumbnail); // Log constructed thumbnail URL
        return {
          ...video, 
          url: Url,
          thumbnail: Thumbnail,
          Likes: video.likes || 0,       // Ensure Likes is set
          Dislikes: video.dislikes || 0,   // Ensure Dislikes is set
          Views: video.views || 0   ,
          title : video.title
        };
      }))
    );
  }
   

  deleteVideo(userId: number): Observable<any> {
    debugger
    return this.http.delete(`${this.apiUrl}/${userId}/user`, { headers: this.createHeaders() });
  }
  


  getVideoById(videoId: number): Observable<VideoUpload> {
    return this.http.get<VideoUpload>(`${this.apiUrl}/${videoId}/video`, {
      headers: this.createHeaders() // Pass the headers here
    }).pipe(
      tap(response => console.log('API Response:', response)),
      map(video => {
        const Url = `${environment.baseUrl}/${video.url}`; // Construct video URL
        const Thumbnail = `${environment.baseUrl}/${video.thumbnail}`; // Construct thumbnail URL
        console.log('Video URL:', Url); // Log constructed video URL
        console.log('Thumbnail URL:', Thumbnail); // Log constructed thumbnail URL
        
        return {
          ...video,
          url: Url,
          thumbnail: Thumbnail,
          Likes: video.likes || 0,       // Ensure Likes is set
          Dislikes: video.dislikes || 0,  // Ensure Dislikes is set
          Views: video.views || 0         // Ensure Views is set
        };
      })
    );
  }
  
  
  
}
  

