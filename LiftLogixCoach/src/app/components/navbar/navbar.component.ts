import { Component, ElementRef, EventEmitter, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import { EditProfileDialogComponent } from "../edit-profile-dialog/edit-profile-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { AuthService } from "../../services/auth.service";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { UserService } from "../../services/user.service";
import { SecurityOptionsDialogComponent } from "../security-options-dialog/security-options-dialog.component";
import { ChatService } from "../../services/chat.service";
import { ChatMessage } from "../../interfaces/ChatMessage";
import { User } from "../../interfaces/User";
import { NotificationService } from "../../services/notification.service";
import { Notification } from "../../interfaces/Notification";
import { ReportDetailsDialogComponent } from "../report-details-dialog/report-details-dialog.component";
import { ReportService } from "../../services/report.service";
import { ApplicationService } from "../../services/application.service";
import { ApplicationDetailsDialogComponent } from "../application-details-dialog/application-details-dialog.component";

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {
  @ViewChild('messagesDropdown', { static: true }) messagesDropdown!: ElementRef;
  @Output() openChat = new EventEmitter<User>();
  scrollTimeout: any;

  menuOpen = false;
  notificationsOpen = false;
  messagesOpen = false;
  settingsOpen = false;
  image: SafeUrl = '';

  userEmail = localStorage.getItem('email') || '';
  messages: ChatMessage[] = [];
  usersMap: Map<string, [User, SafeUrl]> = new Map();
  openedChat: string = '';

  notifications: Notification[] = [];

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private chatService: ChatService,
    private notificationService: NotificationService,
    private reportService: ReportService,
    private applicationService: ApplicationService,
    private dialog: MatDialog,
    private sanitizer: DomSanitizer,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    this.chatService.connectToChat(this.userEmail);

    this.loadImage();
    this.userService.imageUpdated$.subscribe(() => {
      this.loadImage();
    });

    this.loadMessages();

    this.chatService.getOpenChats().subscribe(chat => {
      this.openedChat = chat;
    });

    this.chatService.getMessageObservable().subscribe(message => {
      this.handleNewMessage(message);
    });

    this.notificationService.connectToNotification(this.userEmail);

    this.loadNotifications();

    this.notificationService.getNotificationObservable().subscribe(notification => {
      this.handleNewNotification(notification);
    })
  }

  loadImage() {
    const id = localStorage.getItem('id') || '0';
    const token = localStorage.getItem('token') || '';
    this.userService.getUserImage(id, token).subscribe(
      (blob) => {
        const objectURL = URL.createObjectURL(blob);
        this.image = this.sanitizer.bypassSecurityTrustUrl(objectURL);
      },
      () => {
        this.image = '/icons/user.jpg';
      }
    );
  }

  handleNewMessage(newMessage: ChatMessage) {
    const recipientId = newMessage.recipientId;
    const senderId = newMessage.senderId;

    const existingMessageIndex = this.messages.findIndex(message =>
        (message.recipientId === recipientId && message.senderId === senderId) ||
        (message.recipientId === senderId && message.senderId === recipientId)
    );

    newMessage.read = this.openedChat === newMessage.senderId;

    if (existingMessageIndex !== -1) {
      this.messages[existingMessageIndex] = newMessage;
    } else {
      this.messages.push(newMessage);
    }
  }

  handleNewNotification(newNotification: Notification) {
    this.notifications.push(newNotification);
  }

  toggleMenu() {
    if (this.notificationsOpen) {
      this.markAllNotificationsAsRead();
    }
    this.menuOpen = !this.menuOpen;
    this.notificationsOpen = false;
    this.settingsOpen = false;
    this.messagesOpen = false;
  }

  toggleSettings() {
    if (this.notificationsOpen) {
      this.markAllNotificationsAsRead();
    }
    this.settingsOpen = !this.settingsOpen;
    this.menuOpen = false;
    this.notificationsOpen = false;
    this.messagesOpen = false;
  }

  toggleMessages() {
    if (this.notificationsOpen) {
      this.markAllNotificationsAsRead();
    }
    this.messagesOpen = !this.messagesOpen;
    this.settingsOpen = false;
    this.notificationsOpen = false;
    this.menuOpen = false;
  }

  toggleNotifications() {
    if (this.notificationsOpen) {
      this.markAllNotificationsAsRead();
    }
    this.notificationsOpen = !this.notificationsOpen;
    this.settingsOpen = false;
    this.messagesOpen = false;
    this.menuOpen = false;
  }

  onChatOpen(senderId: string, recipientId: string) {
    const user = this.getUser(senderId, recipientId);
    if (user) {
      this.messagesOpen = false;
      this.openChat.emit(user);
    } else {
      console.warn('Cannot open chat with an unknown user.');
    }
  }

  openNotificationDetails(notification: Notification) {
    const token = localStorage.getItem('token') || '';
    switch (notification.type) {
      case 'REPORT':
        this.reportService.getReportById(notification.itemId, token).subscribe(
          report => {
            this.dialog.open(ReportDetailsDialogComponent, {
              width: '600px',
              data: report
            })
          }, () => {
            console.error('Error during opening report');
          }
        )
        this.toggleNotifications();
        break;
      case 'APPLICATION':
        this.applicationService.getApplication(notification.itemId, token).subscribe(
          application => {
            this.dialog.open(ApplicationDetailsDialogComponent, {
              data: application,
              width: '600px'
            });
          }, () => {
            console.error('Error during opening application');
          }
        )
        this.toggleNotifications();
        break;
      default:
        break;
    }
  }

  markMessageAsRead(message: ChatMessage) {
    message.read = true;
  }

  markNotificationAsRead(notification: Notification) {
    notification.read = true;
    this.notificationService.markNotificationAsRead(notification.id).subscribe(
      () => console.log('Notification marked successfully'),
      () => console.error('Error during marking notification as read')
    );
  }

  markAllNotificationsAsRead() {
    this.notificationService.markAllNotificationsAsRead(this.userEmail).subscribe(
      () => {
        this.notifications.forEach(notification => notification.read = true);
      }, () => {
        console.error("Error during marking notifications");
      }
    );
  }

  loadMessages() {
    this.chatService.fetchRecentChatMessages(this.userEmail).subscribe(
      (messages) => {
        this.messages = messages;
        this.loadUsersForMessages(messages);
      }
    )
  }

  loadNotifications() {
    this.notificationService.fetchRecentNotifications(this.userEmail).subscribe(
      (notifications) => {
        this.notifications = notifications;
      }
    )
  }

  loadUsersForMessages(messages: ChatMessage[]): void {
    messages.forEach(message => {
      const token = localStorage.getItem('token') || '';
      const myEmail = localStorage.getItem('email') || '';
      const email = message.senderId === myEmail ? message.recipientId : message.senderId;

      if (!this.usersMap.has(email)) {
        this.userService.getUserByEmail(email, token).subscribe(
          (user) => {
            this.userService.getUserImage(user.id.toString(), token).subscribe(
              (blob) => {
                const objectURL = URL.createObjectURL(blob);
                const safeUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);

                this.usersMap.set(email, [user, safeUrl]);
              },
              () => {
                this.usersMap.set(email, [user, '/icons/user.jpg']);
              }
            );
          },
          () => {
            console.error(`User not found: ${email}`);
          }
        );
      }
    });
  }

  getMessageClass(message: ChatMessage) {
    return !message.read && message.senderId !== localStorage.getItem('email');
  }

  countUnreadMessages() {
    return this.messages.filter(message => !message.read && message.senderId !== this.userEmail).length;
  }

  getNotificationClass(notification: Notification) {
    return !notification.read;
  }

  countUnreadNotifications() {
    return this.notifications.filter(notification => !notification.read).length;
  }

  getNotificationType(notification: Notification) {
    switch (notification.type) {
      case 'REPORT':
        return 'Raport';
      case 'APPLICATION':
        return 'Zgłoszenie';
      default:
        return 'Powiadomienie';
    }
  }

  getNotificationText(notification: Notification) {
    switch (notification.type) {
      case 'REPORT':
        return `Klient ${notification.senderId} stworzył/edytował raport.`
      case 'APPLICATION':
        return `Otrzymano nowe zgłoszenie od ${notification.senderId}`
      default:
        return '';
    }
  }

  getUserEntry(senderId: string, recipientId: string) {
    const myEmail = localStorage.getItem('email') || '';
    const email = myEmail === senderId ? recipientId : senderId;
    return this.usersMap.get(email);
  }

  getUser(senderId: string, recipientId: string): User | null {
    const userEntry = this.getUserEntry(senderId, recipientId);
    if (userEntry) {
      return userEntry[0];
    }
    console.warn(`User entry not found for senderId: ${senderId}, recipientId: ${recipientId}`);
    return null;
  }

  getUserName(senderId: string, recipientId: string): string {
    const userEntry = this.getUserEntry(senderId, recipientId);
    return userEntry ? `${userEntry[0].first_name} ${userEntry[0].last_name}` : 'Nieznany użytkownik';
  }

  getUserImage(senderId: string, recipientId: string): SafeUrl {
    const userEntry = this.getUserEntry(senderId, recipientId);
    return userEntry ? userEntry[1] : '/icons/user.jpg';
  }

  toggleLanguage() {
  }

  toggleDarkMode() {
  }

  goToProfile() {
    this.menuOpen = false;
    const dialogRef = this.dialog.open(EditProfileDialogComponent, {
      width: '360px',
      height: '600px',
      panelClass: 'custom-dialog-container'
    });
  }

  goToSecurity() {
    this.settingsOpen = false;
    const dialogRef = this.dialog.open(SecurityOptionsDialogComponent, {
      width: '360px',
      height: '600px',
      panelClass: 'custom-dialog-container'
    });
  }

  logOut() {
    this.authService.logout();
  }

  onScroll(event: Event): void {
    const target = event.target as HTMLElement;

    if (target) {
      this.renderer.addClass(document.body, 'show-scrollbar');

      clearTimeout(this.scrollTimeout);

      this.scrollTimeout = setTimeout(() => {
        this.renderer.removeClass(document.body, 'show-scrollbar');
      }, 3000);
    }
  }
}
