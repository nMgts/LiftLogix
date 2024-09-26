package com.liftlogix.exceptions;

public class ChatRoomNotFoundExeption extends RuntimeException {
    public ChatRoomNotFoundExeption(String message) {
        super(message);
    }
}
