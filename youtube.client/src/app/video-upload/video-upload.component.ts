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

  constructor(private videoUploadService: VideoUploadService,private router: Router,private authService: AuthService) {}



  videoUrl: string | null = null;
  videoFile: File | null = null;
  thumbnailFile: File | null = null;
  videoError: string | null = null;
  videoTitle: string = '';


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
  
    const userId = this.authService.getUserId();
    if (userId !== null) {
    if (this.videoFile && this.thumbnailFile && this.videoTitle) {
      this.videoUploadService.uploadVideo(userId,this.videoFile, this.thumbnailFile,this.videoTitle).subscribe(response => {
        this.videoUrl = response.videoFilePath; // Update according to your API response structure
        console.log('Upload successful!', response);
        Swal.fire({
          icon: 'success',
          title: 'Upload successful!',
          text: 'Your video has been uploaded successfully.',
        });
        this.router.navigate(['/header']);
      },
      error => {
        console.error('Upload failed', error);
        Swal.fire({
          icon: 'error',
          title: 'Upload failed',
          text: 'There was a problem uploading your video. Please try again.',
        });
      }
    );
    
  } else {
    console.error('Please select both a video and a thumbnail.');
    Swal.fire({
      icon: 'warning',
      title: 'Missing files',
      text: 'Please select both a video and a thumbnail.',
    });
  }
}
  }
  

}
