package com.liftlogix.exceptions;

public class DuplicateExerciseNameException extends RuntimeException {
    public DuplicateExerciseNameException(String message) {
        super(message);
    }
}
