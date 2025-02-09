package com.liftlogix.services;

import com.liftlogix.exceptions.ChatRoomNotFoundExeption;
import com.liftlogix.models.chat.ChatMessage;
import com.liftlogix.models.users.Coach;
import com.liftlogix.models.users.User;
import com.liftlogix.repositories.ChatMessageRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ChatMessageServiceTest {

    @Mock private ChatMessageRepository chatMessageRepository;
    @Mock private ChatRoomService chatRoomService;
    @InjectMocks private ChatMessageService chatMessageService;

    private ChatMessage chatMessage;

    @BeforeEach
    void setUp() {
        chatMessage = new ChatMessage();
        chatMessage.setSenderId("user1@example.com");
        chatMessage.setRecipientId("user2@example.com");
    }

    @Test
    void save_ShouldSaveChatMessage_WhenChatRoomExists() {
        when(chatRoomService.getChatRoomId(any(), any(), eq(true))).thenReturn(Optional.of("chatRoom123"));
        when(chatMessageRepository.save(any(ChatMessage.class))).thenReturn(chatMessage);

        ChatMessage savedMessage = chatMessageService.save(chatMessage);

        assertNotNull(savedMessage);
        assertEquals("chatRoom123", savedMessage.getChatId());
        assertFalse(savedMessage.isRead());
        verify(chatMessageRepository, times(1)).save(chatMessage);
    }

    @Test
    void save_ShouldThrowException_WhenChatRoomDoesNotExist() {
        when(chatRoomService.getChatRoomId(any(), any(), eq(true))).thenReturn(Optional.empty());

        assertThrows(ChatRoomNotFoundExeption.class, () -> chatMessageService.save(chatMessage));
    }

    @Test
    void markMessagesAsRead_ShouldUpdateMessagesAsRead() {
        User user = new Coach();
        user.setEmail("user2@example.com");

        ChatMessage message1 = new ChatMessage();
        message1.setSenderId("user1@example.com");
        message1.setRecipientId("user2@example.com");
        message1.setRead(false);

        ChatMessage message2 = new ChatMessage();
        message2.setSenderId("user2@example.com");
        message2.setRecipientId("user1@example.com");
        message2.setRead(false);

        when(chatMessageRepository.findByChatId("user1@example.com_user2@example.com"))
                .thenReturn(Arrays.asList(message1));
        when(chatMessageRepository.findByChatId("user2@example.com_user1@example.com"))
                .thenReturn(Arrays.asList(message2));

        chatMessageService.markMessagesAsRead("user1@example.com", "user2@example.com", user);

        assertTrue(message1.isRead());
        assertFalse(message2.isRead());

        verify(chatMessageRepository, times(1)).saveAll(Arrays.asList(message1));
        verify(chatMessageRepository, times(1)).saveAll(Arrays.asList(message2));
    }

    @Test
    void findChatMessages_ShouldReturnMessages_WhenChatRoomExists() {
        when(chatRoomService.getChatRoomId("user1@example.com", "user2@example.com", false))
                .thenReturn(Optional.of("chatRoom123"));
        when(chatMessageRepository.findByChatId("chatRoom123"))
                .thenReturn(List.of(chatMessage));

        List<ChatMessage> messages = chatMessageService.findChatMessages("user1@example.com", "user2@example.com");

        assertEquals(1, messages.size());
        assertEquals(chatMessage, messages.get(0));
    }

    @Test
    void findChatMessages_ShouldReturnEmptyList_WhenChatRoomDoesNotExist() {
        when(chatRoomService.getChatRoomId("user1@example.com", "user2@example.com", false))
                .thenReturn(Optional.empty());

        List<ChatMessage> messages = chatMessageService.findChatMessages("user1@example.com", "user2@example.com");

        assertTrue(messages.isEmpty());
    }
}

