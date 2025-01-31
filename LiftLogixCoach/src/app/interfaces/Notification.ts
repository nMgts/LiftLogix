export interface Notification {
  id: number,
  type: string,
  senderId: string,
  recipientId: string,
  itemId: number,
  timestamp: Date,
  read: boolean;
}
