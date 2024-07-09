package com.liftlogix.exceptions;

public class ApplicationIsNotActiveException extends RuntimeException {
    public ApplicationIsNotActiveException(String message) {
        super(message);
    }
}
