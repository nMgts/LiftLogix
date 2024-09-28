package com.liftlogix.services;

import com.liftlogix.convert.UserDTOMapper;
import com.liftlogix.dto.ReqRes;
import com.liftlogix.dto.UserDTO;
import com.liftlogix.exceptions.InvalidTokenException;
import com.liftlogix.models.users.PasswordResetToken;
import com.liftlogix.models.users.User;
import com.liftlogix.repositories.TokenRepository;
import com.liftlogix.repositories.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
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
    private final UserDTOMapper userDTOMapper;

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

    public byte[] getImage(long user_id) {
            User user = userRepository.findById(user_id).orElseThrow(
                    () -> new EntityNotFoundException("User not found")
            );
        byte[] image = user.getImage();
        if (image != null && image.length > 0) {
            return image;
        }
        else {
            throw new EntityNotFoundException("Image not found");
        }
    }

    public void updateImage(MultipartFile image, Authentication authentication) throws IOException {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElseThrow(
                () -> new EntityNotFoundException("User not found")
        );
        try {
            user.setImage(image.getBytes());
            userRepository.save(user);
        } catch (IOException e) {
            throw new IOException("Error during image update");
        }
    }

    public UserDTO findUserByEmail(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(
                () -> new EntityNotFoundException("User not found")
        );

        return userDTOMapper.mapUserToDTO(user);
    }
}
