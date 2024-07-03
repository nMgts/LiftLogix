package com.liftlogix.services;

import com.liftlogix.models.Exercise;
import com.liftlogix.repositories.ExerciseRepository;
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
        return exerciseRepository.findById(id).orElseThrow(() -> new RuntimeException("Exercise not found"));
    }

    public List<Exercise> getAllExercises() {
        return exerciseRepository.findAll();
    }

    public Exercise addExercise(String name, String description, String url, MultipartFile image) throws IOException {
        Exercise exercise = new Exercise();
        exercise.setName(name);
        exercise.setDescription(description);
        exercise.setUrl(url);
        exercise.setImage(image.getBytes());
        return exerciseRepository.save(exercise);
    }
}
