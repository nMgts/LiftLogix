package com.liftlogix.services;

import com.liftlogix.exceptions.ChatRoomNotFoundExeption;
import com.liftlogix.models.chat.ChatMessage;
import com.liftlogix.repositories.ChatMessageRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

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
        System.out.println(chatMessage.getContent());
        chatMessageRepository.save(chatMessage);
        return chatMessage;
    }

    public void markMessagesAsRead(String chatId) {
        List<ChatMessage> messages = chatMessageRepository.findByChatId(chatId);

        messages.forEach(message -> message.setRead(true));
        chatMessageRepository.saveAll(messages);
    }

    public List<ChatMessage> findChatMessages(String senderId, String recipientId) {
        var chatId = chatRoomService.getChatRoomId(
                senderId, recipientId, false);
        return chatId.map(chatMessageRepository::findByChatId).orElse(new ArrayList<>());
    }
}
