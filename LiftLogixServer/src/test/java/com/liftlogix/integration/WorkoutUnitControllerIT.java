package com.liftlogix.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.liftlogix.convert.WorkoutUnitDTOMapper;
import com.liftlogix.dto.ChangeDateRequest;
import com.liftlogix.dto.WorkoutExerciseDTO;
import com.liftlogix.dto.WorkoutUnitDTO;
import com.liftlogix.repositories.WorkoutUnitRepository;
import com.liftlogix.util.JWTUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(SpringExtension.class)
@SpringBootTest
@AutoConfigureMockMvc
class WorkoutUnitControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private WorkoutUnitRepository workoutUnitRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private WorkoutUnitDTOMapper workoutUnitDTOMapper;

    @Autowired
    private JWTUtils jwtUtils;

    private WorkoutUnitDTO testWorkout;
    private String jwtToken;

    @BeforeEach
    void setup() {
        testWorkout = new WorkoutUnitDTO();
        testWorkout.setId(1L);
        testWorkout.setDate(LocalDateTime.now());
        testWorkout.setDuration(60);
        testWorkout.setIndividual(true);

        WorkoutExerciseDTO workoutExerciseDTO = new WorkoutExerciseDTO();
        workoutExerciseDTO.setId(1L);
        List<WorkoutExerciseDTO> workoutExerciseDTOList = new ArrayList<>();
        workoutExerciseDTOList.add(workoutExerciseDTO);
        testWorkout.setWorkoutExercises(workoutExerciseDTOList);

        UserDetails userDetails = User.builder()
                .username("coach@example.com")
                .password("password")
                .roles("COACH")
                .build();

        jwtToken = "Bearer " + jwtUtils.generateAccessToken(userDetails);
    }

    @Test
    void testGetWorkout_Success() throws Exception {
        mockMvc.perform(get("/api/workout/1")
                        .header("Authorization", jwtToken))
                .andExpect(status().isOk());
    }

    @Test
    void testToggleIndividual_Success() throws Exception {
        mockMvc.perform(patch("/api/workout/toggle-individual/1")
                        .header("Authorization", jwtToken))
                .andExpect(status().isOk())
                .andExpect(content().json("{\"message\": \"Workout individual status toggled\"}"));
    }

    @Test
    void testChangeDate_Success() throws Exception {
        ChangeDateRequest request = new ChangeDateRequest();
        request.setId(1L);
        request.setNewDate(LocalDateTime.now().plusDays(1));
        request.setDuration(90);

        mockMvc.perform(put("/api/workout/set-date")
                        .header("Authorization", jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }
}
