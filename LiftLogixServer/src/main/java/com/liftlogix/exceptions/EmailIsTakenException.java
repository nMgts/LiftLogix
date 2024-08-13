package com.liftlogix.exceptions;

public class EmailIsTakenException extends RuntimeException {
    public EmailIsTakenException(String message) {
        super(message);
    }
}
