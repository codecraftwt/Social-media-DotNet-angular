import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { VideoUpload } from '../model/VideoUpload';
import { VideoUploadService } from '../services/video-upload.service';
import { RegistrationService } from '../services/registration.service';
import { AuthService } from '../services/AuthService ';
import { Video } from '../model/Video';

@Component({
  selector: 'app-user-video',
  templateUrl: './user-video.component.html',
  styleUrl: './user-video.component.css'
})
export class UserVideoComponent {
   
  //videos: string[] = [];
  videos: VideoUpload[] = [];
  @Input() video!: Video;
  ImagePath: string; 
  videoPathToPlay: string | null = null; // Add this property
  isLoading = true;
  userProfilePic: string | undefined;
  private viewedVideos: Set<string> = new Set();
  filteredVideos: VideoUpload[] = [];
  searchTerm: string = ''; 

  constructor(private videoUploadService: VideoUploadService,private registrationService: RegistrationService,private authService: AuthService,private cdr: ChangeDetectorRef) {
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
        this.filteredVideos = this.videos;
        this.isLoading = false; 
        console.log('Processed video files:', this.videos);
      },
      error: (err) => {
        console.error('Error loading videos', err);
        this.isLoading = false; 
      },
    });
  }
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
   debugger 
    const userId = this.authService.getUserId();
    if (userId) { 
    if (!this.viewedVideos.has(video.url)) { 
      this.videoUploadService.incrementView(video.id,userId).subscribe(() => {
        video.views++;
      });
      this.viewedVideos.add(video.url);
    }
  }
  }


  filterVideos(): void {
   
    console.log('Current search term:', this.searchTerm); 
  if (this.searchTerm.trim() === '') {
    this.filteredVideos = this.videos; 
  } else {
    this.filteredVideos = this.videos.filter(video =>
      video.title.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }
  console.log('Filtered videos:', this.filteredVideos);
  }

}
