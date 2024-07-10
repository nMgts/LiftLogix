package com.liftlogix.controllers;

import com.liftlogix.convert.UserDTOMapper;
import com.liftlogix.dto.UserDTO;
import com.liftlogix.models.User;
import com.liftlogix.services.ClientService;
import com.liftlogix.services.CoachService;
import com.liftlogix.services.UserDetailsService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/user")
@AllArgsConstructor
public class UserController {
    private final UserDetailsService userDetailsService;
    private final UserDTOMapper userDTOMapper;

    @GetMapping("/details")
    public ResponseEntity<UserDTO> getUserDetails(Authentication authentication) {
        String userEmail = authentication.getName();

        UserDetails userDetails = userDetailsService.loadUserByUsername(userEmail);

        if (userDetails != null) {
            UserDTO userDTO = userDTOMapper.mapUserToDTO((User) userDetails);
            return ResponseEntity.ok(userDTO);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
}
