import { Component, Input } from '@angular/core';
import { VideoUploadService } from '../../services/video-upload.service';
import { VideoUpload } from '../../model/VideoUpload';
import Swal from 'sweetalert2';
import { RegistrationService } from '../../services/registration.service';
import { AuthService } from '../../services/AuthService ';
import { Video } from '../../model/Video';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  
  //videos: string[] = [];
  videos: VideoUpload[] = [];
  @Input() video!: Video;
  ImagePath: string; 
  videoPathToPlay: string | null = null; // Add this property
  isLoading = true;
  userProfilePic: string | undefined;
  private viewedVideos: Set<string> = new Set();


  constructor(private videoUploadService: VideoUploadService,private registrationService: RegistrationService,private authService: AuthService) {
     this.ImagePath = '/assets/images/Like.png'
  }
  ngOnInit(): void {
    this.loadVideos();
    this.loadUserProfile();
  }
  
  loadUserProfile() {
 
    const userId = this.authService.getUserId();
    if (userId !== null) {
      this.registrationService.getUserProfileById(userId).subscribe({
        next: (user) => {
          console.log('Fetched User Profile:', user);
          this.userProfilePic = user.ProfilePic; 
          console.log('Profile Picture URL:', this.userProfilePic);
        },
        error: (err) => {
          console.error('Error loading user profile', err);
        }
      });
    }
  }
  

  loadVideos(): void {

    this.videoUploadService.getVideos().subscribe({
      next: (videoFiles) => {
        console.log('Video files from service:', videoFiles);
        this.videos = videoFiles.map(video => ({
          ...video,
          Likes: video.likes ?? 0,
          Dislikes: video.dislikes ?? 0,
          Views: video.views ?? 0,
        }));
        this.isLoading = false; // Set loading to false after loading
        console.log('Processed video files:', this.videos);
      },
      error: (err) => {
        console.error('Error loading videos', err);
        this.isLoading = false; // Set loading to false even on error
      },
    });
  }


  
  isDropdownOpen = false;

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  logout() {
    
    console.log('User logged out');
    this.isDropdownOpen = false; 
  }



  incrementLike(video: VideoUpload) {
   
    this.videoUploadService.incrementLike(video.id).subscribe({
        next: () => {
            video.likes++;
            console.log('Like incremented for video:', video.id);
        },
        error: (err) => {
            console.error('Error incrementing like:', err);
        }
    });
  }
  
  incrementUnlike(video: VideoUpload) {
    this.videoUploadService.incrementDislike(video.id).subscribe(() => {
      video.dislikes++;
    });
  }
  
  incrementView(video: VideoUpload) {
    // Only increment views if the video hasn't been viewed yet
    if (!this.viewedVideos.has(video.url)) { // Use a unique identifier for the video
      this.videoUploadService.incrementView(video.id).subscribe(() => {
        video.views++;
      });
      this.viewedVideos.add(video.url); // Add the video's URL to the set of viewed videos
    }
  }
  
  }

  

