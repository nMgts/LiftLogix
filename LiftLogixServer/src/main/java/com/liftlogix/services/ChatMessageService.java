package com.liftlogix.services;

import com.liftlogix.exceptions.ChatRoomNotFoundExeption;
import com.liftlogix.models.chat.ChatMessage;
import com.liftlogix.models.users.User;
import com.liftlogix.repositories.ChatMessageRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@AllArgsConstructor
public class ChatMessageService {
    private final ChatMessageRepository chatMessageRepository;
    private final ChatRoomService chatRoomService;

    public ChatMessage save(ChatMessage chatMessage) {
        var chatId = chatRoomService.getChatRoomId(
                chatMessage.getSenderId(), chatMessage.getRecipientId(), true
        ).orElseThrow(
                () -> new ChatRoomNotFoundExeption("Chat room not found")
        );
        chatMessage.setChatId(chatId);
        chatMessage.setRead(false);
        chatMessageRepository.save(chatMessage);
        return chatMessage;
    }

    public void markMessagesAsRead(String senderId, String recipientId, User user) {
        String id1 = senderId + "_" + recipientId;
        String id2 = recipientId + "_" + senderId;

        List<ChatMessage> messages1 = chatMessageRepository.findByChatId(id1);
        List<ChatMessage> messages2 = chatMessageRepository.findByChatId(id2);

        markMessages(messages1, user);
        markMessages(messages2, user);

        chatMessageRepository.saveAll(messages1);
        chatMessageRepository.saveAll(messages2);
    }

    public List<ChatMessage> findChatMessages(String senderId, String recipientId) {
        var chatId = chatRoomService.getChatRoomId(
                senderId, recipientId, false);
        return chatId.map(chatMessageRepository::findByChatId).orElse(new ArrayList<>());
    }

    public List<ChatMessage> findRecentMessages(String senderId) {
        List<ChatMessage> allMessages = chatMessageRepository.findBySenderIdOrRecipientId(senderId, senderId);
        Map<String, ChatMessage> lastMessagesMap = new HashMap<>();

        for (ChatMessage message : allMessages) {
            String otherUserId = message.getSenderId().equals(senderId) ? message.getRecipientId() : message.getSenderId();

            if (!lastMessagesMap.containsKey(otherUserId) ||
                    lastMessagesMap.get(otherUserId).getTimestamp().compareTo(message.getTimestamp()) < 0) {
                lastMessagesMap.put(otherUserId, message);
            }
        }

        return new ArrayList<>(lastMessagesMap.values());
    }

    private void markMessages(List<ChatMessage> messages, User user) {
        messages.forEach(message -> {
            if (!message.getSenderId().equals(user.getEmail())) {
                message.setRead(true);
            }
        });
    }
}
