import { ChangeDetectorRef, Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { VideoUpload } from '../model/VideoUpload';
import { AuthService } from '../services/AuthService ';
import { VideoUploadService } from '../services/video-upload.service';
import { RegistrationService } from '../services/registration.service';
import { Router } from '@angular/router';
import { SubscriptionService } from '../services/subscription.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NotificationVideo } from '../model/Notification';
import { NotifyService } from '../services/notify.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-head',
  templateUrl: './head.component.html',
  styleUrl: './head.component.css'
})
export class HeadComponent {
  @ViewChild('notificationsModal')
  notificationsModal!: TemplateRef<any>;

  searchTerm: string = ''; 

  videos: VideoUpload[] = [];
  @Input() userProfilePic: string | null = null;
  @Input() usernames: string | null = null;
  @Input() filteredVideos: VideoUpload[] = [];
  headVideo: VideoUpload[]=[];
  @Output() videosFiltered = new EventEmitter<VideoUpload[]>();
  videoDetails: VideoUpload | null = null;
  notifications : NotificationVideo[]=[]

  constructor(
    private videoUploadService: VideoUploadService,
    private registrationService: RegistrationService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef ,
    private router: Router,
    private subscribedService: SubscriptionService,
    private modalService: NgbModal,
    private notificationService:NotifyService) 
    {
      
  }

  ngOnInit(): void {
  
    this.videos = this.filteredVideos; // Initialize with all videos
   
    this.videosFiltered.emit(this.filteredVideos);
    // this.loadNotifications();
  }

  filterVideos(): void {
   debugger
   

  if (this.searchTerm.trim() === '') {
    this.getVideo();
    this.filteredVideos = this.videos; 
   
  } else {
    this.filteredVideos = this.filteredVideos.filter(video =>
      video.title.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  
  }
  this.videosFiltered.emit(this.filteredVideos);
 
  }


  getVideo():void{
    this.headVideo = [...this.videos];
  }

  isDropdownOpen = false;

  toggleDropdown() {
    
    this.isDropdownOpen = !this.isDropdownOpen;
   
  }
  

  loadUserProfile() {
 debugger
    const userId = this.authService.getUserId();
    if (userId !== null) {
      this.registrationService.getUserProfileById(userId).subscribe({
        next: (user) => {
       
          this.userProfilePic = user.ProfilePic; 
         
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
  
  getVideoDetails(videoId: number) {
    this.videoUploadService.getVideoById(videoId).subscribe(
        (video) => {
            this.videoDetails = video; // Store the video details
            console.log('Fetched video details:', this.videoDetails);
        },
        (error) => {
            console.error('Error fetching video details:', error);
        }
    );
}

fetchNotificationVideo(notification: NotificationVideo) {
    this.getVideoDetails(notification.videoId);
}


openNotificationsModal(event: MouseEvent) {
  debugger
  
  console.log('Fetching notifications to display related videos');

  
  event.stopPropagation();

  // Fetch all notifications
  this.notificationService.getAllNotification().subscribe(
    (notifications) => {
      console.log('Fetched Notifications:', notifications);

      // Extract video IDs from notifications
      const videoIds = notifications.map(notification => notification.videoId);
      console.log('Extracted Video IDs:', videoIds);

      // Clear previous videos
      this.videos = [];

      // Fetch each video individually
      const videoFetchObservables = videoIds.map(videoId => 
        this.videoUploadService.getVideoById(videoId)
      );

      // Combine all observables
      forkJoin(videoFetchObservables).subscribe(
        (videos) => {
          this.videos = videos; 
          console.log('Fetched Videos:', this.videos);
          videos.forEach(video => {
            this.loadUser(video.userId);
          });
          // Open the modal with a custom class to position it
          this.modalService.open(this.notificationsModal, { 
            ariaLabelledBy: 'modal-basic-title', 
            windowClass: 'custom-modal' // Custom class for positioning
          });
        },
        (error) => {
          console.error('Error fetching videos by IDs:', error);
        }
      );
    },
    (error) => {
      console.error('Error fetching notifications:', error);
    }
  );
}


loadUser(userId : number) {
 
  
 
    this.registrationService.getUserProfileById(userId).subscribe({
      next: (user) => {
     
        this.userProfilePic = user.ProfilePic; 
       
      },
      error: (err) => {
        console.error('Error loading user profile', err);
      }
    });
  
}


loadNotifications() {
  this.notificationService.getAllNotification().subscribe(
      (notifications) => {
          this.notifications = notifications; // Ensure this is defined
          console.log('Notifications:', this.notifications);
      },
      (error) => {
          console.error('Error fetching notifications:', error);
      }
  );
}


}
