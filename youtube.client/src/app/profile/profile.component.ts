import { Component } from '@angular/core';
import { RegistrationService } from '../services/registration.service';
import { AuthService } from '../services/AuthService ';
import { EditProfile } from '../model/EditProfile';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {

  user: EditProfile = {
    id:0,
    email: '',
    fullName: '',
    userName: '',
    profilePic:''
  };
  userProfilePic: string | undefined;
  
  selectedFile: File | null = null;

  constructor(private registrationService: RegistrationService,private authService: AuthService,private router: Router) {}
  
  ngOnInit() {
    const userId = this.authService.getUserId();
    if (userId !== null) {
    this.getUserData(userId);
    }
    this.loadUserProfile();
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


  customizeChannel(){
    this.router.navigate(['/edit-profile']);
  }

  manageVideos(){
    this.router.navigate(['/upload']);
  }
}
