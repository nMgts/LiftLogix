package com.liftlogix.exceptions;

public class UserIsNotConfirmed extends RuntimeException {
    public UserIsNotConfirmed(String message) {
        super(message);
    }
}
