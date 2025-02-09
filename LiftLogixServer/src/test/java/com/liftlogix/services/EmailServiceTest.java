package com.liftlogix.services;

import com.liftlogix.exceptions.EmailAlreadyConfirmedException;
import com.liftlogix.models.users.Coach;
import com.liftlogix.models.users.User;
import com.liftlogix.repositories.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.core.Authentication;

import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class EmailServiceTest {
    @Mock private JavaMailSender mailSender;
    @Mock private UserRepository userRepository;
    @Mock private CacheManager cacheManager;
    @Mock private Cache cache;
    @Mock private Authentication authentication;

    @InjectMocks private EmailService emailService;

    @Test
    void confirmEmail_ShouldConfirmEmail_WhenTokenIsValid() {
        String token = "valid-token";
        User user = new Coach();
        user.setConfirmationToken(token);

        when(userRepository.findByConfirmationToken(token)).thenReturn(Optional.of(user));

        String result = emailService.confirmEmail(token);

        assertEquals("Adres e-mail został pomyślnie potwierdzony", result);
        assertNull(user.getConfirmationToken());
        assertTrue(user.isEmail_confirmed());
        verify(userRepository).save(user);
    }

    @Test
    void confirmEmail_ShouldThrowException_WhenTokenIsInvalid() {
        when(userRepository.findByConfirmationToken("invalid-token")).thenReturn(Optional.empty());
        assertThrows(EntityNotFoundException.class, () -> emailService.confirmEmail("invalid-token"));
    }

    @Test
    void resendConfirmationEmail_ShouldSendEmail_WhenUserExistsAndNotConfirmed() {
        User user = new Coach();
        user.setEmail("test@example.com");
        user.setEmail_confirmed(false);

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        doNothing().when(mailSender).send(any(SimpleMailMessage.class));

        emailService.resendConfirmationEmail(Map.of("email", "test@example.com"));

        verify(mailSender).send(any(SimpleMailMessage.class));
    }

    @Test
    void resendConfirmationEmail_ShouldThrowException_WhenEmailAlreadyConfirmed() {
        User user = new Coach();
        user.setEmail_confirmed(true);

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));

        assertThrows(EmailAlreadyConfirmedException.class, () ->
                emailService.resendConfirmationEmail(Map.of("email", "test@example.com")));
    }

    @Test
    void send2FACode_ShouldSendEmail_WhenUserExists() {
        User user = new Coach();
        user.setSecret(123456);

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));

        emailService.send2FACode("test@example.com");

        verify(mailSender).send(any(SimpleMailMessage.class));
    }

    @Test
    void updateEmail_ShouldUpdateEmail_WhenVerificationIsValid() throws Exception {
        User user = new Coach();
        user.setEmail("old@example.com");
        when(authentication.getName()).thenReturn("old@example.com");
        when(userRepository.findByEmail("old@example.com")).thenReturn(Optional.of(user));
        when(userRepository.findByEmail("new@example.com")).thenReturn(Optional.empty());
        when(cacheManager.getCache("verificationCodes")).thenReturn(cache);
        when(cache.get("old@example.com", String.class)).thenReturn("123456");

        emailService.updateEmail("old@example.com", "new@example.com", "123456", authentication);

        assertEquals("new@example.com", user.getEmail());
        verify(userRepository).save(user);
    }

    @Test
    void updateEmail_ShouldThrowException_WhenVerificationCodeIsInvalid() {
        User user = new Coach();
        user.setEmail("old@example.com");
        when(authentication.getName()).thenReturn("old@example.com");
        when(userRepository.findByEmail("old@example.com")).thenReturn(Optional.of(user));
        when(cacheManager.getCache("verificationCodes")).thenReturn(cache);
        when(cache.get("old@example.com", String.class)).thenReturn("wrongCode");

        assertThrows(IllegalArgumentException.class, () ->
                emailService.updateEmail("old@example.com", "new@example.com", "123456", authentication));
    }

    @Test
    void sendPasswordResetEmail_ShouldSendEmail() {
        emailService.sendPasswordResetEmail("test@example.com", "http://reset-link.com");

        verify(mailSender).send(any(SimpleMailMessage.class));
    }

    @Test
    void sendEmail_ShouldSendEmail() {
        emailService.sendEmail("test@example.com", "Test Subject", "Test Message");

        verify(mailSender).send(any(SimpleMailMessage.class));
    }
}
