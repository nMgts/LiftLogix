package com.liftlogix.services;

import com.liftlogix.convert.ReportDTOMapper;
import com.liftlogix.dto.ReportDTO;
import com.liftlogix.exceptions.AuthorizationException;
import com.liftlogix.models.Report;
import com.liftlogix.models.plans.Mesocycle;
import com.liftlogix.models.plans.Microcycle;
import com.liftlogix.models.plans.PersonalPlan;
import com.liftlogix.models.plans.WorkoutUnit;
import com.liftlogix.models.users.Client;
import com.liftlogix.models.users.Coach;
import com.liftlogix.models.users.User;
import com.liftlogix.repositories.*;
import com.liftlogix.types.Role;
import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@AllArgsConstructor
public class ReportService {
    private final ReportRepository reportRepository;
    private final UserRepository userRepository;
    private final ClientRepository clientRepository;
    private final CoachRepository coachRepository;
    private final PersonalPlanRepository personalPlanRepository;
    private final ReportDTOMapper reportDTOMapper;

    public List<ReportDTO> getAllReports(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        if (user.getRole().equals(Role.ADMIN)) {
            List<Report> reports = reportRepository.findAll();

            return reports.stream()
                    .map(reportDTOMapper::mapEntityToDTO)
                    .toList();
        }
        else if (user.getRole().equals(Role.COACH)) {
            Coach coach = coachRepository.findByEmail(authentication.getName())
                    .orElseThrow(() -> new EntityNotFoundException("Coach not found"));

            List<Client> clients = clientRepository.findByCoach(coach);
            List<PersonalPlan> allPlans = new ArrayList<>();
            for (Client client : clients) {
                List<PersonalPlan> plans = personalPlanRepository.findByClientId(client.getId());
                allPlans.addAll(plans);
            }

            List<Report> reports = new ArrayList<>();
            for (PersonalPlan plan : allPlans) {
                for (Mesocycle mesocycle : plan.getMesocycles()) {
                    for (Microcycle microcycle : mesocycle.getMicrocycles()) {
                        for (WorkoutUnit workoutUnit : microcycle.getWorkoutUnits()) {
                            reports.addAll(reportRepository.findByWorkoutUnitId(workoutUnit.getId()));
                        }
                    }
                }
            }

            return reports.stream()
                    .map(reportDTOMapper::mapEntityToDTO)
                    .toList();
        }
        else {
            Client client = clientRepository.findByEmail(authentication.getName())
                    .orElseThrow(() -> new EntityNotFoundException("Client not found"));
            List<PersonalPlan> plans = personalPlanRepository.findByClientId(client.getId());

            List<Report> reports = new ArrayList<>();
            for (PersonalPlan plan : plans) {
                for (Mesocycle mesocycle : plan.getMesocycles()) {
                    for (Microcycle microcycle : mesocycle.getMicrocycles()) {
                        for (WorkoutUnit workoutUnit : microcycle.getWorkoutUnits()) {
                            reports.addAll(reportRepository.findByWorkoutUnitId(workoutUnit.getId()));
                        }
                    }
                }
            }

            return reports.stream()
                    .map(reportDTOMapper::mapEntityToDTO)
                    .toList();
        }
    }

    public ReportDTO getReport(long id, Authentication authentication) {
        Report report = reportRepository.findById(id).
                orElseThrow(() -> new EntityNotFoundException("Report not found"));
        ReportDTO dto = reportDTOMapper.mapEntityToDTO(report);

        if (!checkAccess(dto, authentication)) {
            throw new AuthorizationException("You are not authorized");
        }
        return dto;
    }

    public ReportDTO findByWorkoutUnitId(long id, Authentication authentication) {
        Report report = reportRepository.findByWorkoutUnitId(id).getFirst();
        ReportDTO dto = reportDTOMapper.mapEntityToDTO(report);

        if (!checkAccess(dto, authentication)) {
            throw new AuthorizationException("You are not authorized");
        }

        return dto;
    }

    public ReportDTO updateReport(ReportDTO dto, Authentication authentication) {
        if (!checkAccess(dto, authentication)) {
            throw new AuthorizationException("You are not authorized");
        }

        Report report = reportDTOMapper.mapDTOToEntity(dto);
        reportRepository.save(report);
        return dto;
    }

    public void deleteReport(long id, Authentication authentication) {
        Report report = reportRepository.findById(id).
                orElseThrow(() -> new EntityNotFoundException("Report not found"));
        ReportDTO dto = reportDTOMapper.mapEntityToDTO(report);

        if (!checkAccess(dto, authentication)) {
            throw new AuthorizationException("You are not authorized");
        }

        reportRepository.delete(report);
    }

    public void deleteReportForWU(long wuId) {
        List<Report> reports = reportRepository.findByWorkoutUnitId(wuId);
        if (!reports.isEmpty()) {
            reportRepository.delete(reports.getFirst());
        }
    }

    private boolean checkAccess(ReportDTO dto, Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        if (user.getRole().equals(Role.COACH)) {
            String clientEmail = dto.getClientEmail();
            Coach coach = coachRepository.findByEmail(authentication.getName())
                    .orElseThrow(() -> new EntityNotFoundException("Coach not found"));
            List<Client> clients = clientRepository.findByCoach(coach);
            return clients.stream()
                    .anyMatch(c -> c.getEmail().equals(clientEmail));
        }
        else if (user.getRole().equals(Role.CLIENT)) {
            return dto.getClientEmail().equals(authentication.getName());
        }
        return true;
    }
}
