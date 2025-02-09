package com.liftlogix.services;

import com.liftlogix.exceptions.AuthorizationException;
import com.liftlogix.models.plans.*;
import com.liftlogix.models.users.Admin;
import com.liftlogix.models.users.Client;
import com.liftlogix.models.users.Coach;
import com.liftlogix.models.users.User;
import com.liftlogix.repositories.PersonalPlanRepository;
import com.liftlogix.repositories.PlanRepository;
import com.liftlogix.types.Role;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.io.ByteArrayResource;

import jakarta.persistence.EntityNotFoundException;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ExcelServiceTest {

    @Mock
    private PlanRepository planRepository;

    @Mock
    private PersonalPlanRepository personalPlanRepository;

    @InjectMocks
    private ExcelService excelService;

    private Coach author;
    private User admin;
    private User unauthorizedUser;
    private Plan plan;
    private PersonalPlan personalPlan;
    private Client client;

    @BeforeEach
    void setUp() {
        author = new Coach();
        author.setEmail("author@example.com");
        author.setRole(Role.COACH);

        admin = new Admin();
        admin.setEmail("admin@example.com");
        admin.setRole(Role.ADMIN);

        unauthorizedUser = new Client();
        unauthorizedUser.setEmail("unauthorized@example.com");
        unauthorizedUser.setRole(Role.CLIENT);

        Workout workout = new Workout();
        workout.setName("Workout 1");
        workout.setWorkoutExercises(List.of());
        workout.setDays(List.of(1, 3, 5));

        WorkoutUnit workoutUnit = new WorkoutUnit();
        workoutUnit.setName("Workout Unit 1");
        workoutUnit.setDate(LocalDateTime.now());
        workoutUnit.setWorkoutExercises(List.of());

        Microcycle microcycle = new Microcycle();
        microcycle.setLength(7);
        microcycle.setWorkouts(List.of(workout));
        microcycle.setWorkoutUnits(List.of(workoutUnit));

        Mesocycle mesocycle = new Mesocycle();
        mesocycle.setMicrocycles(List.of(microcycle));

        plan = new Plan();
        plan.setId(1L);
        plan.setAuthor(author);
        plan.setMesocycles(List.of(mesocycle));

        client = new Client();
        client.setEmail("client@example.com");
        client.setCoach(author);

        personalPlan = new PersonalPlan();
        personalPlan.setId(1L);
        personalPlan.setClient(client);
        personalPlan.setMesocycles(List.of(mesocycle));
    }


    @Test
    void exportPlanToExcel_AuthorizedUser_ReturnsExcelFile() throws IOException {
        when(planRepository.findById(1L)).thenReturn(Optional.of(plan));

        ByteArrayResource resource = excelService.exportPlanToExcel(1L, author);

        assertNotNull(resource);
        assertTrue(resource.contentLength() > 0);
        assertDoesNotThrow(() -> WorkbookFactory.create(resource.getInputStream()));

        verify(planRepository, times(1)).findById(1L);
    }

    @Test
    void exportPlanToExcel_AdminUser_ReturnsExcelFile() throws IOException {
        when(planRepository.findById(1L)).thenReturn(Optional.of(plan));

        ByteArrayResource resource = excelService.exportPlanToExcel(1L, admin);

        assertNotNull(resource);
        assertTrue(resource.contentLength() > 0);

        verify(planRepository, times(1)).findById(1L);
    }

    @Test
    void exportPlanToExcel_UnauthorizedUser_ThrowsAuthorizationException() {
        when(planRepository.findById(1L)).thenReturn(Optional.of(plan));

        assertThrows(AuthorizationException.class, () -> excelService.exportPlanToExcel(1L, unauthorizedUser));

        verify(planRepository, times(1)).findById(1L);
    }

    @Test
    void exportPlanToExcel_PlanNotFound_ThrowsEntityNotFoundException() {
        when(planRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> excelService.exportPlanToExcel(1L, author));

        verify(planRepository, times(1)).findById(1L);
    }

    @Test
    void exportPersonalPlanToExcel_AuthorizedUser_ReturnsExcelFile() throws IOException {
        when(personalPlanRepository.findById(1L)).thenReturn(Optional.of(personalPlan));

        ByteArrayResource resource = excelService.exportPersonalPlanToExcel(1L, author);

        assertNotNull(resource);
        assertTrue(resource.contentLength() > 0);

        verify(personalPlanRepository, times(1)).findById(1L);
    }

    @Test
    void exportPersonalPlanToExcel_UnauthorizedUser_ThrowsAuthorizationException() {
        when(personalPlanRepository.findById(1L)).thenReturn(Optional.of(personalPlan));

        assertThrows(AuthorizationException.class, () -> excelService.exportPersonalPlanToExcel(1L, unauthorizedUser));

        verify(personalPlanRepository, times(1)).findById(1L);
    }

    @Test
    void exportPersonalPlanToExcel_PlanNotFound_ThrowsEntityNotFoundException() {
        when(personalPlanRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> excelService.exportPersonalPlanToExcel(1L, author));

        verify(personalPlanRepository, times(1)).findById(1L);
    }
}
