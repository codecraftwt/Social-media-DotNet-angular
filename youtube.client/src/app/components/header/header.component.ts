import { ChangeDetectorRef, Component, Input, numberAttribute } from '@angular/core';
import { VideoUploadService } from '../../services/video-upload.service';
import { VideoUpload } from '../../model/VideoUpload';
import Swal from 'sweetalert2';
import { RegistrationService } from '../../services/registration.service';
import { AuthService } from '../../services/AuthService ';
import { Video } from '../../model/Video';
import { Router } from '@angular/router';
import { EditProfile } from '../../model/EditProfile';
import { SubscriptionService } from '../../services/subscription.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  
  user: EditProfile = {
    id:0,
    email: '',
    fullName: '',
    userName: '',
    profilePic:''
  };
  buttonText: string = 'Subscribe';
  users: EditProfile[] = [];
  //videos: string[] = [];
  videos: VideoUpload[] = [];
  @Input() video!: Video;
  ImagePath: string; 
  videoPathToPlay: string | null = null; 
  isLoading = true;
  userProfilePic: string | undefined;
  private viewedVideos: Set<string> = new Set();
  filteredVideos: VideoUpload[] = [];
  filteredVideos1: VideoUpload[] = [];
  searchTerm: string = ''; 
  usernames: string = '';
  isSubscribed: boolean = false; 
  currentUserId:number = 0;
  isSubscribedMap: { [key: number]: boolean } = {};
  videoDescriptionExpanded: { [key: number]: boolean } = {};
  selectedVideoId: number | null = null;
  beforfilteredVideos: VideoUpload[] = [];



  constructor(
    private videoUploadService: VideoUploadService,
    private registrationService: RegistrationService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef ,
    private router: Router,
    private subscribedService: SubscriptionService) 
    {
     this.ImagePath = '/assets/images/Like.png'
  }
  ngOnInit(): void {
    this.loadVideos();
    this.loadUserProfile();
    this.getAllUsers();
    const userId = this.authService.getUserId();
    if (userId !== null) {
    this.getUserData(userId);
   }
   this.getAllUser();
  
  }
  
  loadUserProfile() {
 
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
  
  getUserData(id: number) {
    
    this.registrationService.getUser(id).subscribe(
      (userData: EditProfile) => {
        this.user = userData; 
        
      

      },
      (error) => {
        console.error('Error fetching user data:', error);
      }
    );
  }

  loadVideos(): void {

    this.videoUploadService.getVideos().subscribe({
      next: (videoFiles) => {
        
        this.videos = videoFiles.map(video => ({
          ...video,
          Likes: video.likes ?? 0,
          Dislikes: video.dislikes ?? 0,
          Views: video.views ?? 0,
          UserId: video.userId ?? null,
        }));
  
        this.filteredVideos = this.videos;
        this.isLoading = false; 
        this.videos.forEach(video => {
          debugger
          this.getUserProfilePic(video.userId);
          this.getUserFullName(video.userId);
          this.checkUserSubscription(video.userId);
        });
        this.beforfilteredVideos = this.videos;
      },
      error: (err) => {
        console.error('Error loading videos', err);
        this.isLoading = false; 
      },
    });
  }


  
  isDropdownOpen = false;

  toggleDropdown() {
    
    this.isDropdownOpen = !this.isDropdownOpen;
   
  }
  

  logout() {
    
  
    this.isDropdownOpen = false; 
  }



  incrementLike(video: VideoUpload) {
   
    this.videoUploadService.incrementLike(video.id).subscribe({
        next: () => {
            video.likes++;
           
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
   
   
  if (this.searchTerm.trim() === '') {
    this.filteredVideos = this.videos; 
  } else {
    this.filteredVideos = this.videos.filter(video =>
      video.title.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }
  console.log('Filtered videos:', this.filteredVideos);
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
  
  getUserProfilePic(userId: number): string {
    const user = this.users.find(u => u.id === userId);
    const profilePic = user && user.profilePic ? user.profilePic.replace(' ', '%20') : 'assets/images/defaultProfilePic.jpg'; 
  
    return profilePic;
}

getUserFullName(userId: number): string {
  const user = this.users.find(u => u.id === userId);
  return user ? `${user.fullName} ` : 'Unknown User'; // Adjust according to your user object structure
}

  
  getAllUser() {
   
    this.registrationService.getAll().subscribe(
      (users: EditProfile[]) => {
        this.users = users; // Ensure users are stored
        
      },
      (error) => {
        console.error('Error fetching users:', error);
      }
    );
  }
  

  subscribe(videoId : number) {
    debugger;
    const userId = this.authService.getUserId();
    if (this.buttonText === 'Subscribed') {
      console.warn('Already subscribed');
      return; // Exit if already subscribed
    }
  
    let subscribeby = null; // Initialize subscribeby
  
    // Find the selected video based on selectedVideoId
    const selectedVideo = this.videos.find(video => video.id === videoId);
  
    if (selectedVideo) {
      subscribeby = selectedVideo.userId; // Get userId of the selected video
    }
  
    if (userId !== null && subscribeby !== null) {
      // Call a service to handle the subscription logic
      this.subscribedService.subscribe(userId, subscribeby).subscribe(response => {
        if (response.id && response.userId && response.subscribeby) {
          console.log('Subscribed successfully to user:', subscribeby);
          // Optionally, provide feedback to the user here
        } else {
          console.error('Subscription failed:', response.message);
        }
      });
    } else {
      console.warn('User ID or selected video user ID is null');
    }
  }
  

  checkUserSubscription(userId: number) {
    debugger;
    const currentUserId = this.authService.getUserId();

    if (currentUserId === null) {
      
        return; // Exit if no user ID
    }

    if (userId) {
        // Call the API to check subscription status
        this.subscribedService.isUserSubscribed(currentUserId, userId).subscribe({
            next: isSubscribed => {
               
                // Store the subscription status in the video
                this.filteredVideos1 = this.videos.filter(v => v.userId === userId);
                
                if (this.filteredVideos1.length > 0) { // Check if there are filtered videos
                    this.filteredVideos1.forEach(item => { // Corrected forEach usage
                        item.isSubscribed = isSubscribed;
                       
                    });
                }

              
            },
            error: err => {
                console.error(`Error checking subscription for user ${userId}:`, err);
            }
        });
    } else {
        console.log("Uploader ID is not available for video:", this.videos[0]?.title);
    }
}



toggleDescription(videoId: number) {
  this.videoDescriptionExpanded[videoId] = !this.videoDescriptionExpanded[videoId];
}

handleVideoClick(video: any) {
  this.incrementView(video); // Increment the view count
  this.router.navigate(['/video', video.id]);
}  

onVideosFiltered(filtered: VideoUpload[]): void {
  if (filtered.length === 0) {
    this.filteredVideos = this.beforfilteredVideos;
  } else {
    this.filteredVideos = filtered;
  }
  
 
}

OnpageFiltered(video :number): void {
  debugger;
  
  
  this.router.navigate(['/video', video]);
}

        }

      