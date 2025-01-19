import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from "./components/home/home.component";
import { RegisterComponent } from "./components/register/register.component";
import { DashboardComponent } from "./components/dashboard/dashboard.component";
import { LoginComponent } from "./components/login/login.component";
import { adminGuard, usersGuard } from "./guard/guard";
import { AdminDashboardComponent } from "./components/admin-dashboard/admin-dashboard.component";
import { ForgotPasswordComponent } from "./components/forgot-password/forgot-password.component";
import { ResetPasswordComponent } from "./components/reset-password/reset-password.component";
import { ConfirmEmailComponent } from "./components/confirm-email/confirm-email.component";
import {StatueComponent} from "./components/statue/statue.component";
import {AboutUsComponent} from "./components/about-us/about-us.component";
import {FunctionalityComponent} from "./components/functionality/functionality.component";
import {ContactComponent} from "./components/contact/contact.component";

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [usersGuard]},
  { path: 'dashboard', component: AdminDashboardComponent, canActivate: [adminGuard]},
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'confirm-mail', component: ConfirmEmailComponent },
  { path: 'statue', component: StatueComponent },
  { path: 'about', component: AboutUsComponent },
  { path: 'functionality', component: FunctionalityComponent },
  { path: 'contact', component: ContactComponent },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
