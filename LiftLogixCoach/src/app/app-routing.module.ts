import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from "./components/home/home.component";
import { RegisterComponent } from "./components/register/register.component";
import { DashboardComponent } from "./components/dashboard/dashboard.component";
import { LoginComponent } from "./components/login/login.component";
import { adminGuard, usersGuard } from "./guard/guard";
import { AdminDashboardComponent } from "./components/admin-dashboard/admin-dashboard.component";
import { ForgotPasswordComponent } from "./components/forgot-password/forgot-password.component";
import {ResetPasswordComponent} from "./components/reset-password/reset-password.component";

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [usersGuard]},
  { path: 'dashboard', component: AdminDashboardComponent, canActivate: [adminGuard]},
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
