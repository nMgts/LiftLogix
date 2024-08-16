package com.liftlogix.services;

import com.liftlogix.convert.ResultDTOMapper;
import com.liftlogix.dto.ResultDTO;
import com.liftlogix.exceptions.AuthorizationException;
import com.liftlogix.models.Client;
import com.liftlogix.models.Result;
import com.liftlogix.models.User;
import com.liftlogix.repositories.ClientRepository;
import com.liftlogix.repositories.ResultRepository;
import com.liftlogix.repositories.UserRepository;
import com.liftlogix.types.Role;
import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class ResultService {
    private final ResultRepository resultRepository;
    private final ClientRepository clientRepository;
    private final ResultDTOMapper resultDTOMapper;
    private final UserRepository userRepository;

    public List<ResultDTO> getAllResults(long clientId, Authentication authentication) {

        if (!checkAccess(authentication, clientId)) {
            throw new AuthorizationException("You are not authorized");
        }

        List<Result> results = resultRepository.findByClientId(clientId);
        return results.stream()
                .map(resultDTOMapper::mapEntityToDTO)
                .collect(Collectors.toList());
    }

    public ResultDTO getCurrentResult(long clientId, Authentication authentication) {

        if (!checkAccess(authentication, clientId)) {
            throw new AuthorizationException("You are not authorized");
        }

        List<Result> results = resultRepository.findByClientId(clientId);

        ResultDTO currentResult = new ResultDTO();
        currentResult.setClient_id(clientId);
        currentResult.setDate(LocalDate.now());

        findNearestResult(results, "benchpress").ifPresent(r -> currentResult.setBenchpress(r.getBenchpress()));
        findNearestResult(results, "deadlift").ifPresent(r -> currentResult.setDeadlift(r.getDeadlift()));
        findNearestResult(results, "squat").ifPresent(r -> currentResult.setSquat(r.getSquat()));

        return currentResult;
    }

    public ResultDTO addResult(long clientId, Double benchpress, Double deadlift, Double squat, Authentication authentication) throws IllegalArgumentException {

        if (!checkAccess(authentication, clientId)) {
            throw new AuthorizationException("You are not authorized");
        }

        if ((benchpress == null || benchpress <= 0) &&
                (deadlift == null || deadlift <= 0) &&
                (squat == null || squat <= 0)) {
            throw new IllegalArgumentException("At least one result must be provided and greater than 0");
        }

        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new EntityNotFoundException("Client not found"));

        Result result = new Result();
        result.setClient(client);

        if (benchpress != null && benchpress > 0) {
            result.setBenchpress(benchpress);
        }
        if (deadlift != null && deadlift > 0) {
            result.setDeadlift(deadlift);
        }
        if (squat != null && squat > 0) {
            result.setSquat(squat);
        }
        result.setDate(LocalDate.now());
        resultRepository.save(result);

        return resultDTOMapper.mapEntityToDTO(result);
    }

    public ResultDTO updateResult(ResultDTO result, Authentication authentication) {

        long clientId = result.getClient_id();
        if (!checkAccess(authentication, clientId)) {
            throw new AuthorizationException("You are not authorized");
        }

        if ((result.getBenchpress() == null || result.getBenchpress() <= 0) &&
                (result.getDeadlift() == null || result.getDeadlift() <= 0) &&
                (result.getSquat() == null || result.getSquat() <= 0)) {
            throw new IllegalArgumentException("At least one result must be provided and greater than 0");
        }

        Result entity = resultRepository.findById(result.getId()).orElseThrow(
                () -> new EntityNotFoundException("Result not found")
        );

        if (result.getBenchpress() != null && result.getBenchpress() > 0) {
            entity.setBenchpress(result.getBenchpress());
        }
        if (result.getDeadlift() != null && result.getDeadlift() > 0) {
            entity.setDeadlift(result.getDeadlift());
        }
        if (result.getSquat() != null && result.getSquat() > 0) {
            entity.setSquat(result.getSquat());
        }

        entity.setDate(result.getDate());

        resultRepository.save(entity);
        return resultDTOMapper.mapEntityToDTO(entity);
    }

    public void deleteResult(long resultId, Authentication authentication) {

        Result result = resultRepository.findById(resultId).orElseThrow(
                () -> new EntityNotFoundException("Result not found")
        );

        long clientId = result.getClient().getId();
        if (!checkAccess(authentication, clientId)) {
            throw new AuthorizationException("You are not authorized");
        }

        resultRepository.deleteById(result.getId());
    }

    private Optional<Result> findNearestResult(List<Result> results, String exercise) {
        return results.stream()
                .filter(result -> {
                    switch (exercise) {
                        case "benchpress":
                            return result.getBenchpress() != null;
                        case "deadlift":
                            return result.getDeadlift() != null;
                        case "squat":
                            return result.getSquat() != null;
                        default:
                            return false;
                    }
                })
                .min(Comparator.comparing(result -> Math.abs(result.getDate().until(LocalDate.now(), ChronoUnit.DAYS))));
    }

    private boolean checkAccess(Authentication authentication, long clientId) {

        Client client = clientRepository.findById(clientId).orElseThrow(
                () -> new EntityNotFoundException("Client not found")
        );

        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElseThrow(
                () -> new EntityNotFoundException("User not found"));

        if (user.getRole() == Role.COACH) {
            return client.getCoach().getId() == user.getId();
        } else if (user.getRole() == Role.ADMIN) return true;
        else {
            return user.getId() == client.getId();
        }
    }
}
