import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { ChatMessage } from "../interfaces/ChatMessage";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import Stomp from 'stompjs';
import SockJS from 'sockjs-client';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private baseUrl = 'http://localhost:8080/api/chat';

  private stompClient: any;
  private messageSubject = new Subject<ChatMessage>();

  private openChat: string = '';
  private openChatsSubject = new BehaviorSubject<string>('');

  constructor(private http: HttpClient) {}

  addChat(recipientId: string): void {
    if (this.openChat !== recipientId) {
      this.openChat = recipientId;
      this.openChatsSubject.next(this.openChat);
    }
  }

  removeChat(): void {
    this.openChat = '';
    this.openChatsSubject.next(this.openChat);
  }

  getOpenChats() {
    return this.openChatsSubject.asObservable();
  }

  connectToChat(senderId: string) {
    if (this.stompClient && this.stompClient.connected) {
      return;
    }

    const socket = new SockJS('http://localhost:8080/ws');
    this.stompClient = Stomp.over(socket);

    this.stompClient.connect({}, () => {
      console.log('Connected to WebSocket');
      this.onConnected(senderId);
    }, (error: any) => {
      console.error('WebSocket error:', error);
    });
  }

  onConnected(senderId: string) {
    this.stompClient.subscribe(`/user/${senderId}/queue/messages`, (message: any) => {
      this.onMessageReceived(JSON.parse(message.body));
    });
  }

  onMessageReceived(message: ChatMessage) {
    this.messageSubject.next(message);
  }

  getMessageObservable(): Observable<ChatMessage> {
    return this.messageSubject;
  }

  fetchUserChat(senderId: string, recipientId: string): Observable<ChatMessage[]> {
    const headers = this.createHeaders();
    return this.http.get<ChatMessage[]>(`${this.baseUrl}/messages/${senderId}/${recipientId}`, {  headers: headers });
  }

  sendMessage(message: ChatMessage): Observable<void> {
    return new Observable<void>(observer => {
      if (this.stompClient && this.stompClient.connected) {
        this.stompClient.send('/app/chat', {}, JSON.stringify(message));
        console.log('Message sent:', message);
        this.messageSubject.next(message);
        observer.next();
        observer.complete();
      } else {
        console.error('WebSocket connection is not established yet.');
        observer.error('WebSocket not connected');
      }
    });
  }

  fetchRecentChatMessages(senderId: string): Observable<ChatMessage[]> {
    const headers = this.createHeaders();
    return this.http.get<ChatMessage[]>(`${this.baseUrl}/messages/recent/${senderId}`, { headers: headers });
  }

  markMessagesAsRead(senderId: string, recipientId: string): Observable<any> {
    const headers = this.createHeaders();
    return this.http.put(`${this.baseUrl}/messages/${senderId}/${recipientId}/read`, {}, { headers: headers });
  }

  private createHeaders() {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }
}
