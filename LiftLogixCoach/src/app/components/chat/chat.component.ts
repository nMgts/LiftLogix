import { Component, Input, OnInit } from '@angular/core';
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
  chatId: string = '';

  messages: ChatMessage[] = [];
  newMessageContent: string = '';

  constructor(private chatService: ChatService) {}

  ngOnInit(): void {
    this.chatId = this.senderId + '_' + this.recipientId;
    this.chatService.connectToChat(this.senderId);

    this.chatService.onMessageReceived().subscribe(message => {
      this.messages.push(message);
    });

    this.loadMessages();
  }

  loadMessages(): void {
    this.chatService.getChatMessages('senderId', 'recipientId').subscribe(messages => {
      this.messages = messages;
    });
  }


  sendMessage(): void {
    const message = {
      senderId: this.senderId,
      recipientId: this.recipientId,
      content: this.newMessageContent
    };

    this.chatService.sendMessage(message);
    this.newMessageContent = '';
  }

  markAllAsRead(): void {
    this.chatService.markMessagesAsRead(this.chatId).subscribe(() => {
      console.log('Wiadomości oznaczone jako przeczytane');
    });
  }

  close() {

  }
}
