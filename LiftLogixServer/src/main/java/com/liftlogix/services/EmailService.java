package com.liftlogix.services;

import com.liftlogix.exceptions.EmailAlreadyConfirmedException;
import com.liftlogix.models.User;
import com.liftlogix.repositories.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@AllArgsConstructor
public class EmailService {
    private final JavaMailSender mailSender;
    private final UserRepository userRepository;

    public void sendConfirmationEmail(User user) {
        SimpleMailMessage mailMessage = new SimpleMailMessage();
        mailMessage.setTo(user.getEmail());
        mailMessage.setSubject("Potwierdź swój adres e-mail");
        mailMessage.setText("Aby potwierdzić swój adres e-mail, proszę kliknąć tutaj:\n"
                + "http://localhost:8080/api/auth/confirm?token=" + user.getConfirmationToken());
        mailSender.send(mailMessage);
    }

    public String confirmEmail(String token) {
        System.out.println("a");
        User user = userRepository.findByConfirmationToken(token).orElseThrow();
        System.out.println(user.getConfirmationToken());
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
}
