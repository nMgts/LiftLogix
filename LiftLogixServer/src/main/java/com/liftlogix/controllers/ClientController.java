package com.liftlogix.controllers;

import com.liftlogix.models.Client;
import com.liftlogix.services.ClientService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;

@RestController
@RequestMapping("/api/client")
@AllArgsConstructor
public class ClientController {
    private final ClientService clientService;

    @GetMapping("/all")
    public ResponseEntity<List<Client>> findAllCoaches() {
        return ResponseEntity.ok(clientService.findAllClients());
    }

    @PostMapping("/assign/{client_id}/{coach_id}")
    public ResponseEntity<String> assignUserToCoach(@PathVariable long client_id, @PathVariable long coach_id, @RequestHeader("Authorization") String token) {
        String result = clientService.assignClientToCoach(client_id, coach_id, token);
        if (Objects.equals(result, "success")) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(result);
        }
    }

    @PostMapping("unsubscribe/{client_id}")
    public ResponseEntity<String> unsubscribeUserFromCoach(@PathVariable long client_id, @RequestHeader("Authorization") String token) {
        String result = clientService.unsubscribeClientFromCoach(client_id, token);

        if (Objects.equals(result, "success")) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(result);
        }
    }
}
