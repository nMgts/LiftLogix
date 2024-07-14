package com.liftlogix.services;

import com.liftlogix.convert.UserDTOMapper;
import com.liftlogix.dto.ReqRes;
import com.liftlogix.dto.UserDTO;
import com.liftlogix.exceptions.EmailIsTakenException;
import com.liftlogix.exceptions.InvalidTokenException;
import com.liftlogix.exceptions.UserIsNotConfirmedException;
import com.liftlogix.models.*;
import com.liftlogix.repositories.TokenRepository;
import com.liftlogix.repositories.UserRepository;
import com.liftlogix.types.Role;
import com.liftlogix.util.JWTUtils;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.AllArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.*;

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

            Optional<User> opt = userRepository.findByEmail(registrationRequest.getEmail());
            if (opt.isPresent()) {
                throw new EmailIsTakenException("Email is taken");
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
            var jwt = jwtUtils.generateAccessToken(user);
            var refreshToken = jwtUtils.generateRefreshToken(user);

            if (!user.isEmail_confirmed()) {
                throw new UserIsNotConfirmedException("User is not confirmed");
            }

            resp.setStatusCode(200);
            resp.setToken(jwt);
            resp.setRole(user.getRole());
            resp.setRefreshToken(refreshToken);
            resp.setExpirationTime("24Hrs");
            resp.setMessage("Successfully logged in");
        } catch (Exception e) {
            resp.setStatusCode(500);
            resp.setError(e.getMessage());
        }
        return resp;
    }

    public void logout(HttpServletRequest request) {
        final String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String accessToken = authHeader.substring(7);
            jwtUtils.invalidateToken(accessToken);
        }

        final String refreshTokenHeader = request.getHeader("Refresh-Token");
        System.out.println(refreshTokenHeader);
        if (refreshTokenHeader != null && refreshTokenHeader.startsWith("Bearer ")) {
            String refreshToken = refreshTokenHeader.substring(7);
            jwtUtils.invalidateToken(refreshToken);
        }

        SecurityContextHolder.clearContext();
    }

    public ReqRes refreshToken(String refreshToken) {
        ReqRes resp = new ReqRes();
        try {
            String email = jwtUtils.extractUsername(refreshToken);
            User user = userRepository.findByEmail(email).orElseThrow();
            if (jwtUtils.isTokenValid(refreshToken, user) && jwtUtils.isRefreshToken(refreshToken)) {
                var newAccessToken = jwtUtils.generateAccessToken(user);
                var newRefreshToken = jwtUtils.generateRefreshToken(user);
                resp.setStatusCode(200);
                resp.setToken(newAccessToken);
                resp.setRefreshToken(newRefreshToken);
                resp.setExpirationTime("24Hrs");
                resp.setMessage("Successfully refreshed token");

                jwtUtils.invalidateToken(refreshToken);
            } else {
                resp.setStatusCode(500);
                resp.setError("Refresh token is not valid");
            }

            return resp;
        } catch (Exception e) {
            resp.setStatusCode(500);
            resp.setError(e.getMessage());
            return resp;
        }
    }

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
}
