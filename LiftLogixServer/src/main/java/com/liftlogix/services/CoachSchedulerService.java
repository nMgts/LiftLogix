package com.liftlogix.services;

import com.liftlogix.convert.CoachSchedulerDTOMapper;
import com.liftlogix.dto.CoachSchedulerDTO;
import com.liftlogix.exceptions.TimeConflictException;
import com.liftlogix.models.*;
import com.liftlogix.repositories.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Service
@AllArgsConstructor
public class CoachSchedulerService {
    private final CoachScheduleRepository coachScheduleRepository;
    private final SchedulerItemRepository schedulerItemRepository;
    private final WorkoutUnitRepository workoutUnitRepository;
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

    public void addWorkout(Long workoutId) {
        WorkoutUnit workout = workoutUnitRepository.findById(workoutId).orElseThrow(
                () -> new EntityNotFoundException("Workout unit not found")
        );

        Client client = personalPlanRepository.findClientByWorkoutUnitId(workoutId).orElseThrow(
                () -> new EntityNotFoundException("Client not found")
        );

        CoachScheduler scheduler = getCoachSchedulerByWorkoutId(workoutId);

        List<SchedulerItem> schedulerItems = scheduler.getSchedulerItems();

        LocalDateTime startDate = workout.getDate();
        LocalDateTime endDate = startDate.plusMinutes(workout.getDuration());

        SchedulerItem newItem = new SchedulerItem();
        newItem.setWorkoutUnit(workout);
        newItem.setStartDate(startDate);
        newItem.setEndDate(endDate);
        newItem.setClient(client);
        newItem.setCoachScheduler(scheduler);

        checkForTimeConflicts(startDate, endDate, scheduler, newItem);

        schedulerItems.add(newItem);

        scheduler.setSchedulerItems(schedulerItems);

        coachScheduleRepository.save(scheduler);
    }

    public void removeWorkout(Long workoutId) {
        CoachScheduler scheduler = getCoachSchedulerByWorkoutId(workoutId);

        List<SchedulerItem> schedulerItems = scheduler.getSchedulerItems();

        SchedulerItem itemToRemove = schedulerItems.stream()
                .filter(item -> item.getWorkoutUnit().getId().equals(workoutId))
                .findFirst()
                .orElseThrow(() -> new EntityNotFoundException("SchedulerItem not found"));

        schedulerItems.remove(itemToRemove);
        schedulerItemRepository.delete(itemToRemove);

        scheduler.setSchedulerItems(schedulerItems);
        coachScheduleRepository.save(scheduler);
    }

    public void onChangeWorkoutDate(Long workoutId, LocalDateTime newDate, Integer newDuration) {
        CoachScheduler scheduler = getCoachSchedulerByWorkoutId(workoutId);

        List<SchedulerItem> schedulerItems = scheduler.getSchedulerItems();
        SchedulerItem itemToChange = schedulerItems.stream()
                .filter(item -> item.getWorkoutUnit().getId().equals(workoutId))
                .findFirst()
                .orElseThrow(() -> new EntityNotFoundException("SchedulerItem not found"));

        checkForTimeConflicts(newDate, newDate.plusMinutes(newDuration), scheduler, itemToChange);

        itemToChange.setStartDate(newDate);
        itemToChange.setEndDate(newDate.plusMinutes(newDuration));

        coachScheduleRepository.save(scheduler);
    }

    private CoachScheduler getCoachSchedulerByWorkoutId(Long workoutId) {
        Client client = personalPlanRepository.findClientByWorkoutUnitId(workoutId).orElseThrow(
                () -> new EntityNotFoundException("Client not found")
        );

        Coach coach = client.getCoach();

        return coachScheduleRepository.findByCoach(coach).orElseThrow(
                () -> new EntityNotFoundException("Scheduler not found")
        );
    }

    private void checkForTimeConflicts
            (LocalDateTime startDate, LocalDateTime endDate, CoachScheduler scheduler, SchedulerItem item) {
        for (SchedulerItem i : scheduler.getSchedulerItems()) {
            if (!Objects.equals(item.getId(), i.getId())) {
                LocalDateTime itemStart = i.getStartDate();
                LocalDateTime itemEnd = i.getEndDate();

                boolean overlaps = (startDate.isBefore(itemEnd) && endDate.isAfter(itemStart));

                if (overlaps) {
                    throw new TimeConflictException("The time slot conflicts with an existing workout.");
                }
            }
        }
    }
}
