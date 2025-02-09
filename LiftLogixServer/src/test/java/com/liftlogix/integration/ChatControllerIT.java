package com.liftlogix.integration;

import com.liftlogix.models.chat.ChatMessage;
import com.liftlogix.repositories.ChatMessageRepository;
import com.liftlogix.services.ChatRoomService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;
import java.util.UUID;

import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.anyOf;
import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(SpringExtension.class)
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ChatControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private ChatRoomService chatRoomService;

    private ChatMessage testMessage1;
    private ChatMessage testMessage2;

    private String senderId;
    private String recipientId;

    @BeforeEach
    void setUp() {
        senderId = "user-" + UUID.randomUUID();
        recipientId = "user-" + UUID.randomUUID();

        String chatId = chatRoomService.getChatRoomId(senderId, recipientId, true).orElseThrow();

        testMessage1 = ChatMessage.builder()
                .chatId(chatId)
                .senderId(senderId)
                .recipientId(recipientId)
                .content("Hello, how are you?")
                .timestamp(new Date())
                .read(false)
                .build();

        testMessage2 = ChatMessage.builder()
                .chatId(chatId)
                .senderId(recipientId)
                .recipientId(senderId)
                .content("I'm fine, thanks!")
                .timestamp(new Date())
                .read(false)
                .build();

        chatMessageRepository.saveAll(List.of(testMessage1, testMessage2));
    }

    @Test
    @WithMockUser(username = "test-user")
    void shouldFetchChatMessagesBetweenUsers() throws Exception {
        mockMvc.perform(get("/api/chat/messages/{senderId}/{recipientId}", senderId, recipientId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(2))
                .andExpect(jsonPath("$[*].content", containsInAnyOrder("Hello, how are you?", "I'm fine, thanks!")));
    }

    @Test
    @WithMockUser(username = "test-user")
    void shouldFetchRecentMessagesForUser() throws Exception {
        mockMvc.perform(get("/api/chat/messages/recent/{senderId}", senderId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(1))
                .andExpect(jsonPath("$[0].content", anyOf(is("Hello, how are you?"), is("I'm fine, thanks!"))));
    }
}
