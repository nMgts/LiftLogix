package com.liftlogix.controllers;

import com.liftlogix.dto.ReqRes;
import com.liftlogix.services.EmailService;
import com.liftlogix.services.UserManagementService;
import com.liftlogix.types.Role;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@AllArgsConstructor
public class AuthController {
    private final UserManagementService userManagementService;
    private final EmailService emailService;

    @PostMapping("/register/coach")
    public ResponseEntity<ReqRes> registerCoach(@RequestBody ReqRes req) {
        return ResponseEntity.ok(userManagementService.register(req, Role.COACH));
    }

    @PostMapping("/register/client")
    public ResponseEntity<ReqRes> registerClient(@RequestBody ReqRes req) {
        return ResponseEntity.ok(userManagementService.register(req, Role.CLIENT));
    }

    @PostMapping("/register/admin")
    public ResponseEntity<ReqRes> registerAdmin(@RequestBody ReqRes req) {
        return ResponseEntity.ok(userManagementService.register(req, Role.ADMIN));
    }

    @PostMapping("/login")
    public ResponseEntity<ReqRes> login(@RequestBody ReqRes req) {
        return ResponseEntity.ok(userManagementService.login(req));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ReqRes> refreshToken(@RequestBody ReqRes req) {
        return ResponseEntity.ok(userManagementService.refreshToken(req));
    }

    @GetMapping("/confirm")
    public ResponseEntity<String> confirmEmail(@RequestParam("token") String token) {
        try {
            return ResponseEntity.ok(emailService.confirmEmail(token));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping("/resend-confirmation")
    public ResponseEntity<String> resendConfirmationEmail(@RequestBody Map<String, String> request) {
        try {
            emailService.resendConfirmationEmail(request);
            return ResponseEntity.ok().body("{\"message\": \"Email sent successfully\"}");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        }
    }

    @PostMapping("/send-verification-code")
    public ResponseEntity<Void> sendVerificationCode(@RequestBody Map<String, String> emailPayload) {
        String email = emailPayload.get("email");
        String code = emailService.sendVerificationCode(email);
        emailService.saveVerificationCode(email, code);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/update-email")
    public ResponseEntity<Void> updateEmail(@RequestBody Map<String, String> request, HttpServletRequest httpRequest, Authentication authentication) {
        String currentEmail = request.get("currentEmail");
        String newEmail = request.get("newEmail");
        String verificationCode = request.get("verificationCode");

        try {
            emailService.updateEmail(currentEmail, newEmail, verificationCode, authentication);

            httpRequest.getSession().invalidate();

            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

}
