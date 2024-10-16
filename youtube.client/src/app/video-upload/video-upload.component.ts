import { Component } from '@angular/core';
import { VideoUploadService } from '../services/video-upload.service';
import { VideoUpload } from '../model/VideoUpload';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { AuthService } from '../services/AuthService ';

@Component({
  selector: 'app-video-upload',
  templateUrl: './video-upload.component.html',
  styleUrl: './video-upload.component.css'
})
export class VideoUploadComponent {
  isUploadVisible: boolean = false;

  constructor(private videoUploadService: VideoUploadService,private router: Router,private authService: AuthService) {}


  videos: VideoUpload[] = [];
  videoUrl: string | null = null;
  videoFile: File | null = null;
  thumbnailFile: File | null = null;
  videoError: string | null = null;
  videoTitle: string = '';
  videoDescription: string ='';

  ngOnInit(): void {
    this.loadVideos();
    
    
  }

  onVideoChange(event: any) {
   
    const file = event.target.files[0];
    const maxSizeInBytes = 50 * 1024 * 1024; // 50 MB limit

    if (file) {
      if (file.size > maxSizeInBytes) {
        this.videoError = 'The video file exceeds the maximum size of 50 MB.';
        event.target.value = ''; 
        
      } else {
        this.videoError = null; // Clear any previous errors
        this.videoFile=file;
        // Handle the video file as needed
        console.log('Video file accepted:', file);
      }
    }
  }

  onThumbnailChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.thumbnailFile = file;
    }
  }

  upload() {
    debugger
    const userId = this.authService.getUserId();
    if (userId !== null) {
      if (this.videoFile && this.thumbnailFile && this.videoTitle && this.videoDescription) {
        this.videoUploadService.uploadVideo(userId, this.videoFile, this.thumbnailFile, this.videoTitle, this.videoDescription)
          .subscribe(
            response => {
              this.videoUrl = response.videoFilePath; 
              console.log('Upload successful!', response);
              Swal.fire({
                icon: 'success',
                title: 'Upload successful!',
                text: 'Your video has been uploaded successfully.',
              });
              
              this.resetFields();
              this.router.navigate(['/header']);
            },
            error => {
              console.error('Upload failed', error);
              let errorMessage = 'There was a problem uploading your video. Please try again.';
              if (error.status === 400) {
                errorMessage = 'Invalid data provided. Please check your inputs.';
              } else if (error.status === 500) {
                errorMessage = 'Server error. Please try again later.';
              }
              Swal.fire({
                icon: 'error',
                title: 'Upload failed',
                text: errorMessage,
              });
            }
          );
      } else {
        console.error('Please fill in all required fields.');
        Swal.fire({
          icon: 'warning',
          title: 'Missing information',
          text: 'Please fill in all required fields.',
        });
      }
    }
  }
  
  private resetFields() {
    this.videoFile = null;
    this.thumbnailFile = null;
    this.videoTitle = '';
    this.videoDescription = '';
  }
  
  toggleUpload() {
    this.isUploadVisible = !this.isUploadVisible;
    this.videoError = '';
  }

  loadVideos(): void {
    debugger
     const userId = this.authService.getUserId();
     if (userId !== null) {
     this.videoUploadService.getUserVideos(userId).subscribe({
       next: (videoFiles) => {
         console.log('Video files from service:', videoFiles);
         this.videos = videoFiles.map(video => ({
           ...video,
           Likes: video.likes ?? 0,
           Dislikes: video.dislikes ?? 0,
           Views: video.views ?? 0,
         }));
        
         console.log('Processed video files:', this.videos);
       },
       error: (err) => {
         console.error('Error loading videos', err);
         
       },
     });
   }
   }


   
 
}
