import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './register/register.component';
import { HeaderComponent } from './components/header/header.component';
import { UserLoginComponent } from './user-login/user-login.component';
import { VideoUploadComponent } from './video-upload/video-upload.component';
import { ProfileEditComponent } from './profile-edit/profile-edit.component';
import { UserVideoComponent } from './user-video/user-video.component';
import { ProfileComponent } from './profile/profile.component';
import { VideoDetailComponent } from './video-detail/video-detail.component';

const routes: Routes = [
  {path: 'register', component: RegisterComponent},
  {path:'header', component: HeaderComponent},
  {path:'', component: UserLoginComponent},
  {path:'upload', component:VideoUploadComponent},
  {path:'edit-profile', component:ProfileEditComponent},
  {path:'user-video', component:UserVideoComponent},
  {path:'profile', component:ProfileComponent},
  {
    path:'video/:id', component:VideoDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
