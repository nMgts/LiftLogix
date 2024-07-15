package com.liftlogix.controllers;

import com.liftlogix.dto.ReqRes;
import com.liftlogix.services.EmailService;
import com.liftlogix.services.UserManagementService;
import com.liftlogix.types.Role;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    @CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
    public ResponseEntity<ReqRes> login(@RequestBody ReqRes req, HttpServletResponse response) {
        ReqRes loginResponse = userManagementService.login(req);

        if (loginResponse.getStatusCode() == 200) {
            Cookie cookieRefreshToken = new Cookie("refreshToken", loginResponse.getRefreshToken());
            cookieRefreshToken.setHttpOnly(true);
            cookieRefreshToken.setPath("/");
            //cookieRefreshToken.setDomain("localhost");
            cookieRefreshToken.setMaxAge(req.isRememberMeChecked() ? 2592000 : 86400);
            response.addCookie(cookieRefreshToken);
        }
        return ResponseEntity.ok(loginResponse);
    }

    @PostMapping("/logout")
    @CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
    public ResponseEntity<?> logout(@CookieValue(value = "refreshToken", required = false) String refreshToken,
                                    HttpServletRequest request, HttpServletResponse response) {
        userManagementService.logout(request, refreshToken);
        if (response.getStatus() == 200) {
            Cookie cookieRefreshToken = new Cookie("refreshToken", "");
            cookieRefreshToken.setHttpOnly(true);
            cookieRefreshToken.setPath("/");
            cookieRefreshToken.setMaxAge(0);
            response.addCookie(cookieRefreshToken);
        }
        return ResponseEntity.ok("Logged out successfully");
    }

    @PostMapping("/refresh")
    @CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
    public ResponseEntity<ReqRes> refreshToken(@CookieValue(value = "refreshToken") String refreshToken,
                                               @RequestBody ReqRes reqRes, HttpServletResponse response) {
        ReqRes refreshResponse = userManagementService.refreshToken(refreshToken, reqRes.isRememberMeChecked());
        if (refreshResponse.getStatusCode() == 200) {
            Cookie cookieRefreshToken = new Cookie("refreshToken", refreshResponse.getRefreshToken());
            cookieRefreshToken.setHttpOnly(true);
            cookieRefreshToken.setPath("/");
            //cookieRefreshToken.setDomain("localhost");
            cookieRefreshToken.setMaxAge(reqRes.isRememberMeChecked() ? 2592000 : 86400); //86400 or 2592000
            response.addCookie(cookieRefreshToken);
        }
        return ResponseEntity.ok(refreshResponse);
    }
}
