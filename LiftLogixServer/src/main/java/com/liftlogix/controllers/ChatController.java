package com.liftlogix.controllers;

import com.liftlogix.models.chat.ChatMessage;
import com.liftlogix.models.chat.ChatNotification;
import com.liftlogix.services.ChatMessageService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;

@Controller
@AllArgsConstructor
@RequestMapping("/api/chat")
public class ChatController {
    private ChatMessageService chatMessageService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat")
    public void processMessage(
            @Payload ChatMessage chatMessage
    ) {
        ChatMessage savesMsg = chatMessageService.save(chatMessage);
        messagingTemplate.convertAndSendToUser(
                chatMessage.getRecipientId(), "/queue/messages",
                ChatNotification.builder()
                        .id(savesMsg.getId())
                        .senderId(savesMsg.getSenderId())
                        .recipientId(savesMsg.getRecipientId())
                        .content(savesMsg.getContent())
                        .build()
        );
    }

    @GetMapping("/messages/{senderId}/{recipientId}")
    public ResponseEntity<List<ChatMessage>> findChatMessages(
            @PathVariable("senderId") String senderId,
            @PathVariable("recipientId") String recipientId
    ) {
        return ResponseEntity.ok(chatMessageService.findChatMessages(senderId, recipientId));
    }

    @GetMapping("/messages/recent/{senderId}")
    public ResponseEntity<List<ChatMessage>> findRecentChatMessages(@PathVariable("senderId") String senderId) {
        return ResponseEntity.ok(chatMessageService.findRecentMessages(senderId));
    }

    @PutMapping("/messages/{chatId}/read")
    public ResponseEntity<Void> markMessagesAsRead(@PathVariable String chatId) {
        chatMessageService.markMessagesAsRead(chatId);
        return ResponseEntity.ok().build();
    }
}
