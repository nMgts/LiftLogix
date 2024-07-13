import {Component, OnInit} from '@angular/core';
import {UserService} from "../../services/user.service";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-confirm-email',
  templateUrl: './confirm-email.component.html',
  styleUrl: './confirm-email.component.scss'
})
export class ConfirmEmailComponent implements OnInit {
  message: string | undefined = '';
  error: string = '';

  constructor(private route: ActivatedRoute, private userService: UserService, private router: Router) {}

  ngOnInit() {
    this.route.queryParams.subscribe(async params => {
      const token = params['token'];
      try {
        this.message = await this.userService.confirmEmail(token).toPromise();
      } catch (error) {
        console.error(error);
        this.error = 'Wystąpił nieoczekiwany błąd';
      }
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 3000);
    });
  }
}
