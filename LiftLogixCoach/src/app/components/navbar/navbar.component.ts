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
  messagesOpen = false;
  settingsOpen = false;
  image: SafeUrl = '';

  userEmail = localStorage.getItem('email') || '';
  messages: ChatMessage[] = [];
  usersMap: Map<string, [User, SafeUrl]> = new Map();
  openedChat: string = '';

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private chatService: ChatService,
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

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
    this.settingsOpen = false;
    this.messagesOpen = false;
  }

  toggleSettings() {
    this.settingsOpen = !this.settingsOpen;
    this.menuOpen = false;
    this.messagesOpen = false;
  }

  toggleMessages() {
    this.messagesOpen = !this.messagesOpen;
    this.settingsOpen = false;
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

  markMessageAsRead(message: ChatMessage) {
    message.read = true;
  }

  loadMessages() {
    const senderId = localStorage.getItem('email') || '';
    this.chatService.fetchRecentChatMessages(senderId).subscribe(
      (messages) => {
        this.messages = messages;
        this.loadUsersForMessages(messages);
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
