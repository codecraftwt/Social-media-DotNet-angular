import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { User } from '../model/User';
import { RegistrationService } from '../services/registration.service';
import { AuthService } from '../services/AuthService ';
import { EditProfile } from '../model/EditProfile';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-profile-edit',
  templateUrl: './profile-edit.component.html',
  styleUrl: './profile-edit.component.css'
})
export class ProfileEditComponent {
  user: EditProfile = {
    id:0,
    email: '',
    fullName: '',
    userName: '',
    profilePic:''
  };
  
  selectedFile: File | null = null;

  constructor(private registrationService: RegistrationService,private authService: AuthService) {}

  ngOnInit() {
    const userId = this.authService.getUserId();
    if (userId !== null) {
    this.getUserData(userId);
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
  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.selectedFile = input.files[0];
      this.user.profilePic = this.selectedFile.name;
    }
  }

  onSubmit(form: NgForm) {
   
    if (form.valid) {
        const formData = new FormData();
        formData.append('email', this.user.email);
        formData.append('fullname', this.user.fullName);
        formData.append('username', this.user.userName);

        if (this.selectedFile) {
            formData.append('profilePicture', this.selectedFile, this.selectedFile.name);
        }

        const userId = this.authService.getUserId();
        if (userId !== null) {
            this.registrationService.updateUser(userId, formData).subscribe(
                response => {
                    console.log('Profile updated successfully:', response);
                    Swal.fire({
                      icon: 'success',
                      title: 'Profile updated successfully',
                      text: 'Your profile has been updated!',
                    });
                },
                error => {
                    console.error('Error updating profile:', error);
                    Swal.fire({
                      icon: 'error',
                      title: 'Update Failed',
                      text: error?.message || 'There was an error during the update. Please try again.',
                    });
                }
            );
        } else {
            console.error('User ID is null. Cannot update profile.');
            Swal.fire({
              icon: 'warning',
              title: 'Invalid form',
              text: 'Please fill out all required fields correctly.',
            });
        }
    }
}


  getFileName(filePath: string): string {
    return filePath.split('/').pop() || filePath; 
  }
}
