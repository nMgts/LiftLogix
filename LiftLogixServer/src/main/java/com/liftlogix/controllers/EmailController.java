package com.liftlogix.controllers;

import com.liftlogix.exceptions.EmailAlreadyConfirmedException;
import com.liftlogix.services.EmailService;
import com.liftlogix.services.UserManagementService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/email")
@AllArgsConstructor
public class EmailController {
    private final EmailService emailService;
    private final UserManagementService userManagementService;

    @PutMapping("/confirm")
    public ResponseEntity<String> confirmEmail(@RequestParam("token") String token) {
        try {
            return ResponseEntity.ok(emailService.confirmEmail(token));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred");
        }
    }

    @PostMapping("/resend-confirmation")
    public ResponseEntity<String> resendConfirmationEmail(@RequestBody Map<String, String> request) {
        try {
            emailService.resendConfirmationEmail(request);
            return ResponseEntity.ok().body("{\"message\": \"Email sent successfully\"}");
        } catch (EmailAlreadyConfirmedException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred");
        }
    }

    @PostMapping("/send-verification-code")
    public ResponseEntity<String> sendVerificationCode(@RequestBody Map<String, String> emailPayload) {
        try {
            String email = emailPayload.get("email");
            String code = emailService.sendVerificationCode(email);
            emailService.saveVerificationCode(email, code);
            return ResponseEntity.ok().body("{\"message\": \"Email sent successfully\"}");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred");
        }
    }

    @PutMapping("/update-email")

    public ResponseEntity<String> updateEmail(@RequestBody Map<String, String> request,  Authentication authentication) {
        String currentEmail = request.get("currentEmail");
        String newEmail = request.get("newEmail");
        String verificationCode = request.get("verificationCode");

        try {
            emailService.updateEmail(currentEmail, newEmail, verificationCode, authentication);
            return ResponseEntity.ok().body("{\"message\": \"Email updated successfully\"}");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}
