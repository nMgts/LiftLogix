package com.liftlogix.services;

import com.liftlogix.convert.ApplicationDTOMapper;
import com.liftlogix.dto.ApplicationDTO;
import com.liftlogix.models.Application;
import com.liftlogix.models.Client;
import com.liftlogix.models.Coach;
import com.liftlogix.repositories.ApplicationRepository;
import com.liftlogix.repositories.ClientRepository;
import com.liftlogix.repositories.CoachRepository;
import com.liftlogix.types.ApplicationStatus;
import jakarta.persistence.EntityExistsException;
import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@AllArgsConstructor
public class ApplicationService {
    private final ApplicationRepository applicationRepository;
    private final ClientRepository clientRepository;
    private final CoachRepository coachRepository;
    private final ApplicationDTOMapper applicationDTOMapper;

    public ApplicationDTO create(ApplicationDTO request) {
        Optional<Client> optClient = clientRepository.findById(request.getClient().getId());
        if (optClient.isPresent()) {
            Optional<Coach> optCoach = coachRepository.findById(request.getCoach().getId());

            if (optCoach.isPresent()) {
                Client client = optClient.get();
                Coach coach = optCoach.get();

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

                applicationRepository.save(application);
                return applicationDTOMapper.mapEntityToDTO(application);
            }
            throw new EntityNotFoundException("Coach not found");
        }
        throw new EntityNotFoundException("Client not found");
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
