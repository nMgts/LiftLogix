package com.liftlogix.services;

import com.liftlogix.convert.MesocycleDTOMapper;
import com.liftlogix.convert.PersonalPlanDTOMapper;
import com.liftlogix.dto.PersonalPlanDTO;
import com.liftlogix.dto.PlanDTO;
import com.liftlogix.models.Client;
import com.liftlogix.models.Mesocycle;
import com.liftlogix.models.PersonalPlan;
import com.liftlogix.repositories.ClientRepository;
import com.liftlogix.repositories.PersonalPlanRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class PersonalPlanService {
    private final PersonalPlanRepository personalPlanRepository;
    private final PersonalPlanDTOMapper personalPlanDTOMapper;
    private final MesocycleDTOMapper mesocycleDTOMapper;
    private final ClientRepository clientRepository;

    public Optional<PersonalPlanDTO> getActivePlanByClientId(Long clientId) {
        return personalPlanRepository.findByClientIdAndIsActiveTrue(clientId)
                .map(personalPlanDTOMapper::mapEntityToDTO);
    }

    public void deactivatePlan(Long planId) {
        PersonalPlan plan = personalPlanRepository.findById(planId).orElseThrow(
                () -> new EntityNotFoundException("Plan not found")
        );
        plan.setActive(false);
        personalPlanRepository.save(plan);
    }

    public PersonalPlanDTO createPersonalPlan(PlanDTO planDTO, Long clientId, LocalDate startDate) {
        PersonalPlan personalPlan = new PersonalPlan();
        personalPlan.setName(planDTO.getName());
        personalPlan.setStartDate(startDate);
        personalPlan.setActive(true);

        List<Mesocycle> mesocycles = planDTO.getMesocycles().stream()
                .map(mesocycleDTO -> {
                    Mesocycle mesocycle = mesocycleDTOMapper.mapDTOToEntity(mesocycleDTO);
                    mesocycle.setPersonalPlan(personalPlan);
                    return mesocycle;
                })
                .collect(Collectors.toList());


        personalPlan.setMesocycles(mesocycles);

        Client client = clientRepository.findById(clientId).orElseThrow(
                () -> new EntityNotFoundException("Client not found")
        );
        personalPlan.setClient(client);

        PersonalPlan savedPlan = personalPlanRepository.save(personalPlan);
        return personalPlanDTOMapper.mapEntityToDTO(savedPlan);
    }
}
