package com.liftlogix.services;

import com.liftlogix.convert.UserDTOMapper;
import com.liftlogix.dto.ReqRes;
import com.liftlogix.dto.UserDTO;
import com.liftlogix.models.users.Coach;
import com.liftlogix.models.users.PasswordResetToken;
import com.liftlogix.models.users.User;
import com.liftlogix.repositories.TokenRepository;
import com.liftlogix.repositories.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UserServiceTest {
    @Mock private UserRepository userRepository;
    @Mock private TokenRepository tokenRepository;
    @Mock private EmailService emailService;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private UserDTOMapper userDTOMapper;
    @Mock private Authentication authentication;
    @Mock private MultipartFile multipartFile;

    @InjectMocks private UserService userService;

    @Test
    void resetPassword_ShouldResetPassword_WhenTokenIsValid() {
        // GIVEN
        String token = "valid-token";
        String newPassword = "newSecurePassword";
        User user = new Coach();
        PasswordResetToken resetToken = new PasswordResetToken(token, user);

        when(tokenRepository.findByToken(token)).thenReturn(resetToken);
        when(passwordEncoder.encode(newPassword)).thenReturn("hashedPassword");

        // WHEN
        ReqRes response = userService.resetPassword(token, newPassword);

        // THEN
        assertEquals(200, response.getStatusCode());
        assertEquals("Password has been reset successfully", response.getMessage());
        verify(userRepository, times(1)).save(user);
        verify(tokenRepository, times(1)).delete(resetToken);
    }

    @Test
    void resetPassword_ShouldReturnError_WhenTokenIsInvalid() {
        // GIVEN
        String token = "invalid-token";
        when(tokenRepository.findByToken(token)).thenReturn(null);

        // WHEN
        ReqRes response = userService.resetPassword(token, "password");

        // THEN
        assertEquals(500, response.getStatusCode());
        assertTrue(response.getError().contains("Invalid or expired token"));
    }

    @Test
    void getImage_ShouldReturnImage_WhenExists() {
        // GIVEN
        long userId = 1L;
        User user = new Coach();
        byte[] imageData = new byte[]{1, 2, 3};
        user.setImage(imageData);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        // WHEN
        byte[] result = userService.getImage(userId);

        // THEN
        assertArrayEquals(imageData, result);
    }

    @Test
    void getImage_ShouldThrowException_WhenImageNotFound() {
        // GIVEN
        long userId = 1L;
        User user = new Coach();
        user.setImage(null);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        // THEN
        assertThrows(EntityNotFoundException.class, () -> userService.getImage(userId));
    }

    @Test
    void updateImage_ShouldUpdateImage_WhenAuthenticated() throws IOException {
        // GIVEN
        String email = "test@example.com";
        User user = new Coach();
        byte[] imageData = new byte[]{1, 2, 3};

        when(authentication.getName()).thenReturn(email);
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(multipartFile.getBytes()).thenReturn(imageData);

        // WHEN
        userService.updateImage(multipartFile, authentication);

        // THEN
        assertArrayEquals(imageData, user.getImage());
        verify(userRepository, times(1)).save(user);
    }

    @Test
    void updateImage_ShouldThrowIOException_WhenFileProcessingFails() throws IOException {
        // GIVEN
        when(authentication.getName()).thenReturn("test@example.com");
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(new Coach()));
        when(multipartFile.getBytes()).thenThrow(new IOException());

        // THEN
        assertThrows(IOException.class, () -> userService.updateImage(multipartFile, authentication));
    }

    @Test
    void findUserByEmail_ShouldReturnUserDTO_WhenUserExists() {
        // GIVEN
        String email = "test@example.com";
        User user = new Coach();
        UserDTO userDTO = new UserDTO();

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(userDTOMapper.mapUserToDTO(user)).thenReturn(userDTO);

        // WHEN
        UserDTO result = userService.findUserByEmail(email);

        // THEN
        assertEquals(userDTO, result);
    }

    @Test
    void checkIsTwoFactorEnabled_ShouldReturnTrue_WhenEnabled() {
        // GIVEN
        String email = "test@example.com";
        User user = new Coach();
        user.setTwoFactorAuth(true);

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));

        // WHEN
        boolean result = userService.checkIsTwoFactorEnabled(email);

        // THEN
        assertTrue(result);
    }

    @Test
    void checkIsTwoFactorEnabled_ShouldReturnFalse_WhenNotEnabled() {
        // GIVEN
        String email = "test@example.com";
        User user = new Coach();
        user.setTwoFactorAuth(false);

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));

        // WHEN
        boolean result = userService.checkIsTwoFactorEnabled(email);

        // THEN
        assertFalse(result);
    }

    @Test
    void switchTwoFactorAuthentication_ShouldToggleSetting() {
        // GIVEN
        String email = "test@example.com";
        User user = new Coach();
        user.setTwoFactorAuth(false);

        when(authentication.getName()).thenReturn(email);
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));

        // WHEN
        userService.switchTwoFactorAuthentication(authentication);

        // THEN
        assertTrue(user.isTwoFactorAuth());
        verify(userRepository, times(1)).save(user);
    }

    @Test
    void generate2FACode_ShouldGenerateAndSaveCode() {
        // GIVEN
        String email = "test@example.com";
        User user = new Coach();
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));

        // WHEN
        userService.generate2FACode(email);

        // THEN
        assertNotNull(user.getSecret());
        verify(userRepository, times(1)).save(user);
    }

    @Test
    void clear2FACode_ShouldClearCode() {
        // GIVEN
        String email = "test@example.com";
        User user = new Coach();
        user.setSecret(123456);
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));

        // WHEN
        userService.clear2FACode(email);

        // THEN
        assertNull(user.getSecret());
        verify(userRepository, times(1)).save(user);
    }
}
