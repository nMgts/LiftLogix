import {
  AfterViewInit,
  Component,
  ElementRef, EventEmitter,
  HostListener,
  Inject,
  Output,
  Renderer2,
  ViewChild
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { Application } from "../../interfaces/Application";
import { ApplicationService } from "../../services/application.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Client } from "../../interfaces/Client";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { User } from "../../interfaces/User";

@Component({
  selector: 'app-application-details-dialog',
  templateUrl: './application-details-dialog.component.html',
  styleUrl: './application-details-dialog.component.scss'
})
export class ApplicationDetailsDialogComponent implements AfterViewInit {
  @Output() openChat = new EventEmitter<User>();
  @ViewChild('dialog', { static: true }) dialog!: ElementRef;
  scrollTimeout: any;

  private readonly defaultImageUrl: string = '/icons/user.jpg';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Application,
    public dialogRef: MatDialogRef<ApplicationDetailsDialogComponent>,
    private applicationService: ApplicationService,
    private snackBar: MatSnackBar,
    private renderer: Renderer2,
    private sanitizer: DomSanitizer
  ) {}

  ngAfterViewInit(): void {
    this.renderer.listen(this.dialog.nativeElement, 'scroll', () => {
      this.onWindowScroll();
    });
  }

  onChatOpen(): void {
    const user: User = {
      id: this.data.client.id,
      first_name: this.data.client.first_name,
      last_name: this.data.client.last_name,
      email: this.data.client.email,
      role: 'CLIENT'
    }
    this.openChat.emit(user);
    this.close();
  }

  accept(applicationId: number): void {
    const token = localStorage.getItem('token') || '';
    this.applicationService.acceptApplication(applicationId, token).subscribe(
      () => {
        this.dialogRef.close();
        this.openSnackBar('Zgłoszenie przyjęte - dodano nowego klienta');
      },
      (error: any) => console.error('Error accepting application', error)
    );
  }

  reject(applicationId: number): void {
    const token = localStorage.getItem('token') || '';
    this.applicationService.rejectApplication(applicationId, token).subscribe(
      () => {
        this.dialogRef.close();
        this.openSnackBar('Zgłoszenie odrzucone');
      },
      (error: any) => console.error('Error rejecting application', error)
    );
  }

  getSafeImageUrl(client: Client): SafeUrl {
    if (client.image) {
      return this.sanitizer.bypassSecurityTrustUrl(client.image);
    } else {
      return this.sanitizer.bypassSecurityTrustUrl(this.defaultImageUrl);
    }
  }

  private openSnackBar(message: string): void {
    this.snackBar.open(message, 'Zamknij', {
      duration: 3000,
      verticalPosition: 'top'
    });
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {

    this.renderer.addClass(document.body, 'show-scrollbar');

    clearTimeout(this.scrollTimeout);
    this.scrollTimeout = setTimeout(() => {
      this.renderer.removeClass(document.body, 'show-scrollbar');
    }, 3000);
  }

  close() {
    this.dialogRef.close();
  }
}
