package com.liftlogix.exceptions;

public class ClientAlreadyAssignedException extends RuntimeException {
    public ClientAlreadyAssignedException(String message) {
        super(message);
    }
}
