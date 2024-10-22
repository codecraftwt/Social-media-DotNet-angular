import { Component, input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VideoUploadService } from '../services/video-upload.service';
import { EditProfile } from '../model/EditProfile';
import { SubscriptionService } from '../services/subscription.service';
import { AuthService } from '../services/AuthService ';
import { VideoUpload } from '../model/VideoUpload';
import { RegistrationService } from '../services/registration.service';
import { catchError, map, Observable, of } from 'rxjs';
import { CommentDto } from '../model/CommentDto';
import { CommentService } from '../services/comment.service';
import { NgForm } from '@angular/forms';
import { ReplyDto } from '../model/ReplyDto';
import { ReplyCommentService } from '../services/reply-comment.service';

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

  showButtons: boolean = false; 
  showButtons1: boolean = false;
  newCommentText: string = '';
  replyText :string='';
  isSubscribed: boolean = false; 
 
  filteredVideos: VideoUpload[] = [];
  beforfilteredVideos: VideoUpload[] = [];
  userProfilePic: string | null = 'path/to/profile-pic.jpg'; 
  videoId: number | null = null; // Declare as number | null
  video: any; // Define the type as needed
  isLoading: boolean = true; 
  users: EditProfile[] = [];
  buttonText: string = 'Subscribe';
  // usernames: string = '';
  videos: VideoUpload[] = [];
  selectedVideo: VideoUpload | null = null; 
  comments: CommentDto[] = [];
  private viewedVideos: Set<string> = new Set();
  videoDescriptionExpanded: { [key: number]: boolean } = {};
  usernames: string | null = 'John Doe';
  replyCount: { [key: number]: number } = {};
  isSubscribedToUser: { [userId: number]: boolean } = {};
  replyVisibility: { [commentId: number]: boolean } = {};
  searchTerm: string = ''; 
 
  isReplyInputVisible: { [key: number]: boolean } = {};

  constructor(
    private videoUploadService: VideoUploadService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private registrationService: RegistrationService,
    private subscribedService: SubscriptionService,
    private commentService:CommentService,
    private replyCommnetService : ReplyCommentService
  ) {this.filteredVideos = this.videos;}

 
  ngOnInit(): void {
    
    const idString = this.route.snapshot.paramMap.get('id'); // Get ID as string

    // Check if idString is not null and convert to number
    if (idString) {
      this.videoId = Number(idString); // Convert to number
    }

    this.initializeComponent();
    this.fetchVideoDetails(this.videoId);
    if (this.videoId !== null) {
      this.loadComments(this.videoId); // Check here
  } else {
      console.error('videoId is null, cannot load comments');
  }
    const userId = this.authService.getUserId();
    if (userId !== null) {
    this.getUserData(userId);
   }
   this.  getAllUser
    ();
    this.loadVideos();
    this.loadUserProfile();
    this.getAllUsers();
    
    
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
          this.incrementView(video);
        },
        error: (err) => {
         
          this.isLoading = false;
        },
      });
    } else {
      
      this.isLoading = false;
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

loadVideos(): void {
 
  this.videoUploadService.getVideos().subscribe({
    next: (videoFiles) => {
    
      this.videos = videoFiles.map(video => ({
        ...video,
        likes: video.likes ?? 0,
        dislikes: video.dislikes ?? 0,
        views: video.views ?? 0,
        userId: video.userId ?? null,
      }));

      if(this.selectedVideo == null){
        this.filteredVideos = this.videos.filter(video => video.id !== this.videoId);
      }
        this.filteredVideos = this.videos.filter(video => video.id !== this.selectedVideo?.id)
      
      this.isLoading = false; 
      this.videos.forEach(video => {
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

handleVideoClick(selectedVideo: VideoUpload): void {
  debugger

  this.video = selectedVideo; 
  this.selectedVideo=selectedVideo;
  this.loadComments(selectedVideo.id);
  this.loadVideos()
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

  const userId = this.authService.getUserId();
  
  if (userId && this.newCommentText.trim() && this.videoId !== null) {
    const newComment: CommentDto = {
      id:0,
      videoId: this.videoId, 
      userId: userId,
      comment: this.newCommentText,
      likes: 0,
      dislikes:0
    };

    this.commentService.addComment(newComment).subscribe(
      (comment) => {
        this.comments.push(comment); 
        this.newCommentText = ''; 
      },
      (error) => {
        console.error('Error adding comment:', error);
      }
    );
  } else {
    console.error('Cannot add comment: userId, newCommentText, or videoId is invalid');
  }
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



loadComments(videoId: number) {

  const userId = this.authService.getUserId();
  if (userId) { 
  this.commentService.getCommentsByVideoId(videoId).subscribe(
    (comments: CommentDto[]) => {
      this.comments = comments; // Update the comments array with the fetched comments
     
      if (this.comments.length === 0) {
      }

      this.comments.forEach(comment => {
        this.loadReplies(comment.id); 
        this.replyVisibility[comment.id]=false;
      });
    },
    (error) => {
      console.error('Error fetching comments:', error);
    }
  );
}
}


likeComment(comment: CommentDto) {
 
  if (comment.id !== undefined) {
  this.commentService.incrementLike(comment.id).subscribe({
    next: () => {
      comment.likes++;
      
    },
    error: (err) => {
      console.error('Error incrementing like:', err);
      // Optionally, revert the UI update if needed
    }
  });
}
}

dislikeComment(comment: CommentDto) {
  if (comment.id !== undefined) {
  this.commentService.incrementDislike(comment.id).subscribe({
    next: () => {
      comment.dislikes++;
     
    },
    error: (err) => {
      console.error('Error incrementing dislike:', err);
      // Handle error if needed
    }
  });
}
}

submitReply(commentId: number) {
  
  const userId = this.authService.getUserId();
  
  if (userId && this.replyText.trim()) {
      const newReply: ReplyDto = {
          commentId: commentId,
          userId: userId,
          replyText: this.replyText,
          likes:0,
          dislikes:0
      };

      this.replyCommnetService.addReply(commentId, newReply).subscribe(
          (reply) => {
              // Optionally load replies for the comment again
              this.loadReplies(commentId);
              this.replyText = ''; // Clear the reply input
          },
          (error) => {
              console.error('Error adding reply:', error);
          }
      );
  } else {
      console.error('Cannot add reply: userId or replyText is invalid');
  }
}

loadReplies(commentId: number) {
  debugger
  if (!this.replyVisibility[commentId]) {
  this.replyCommnetService.getRepliesForComment(commentId).subscribe(
      (replies: ReplyDto[]) => {
          const comment = this.comments.find(c => c.id === commentId);
          if (comment) {
              // Make sure replies is an array
              comment.replies = Array.isArray(replies) ? replies : [replies];
             
              this.replyCount[commentId] = comment.replies.length;
          }
      },
      (error) => {
          console.error('Error loading replies:', error);
      }
  );
}
this.replyVisibility[commentId] = !this.replyVisibility[commentId]; 
}




// cancelReply(comment:ReplyDto) {
//   comment.replyText = '';
//   comment.replyVisible = false;
// }

onInputreplyFocus() {
 
  this.showButtons1 = true;

}


onInputreplyBlur() {

  if (!this.replyText) {
    this.showButtons1 = false;
  }
}

likeReply(reply: ReplyDto) {

  if (reply && reply.id !== undefined) {
    this.replyCommnetService.incrementLike(reply.id).subscribe({
      next: () => {
        reply.likes++;
      
      },
      error: (err) => {
        console.error('Error incrementing like for reply:', err);
      }
    });
  } else {
    console.error('Reply ID is undefined');
  }
}

dislikeReply(reply: ReplyDto) {
  if (reply && reply.id !== undefined) {
    this.replyCommnetService.incrementDislike(reply.id).subscribe({
      next: () => {
        reply.dislikes++;
        
      },
      error: (err) => {
        console.error('Error incrementing dislike for reply:', err);
      }
    });
  }
}

onVideosFiltered(filtered: VideoUpload[]): void {
  if (filtered.length === 0) {
    this.filteredVideos = this.beforfilteredVideos;
  } else {
    this.filteredVideos = filtered;
  }
  
 
}

toggleReplyInput(commentId: number) {
  this.isReplyInputVisible[commentId] = !this.isReplyInputVisible[commentId];
}

cancelReply(commentId: number) {
  this.replyText = '';
  this.isReplyInputVisible[commentId] = false;
}


OnpageFiltered(video :number): void {
  debugger;
  
 this.videoId=video;


  if (video !== null) {
    this.fetchVideoDetails(video);
    this.loadComments(video);
  } else {
    console.error('videoId is null, cannot load comments');
  }
  this.loadVideos()
}


initializeComponent(): void {
  const idString = this.route.snapshot.paramMap.get('id');
  if (idString) {
    this.videoId = Number(idString);
  }
}
}
