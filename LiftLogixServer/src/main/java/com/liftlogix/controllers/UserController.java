package com.liftlogix.controllers;

import com.liftlogix.convert.UserDTOMapper;
import com.liftlogix.dto.PasswordResetRequest;
import com.liftlogix.dto.ReqRes;
import com.liftlogix.dto.UserDTO;
import com.liftlogix.models.User;
import com.liftlogix.repositories.UserRepository;
import com.liftlogix.services.*;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AllArgsConstructor;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/user")
@AllArgsConstructor
public class UserController {
    private final UserService userService;
    private final UserDetailsService userDetailsService;
    private final UserDTOMapper userDTOMapper;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final CacheManager cacheManager;

    @GetMapping("/details")
    public ResponseEntity<UserDTO> getUserDetails(Authentication authentication) {
        String userEmail = authentication.getName();

        UserDetails userDetails = userDetailsService.loadUserByUsername(userEmail);

        if (userDetails != null) {
            UserDTO userDTO = userDTOMapper.mapUserToDTO((User) userDetails);
            return ResponseEntity.ok(userDTO);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ReqRes> forgotPassword(@RequestParam String email) {
        return ResponseEntity.ok(userService.generatePasswordResetToken(email));
    }

    @PutMapping("/reset-password")
    public ResponseEntity<ReqRes> resetPassword(@RequestBody PasswordResetRequest request) {
        return ResponseEntity.ok(userService.resetPassword(request.getToken(), request.getNewPassword()));
    }

    @PutMapping("/change-password")
    @CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
    public ResponseEntity<Void> changePassword(@RequestParam String password, HttpServletResponse response, Authentication authentication) {
        // Będzie trzeba zrobić refactor, niech korzysta z userService do porównywania ze starym hasłem
        try {
            String username = authentication.getName();
            Optional<User> opt = userRepository.findByEmail(username);
            User user = opt.orElseThrow();
            String newPassword = passwordEncoder.encode(password);
            user.setPassword(newPassword);
            userRepository.save(user);

            if (response.getStatus() == 200) {
                Cookie cookieRefreshToken = new Cookie("refreshToken", "");
                cookieRefreshToken.setHttpOnly(true);
                cookieRefreshToken.setPath("/");
                cookieRefreshToken.setMaxAge(0);
                response.addCookie(cookieRefreshToken);
            }

            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<Void> verifyCode(@RequestBody Map<String, String> request) {
        String code = request.get("code");
        String email = request.get("email");

        Cache cache = cacheManager.getCache("verificationCodes");
        Cache.ValueWrapper valueWrapper = cache.get(email); //cacheKey

        if (valueWrapper != null && valueWrapper.get().equals(code)) {
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @GetMapping("/check")
    public ResponseEntity<Void> checkPassword(@RequestParam String password, Authentication authentication) {
        String username = authentication.getName();

        UserDetails userDetails = userDetailsService.loadUserByUsername(username);

        if (passwordEncoder.matches(password, userDetails.getPassword())) {
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @GetMapping("/image/{user_id}")
    public ResponseEntity<?> getImage(@PathVariable long user_id) {
        return userService.getImage(user_id);
    }
}
