package com.liftlogix.services;

import com.liftlogix.convert.UserDTOMapper;
import com.liftlogix.dto.ReqRes;
import com.liftlogix.dto.UserDTO;
import com.liftlogix.exceptions.InvalidTokenException;
import com.liftlogix.exceptions.UserIsNotConfirmed;
import com.liftlogix.models.*;
import com.liftlogix.repositories.TokenRepository;
import com.liftlogix.repositories.UserRepository;
import com.liftlogix.types.Role;
import com.liftlogix.util.JWTUtils;
import lombok.AllArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.UUID;

@Service
@AllArgsConstructor
public class UserManagementService {
    private final UserRepository userRepository;
    private final JWTUtils jwtUtils;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;
    private final UserDTOMapper userDTOMapper;
    private final EmailService emailService;
    private final TokenRepository tokenRepository;

    public ReqRes register(ReqRes registrationRequest, Role role) {
        ReqRes resp = new ReqRes();

        try {
            User user;
            if (role.equals(Role.COACH)) {
                user = new Coach();
            } else if (role.equals(Role.ADMIN)) {
                user = new Admin();
            } else {
                user = new Client();
            }
            user.setEmail(registrationRequest.getEmail());
            user.setFirst_name(registrationRequest.getFirst_name());
            user.setLast_name(registrationRequest.getLast_name());
            user.setPassword(passwordEncoder.encode(registrationRequest.getPassword()));
            user.setRole(role);
            long currentTime = System.currentTimeMillis();
            user.setCreated_at(new Date(currentTime));
            user.setUpdated_at(new Date(currentTime));
            User userResult = userRepository.save(user);
            UserDTO userDTO = userDTOMapper.mapUserToDTO(userResult);
            if (userResult.getId() > 0) {

                String confirmationToken = UUID.randomUUID().toString();
                user.setConfirmationToken(confirmationToken);
                emailService.sendConfirmationEmail(user);
                userRepository.save(user);

                resp.setUser(userDTO);
                resp.setMessage("User saved successfully");
                resp.setStatusCode(200);
            }
        } catch (Exception e) {
            resp.setStatusCode(500);
            resp.setError(e.getMessage());
        }
        return resp;
    }

    public ReqRes login(ReqRes loginRequest) {
        ReqRes resp = new ReqRes();
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getEmail(),
                            loginRequest.getPassword()));
            var user = userRepository.findByEmail(loginRequest.getEmail()).orElseThrow();
            var jwt = jwtUtils.generateToken(user);
            var refreshToken = jwtUtils.generateRefreshToken(new HashMap<>(), user);

            if (!user.isEmail_confirmed()) {
                throw new UserIsNotConfirmed("User is not confirmed");
            }

            resp.setStatusCode(200);
            resp.setToken(jwt);
            resp.setRole(user.getRole());
            resp.setRefreshToken(refreshToken);
            resp.setExpirationTime("24Hrs");
            resp.setMessage("Successfully logged in");
        } catch (Exception e) {
            resp.setStatusCode(500);
            resp.setMessage(e.getMessage());
        }
        return resp;
    }

    public ReqRes refreshToken(ReqRes refreshTokenRequest) {
        ReqRes resp = new ReqRes();
        try {
            String email = jwtUtils.extractUsername(refreshTokenRequest.getToken());
            User user = userRepository.findByEmail(email).orElseThrow();
            if (jwtUtils.isTokenValid(refreshTokenRequest.getToken(), user)) {
                var jwt = jwtUtils.generateToken(user);
                resp.setStatusCode(200);
                resp.setToken(jwt);
                resp.setRefreshToken(refreshTokenRequest.getToken());
                resp.setExpirationTime("24Hrs");
                resp.setMessage("Successfully refreshed token");
            }
            resp.setStatusCode(200);
            return resp;
        } catch (Exception e) {
            resp.setStatusCode(500);
            resp.setMessage(e.getMessage());
            return resp;
        }
    }

    public void generatePasswordResetToken(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();

        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = new PasswordResetToken(token, user);

        tokenRepository.save(resetToken);

        String resetUrl = "http://localhost:4200/reset-password?token=" + token;
        emailService.sendPasswordResetEmail(user.getEmail(), resetUrl);
    }

    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = tokenRepository.findByToken(token);
        if (resetToken == null || resetToken.isExpired()) {
            throw new InvalidTokenException("Invalid or expired token");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        tokenRepository.delete(resetToken);
    }
}
