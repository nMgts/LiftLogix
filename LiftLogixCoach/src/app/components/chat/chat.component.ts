import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ChatMessage } from "../../interfaces/ChatMessage";
import { ChatService } from "../../services/chat.service";

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent implements OnInit {
  @Input() senderId!: string;
  @Input() recipientId!: string;
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  chatId: string = '';

  messages: ChatMessage[] = [];
  newMessageContent: string = '';

  constructor(private chatService: ChatService) {}

  ngOnInit(): void {
    this.chatId = `${this.senderId}_${this.recipientId}`;
    this.chatService.connectToChat(this.senderId);

    this.chatService.getMessageObservable().subscribe(message => {
      console.log('Received message:', message);
      this.messages.push(message);
      this.scrollToBottom();
    });

    this.loadMessages();
  }

  loadMessages(): void {
    this.chatService.fetchUserChat(this.senderId, this.recipientId).subscribe(messages => {
      this.messages = messages;
      this.scrollToBottom();
    });
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

  markAllAsRead(): void {
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
