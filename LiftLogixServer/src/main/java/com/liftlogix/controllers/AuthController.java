package com.liftlogix.controllers;

import com.liftlogix.dto.UserLoginDTO;
import com.liftlogix.dto.UserRegisterDTO;
import com.liftlogix.models.User;
import com.liftlogix.services.UserService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/auth")
@AllArgsConstructor
public class AuthController {
    private final UserService userService;

    @PostMapping("/login")
    public ResponseEntity<Object> login(@RequestBody UserLoginDTO login) {
        List<String> userEmail = userService.checkUserEmail(login.getEmail());

        if (userEmail.isEmpty() || userEmail == null) {
            String errorMessage = "Failed to login";
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorMessage);
        }

        String hashed_password = userService.checkUserPasswordByEmail(login.getEmail());

        if (!BCrypt.checkpw(login.getPassword(), hashed_password)) {
            String errorMessage = "Incorrect email or password";
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorMessage);
        }

        User user = userService.getUserDetailsByEmail(login.getEmail());

        return ResponseEntity.ok(user);
    }

    @PostMapping("/register")
    public ResponseEntity<Object> register(@RequestBody UserRegisterDTO user) {
        try {
            User registeredUser = userService.registerUser(user);
            //return ResponseEntity.ok(registeredUser);
            return ResponseEntity.status(HttpStatus.OK).body("success");
        } catch (Exception e) {
            String errorMessage = "Failed to register user";
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorMessage);
        }
    }
}
