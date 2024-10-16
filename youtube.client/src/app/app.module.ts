import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { RouterModule } from '@angular/router';
import { RegisterComponent } from './register/register.component';
import { FormsModule } from '@angular/forms';
import { UserLoginComponent } from './user-login/user-login.component';
import { VideoUploadComponent } from './video-upload/video-upload.component';
import { ProfileEditComponent } from './profile-edit/profile-edit.component';
import { UserVideoComponent } from './user-video/user-video.component';
import { ProfileComponent } from './profile/profile.component';
import { VideoDetailComponent } from './video-detail/video-detail.component';


@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    RegisterComponent,
    UserLoginComponent,
    VideoUploadComponent,
    ProfileEditComponent,
    UserVideoComponent,
    ProfileComponent,
    VideoDetailComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    AppRoutingModule,
    
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
