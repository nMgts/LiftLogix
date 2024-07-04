package com.liftlogix.controllers;

import com.liftlogix.services.ClientService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Objects;

@RestController
@RequestMapping("/api/client")
@AllArgsConstructor
public class ClientController {
    private final ClientService clientService;

    @PostMapping("/assign/{client_id}/{coach_id}")
    public ResponseEntity<String> assignUserToCoach(@PathVariable long client_id, @PathVariable long coach_id) {
        String result = clientService.assignClientToCoach(client_id, coach_id);
        if (Objects.equals(result, "success")) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(result);
        }
    }

    @PostMapping("unsubscribe/{client_id}")
    public ResponseEntity<String> unsubscribeUserFromCoach(@PathVariable long client_id) {
        String result = clientService.unsubscribeClientFromCoach(client_id);
        if (Objects.equals(result, "success")) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(result);
        }
    }
}
