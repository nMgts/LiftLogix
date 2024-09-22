package com.liftlogix.exceptions;

public class NoActivePlanException extends RuntimeException {
    public NoActivePlanException(String message) {
        super(message);
    }
}
