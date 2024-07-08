package com.liftlogix.controllers;

import com.liftlogix.dto.ReqRes;
import com.liftlogix.services.UserManagementService;
import com.liftlogix.types.Role;
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
        return ResponseEntity.ok(userManagementService.register(req, Role.COACH));
    }

    @PostMapping("/register/client")
    public ResponseEntity<ReqRes> registerClient(@RequestBody ReqRes req) {
        return ResponseEntity.ok(userManagementService.register(req, Role.CLIENT));
    }

    @PostMapping("/register/admin")
    public ResponseEntity<ReqRes> registerAdmin(@RequestBody ReqRes req) {
        return ResponseEntity.ok(userManagementService.register(req, Role.ADMIN));
    }

    @PostMapping("/login")
    public ResponseEntity<ReqRes> login(@RequestBody ReqRes req) {
        return ResponseEntity.ok(userManagementService.login(req));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ReqRes> refreshToken(@RequestBody ReqRes req) {
        return ResponseEntity.ok(userManagementService.refreshToken(req));
    }
}
