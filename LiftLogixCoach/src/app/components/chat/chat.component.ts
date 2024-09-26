import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ChatMessage } from "../../interfaces/ChatMessage";
import { ChatService } from "../../services/chat.service";
import { UserService } from "../../services/user.service";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent implements OnInit {
  @Input() senderId!: string;
  @Input() recipientId!: string;
  @Input() secondUserId!: string;
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  chatId: string = '';

  messages: ChatMessage[] = [];
  newMessageContent: string = '';
  senderImage: SafeUrl = '';
  recipientImage: SafeUrl = '';

  constructor(
    private chatService: ChatService,
    private userService: UserService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.chatId = `${this.senderId}_${this.recipientId}`;
    this.chatService.connectToChat(this.senderId);

    this.chatService.getMessageObservable().subscribe(message => {
      console.log('Received message:', message);
      this.messages.push(message);
      this.scrollToBottom();
    });

    this.loadUsersImages();
    this.loadMessages();
  }

  loadMessages() {
    this.chatService.fetchUserChat(this.senderId, this.recipientId).subscribe(messages => {
      this.messages = messages;
      this.scrollToBottom();
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

    this.userService.getUserImage(this.secondUserId, token).subscribe(
      (blob) => {
        const objectUrl = URL.createObjectURL(blob);
        this.recipientImage = this.sanitizer.bypassSecurityTrustUrl(objectUrl);
      },
      () => {
        this.recipientImage = '/icons/user.jpg';
      }
    )

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
        this.messages.push(message);
        this.scrollToBottom();
      },
      error: (err) => {
        console.error('Error sending message:', err);
      }
    });
  }

  markAllAsRead() {
    // Implementuj tę funkcjonalność, jeśli jest potrzebna
  }

  close() {
    // Możesz dodać funkcjonalność zamykania okna czatu, jeśli jest taka potrzeba
  }

  scrollToBottom() {
    const container = this.messagesContainer.nativeElement;
    setTimeout(() => {
      container.scrollTop = container.scrollHeight;;
    }, 5);
  }
}
