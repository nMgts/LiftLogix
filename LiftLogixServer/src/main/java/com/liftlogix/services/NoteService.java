package com.liftlogix.services;

import com.liftlogix.convert.NoteDTOMapper;
import com.liftlogix.dto.NoteDTO;
import com.liftlogix.exceptions.AuthorizationException;
import com.liftlogix.models.Note;
import com.liftlogix.models.users.Coach;
import com.liftlogix.repositories.CoachRepository;
import com.liftlogix.repositories.NoteRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class NoteService {
    private final NoteRepository noteRepository;
    private final CoachRepository coachRepository;
    private final NoteDTOMapper noteDTOMapper;

    public List<NoteDTO> getNotesByCoach(Authentication authentication) {

        String email = authentication.getName();
        Coach coach = coachRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Coach not found"));

        List<Note> notes = noteRepository.findByCoachId(coach.getId());

        return notes.stream()
                .map(noteDTOMapper::mapEntityToDTO)
                .collect(Collectors.toList());
    }

    public NoteDTO updateNote(NoteDTO noteDTO, Authentication authentication) {
        if (!checkAccess(authentication, noteDTO)) {
            throw new AuthorizationException("You are not authorized");
        }

        Coach coach = coachRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new EntityNotFoundException("Coach not found"));
        Note note = noteDTOMapper.mapDTOToEntity(noteDTO);
        note.setCoach(coach);
        noteRepository.save(note);
        return noteDTO;
    }

    public void deleteNote(Long id, Authentication authentication) {
        Note note = noteRepository.findById(id).
                orElseThrow(() -> new EntityNotFoundException("Note not found"));

        if (!checkAccess(authentication, noteDTOMapper.mapEntityToDTO(note))) {
            throw new AuthorizationException("You are not authorized");
        }

        noteRepository.delete(note);
    }

    private boolean checkAccess(Authentication authentication, NoteDTO noteDTO) {
        String email = authentication.getName();
        Optional<Coach> coach = coachRepository.findByEmail(email);
        return coach.isPresent() && coach.get().getId() == noteDTO.getCoach_id();
    }
}
