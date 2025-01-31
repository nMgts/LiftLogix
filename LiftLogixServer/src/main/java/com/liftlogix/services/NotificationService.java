package com.liftlogix.services;

import com.liftlogix.models.notification.Notification;
import com.liftlogix.models.notification.NotificationType;
import com.liftlogix.repositories.NotificationRepository;
import lombok.AllArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.*;

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
        List<Notification> allNotifications = notificationRepository.findByRecipientIdOrderByTimestampDesc(recipientId);

        Map<String, Notification> latestNotificationsMap = new HashMap<>();

        for (Notification notification : allNotifications) {
            String key = notification.getType() + "_" + notification.getItemId();

            if (!latestNotificationsMap.containsKey(key) ||
                    notification.getTimestamp().after(latestNotificationsMap.get(key).getTimestamp())) {
                latestNotificationsMap.put(key, notification);
            }
        }

        return new ArrayList<>(latestNotificationsMap.values());
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
            notificationRepository.save(notification);
        }
    }
}
