package com.liftlogix.services;

import com.liftlogix.convert.NoteDTOMapper;
import com.liftlogix.dto.NoteDTO;
import com.liftlogix.exceptions.AuthorizationException;
import com.liftlogix.models.Note;
import com.liftlogix.models.users.Coach;
import com.liftlogix.repositories.CoachRepository;
import com.liftlogix.repositories.NoteRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class NoteServiceTest {
    @Mock private NoteRepository noteRepository;
    @Mock private CoachRepository coachRepository;
    @Mock private NoteDTOMapper noteDTOMapper;
    @Mock private Authentication authentication;
    @InjectMocks private NoteService noteService;

    @Test
    void getNotesByCoach_ShouldReturnNotes_WhenCoachExists() {
        // GIVEN
        String email = "coach@example.com";
        Coach coach = new Coach();
        coach.setId(1L);
        coach.setEmail(email);
        Note note = new Note();
        note.setCoach(coach);
        NoteDTO noteDTO = new NoteDTO();

        when(authentication.getName()).thenReturn(email);
        when(coachRepository.findByEmail(email)).thenReturn(Optional.of(coach));
        when(noteRepository.findByCoachId(coach.getId())).thenReturn(List.of(note));
        when(noteDTOMapper.mapEntityToDTO(note)).thenReturn(noteDTO);

        // WHEN
        List<NoteDTO> result = noteService.getNotesByCoach(authentication);

        // THEN
        assertFalse(result.isEmpty());
        verify(coachRepository, times(1)).findByEmail(email);
        verify(noteRepository, times(1)).findByCoachId(coach.getId());
    }

    @Test
    void getNotesByCoach_ShouldThrowException_WhenCoachNotFound() {
        // GIVEN
        String email = "coach@example.com";
        when(authentication.getName()).thenReturn(email);
        when(coachRepository.findByEmail(email)).thenReturn(Optional.empty());

        // THEN
        assertThrows(EntityNotFoundException.class, () -> noteService.getNotesByCoach(authentication));
    }
    @Test
    void updateNote_ShouldThrowException_WhenUnauthorized() {
        // GIVEN
        String email = "coach@example.com";
        NoteDTO noteDTO = new NoteDTO();
        noteDTO.setCoach_id(2L);
        when(authentication.getName()).thenReturn(email);
        when(coachRepository.findByEmail(email)).thenReturn(Optional.of(new Coach()));

        // THEN
        assertThrows(AuthorizationException.class, () -> noteService.updateNote(noteDTO, authentication));
    }

    @Test
    void deleteNote_ShouldDeleteNote_WhenAuthorized() {
        // GIVEN
        String email = "coach@example.com";
        Coach coach = new Coach();
        coach.setId(1L);
        Note note = new Note();
        note.setId(1L);
        note.setCoach(coach);
        NoteDTO noteDTO = new NoteDTO();
        noteDTO.setCoach_id(1L);

        when(authentication.getName()).thenReturn(email);
        when(noteRepository.findById(1L)).thenReturn(Optional.of(note));
        when(noteDTOMapper.mapEntityToDTO(note)).thenReturn(noteDTO);
        when(coachRepository.findByEmail(email)).thenReturn(Optional.of(coach));

        // WHEN
        noteService.deleteNote(1L, authentication);

        // THEN
        verify(noteRepository, times(1)).delete(note);
    }

    @Test
    void deleteNote_ShouldThrowException_WhenUnauthorized() {
        // GIVEN
        String email = "coach@example.com";
        Note note = new Note();
        note.setId(1L);
        NoteDTO noteDTO = new NoteDTO();
        noteDTO.setCoach_id(2L);

        when(authentication.getName()).thenReturn(email);
        when(noteRepository.findById(1L)).thenReturn(Optional.of(note));
        when(noteDTOMapper.mapEntityToDTO(note)).thenReturn(noteDTO);
        when(coachRepository.findByEmail(email)).thenReturn(Optional.of(new Coach()));

        // THEN
        assertThrows(AuthorizationException.class, () -> noteService.deleteNote(1L, authentication));
    }

    @Test
    void deleteNote_ShouldThrowException_WhenNoteNotFound() {
        // GIVEN
        when(noteRepository.findById(1L)).thenReturn(Optional.empty());

        // THEN
        assertThrows(EntityNotFoundException.class, () -> noteService.deleteNote(1L, authentication));
    }
}
