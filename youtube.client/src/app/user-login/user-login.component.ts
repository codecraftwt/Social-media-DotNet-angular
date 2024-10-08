import { Component } from '@angular/core';
import { RegistrationService } from '../services/registration.service';
import { User } from '../model/User';
import { LoginUser } from '../model/LoginUser';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-login',
  templateUrl: './user-login.component.html',
  styleUrl: './user-login.component.css'
})
export class UserLoginComponent {
  user: LoginUser = {
  
    Email: '',
    Password: ''
};

errorMessage: string = '';
constructor(private registrationService: RegistrationService,private router: Router) {}

onSubmit(form: any) {
  debugger
  this.registrationService.login(this.user).subscribe(
    response => {
      debugger
      console.log(response)
      if (response.token) {
        // Handle successful login (e.g., store token, redirect)
        console.log('Login successful!', response);
        // Swal.fire({
        //   icon: 'success',
        //   title: 'Login successful!',
        //   text: 'Welcome back!',
        // }).then(() => {
          
        // });
        this.router.navigate(['/header']);
      } else {
        
        this.errorMessage = response.message;

        // Show error message
        Swal.fire({
          icon: 'error',
          title: 'Login failed',
          text: this.errorMessage,
        });
      }
    },
    error => {
      // Handle error from the API (e.g., server down, etc.)
      this.errorMessage = 'An error occurred. Please try again later.';

      // Show generic error message
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: this.errorMessage,
      });
    }
  );

}
}
