package com.liftlogix.services;

import com.liftlogix.models.notification.Notification;
import com.liftlogix.models.notification.NotificationType;
import com.liftlogix.repositories.NotificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private NotificationService notificationService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void createNotification_ShouldSaveAndSendNotification() {
        String senderId = "user1";
        String recipientId = "user2";
        long itemId = 100L;
        NotificationType type = NotificationType.REPORT;

        Notification notification = Notification.builder()
                .senderId(senderId)
                .recipientId(recipientId)
                .itemId(itemId)
                .type(type)
                .timestamp(new Date())
                .read(false)
                .build();

        when(notificationRepository.save(any(Notification.class))).thenReturn(notification);

        Notification result = notificationService.createNotification(senderId, recipientId, itemId, type);

        assertNotNull(result);
        assertEquals(senderId, result.getSenderId());
        assertEquals(recipientId, result.getRecipientId());
        assertEquals(itemId, result.getItemId());
        assertEquals(type, result.getType());
        assertFalse(result.isRead());

        verify(notificationRepository).save(any(Notification.class));
        verify(messagingTemplate).convertAndSendToUser(eq(recipientId), eq("/queue/notifications"), any(Notification.class));
    }

    @Test
    void getNotificationsForUser_ShouldReturnLatestNotifications() {
        String recipientId = "user2";

        Notification oldNotification = Notification.builder()
                .id("1")
                .recipientId(recipientId)
                .itemId(200L)
                .type(NotificationType.REPORT)
                .timestamp(new Date(System.currentTimeMillis() - 10000))
                .read(false)
                .build();

        Notification latestNotification = Notification.builder()
                .id("2")
                .recipientId(recipientId)
                .itemId(200L)
                .type(NotificationType.REPORT)
                .timestamp(new Date())
                .read(false)
                .build();

        List<Notification> allNotifications = List.of(oldNotification, latestNotification);

        when(notificationRepository.findByRecipientIdOrderByTimestampDesc(recipientId)).thenReturn(allNotifications);

        List<Notification> result = notificationService.getNotificationsForUser(recipientId);

        assertEquals(1, result.size());
        assertEquals(latestNotification.getId(), result.get(0).getId());
    }

    @Test
    void markAsRead_ShouldUpdateNotification() {
        String notificationId = "1";
        Notification notification = Notification.builder()
                .id(notificationId)
                .read(false)
                .build();

        when(notificationRepository.findById(notificationId)).thenReturn(Optional.of(notification));

        notificationService.markAsRead(notificationId);

        assertTrue(notification.isRead());
        verify(notificationRepository).save(notification);
    }

    @Test
    void markAsRead_ShouldDoNothing_WhenNotificationNotFound() {
        String notificationId = "1";

        when(notificationRepository.findById(notificationId)).thenReturn(Optional.empty());

        notificationService.markAsRead(notificationId);

        verify(notificationRepository, never()).save(any());
    }

    @Test
    void markAllAsRead_ShouldUpdateAllNotifications() {
        String recipientId = "user2";
        Notification notification1 = Notification.builder().id("1").recipientId(recipientId).read(false).build();
        Notification notification2 = Notification.builder().id("2").recipientId(recipientId).read(false).build();
        List<Notification> notifications = List.of(notification1, notification2);

        when(notificationRepository.findByRecipientIdOrderByTimestampDesc(recipientId)).thenReturn(notifications);

        notificationService.markAllAsRead(recipientId);

        assertTrue(notification1.isRead());
        assertTrue(notification2.isRead());
        verify(notificationRepository, times(2)).save(any(Notification.class));
    }
}
