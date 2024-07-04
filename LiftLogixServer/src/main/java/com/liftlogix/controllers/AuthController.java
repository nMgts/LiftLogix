package com.liftlogix.controllers;

import com.liftlogix.dto.ReqRes;
import com.liftlogix.services.UserManagementService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/auth")
@AllArgsConstructor
public class AuthController {
    private final UserManagementService userManagementService;

    @PostMapping("/register/coach")
    public ResponseEntity<ReqRes> registerCoach(@RequestBody ReqRes req) {
        return ResponseEntity.ok(userManagementService.register(req, "COACH"));
    }

    @PostMapping("/register/client")
    public ResponseEntity<ReqRes> registerClient(@RequestBody ReqRes req) {
        return ResponseEntity.ok(userManagementService.register(req, "CLIENT"));
    }

    @PostMapping("/login")
    public ResponseEntity<ReqRes> login(@RequestBody ReqRes req) {
        return ResponseEntity.ok(userManagementService.login(req));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ReqRes> refreshToken(@RequestBody ReqRes req) {
        return ResponseEntity.ok(userManagementService.refreshToken(req));
    }
/*
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

 */
}
