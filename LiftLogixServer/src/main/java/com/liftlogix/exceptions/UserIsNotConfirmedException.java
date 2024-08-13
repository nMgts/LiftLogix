package com.liftlogix.exceptions;

public class UserIsNotConfirmedException extends RuntimeException {
    public UserIsNotConfirmedException(String message) {
        super(message);
    }
}
