package com.liftlogix.controllers;

import com.liftlogix.services.UserService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Objects;

@RestController
@RequestMapping("/api/user")
@AllArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping("/test")
    public String testEndPoint() {
        return "Test end point is working";
    }

    @PostMapping("/assign/{user_id}/{coach_id}")
    public ResponseEntity<String> assignUserToCoach(@PathVariable long user_id, @PathVariable long coach_id) {
        String result = userService.assignUserToCoach(user_id, coach_id);
        if (Objects.equals(result, "success")) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(result);
        }
    }

    @PostMapping("unsubscribe/{user_id}")
    public ResponseEntity<String> unsubscribeUserFromCoach(@PathVariable long user_id) {
        String result = userService.unsubscribeUserFromCoach(user_id);
        if (Objects.equals(result, "success")) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(result);
        }
    }
}
