import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { VideoUpload } from '../model/VideoUpload';
import { AuthService } from '../services/AuthService ';
import { VideoUploadService } from '../services/video-upload.service';
import { RegistrationService } from '../services/registration.service';
import { Router } from '@angular/router';
import { SubscriptionService } from '../services/subscription.service';

@Component({
  selector: 'app-head',
  templateUrl: './head.component.html',
  styleUrl: './head.component.css'
})
export class HeadComponent {
  searchTerm: string = ''; 

  videos: VideoUpload[] = [];
  @Input() userProfilePic: string | null = null;
  @Input() usernames: string | null = null;
  @Input() filteredVideos: VideoUpload[] = [];
  headVideo: VideoUpload[]=[];
  @Output() videosFiltered = new EventEmitter<VideoUpload[]>();

  constructor(
    private videoUploadService: VideoUploadService,
    private registrationService: RegistrationService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef ,
    private router: Router,
    private subscribedService: SubscriptionService) 
    {
      
  }

  ngOnInit(): void {
  
    this.videos = this.filteredVideos; // Initialize with all videos
   
    this.videosFiltered.emit(this.filteredVideos);
  }

  filterVideos(): void {
   debugger
   
   console.log(this.videos)
    console.log('Current search term:', this.searchTerm); 
  if (this.searchTerm.trim() === '') {
    this.getVideo();
    this.filteredVideos = this.videos; 
   
  } else {
    this.filteredVideos = this.filteredVideos.filter(video =>
      video.title.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  
  }
  this.videosFiltered.emit(this.filteredVideos);
  console.log('Filtered videos:', this.filteredVideos);
  }


  getVideo():void{
    this.headVideo = [...this.videos];
  }

  isDropdownOpen = false;

  toggleDropdown() {
    
    this.isDropdownOpen = !this.isDropdownOpen;
    console.log('Dropdown toggled:', this.isDropdownOpen); 
  }
  

  loadUserProfile() {
 debugger
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


  
  getAllUsers() {
    
    const userId = this.authService.getUserId();
    if (userId) { 
      this.registrationService.getUserNameById(userId).subscribe(
        username => {
          
          this.usernames = username;
          console.log('Username:', username);
          
        },
        error => {
          console.error('Error fetching username:', error);
        }
      );
      
    }
    
  }

  deleteAccount() {
   
    const userId = this.authService.getUserId();
    if (userId !== null) {
      if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        
        this.videoUploadService.deleteVideo(userId).subscribe({
          next: () => {
            
            this.registrationService.deleteUser(userId).subscribe({
              next: () => {
                alert('Account and associated videos deleted successfully.');
                this.router.navigate(['/header']); 
              },
              error: (err) => {
                alert('Error deleting account: ' + err.message);
              }
            });
          },
          error: (err) => {
            alert('Error deleting videos: ' + err.message);
          }
        });
      }
    }
  }
  

}
