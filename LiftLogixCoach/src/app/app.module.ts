import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from "./components/home/home.component";
import { NgOptimizedImage } from "@angular/common";
import { RegisterComponent } from './components/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HTTP_INTERCEPTORS, HttpClientModule } from "@angular/common/http";
import { LoginComponent } from './components/login/login.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ApplicationDetailsDialogComponent } from './components/application-details-dialog/application-details-dialog.component';
import { MatDialogModule } from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatPaginatorModule } from "@angular/material/paginator";
import { ApplicationsComponent } from './components/applications/applications.component';
import { EditProfileDialogComponent } from './components/edit-profile-dialog/edit-profile-dialog.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { ConfirmEmailComponent } from './components/confirm-email/confirm-email.component';
import { TokenInterceptorService } from "./services/token-interceptor.service";
import { SecurityOptionsDialogComponent } from './components/security-options-dialog/security-options-dialog.component';
import { CdkDropList } from "@angular/cdk/drag-drop";
import { MatListModule } from "@angular/material/list";
import { ClientsComponent } from './components/clients/clients.component';
import { ExercisesComponent } from './components/exercises/exercises.component';
import { ExerciseDetailsDialogComponent } from './components/exercise-details-dialog/exercise-details-dialog.component';
import { AddExerciseDialogComponent } from './components/add-exercise-dialog/add-exercise-dialog.component';
import { MatFormFieldModule} from "@angular/material/form-field";
import { MatSelectModule} from "@angular/material/select";
import { MatInputModule} from "@angular/material/input";
import { YoutubeEmbedPipe } from './pipes/youtube-embed.pipe';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    RegisterComponent,
    DashboardComponent,
    LoginComponent,
    NavbarComponent,
    FooterComponent,
    AdminDashboardComponent,
    ApplicationDetailsDialogComponent,
    ApplicationsComponent,
    EditProfileDialogComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    ConfirmEmailComponent,
    SecurityOptionsDialogComponent,
    ClientsComponent,
    ExercisesComponent,
    ExerciseDetailsDialogComponent,
    AddExerciseDialogComponent,
    YoutubeEmbedPipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgOptimizedImage,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    CdkDropList,
    MatListModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule
  ],
  providers: [
    provideAnimationsAsync(),
    //provideHttpClient(withInterceptors([tokenInterceptor]))
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptorService,
      multi: true
    },
    [YoutubeEmbedPipe]
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
