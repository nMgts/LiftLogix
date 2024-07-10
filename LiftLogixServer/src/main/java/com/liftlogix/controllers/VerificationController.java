package com.liftlogix.controllers;

import lombok.AllArgsConstructor;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@AllArgsConstructor
@RequestMapping("/api/verification")
public class VerificationController {
    private final CacheManager cacheManager;

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
}
