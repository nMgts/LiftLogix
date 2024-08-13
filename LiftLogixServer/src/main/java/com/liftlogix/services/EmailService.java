package com.liftlogix.services;

import com.liftlogix.exceptions.EmailAlreadyConfirmedException;
import com.liftlogix.models.User;
import com.liftlogix.repositories.UserRepository;
import com.liftlogix.types.Role;
import jakarta.mail.MessagingException;
import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
import org.apache.tomcat.websocket.AuthenticationException;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.CachePut;
import org.springframework.mail.MailSendException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.CookieValue;

import java.security.SecureRandom;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

@Service
@AllArgsConstructor
public class EmailService {
    private final JavaMailSender mailSender;
    private final UserRepository userRepository;
    private final CacheManager cacheManager;

    public String confirmEmail(String token) {
        User user = userRepository.findByConfirmationToken(token).orElseThrow(() -> new EntityNotFoundException("User not found"));
        user.setConfirmationToken(null);
        user.setEmail_confirmed(true);
        userRepository.save(user);
        return "Adres e-mail został pomyślnie potwierdzony";
    }

    public void resendConfirmationEmail(Map<String, String> request) {
        String email = request.get("email");
        User user = userRepository.findByEmail(email).orElse(null);
        if (user != null && !user.isEmail_confirmed()) {
            sendConfirmationEmail(user);
        } else {
            throw new EmailAlreadyConfirmedException("Email został już potwierdzony");
        }
    }

    public String sendVerificationCode(String email) {
        String verificationCode = generateVerificationCode();
        SimpleMailMessage mailMessage = new SimpleMailMessage();
        mailMessage.setTo(email);
        mailMessage.setSubject("Kod weryfikacjny");
        mailMessage.setText("Twój kod weryfikacjny to: " + verificationCode);
        mailSender.send(mailMessage);
        return verificationCode;
    }

    @CachePut(value = "verificationCodes", key = "#email")
    public String saveVerificationCode(String email, String code) {
        return code;
    }

    public void updateEmail(String currentEmail, String newEmail, String verificationCode, Authentication authentication) throws AuthenticationException {
        Optional<User> optMe = userRepository.findByEmail(authentication.getName());
        Optional<User> optUser = userRepository.findByEmail(currentEmail);

        if (optMe.isEmpty() || optUser.isEmpty()) {
            throw new EntityNotFoundException("User not found");
        }

        if (!Objects.equals(optMe.get().getEmail(), currentEmail) && optMe.get().getRole() != Role.ADMIN) {
            throw new AuthenticationException("You are not allowed to do this");
        }

        if (userRepository.findByEmail(newEmail).isPresent()) {
            throw new IllegalArgumentException("Email is taken");
        }

        String cachedCode = Objects.requireNonNull(cacheManager.getCache("verificationCodes")).get(currentEmail, String.class);

        if ((cachedCode == null || !cachedCode.equals(verificationCode)) && optMe.get().getRole() != Role.ADMIN) {
            throw new IllegalArgumentException("Invalid verification code");
        }

        Objects.requireNonNull(cacheManager.getCache("verificationCodes")).evict(currentEmail);

        User user = optUser.get();
        user.setEmail(newEmail);
        user.setEmail_confirmed(false);
        String confirmationToken = UUID.randomUUID().toString();
        user.setConfirmationToken(confirmationToken);
        userRepository.save(user);

        try {
            sendConfirmationEmail(optUser.get()); // Tutaj podłączę jakieś darmowe api jak znajdę
        } catch (MailSendException e) {
            user.setEmail(currentEmail);
            user.setEmail_confirmed(true);
            user.setConfirmationToken(null);
            userRepository.save(user);
            throw new MailSendException("Email address is not available");
        }
    }

    public void sendPasswordResetEmail(String to, String resetUrl) {
        SimpleMailMessage email = new SimpleMailMessage();
        email.setTo(to);
        email.setSubject("Password Reset Request");
        email.setText("To reset your password, click the link below:\n" + resetUrl);
        mailSender.send(email);
    }

    public void sendConfirmationEmail(User user) {
        SimpleMailMessage mailMessage = new SimpleMailMessage();
        mailMessage.setTo(user.getEmail());
        mailMessage.setSubject("Potwierdź swój adres e-mail");
        mailMessage.setText("Aby potwierdzić swój adres e-mail, proszę kliknąć tutaj:\n"
                + "http://localhost:4200/confirm-mail?token=" + user.getConfirmationToken());
        mailSender.send(mailMessage);
    }

    private String generateVerificationCode() {
        SecureRandom random = new SecureRandom();
        int code = random.nextInt(900000) + 100000;
        return String.valueOf(code);
    }
}
