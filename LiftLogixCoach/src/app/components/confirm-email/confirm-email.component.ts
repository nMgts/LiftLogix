import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { EmailService } from "../../services/email.service";

@Component({
  selector: 'app-confirm-email',
  templateUrl: './confirm-email.component.html',
  styleUrl: './confirm-email.component.scss'
})
export class ConfirmEmailComponent implements OnInit {
  message: string | undefined = '';
  error: string = '';

  constructor(private route: ActivatedRoute, private emailService: EmailService, private router: Router) {}

  ngOnInit() {
    this.route.queryParams.subscribe(async params => {
      const token = params['token'];
      try {
        this.message = await this.emailService.confirmEmail(token).toPromise();
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
