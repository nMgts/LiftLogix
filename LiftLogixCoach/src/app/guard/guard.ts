import {UserService} from "../services/user.service";
import {CanActivateFn, Router} from "@angular/router";
import {inject} from "@angular/core";

export const usersGuard: CanActivateFn = (route, state) => {
  if (inject(UserService).isAuthenticated()) {
    return true;
  }
  inject(Router).navigate(['/login'])
  return false
};

export const adminGuard: CanActivateFn = (route, state) => {
  if (inject(UserService).isAdmin()) {
    return true;
  }
  inject(Router).navigate(['/login'])
  return false
};
