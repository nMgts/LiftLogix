package com.liftlogix.controllers;

import com.liftlogix.convert.UserDTOMapper;
import com.liftlogix.dto.UserDTO;
import com.liftlogix.models.User;
import com.liftlogix.repositories.UserRepository;
import com.liftlogix.services.ClientService;
import com.liftlogix.services.CoachService;
import com.liftlogix.services.UserDetailsService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/user")
@AllArgsConstructor
public class UserController {
    private final UserDetailsService userDetailsService;
    private final UserDTOMapper userDTOMapper;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

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

    @PutMapping("/change-password")
    public ResponseEntity<Void> changePassword(@RequestParam String password, Authentication authentication) {
        // Będzie trzeba zrobić refactor, niech korzysta z userService do porównywania ze starym hasłem
        try {
            String username = authentication.getName();
            Optional<User> opt = userRepository.findByEmail(username);
            User user = opt.orElseThrow();
            String newPassword = passwordEncoder.encode(password);
            user.setPassword(newPassword);
            userRepository.save(user);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
}
