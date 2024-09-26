package com.liftlogix.repositories;

import com.liftlogix.models.exercises.Exercise;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExerciseRepository extends JpaRepository<Exercise, Long>, JpaSpecificationExecutor<Exercise> {
    boolean existsByName(String name);

    @Query("SELECT e FROM Exercise e JOIN e.aliases a WHERE LOWER(a.alias) LIKE LOWER(CONCAT('%', :alias, '%'))")
    List<Exercise> findByAliasContainingIgnoreCase(String alias);
}
