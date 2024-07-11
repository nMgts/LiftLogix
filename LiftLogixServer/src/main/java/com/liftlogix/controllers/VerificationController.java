package com.liftlogix.controllers;

import com.liftlogix.services.UserDetailsService;
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

@RestController
@AllArgsConstructor
@RequestMapping("/api/verification")
public class VerificationController {
    private final CacheManager cacheManager;
    private final UserDetailsService userDetailsService;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/verify")
    public ResponseEntity<Void> verifyCode(@RequestBody Map<String, String> request) {
        String code = request.get("code");
        String email = request.get("email");
        System.out.println(code);
        System.out.println(email);

        //String cacheKey = email + code;
        //System.out.println(cacheKey);
        Cache cache = cacheManager.getCache("verificationCodes");
        Cache.ValueWrapper valueWrapper = cache.get(email); //cacheKey
        //System.out.println("Cache key: " + cacheKey);
        System.out.println("Cache value: " + (valueWrapper.get() != null ? valueWrapper.get() : null));

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

        System.out.println(userDetails.getPassword());
        System.out.println(password);

        if (passwordEncoder.matches(password, userDetails.getPassword())) {
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
}
