package com.liftlogix.services;

import com.liftlogix.convert.WorkoutUnitDTOMapper;
import com.liftlogix.dto.WorkoutUnitDTO;
import com.liftlogix.exceptions.AuthorizationException;
import com.liftlogix.models.plans.WorkoutExercise;
import com.liftlogix.models.plans.WorkoutUnit;
import com.liftlogix.models.users.Client;
import com.liftlogix.models.users.Coach;
import com.liftlogix.models.users.User;
import com.liftlogix.repositories.PersonalPlanRepository;
import com.liftlogix.repositories.WorkoutExerciseRepository;
import com.liftlogix.repositories.WorkoutUnitRepository;
import com.liftlogix.types.Role;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WorkoutUnitServiceTest {

    @Mock
    private WorkoutUnitRepository workoutUnitRepository;

    @Mock
    private PersonalPlanRepository personalPlanRepository;

    @Mock
    private WorkoutExerciseRepository workoutExerciseRepository;

    @Mock
    private WorkoutUnitDTOMapper workoutUnitDTOMapper;

    @Mock
    private CoachSchedulerService coachSchedulerService;

    @InjectMocks
    private WorkoutUnitService workoutUnitService;

    private WorkoutUnit workout;
    private Client client;
    private Coach coach;

    @BeforeEach
    void setUp() {
        workout = new WorkoutUnit();
        workout.setId(1L);
        workout.setIndividual(false);
        workout.setDuration(60);
        workout.setDate(LocalDateTime.now().plusDays(1));

        client = new Client();
        coach = new Coach();
        coach.setEmail("coach@example.com");
        coach.setRole(Role.COACH);
        client.setCoach(coach);
    }

    @Test
    void shouldReturnWorkoutDTOWhenAccessGranted() {
        when(workoutUnitRepository.findById(1L)).thenReturn(Optional.of(workout));
        when(personalPlanRepository.findClientByWorkoutUnitId(1L)).thenReturn(Optional.of(client));

        WorkoutUnitDTO mockDTO = new WorkoutUnitDTO();
        when(workoutUnitDTOMapper.mapEntityToDTO(workout)).thenReturn(mockDTO);

        WorkoutUnitDTO result = workoutUnitService.getWorkout(1L, coach);

        assertNotNull(result);
        verify(workoutUnitRepository).findById(1L);
        verify(workoutUnitDTOMapper).mapEntityToDTO(workout);
    }

    @Test
    void shouldThrowExceptionWhenWorkoutNotFound() {
        when(workoutUnitRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> workoutUnitService.getWorkout(1L, coach));
    }

    @Test
    void shouldToggleIndividualStatusAndSave() {
        when(workoutUnitRepository.findById(1L)).thenReturn(Optional.of(workout));
        when(personalPlanRepository.findClientByWorkoutUnitId(1L)).thenReturn(Optional.of(client));

        workoutUnitService.toggleIndividual(1L, coach);

        assertTrue(workout.isIndividual());
        verify(workoutUnitRepository).save(workout);
        verify(coachSchedulerService).removeWorkout(1L);
    }

    @Test
    void shouldChangeWorkoutDateAndNotifyScheduler() {
        LocalDateTime newDate = LocalDateTime.now().plusDays(2);
        int newDuration = 90;

        when(workoutUnitRepository.findById(1L)).thenReturn(Optional.of(workout));
        when(personalPlanRepository.findClientByWorkoutUnitId(1L)).thenReturn(Optional.of(client));

        WorkoutUnitDTO mockDTO = new WorkoutUnitDTO();
        when(workoutUnitDTOMapper.mapEntityToDTO(workout)).thenReturn(mockDTO);

        WorkoutUnitDTO result = workoutUnitService.changeDate(1L, newDate, newDuration, coach);

        assertEquals(newDate, workout.getDate());
        assertEquals(newDuration, workout.getDuration());
        verify(coachSchedulerService).onChangeWorkoutDate(1L, newDate, newDuration);
        verify(workoutUnitRepository).save(workout);
        assertNotNull(result);
    }

    @Test
    void shouldThrowAuthorizationExceptionForUnauthorizedUser() {
        User unauthorizedUser = new Client();
        unauthorizedUser.setEmail("unauthorized@example.com");
        unauthorizedUser.setRole(Role.CLIENT);

        when(workoutUnitRepository.findById(1L)).thenReturn(Optional.of(workout));
        when(personalPlanRepository.findClientByWorkoutUnitId(1L)).thenReturn(Optional.of(client));

        assertThrows(AuthorizationException.class, () -> workoutUnitService.getWorkout(1L, unauthorizedUser));
    }
}
