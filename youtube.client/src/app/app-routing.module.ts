import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './register/register.component';
import { HeaderComponent } from './components/header/header.component';
import { UserLoginComponent } from './user-login/user-login.component';
import { VideoUploadComponent } from './video-upload/video-upload.component';

const routes: Routes = [
  {path: 'register', component: RegisterComponent},
  {path:'header', component: HeaderComponent},
  {path:'', component: UserLoginComponent},
  {path:'upload', component:VideoUploadComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
