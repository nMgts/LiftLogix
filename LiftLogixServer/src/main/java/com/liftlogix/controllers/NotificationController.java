package com.liftlogix.controllers;

import com.liftlogix.models.notification.Notification;
import com.liftlogix.services.NotificationService;
import lombok.AllArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notification")
@AllArgsConstructor
public class NotificationController {
    private final NotificationService notificationService;

    @GetMapping("/{userId}")
    public List<Notification> getUserNotifications(@PathVariable String userId) {
        return notificationService.getNotificationsForUser(userId);
    }

    @PutMapping("/mark-as-read/{id}")
    public void markAsRead(@PathVariable String id) {
        notificationService.markAsRead(id);
    }

    @PutMapping("/mark-as-read/all/{recipientId}")
    public void markAllAsRead(@PathVariable String recipientId) {
        notificationService.markAllAsRead(recipientId);
    }

    @MessageMapping("/send-notification")
    @SendTo("/queue/notifications")
    public Notification sendNotification(Notification notification) {
        return notificationService.createNotification(
                notification.getSenderId(),
                notification.getRecipientId(),
                notification.getItemId(),
                notification.getType()
        );
    }
}
