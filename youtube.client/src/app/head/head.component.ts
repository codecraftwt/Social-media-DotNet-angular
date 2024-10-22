import { ChangeDetectorRef, Component, EventEmitter, Input, output, Output, TemplateRef, ViewChild } from '@angular/core';
import { VideoUpload } from '../model/VideoUpload';
import { AuthService } from '../services/AuthService ';
import { VideoUploadService } from '../services/video-upload.service';
import { RegistrationService } from '../services/registration.service';
import { Router } from '@angular/router';
import { SubscriptionService } from '../services/subscription.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NotificationVideo } from '../model/Notification';
import { NotifyService } from '../services/notify.service';
import { forkJoin, map } from 'rxjs';

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
  userProfilePic1: string | null = null;
  @Input() userProfilePic: string | null | undefined = null;

  @Input() usernames: string | null = null;
  @Input() filteredVideos: VideoUpload[] = [];
  headVideo: VideoUpload[]=[];
  @Output() videosFiltered = new EventEmitter<VideoUpload[]>();
  @Output() videoId = new EventEmitter<number>();

  videoDetails: VideoUpload | null = null;
  notifications : NotificationVideo[]=[];
  isSubscribedToUser: { [userId: number]: boolean } = {};
  notificationCount: number = 0; // Initialize to 0


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

    this.loadNotificationCount();
  }

  get formattedNotificationCount(): string {
    return this.notificationCount > 99 ? '+99' : this.notificationCount.toString();
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


// openNotificationsModal(event: MouseEvent) {
//   debugger
  
//   console.log('Fetching notifications to display related videos');

  
//   event.stopPropagation();

//   // Fetch all notifications
//   this.notificationService.getAllNotification().subscribe(
//     (notifications) => {
//       console.log('Fetched Notifications:', notifications);

//       // Extract video IDs from notifications
//       const videoIds = notifications.map(notification => notification.videoId);
//       console.log('Extracted Video IDs:', videoIds);

//       // Clear previous videos
//       this.videos = [];

//       // Fetch each video individually
//       const videoFetchObservables = videoIds.map(videoId => 
//         this.videoUploadService.getVideoById(videoId)
//       );

//       // Combine all observables
//       forkJoin(videoFetchObservables).subscribe(
//         (videos) => {
//           this.videos = videos; 
//           console.log('Fetched Videos:', this.videos);
//           videos.forEach(video => {
//             this.loadUser(video.userId);
//           });
//           // Open the modal with a custom class to position it
//           this.modalService.open(this.notificationsModal, { 
//             ariaLabelledBy: 'modal-basic-title', 
//             windowClass: 'custom-modal' // Custom class for positioning
//           });
//         },
//         (error) => {
//           console.error('Error fetching videos by IDs:', error);
//         }
//       );
//     },
//     (error) => {
//       console.error('Error fetching notifications:', error);
//     }
//   );
// }


openNotificationsModal(event: MouseEvent) {
  debugger;
  const currentUserId = this.authService.getUserId();
  if (currentUserId === null) {
   
    return; // Exit if no user ID
  }
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

      // Combine all observables to fetch videos
      forkJoin(videoFetchObservables).subscribe(
        (videos) => {
          console.log('Fetched Videos:', videos);
          
          // Prepare subscription checks for each video
          const subscriptionChecks = videos.map(video => 
            this.subscribedService.isUserSubscribed(currentUserId, video.userId).pipe(
              map(isSubscribed => ({ video, isSubscribed }))
            )
          );

          // Combine all observables to check subscriptions
          forkJoin(subscriptionChecks).subscribe(
            (results) => {
              // Filter videos based on subscription status
              const filteredVideos = results
                .filter(result => result.isSubscribed)
                .map(result => result.video);

              this.videos = filteredVideos; 
              console.log('Filtered Videos:', this.videos);
              
              // Load users for filtered videos
              this.videos.forEach(video => {
                this.loadUser(video.userId);
              });
              
              // Open the modal with a custom class to position it
              const modalRef = this.modalService.open(this.notificationsModal, { 
                ariaLabelledBy: 'modal-basic-title', 
                windowClass: 'custom-modal' // Custom class for styling
              });

              // Get the position of the bell icon
              const bellButton = document.querySelector('.fas.fa-bell') as HTMLElement; // Adjust selector
              if (!bellButton) {
                  console.error('Bell button not found in DOM');
                  return;
              }
              const rect = bellButton.getBoundingClientRect();

              // Apply custom positioning using the modal reference
              modalRef.result.then(() => {}, () => {
                // This code will run when the modal is dismissed
              });

              // Use a timeout to ensure the modal is in the DOM before setting position
              setTimeout(() => {
                const modalElement = document.querySelector('.custom-modal .modal-dialog') as HTMLElement;
                if (modalElement) {
                  modalElement.style.position = 'absolute';
                  modalElement.style.top = `${rect.bottom + window.scrollY}px`; // Position below the bell button
                  modalElement.style.left = `${rect.left + 300}px`; // Align with the bell button
                }
              }, 0);
         
            },
            (error) => {
              console.error('Error checking subscriptions:', error);
            }
          );
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
     
        this.userProfilePic1 = user.ProfilePic; 
       
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

handleVideoClick(video: any,modal: any) {
 debugger
  this.router.navigate(['/video', video.id]);
  modal.dismiss();
  this.videoId.emit(video.id);
}

checkUserSubscription(userId: number) {
  const currentUserId = this.authService.getUserId();

  if (currentUserId === null) {
   
    return; // Exit if no user ID
  }

  if (userId) {
    this.subscribedService.isUserSubscribed(currentUserId, userId).subscribe({
      next: isSubscribed => {
        this.isSubscribedToUser[userId] = isSubscribed; // Store in the new object
       
      },
      error: err => {
        console.error(`Error checking subscription for user ${userId}:`, err);
      }
    });
  } else {
    console.log("Uploader ID is not available for video.");
  }
}

loadNotificationCount() {
  const currentUserId = this.authService.getUserId();
  if (currentUserId === null) {
    return; // Exit if no user ID
  }

  // Fetch all notifications
  this.notificationService.getAllNotification().subscribe(
    (notifications) => {
      console.log('Fetched Notifications:', notifications);

      // Extract video IDs from notifications
      const videoIds = notifications.map(notification => notification.videoId);
      console.log('Extracted Video IDs:', videoIds);

      // Fetch each video individually
      const videoFetchObservables = videoIds.map(videoId => 
        this.videoUploadService.getVideoById(videoId)
      );

      // Combine all observables to fetch videos
      forkJoin(videoFetchObservables).subscribe(
        (videos) => {
          console.log('Fetched Videos:', videos);
          
          // Prepare subscription checks for each video
          const subscriptionChecks = videos.map(video => 
            this.subscribedService.isUserSubscribed(currentUserId, video.userId).pipe(
              map(isSubscribed => ({ video, isSubscribed }))
            )
          );

          // Combine all observables to check subscriptions
          forkJoin(subscriptionChecks).subscribe(
            (results) => {
              // Filter videos based on subscription status
              const filteredVideos = results
                .filter(result => result.isSubscribed)
                .map(result => result.video);

              this.notificationCount = filteredVideos.length; // Update the notification count
              console.log('Notification Count:', this.notificationCount); // Log the count

              // Load users for filtered videos
              this.videos = filteredVideos; 
              this.videos.forEach(video => {
                this.loadUser(video.userId);
              });
            },
            (error) => {
              console.error('Error checking subscriptions:', error);
            }
          );
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

}
