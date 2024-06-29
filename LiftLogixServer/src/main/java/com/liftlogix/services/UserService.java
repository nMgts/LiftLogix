package com.liftlogix.services;

import com.liftlogix.convert.UserRegisterMapper;
import com.liftlogix.dto.UserRegisterDTO;
import com.liftlogix.models.Coach;
import com.liftlogix.models.User;
import com.liftlogix.repositories.CoachRepository;
import com.liftlogix.repositories.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final CoachRepository coachRepository;
    private final UserRegisterMapper userRegisterMapper;
    private final PasswordEncoder passwordEncoder;

    public User registerUser(UserRegisterDTO userDTO) {
        User user = userRegisterMapper.mapDTOToEntity(userDTO);
        user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
        long currentTime = System.currentTimeMillis();
        user.setCreated_at(new Date(currentTime));
        user.setUpdated_at(new Date(currentTime));
        return userRepository.save(user);
    }

    public List<String> checkUserEmail(String email) {
        return userRepository.checkUserEmail(email);
    }

    public String checkUserPasswordByEmail(String email) {
        return userRepository.checkUserPasswordByEmail(email);
    }

    public User getUserDetailsByEmail(String email) {
        User user = userRepository.getUserDetailsByEmail(email);
        user.setAssignedToCoach(user.getCoach() != null);
        return userRepository.getUserDetailsByEmail(email);
    }

    public String assignUserToCoach(long user_id, long coach_id) {
        Optional<Coach> opt_c = coachRepository.findById(coach_id);
        if (opt_c.isPresent()) {
            Optional<User> opt_u = userRepository.findById(user_id);
            if (opt_u.isPresent()) {
                Coach coach = opt_c.get();
                User user = opt_u.get();
                if (user.getCoach() == null) {
                    user.setCoach(coach);
                    user.setAssignedToCoach(true);
                    userRepository.save(user);
                    return "success";
                } else {
                    return "User already assigned";
                }
            } else {
                return "User not found";
            }
        }
        return "Coach not found";
    }

    public String unsubscribeUserFromCoach(long user_id) {
        Optional<User> opt = userRepository.findById(user_id);
        if (opt.isPresent()) {
            User user = opt.get();
            if (user.getCoach() != null) {
                user.setCoach(null);
                user.setAssignedToCoach(false);
                userRepository.save(user);
                return "success";
            } else {
                return "User is not assigned";
            }
        }
        return "User not found";
    }
}
