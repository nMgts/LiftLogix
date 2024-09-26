import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import { ChatMessage } from "../interfaces/ChatMessage";
import {Observable, Subject} from "rxjs";
import Stomp from 'stompjs';
import SockJS from 'sockjs-client';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private stompClient: any;
  private messageSubject = new Subject<any>();

  private baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}
/*
  connectToChat(senderId: string) {
    const socket = new SockJS(`${this.baseUrl}/ws`);
    this.stompClient = Stomp.over(socket);
    const token = localStorage.getItem('token') || '';

    this.stompClient.connect({ Authorization: `Bearer ${token}` }, () => {
      console.log('Connected with WebSocket');

      this.stompClient.subscribe(`/user/${senderId}/queue/messages`, (message: any) => {
        this.messageSubject.next(JSON.parse(message.body));
      });
    });
  }
*/


  connectToChat(senderId: string) {
    const socket = new SockJS('http://localhost:8080/ws');
    console.log('socket ' + socket)
    this.stompClient = Stomp.over(socket);
    const token = localStorage.getItem('token') || '';

    this.stompClient.connect(
      { Authorization: `Bearer ${token}` },
      () => {
        console.log('Connected with WebSocket');

        this.stompClient.subscribe(`/user/${senderId}/queue/messages`, (message: any) => {
          console.log('Received message:', message);
          this.messageSubject.next(JSON.parse(message.body));
        });
      },
      (error: any) => {
        console.error('WebSocket connection error:', error);
      }
    );

    socket.onopen = () => {
      console.log('WebSocket connection opened');
    };

    socket.onclose = () => {
      console.log('WebSocket connection closed');
    };

    socket.onerror = (event) => {
      console.error('WebSocket error:', event);
    };
  }

  onMessageReceived(): Observable<any> {
    return this.messageSubject.asObservable();
  }

  sendMessage(chatMessage: any): void {
    this.stompClient.send(
      '/app/chat',
      {},
      JSON.stringify(chatMessage)
    );
  }

  getChatMessages(senderId: string, recipientId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/messages/${senderId}/${recipientId}`);
  }

  // Oznaczanie wiadomości jako przeczytane
  markMessagesAsRead(chatId: string): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/messages/${chatId}/read`, {});
  }

  /*
  connect(recipientId: string, event: Event, token: string) {
    event.preventDefault();
    if (this.senderId !== '') {
      const socket = new SockJS('/ws');
      const headers = this.createHeaders(token);
      this.socketClient = Stomp.over(socket);
      this.recipientId = recipientId;

      this.socketClient.connect({ headers }, () => {
        console.log('connecting to ws...')
      });
    }
  }

  onConnected() {
    this.socketClient.subscribe(`/user/${this.recipientId}/queue/messages`, this.onMessageReceived())

    this.socketClient.send('app/user.addUser',
      {},
      JSON.stringify({ email: this.senderId })
    );
    //this.findAndDisplayConnectedUsers().then();

  }

  async findAndDisplayConnectedUsers() {
    const connectedUserResponse = await fetch('/users');
    let connectedUsers = await connectedUserResponse.json();
    connectedUsers = connectedUsers.filter(user => user.email !== this.senderId);

  }
  onMessageReceived() {

  }

  getChatMessages(senderId: string, recipientId: string): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(`${this.baseUrl}/messages/${senderId}/${recipientId}`);
  }

  sendMessage(chatMessage: ChatMessage): void {
    // Implementacja wysyłania wiadomości przez WebSocket
    const socket = new WebSocket('ws://localhost:8080/ws'); // Upewnij się, że adres URL jest poprawny
    socket.onopen = () => {
      socket.send(JSON.stringify(chatMessage));
    };
  }

  private createHeaders(token: string) {
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }
  */

}
