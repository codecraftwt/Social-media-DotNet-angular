import { Component } from '@angular/core';
import { NgForm } from '@angular/forms'; // Import NgForm
import { RegistrationService } from '../services/registration.service';
import { User } from '../model/User';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'] // Corrected styleUrls
})
export class RegisterComponent {
  user: User = {
    Email: '',
    Fullname: '',
    Username: '',
    Password: '',
    ProfilePic: ''
  }

  constructor(private registrationService: RegistrationService) {}

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.user.ProfilePic = file.name; // Consider storing the actual file or blob instead
      console.log(this.user.ProfilePic);
    }
  }


  onSubmit(form: NgForm, fileInput: HTMLInputElement) {
    if (form.valid) {
      const formData = new FormData();
      formData.append('Email', this.user.Email);
      formData.append('Fullname', this.user.Fullname);
      formData.append('Username', this.user.Username);
      formData.append('Password', this.user.Password);

      const file = fileInput?.files?.[0];
      if (file) {
        formData.append('profilePic', file);
      }
      console.log( this.user.ProfilePic)
      debugger
      
      this.registrationService.CreateUser(formData).subscribe(response => {
        debugger
        console.log('Registration successful', response);
        Swal.fire({
          icon: 'success',
          title: 'Registration successful',
          text: 'You have registered successfully!',
        }).then(() => {
          
          form.reset();
          // Clear the file input
          if (fileInput) {
            fileInput.value = '';
          }
        });
      },
      error => {
        console.error('Registration failed', error);
        Swal.fire({
          icon: 'error',
          title: 'Registration failed',
          text: 'There was an error during registration. Please try again.',
        });
      }
    );
  } else {
    Swal.fire({
      icon: 'warning',
      title: 'Invalid form',
      text: 'Please fill out all required fields correctly.',
    });
  }
  }
}
