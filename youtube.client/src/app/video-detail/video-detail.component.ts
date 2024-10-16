import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VideoUploadService } from '../services/video-upload.service';
import { EditProfile } from '../model/EditProfile';
import { SubscriptionService } from '../services/subscription.service';
import { AuthService } from '../services/AuthService ';
import { VideoUpload } from '../model/VideoUpload';
import { RegistrationService } from '../services/registration.service';
import { catchError, map, Observable, of } from 'rxjs';

@Component({
  selector: 'app-video-detail',
  templateUrl: './video-detail.component.html',
  styleUrl: './video-detail.component.css'
})
export class VideoDetailComponent {
  user: EditProfile = {
    id:0,
    email: '',
    fullName: '',
    userName: '',
    profilePic:''
  };

  showButtons: boolean = false; // To control button visibility
  newCommentText: string = '';
  isSubscribed: boolean = false; 
  filteredVideos1: VideoUpload[] = [];
  filteredVideos: VideoUpload[] = [];
  userProfilePic: string | undefined;
  videoId: number | null = null; // Declare as number | null
  video: any; // Define the type as needed
  isLoading: boolean = true; 
  users: EditProfile[] = [];
  buttonText: string = 'Subscribe';
  usernames: string = '';
  videos: VideoUpload[] = [];
  private viewedVideos: Set<string> = new Set();
  videoDescriptionExpanded: { [key: number]: boolean } = {};

  constructor(
    private videoUploadService: VideoUploadService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private registrationService: RegistrationService,
    private subscribedService: SubscriptionService
  ) {}

 
  ngOnInit(): void {
    const idString = this.route.snapshot.paramMap.get('id'); // Get ID as string

    // Check if idString is not null and convert to number
    if (idString) {
      this.videoId = Number(idString); // Convert to number
    }

    // Fetch the video data using the videoId
    this.fetchVideoDetails(this.videoId);
    const userId = this.authService.getUserId();
    if (userId !== null) {
    this.getUserData(userId);
   }
   this.  getAllUser
    ();
    this.loadVideos();
    this.loadUserProfile();
  }

  fetchVideoDetails(id: number | null) {
    if (id !== null) {
      this.videoUploadService.getVideoById(id).subscribe({
        next: (video) => {
          this.video = video;
          this.isLoading = false;
          this.getUserProfilePic(video.userId);
          this.getUserFullName(video.userId);
          this.checkUserSubscription(video.userId);
        },
        error: (err) => {
          console.error('Error loading video details', err);
          this.isLoading = false;
        },
      });
    } else {
      console.error('Invalid video ID');
      this.isLoading = false;
    }
  }
  getUserData(id: number) {
    
    this.registrationService.getUser(id).subscribe(
      (userData: EditProfile) => {
        this.user = userData; 
        
        console.log(this.user)

      },
      (error) => {
        console.error('Error fetching user data:', error);
      }
    );
  }

  getAllUser() {
   
    this.registrationService.getAll().subscribe(
      (users: EditProfile[]) => {
        this.users = users; // Ensure users are stored
        console.log('All users fetched:', this.users);
      },
      (error) => {
        console.error('Error fetching users:', error);
      }
    );
  }
  


  getUserProfilePic(userId: number): string {
   
    const user = this.users.find(u => u.id === userId);
    return user && user.profilePic 
      ? user.profilePic.replace(' ', '%20') 
      : 'assets/images/defaultProfilePic.jpg'; 
  }
  

getUserFullName(userId: number): string {
  const user = this.users.find(u => u.id === userId);
  return user ? `${user.fullName} ` : 'Unknown User'; // Adjust according to your user object structure
}

subscribe() {
 
  const userId = this.authService.getUserId();
  if (this.buttonText === 'Subscribed') {
    console.warn('Already subscribed');
    return; // Exit if already subscribed
  }

  let subscribeby = null; // Initialize subscribeby

  // Assuming you want to subscribe to the first video in this.videos
  if (this.videos.length > 0) {
      subscribeby = this.videos[0].userId; // Get userId of the first video
  }

  if (userId !== null) {
  // Call a service to handle the subscription logic
  this.subscribedService.subscribe(userId,subscribeby).subscribe(response => {
    if (response.success) {
      console.log('Subscribed successfully to user:', userId);
      // Optionally, you can provide feedback to the user here
    } else {
      console.error('Subscription failed:', response.message);
    }
  });
}
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


toggleDescription(videoId: number) {
  this.videoDescriptionExpanded[videoId] = !this.videoDescriptionExpanded[videoId];
}


checkUserSubscription(userId: number) {

  const currentUserId = this.authService.getUserId();

  if (currentUserId === null) {
      console.log("User ID is not available");
      return; // Exit if no user ID
  }

  if (userId) {
      // Call the API to check subscription status
      this.subscribedService.isUserSubscribed(currentUserId, userId).subscribe({
          next: isSubscribed => {
              console.log(isSubscribed);
              // Store the subscription status in the video
              this.filteredVideos1 = this.videos.filter(v => v.userId === userId);
              
              if (this.filteredVideos1.length > 0) { // Check if there are filtered videos
                  this.filteredVideos1.forEach(item => { // Corrected forEach usage
                      item.isSubscribed = isSubscribed;
                      console.log(item.isSubscribed); // Use 'item' instead of 'video'
                  });
              }

              console.log(isSubscribed ? `Subscribed to user ${userId}` : `Not subscribed to user ${userId}`);
          },
          error: err => {
              console.error(`Error checking subscription for user ${userId}:`, err);
          }
      });
  } else {
      console.log("Uploader ID is not available for video:", this.videos[0]?.title);
  }
}

loadVideos(): void {
  this.videoUploadService.getVideos().subscribe({
    next: (videoFiles) => {
      console.log('Video files from service:', videoFiles);
      this.videos = videoFiles.map(video => ({
        ...video,
        likes: video.likes ?? 0,
        dislikes: video.dislikes ?? 0,
        views: video.views ?? 0,
        userId: video.userId ?? null,
      }));

      // Exclude the currently displayed video
      this.filteredVideos = this.videos.filter(video => video.id !== this.videoId);

      this.isLoading = false; 
      this.videos.forEach(video => {
        this.getUserProfilePic(video.userId);
        this.getUserFullName(video.userId);
        this.checkUserSubscription(video.userId);
      });
      console.log('Processed video files:', this.videos);
    },
    error: (err) => {
      console.error('Error loading videos', err);
      this.isLoading = false; 
    },
  });
}

handleVideoClick(selectedVideo: VideoUpload): void {
  this.video = selectedVideo; 
}


onInputFocus() {
  this.showButtons = true;
}


onInputBlur() {
  if (!this.newCommentText) {
    this.showButtons = false;
  }
}

addComment() {
 
  this.newCommentText = ''; 
  this.showButtons = false; 
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

}
