package com.liftlogix.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PasswordResetRequest {
    private String token;
    private String newPassword;
}
