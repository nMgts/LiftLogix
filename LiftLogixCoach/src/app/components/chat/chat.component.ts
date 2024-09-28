import {
  Component,
  ElementRef,
  EventEmitter,
  Input, OnChanges,
  OnDestroy,
  Output,
  Renderer2,
  ViewChild
} from '@angular/core';
import { ChatMessage } from "../../interfaces/ChatMessage";
import { ChatService } from "../../services/chat.service";
import { UserService } from "../../services/user.service";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { User } from "../../interfaces/User";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent implements OnChanges, OnDestroy {
  @Input() senderId!: string;
  @Input() recipientId!: string;
  @Output() closeChat = new EventEmitter<string>();
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  scrollTimeout: any;

  chatId: string = '';
  secondUser: User | null = null;

  private messageSubscription!: Subscription;
  messages: ChatMessage[] = [];
  newMessageContent: string = '';
  senderImage: SafeUrl = '';
  recipientImage: SafeUrl = '';

  constructor(
    private chatService: ChatService,
    private userService: UserService,
    private sanitizer: DomSanitizer,
    private renderer: Renderer2
  ) {}

  ngOnChanges() {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }

    this.chatId = `${this.senderId}_${this.recipientId}`;
    this.chatService.addChat(this.recipientId);

    this.messageSubscription = this.chatService.getMessageObservable().subscribe(message => {
      this.messages.push(message);
      this.scrollToBottom();
      this.markMessagesAsRead();
    });

    this.getSecondUser();
    this.loadMessages();
  }

  ngOnDestroy() {
    this.messageSubscription.unsubscribe();
    this.chatService.removeChat();
  }

  getSecondUser() {
    const token = localStorage.getItem('token') || '';
    this.userService.getUserByEmail(this.recipientId, token).subscribe(
      (user) => {
        this.secondUser = user;
        this.loadUsersImages();
      },
      () => {
        console.error("Second User not found");
        this.loadUsersImages();
      }
    )
  }

  getSecondUserName() {
    return this.secondUser ? `${this.secondUser.first_name} ${this.secondUser.last_name}` : 'Nieznany użytkownik';
  }

  loadMessages() {
    this.chatService.fetchUserChat(this.senderId, this.recipientId).subscribe(messages => {
      this.messages = messages;
      this.scrollToBottom();
      this.markMessagesAsRead();
    });
  }

  loadUsersImages() {
    const token = localStorage.getItem('token') || '';
    const myId = localStorage.getItem('id') || '';
    this.userService.getUserImage(myId, token).subscribe(
      (blob) => {
        const objectURL = URL.createObjectURL(blob);
        this.senderImage = this.sanitizer.bypassSecurityTrustUrl(objectURL);
      },
      () => {
        this.senderImage = '/icons/user.jpg';
      }
    );

    if (this.secondUser) {
      this.userService.getUserImage(this.secondUser.id.toString(), token).subscribe(
        (blob) => {
          const objectUrl = URL.createObjectURL(blob);
          this.recipientImage = this.sanitizer.bypassSecurityTrustUrl(objectUrl);
        },
        () => {
          this.recipientImage = '/icons/user.jpg';
        }
      )
    }
  }

  markMessagesAsRead() {
    this.chatService.markMessagesAsRead(this.senderId, this.recipientId).subscribe(
      () => {
        console.log('Successfully marked messages as read');
      },
      () => {
        console.error('Cannot mark messages as read');
      }
    );
  }

  sendMessage(): void {
    const message: ChatMessage = {
      chatId: this.chatId,
      senderId: this.senderId,
      recipientId: this.recipientId,
      content: this.newMessageContent,
      timestamp: new Date(),
      read: false
    };

    this.chatService.sendMessage(message).subscribe({
      next: () => {
        this.newMessageContent = '';
      },
      error: (err) => {
        console.error('Error sending message:', err);
      }
    });
  }

  close() {
    this.messageSubscription.unsubscribe();
    this.chatService.removeChat();
    this.closeChat.emit(this.recipientId);
  }

  scrollToBottom() {
    const container = this.messagesContainer.nativeElement;
    setTimeout(() => {
      container.scrollTop = container.scrollHeight;
    }, 5);
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
