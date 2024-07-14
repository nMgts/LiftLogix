package com.liftlogix.controllers;

import com.liftlogix.dto.PasswordResetRequest;
import com.liftlogix.dto.ReqRes;
import com.liftlogix.services.EmailService;
import com.liftlogix.services.UserManagementService;
import com.liftlogix.types.Role;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AllArgsConstructor;
import org.apache.tomcat.util.http.parser.Authorization;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
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
    public ResponseEntity<ReqRes> login(@RequestBody ReqRes req, HttpServletResponse response) {
        ReqRes loginResponse = userManagementService.login(req);

        if (loginResponse.getStatusCode() == 200) {
            Cookie cookieRefreshToken = new Cookie("refreshToken", loginResponse.getRefreshToken());
            cookieRefreshToken.setHttpOnly(true);
            cookieRefreshToken.setPath("/");
            response.addCookie(cookieRefreshToken);

            System.out.println(cookieRefreshToken.getName());
            System.out.println(cookieRefreshToken.getValue());
            System.out.println(cookieRefreshToken.getPath());
        }

        return ResponseEntity.ok(loginResponse);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        userManagementService.logout(request);
        return ResponseEntity.ok("Logged out successfully");
    }

    @PostMapping("/refresh")
    public ResponseEntity<ReqRes> refreshToken(@CookieValue(value = "refreshToken") String refreshToken, HttpServletResponse response) {
        ReqRes refreshResponse = userManagementService.refreshToken(refreshToken);
        if (refreshResponse.getStatusCode() == 200) {
            Cookie cookieRefreshToken = new Cookie("refreshToken", refreshResponse.getRefreshToken());
            cookieRefreshToken.setHttpOnly(true);
            cookieRefreshToken.setPath("/");
            response.addCookie(cookieRefreshToken);

            Cookie oldCookieRefreshToken = new Cookie("refreshToken", "");
            oldCookieRefreshToken.setMaxAge(0);
            oldCookieRefreshToken.setHttpOnly(true);
            oldCookieRefreshToken.setPath("/");
            response.addCookie(oldCookieRefreshToken);
        }
        return ResponseEntity.ok(refreshResponse);
    }

    @PutMapping("/confirm")
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

    @PostMapping("/forgot-password")
    public ResponseEntity<ReqRes> forgotPassword(@RequestParam String email) {
        return ResponseEntity.ok(userManagementService.generatePasswordResetToken(email));
    }

    @PutMapping("/reset-password")
    public ResponseEntity<ReqRes> resetPassword(@RequestBody PasswordResetRequest request) {
        return ResponseEntity.ok(userManagementService.resetPassword(request.getToken(), request.getNewPassword()));
    }
}
