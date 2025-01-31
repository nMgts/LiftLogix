package com.liftlogix.models.notification;

import jakarta.persistence.Id;
import lombok.*;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document
public class Notification {

    @Id
    private String id;
    private NotificationType type;
    private String senderId;
    private String recipientId;
    private long itemId;
    private Date timestamp;
    private boolean read;
}
