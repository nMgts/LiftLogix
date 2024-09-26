package com.liftlogix.repositories;

import com.liftlogix.models.chat.ChatMessage;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ChatMessageRepository extends MongoRepository<ChatMessage, String> {
    List<ChatMessage> findByChatId(String id);
    List<ChatMessage> findBySenderIdOrRecipientId(String senderId);
}
