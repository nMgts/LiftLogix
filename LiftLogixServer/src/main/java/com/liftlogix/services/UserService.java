package com.liftlogix.services;

import com.liftlogix.dto.ReqRes;
import com.liftlogix.exceptions.InvalidTokenException;
import com.liftlogix.models.PasswordResetToken;
import com.liftlogix.models.User;
import com.liftlogix.repositories.TokenRepository;
import com.liftlogix.repositories.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.Optional;
import java.util.UUID;

@Service
@AllArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final TokenRepository tokenRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    public ReqRes generatePasswordResetToken(String email) {
        ReqRes resp = new ReqRes();
        try {

            Optional<User> opt = userRepository.findByEmail(email);
            if (opt.isEmpty()) {
                throw new EntityNotFoundException("User not exists");
            }

            User user = opt.get();
            String token = UUID.randomUUID().toString();
            PasswordResetToken resetToken = new PasswordResetToken(token, user);

            try {
                tokenRepository.save(resetToken);
            } catch (Exception e) {
                Date expiryDate = resetToken.getExpiryDate();
                resetToken = tokenRepository.findByUser(user);;
                resetToken.setToken(token);
                resetToken.setExpiryDate(expiryDate);
                tokenRepository.save(resetToken);
            }

            String resetUrl = "http://localhost:4200/reset-password?token=" + token;
            emailService.sendPasswordResetEmail(user.getEmail(), resetUrl);

            resp.setStatusCode(200);
            resp.setMessage("Email reset token sent successfully");

        } catch (Exception e) {
            resp.setStatusCode(500);
            resp.setError(e.getMessage());
        }
        return resp;
    }

    public ReqRes resetPassword(String token, String newPassword) {
        ReqRes resp = new ReqRes();

        try {
            PasswordResetToken resetToken = tokenRepository.findByToken(token);
            if (resetToken == null || resetToken.isExpired()) {
                throw new InvalidTokenException("Invalid or expired token");
            }

            User user = resetToken.getUser();
            user.setPassword(passwordEncoder.encode(newPassword));
            userRepository.save(user);

            tokenRepository.delete(resetToken);

            resp.setStatusCode(200);
            resp.setMessage("Password has been reset successfully");
        } catch (Exception e) {
            resp.setStatusCode(500);
            resp.setError(e.getMessage());
        }
        return resp;
    }

    public ResponseEntity<?> getImage(long user_id) {
        Optional<User> opt = userRepository.findById(user_id);
        if (opt.isPresent()) {
            User user = opt.get();
            if (user.getImage() != null) {
                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"image.jpg\"")
                        .contentType(MediaType.IMAGE_JPEG)
                        .body(user.getImage());
            }
            else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Image not found");
            }
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }
    }
}
