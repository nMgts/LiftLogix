package com.liftlogix.controllers;

import com.liftlogix.dto.ClientDTO;
import com.liftlogix.exceptions.AuthorizationException;
import com.liftlogix.exceptions.ClientAlreadyAssignedException;
import com.liftlogix.exceptions.ClientIsNotAssignedException;
import com.liftlogix.services.ClientService;
import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/client")
@AllArgsConstructor
public class ClientController {
    private final ClientService clientService;

    @GetMapping("/all")
    public ResponseEntity<List<ClientDTO>> findAllClients() {
        return ResponseEntity.ok(clientService.findAllClients());
    }

    @PostMapping("/assign/{client_id}/{coach_id}")
    public ResponseEntity<String> assignUserToCoach(@PathVariable long client_id, @PathVariable long coach_id, Authentication authentication) {
        try {
            clientService.assignClientToCoach(client_id, coach_id, authentication);
            return ResponseEntity.ok().body("{\"message\": \"Client assigned successfully\"}");
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (AuthorizationException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (ClientAlreadyAssignedException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred");
        }
    }

    @PostMapping("unsubscribe/{client_id}")
    public ResponseEntity<String> unsubscribeUserFromCoach(@PathVariable long client_id, Authentication authentication) {
        try {
            clientService.unsubscribeClientFromCoach(client_id, authentication);
            return ResponseEntity.ok().body("{\"message\": \"Client unsubscribed successfully\"}");
        } catch (ClientIsNotAssignedException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (AuthorizationException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred");
        }
    }
}
