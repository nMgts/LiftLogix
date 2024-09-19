package com.liftlogix.services;

import com.liftlogix.convert.CoachSchedulerDTOMapper;
import com.liftlogix.dto.CoachSchedulerDTO;
import com.liftlogix.models.*;
import com.liftlogix.repositories.CoachScheduleRepository;
import com.liftlogix.repositories.PersonalPlanRepository;
import com.liftlogix.repositories.WorkoutRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@AllArgsConstructor
public class CoachSchedulerService {
    private final CoachScheduleRepository coachScheduleRepository;
    private final WorkoutRepository workoutRepository;
    private final PersonalPlanRepository personalPlanRepository;
    private final CoachSchedulerDTOMapper coachSchedulerDTOMapper;

    public void setCoachScheduler(Coach coach) {
        CoachScheduler coachScheduler = new CoachScheduler();
        coachScheduler.setCoach(coach);
        coachScheduleRepository.save(coachScheduler);
    }

    public CoachSchedulerDTO getCoachScheduler(User user) {
        CoachScheduler scheduler = coachScheduleRepository.findByCoach((Coach) user).orElseThrow(
                () -> new EntityNotFoundException("Scheduler not found")
        );

        return coachSchedulerDTOMapper.mapEntityToDTO(scheduler);
    }

    public void addWorkout(Long workoutId, WorkoutDate date) {
        Workout workout = workoutRepository.findById(workoutId).orElseThrow(
                () -> new EntityNotFoundException("Workout not found")
        );

        Client client = personalPlanRepository.findClientByWorkout(workoutId).orElseThrow(
                () -> new EntityNotFoundException("Client not found")
        );

        CoachScheduler scheduler = getCoachSchedulerByWorkoutId(workoutId);

        List<SchedulerItem> schedulerItems = scheduler.getSchedulerItems();

        SchedulerItem newItem = new SchedulerItem();
        newItem.setWorkout(workout);
        newItem.setStartDate(date.getDate());
        newItem.setEndDate(date.getDate().plusMinutes(date.getDuration()));
        newItem.setClient(client);

        schedulerItems.add(newItem);

        scheduler.setSchedulerItems(schedulerItems);
        coachScheduleRepository.save(scheduler);
    }

    public void removeWorkout(Long workoutId, WorkoutDate date) {
        CoachScheduler scheduler = getCoachSchedulerByWorkoutId(workoutId);

        List<SchedulerItem> schedulerItems = scheduler.getSchedulerItems();

        SchedulerItem itemToRemove = schedulerItems.stream()
                .filter(item -> item.getWorkout().getId().equals(workoutId)
                        && item.getStartDate().equals(date.getDate())
                        && item.getEndDate().equals(date.getDate().plusMinutes(date.getDuration())))
                .findFirst()
                .orElseThrow(() -> new EntityNotFoundException("SchedulerItem not found"));

        schedulerItems.remove(itemToRemove);

        scheduler.setSchedulerItems(schedulerItems);
        coachScheduleRepository.save(scheduler);
    }

    public void onChangeWorkoutDate(Long workoutId, LocalDateTime oldDate, LocalDateTime newDate, Integer newDuration) {
        CoachScheduler scheduler = getCoachSchedulerByWorkoutId(workoutId);

        List<SchedulerItem> schedulerItems = scheduler.getSchedulerItems();
        SchedulerItem itemToChange = schedulerItems.stream()
                .filter(item -> item.getWorkout().getId().equals(workoutId)
                        && item.getStartDate().equals(oldDate))
                .findFirst()
                .orElseThrow(() -> new EntityNotFoundException("SchedulerItem not found"));

        itemToChange.setStartDate(newDate);
        itemToChange.setEndDate(newDate.plusMinutes(newDuration != null ? newDuration : 60));

        coachScheduleRepository.save(scheduler);
    }

    private CoachScheduler getCoachSchedulerByWorkoutId(Long workoutId) {
        Client client = personalPlanRepository.findClientByWorkout(workoutId).orElseThrow(
                () -> new EntityNotFoundException("Client not found")
        );

        Coach coach = client.getCoach();

        return coachScheduleRepository.findByCoach(coach).orElseThrow(
                () -> new EntityNotFoundException("Scheduler not found")
        );
    }
}
