package com.liftlogix.services;

import com.liftlogix.convert.ApplicationDTOMapper;
import com.liftlogix.dto.ApplicationDTO;
import com.liftlogix.exceptions.ApplicationIsNotActiveException;
import com.liftlogix.exceptions.AuthorizationException;
import com.liftlogix.exceptions.ClientAlreadyAssignedException;
import com.liftlogix.models.Application;
import com.liftlogix.models.users.Client;
import com.liftlogix.models.users.Coach;
import com.liftlogix.repositories.ApplicationRepository;
import com.liftlogix.repositories.ClientRepository;
import com.liftlogix.repositories.CoachRepository;
import com.liftlogix.types.ApplicationStatus;
import com.liftlogix.util.JWTUtils;
import jakarta.persistence.EntityExistsException;
import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class ApplicationService {
    private final ApplicationRepository applicationRepository;
    private final ClientRepository clientRepository;
    private final CoachRepository coachRepository;
    private final ApplicationDTOMapper applicationDTOMapper;
    private final JWTUtils jwtUtils;
    private final ClientService clientService;

    public List<ApplicationDTO> getMyApplications(Authentication authentication) {
        String username = authentication.getName();
        Coach coach = coachRepository.findByEmail(username)
                .orElse(null);

        if (coach == null) {
            Client client = clientRepository.findByEmail(username)
                    .orElseThrow(() -> new EntityNotFoundException("User not found"));

            return client.getApplications().stream()
                    .map(applicationDTOMapper::mapEntityToDTO)
                    .collect(Collectors.toList());
        } else {
            return coach.getApplications().stream()
                    .map(applicationDTOMapper::mapEntityToDTO)
                    .collect(Collectors.toList());
        }
    }

    public ApplicationDTO create(ApplicationDTO request, String token) {
        Optional<Client> optClient = clientRepository.findById(request.getClient().getId());
        if (optClient.isPresent()) {
            Optional<Coach> optCoach = coachRepository.findById(request.getCoach().getId());

            if (optCoach.isPresent()) {
                Client client = optClient.get();
                Coach coach = optCoach.get();

                if (client.isAssignedToCoach()) {
                    throw new ClientAlreadyAssignedException("Client already assigned");
                }

                if (token.startsWith("Bearer ")) {
                    token = token.substring(7);
                }
                String username = jwtUtils.extractUsername(token);

                if (!Objects.equals(client.getUsername(), username)) {
                    throw new AuthorizationException("You are not authorized to create applications for other clients.");
                }

                Optional<Application> existingApplication =
                        applicationRepository.findByClientAndCoach(client, coach);
                if (existingApplication.isPresent()) {
                    throw new EntityExistsException("Application already exists for this client and coach");
                }

                Application application = new Application();
                application.setClient(client);
                application.setCoach(coach);
                application.setDescription(request.getDescription());
                application.setStatus(ApplicationStatus.PENDING);
                application.setSubmitted_date(LocalDateTime.now());

                applicationRepository.save(application);
                return applicationDTOMapper.mapEntityToDTO(application);
            }
            throw new EntityNotFoundException("Coach not found");
        }
        throw new EntityNotFoundException("Client not found");
    }

    public void acceptApplication(long application_id, Authentication authentication) {
        Application application = applicationRepository.findById(application_id)
                .orElseThrow(() -> new EntityNotFoundException("Application not found"));

        if (!application.getStatus().equals(ApplicationStatus.PENDING)) {
            throw new ApplicationIsNotActiveException("Application is not active");
        }

        String username = authentication.getName();
        Coach coach = coachRepository.findByEmail(username)
                .orElseThrow(() -> new EntityNotFoundException("Coach not found"));

        if (!Objects.equals(application.getCoach(), coach)) {
            throw new AuthorizationException("You are not authorized to accept this application");
        }

        Client client = application.getClient();
        clientService.assignClientToCoach(client.getId(), coach.getId(), authentication);

        application.setStatus(ApplicationStatus.ACCEPTED);
        applicationRepository.save(application);
    }

    public void rejectApplication(long application_id, Authentication authentication) {
        Application application = applicationRepository.findById(application_id)
                .orElseThrow(() -> new EntityNotFoundException("Application not found"));

        if (!application.getStatus().equals(ApplicationStatus.PENDING)) {
            throw new ApplicationIsNotActiveException("Application is not active");
        }

        String username = authentication.getName();
        Coach coach = coachRepository.findByEmail(username)
                .orElseThrow(() -> new EntityNotFoundException("Coach not found"));

        if (!Objects.equals(application.getCoach(), coach)) {
            throw new AuthorizationException("You are not authorized to reject this application");
        }

        application.setStatus(ApplicationStatus.REJECTED);
        applicationRepository.save(application);
    }

    public void updateStatus(long application_id, ApplicationStatus status) {
        Optional<Application> optApplication = applicationRepository.findById(application_id);
        if (optApplication.isPresent()) {
            Application application = optApplication.get();
            application.setStatus(status);
            applicationRepository.save(application);
        } else {
            throw new EntityNotFoundException("Application with ID " + application_id + " not found");
        }
    }
}
