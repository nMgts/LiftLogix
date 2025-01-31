import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, Subject } from "rxjs";
import SockJS from "sockjs-client";
import Stomp from "stompjs";
import { Notification } from "../interfaces/Notification";

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private baseUrl = 'http://localhost:8080/api/notification';
  private markAsReadUrl = 'http://localhost:8080/api/notification/mark-as-read';
  private markAllAsReadUrl = 'http://localhost:8080/api/notification/mark-as-read/all';

  private stompClient: any;
  private notificationSubject = new Subject<Notification>();

  constructor(private http: HttpClient) {}

  connectToNotification(userId: string) {
    if (this.stompClient && this.stompClient.connected) {
      return;
    }

    const socket = new SockJS('http://localhost:8080/ws');
    this.stompClient = Stomp.over(socket);

    this.stompClient.connect({}, () => {
      console.log('Connected to WebSocket notification');
      this.onConnected(userId);
    }, (error: any) => {
      console.error('WebSocket error:', error);
    });
  }

  onConnected(userId: string) {
    this.stompClient.subscribe(`/user/${userId}/queue/notifications`, (notifications: any) => {
      this.onNotificationReceived(JSON.parse(notifications.body));
    });
  }

  onNotificationReceived(notification: Notification) {
    console.log('New notification received:', notification);
    this.notificationSubject.next(notification)
  }

  getNotificationObservable(): Observable<Notification> {
    return this.notificationSubject;
  }

  fetchRecentNotifications(userId: string): Observable<Notification[]> {
    const headers = this.createHeaders();
    return this.http.get<Notification[]>(`${this.baseUrl}/${userId}`, { headers: headers });
  }

  markNotificationAsRead(notificationId: number): Observable<any> {
    const headers = this.createHeaders();
    return this.http.put(`${this.markAsReadUrl}/${notificationId}`, {}, { headers: headers });
  }

  markAllNotificationsAsRead(recipientId: string): Observable<any> {
    const headers = this.createHeaders();
    return this.http.put(`${this.markAllAsReadUrl}/${recipientId}`, {}, { headers: headers });
  }

  private createHeaders() {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }
}
