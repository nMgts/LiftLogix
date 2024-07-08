package com.liftlogix.services;

import com.liftlogix.models.Exercise;
import com.liftlogix.repositories.ExerciseRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
@AllArgsConstructor
public class ExerciseService {
    private final ExerciseRepository exerciseRepository;

    public Exercise getExerciseDetails(long id) {
        return exerciseRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Exercise not found"));
    }

    public List<Exercise> getAllExercises() {
        return exerciseRepository.findAll();
    }

    public Exercise addExercise(String name, String description, String url, MultipartFile image) throws IOException {
        try {
            Exercise exercise = new Exercise();
            exercise.setName(name);
            exercise.setDescription(description);
            exercise.setUrl(url);
            exercise.setImage(image.getBytes());
            return exerciseRepository.save(exercise);
        } catch (IOException e) {
            throw new IOException("Nie udało się przetworzyć pliku obrazu.");
        }
    }
}
