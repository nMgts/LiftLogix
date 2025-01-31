package com.liftlogix.services;

import com.liftlogix.models.notification.Notification;
import com.liftlogix.models.notification.NotificationType;
import com.liftlogix.repositories.NotificationRepository;
import lombok.AllArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
@AllArgsConstructor
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public Notification createNotification(String senderId, String recipientId, long itemId, NotificationType type) {
        Notification notification = Notification.builder()
                .senderId(senderId)
                .recipientId(recipientId)
                .itemId(itemId)
                .type(type)
                .timestamp(new Date())
                .read(false)
                .build();

        notificationRepository.save(notification);

        messagingTemplate.convertAndSendToUser(
                recipientId, "/queue/notifications", notification
        );

        return notification;
    }

    public List<Notification> getNotificationsForUser(String recipientId) {
        return notificationRepository.findByRecipientIdOrderByTimestampDesc(recipientId);
    }

    public void markAsRead(String notificationId) {
        notificationRepository.findById(notificationId).ifPresent(notification -> {
            notification.setRead(true);
            notificationRepository.save(notification);
        });
    }

    public void markAllAsRead(String recipientId) {
        List<Notification> notifications = notificationRepository.findByRecipientIdOrderByTimestampDesc(recipientId);
        for (Notification notification : notifications) {
            notification.setRead(true);
        }
    }
}
