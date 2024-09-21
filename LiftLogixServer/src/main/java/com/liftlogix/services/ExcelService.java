package com.liftlogix.services;

import com.liftlogix.models.*;
import org.apache.poi.hssf.usermodel.HSSFSheet;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;

import com.liftlogix.exceptions.AuthorizationException;
import com.liftlogix.repositories.PlanRepository;
import com.liftlogix.types.Role;
import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;

@Service
@AllArgsConstructor
public class ExcelService {
    private final PlanRepository planRepository;

    public ByteArrayResource exportPlanToExcel(Long planId, User user) throws IOException {

        Plan plan = planRepository.findById(planId).orElseThrow(
                () -> new EntityNotFoundException("Plan not found")
        );

        if (!Objects.equals(plan.getAuthor().getEmail(), user.getEmail()) && !user.getRole().equals(Role.ADMIN)) {
            throw new AuthorizationException("You are not authorized");
        }

        try (HSSFWorkbook workbook = new HSSFWorkbook()) {
            int mesocycleCounter = 1;
            for (Mesocycle mesocycle : plan.getMesocycles()) {
                String sheetName = "Mezocykl " + mesocycleCounter++;
                HSSFSheet sheet = workbook.createSheet(sheetName);

                int columnOffset = 0;
                int microcycleCounter = 1;

                for (Microcycle microcycle : mesocycle.getMicrocycles()) {
                    Row headerRow = sheet.getRow(0);
                    if (headerRow == null) {
                        headerRow = sheet.createRow(0);
                    }
                    Cell headerCell = headerRow.createCell(columnOffset);
                    headerCell.setCellValue("Mikrocykl " + microcycleCounter++);

                    CellStyle microcycleHeaderStyle = workbook.createCellStyle();
                    microcycleHeaderStyle.setFillForegroundColor(IndexedColors.LIGHT_BLUE.getIndex());
                    microcycleHeaderStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
                    Font headerFont = workbook.createFont();
                    headerFont.setBold(true);
                    microcycleHeaderStyle.setFont(headerFont);
                    headerCell.setCellStyle(microcycleHeaderStyle);

                    Row columnHeaderRow = sheet.getRow(1);
                    if (columnHeaderRow == null) {
                        columnHeaderRow = sheet.createRow(1);
                    }
                    String[] headers = {"Nazwa ćwiczenia", "Serie", "Powtórzenia", "Waga (kg)", "%1RM", "Tempo", "RPE", "Przerwa"};

                    for (int i = 0; i < headers.length; i++) {
                        Cell cell = columnHeaderRow.createCell(columnOffset + i);
                        cell.setCellValue(headers[i]);

                        CellStyle columnHeaderStyle = workbook.createCellStyle();
                        columnHeaderStyle.setFillForegroundColor(IndexedColors.LIGHT_GREEN.getIndex());
                        columnHeaderStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
                        columnHeaderStyle.setBorderBottom(BorderStyle.THIN);
                        columnHeaderStyle.setBorderLeft(BorderStyle.THIN);
                        columnHeaderStyle.setBorderRight(BorderStyle.THIN);
                        columnHeaderStyle.setBorderTop(BorderStyle.THIN);
                        columnHeaderStyle.setFont(headerFont);
                        cell.setCellStyle(columnHeaderStyle);
                    }

                    int rowIndex = 2;
                    List<Workout> sortedWorkouts = microcycle.getWorkouts().stream()
                            .filter(workout -> workout.getDays() != null && !workout.getDays().isEmpty())
                            .sorted(Comparator.comparingInt(workout -> workout.getDays().getFirst()))
                            .toList();

                    for (Workout workout : sortedWorkouts) {
                        for (Integer day : workout.getDays()) {
                            Row workoutRow = sheet.getRow(rowIndex++);
                            if (workoutRow == null) {
                                workoutRow = sheet.createRow(rowIndex - 1);
                            }
                            Cell workoutCell = workoutRow.createCell(columnOffset);
                            workoutCell.setCellValue(workout.getName() + " - Dzień " + day);

                            CellStyle workoutCellStyle = workbook.createCellStyle();
                            workoutCellStyle.setFillForegroundColor(IndexedColors.YELLOW.getIndex());
                            workoutCellStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
                            workoutCell.setCellStyle(workoutCellStyle);

                            for (WorkoutExercise workoutExercise : workout.getWorkoutExercises()) {
                                Row exerciseRow = sheet.getRow(rowIndex++);
                                if (exerciseRow == null) {
                                    exerciseRow = sheet.createRow(rowIndex - 1);
                                }
                                exerciseRow.createCell(columnOffset).setCellValue(workoutExercise.getExercise().getName());
                                if (workoutExercise.getSeries() != null) {
                                    exerciseRow.createCell(columnOffset + 1).setCellValue(workoutExercise.getSeries());
                                } else {
                                    exerciseRow.createCell(columnOffset + 1).setCellValue("");
                                }
                                exerciseRow.createCell(columnOffset + 2).setCellValue(formatRepetitions(workoutExercise));
                                if (workoutExercise.getWeight() != null) {
                                    exerciseRow.createCell(columnOffset + 3).setCellValue(workoutExercise.getWeight());
                                } else {
                                    exerciseRow.createCell(columnOffset + 3).setCellValue("");
                                }
                                if (workoutExercise.getPercentage() != null) {
                                    exerciseRow.createCell(columnOffset + 4).setCellValue(workoutExercise.getPercentage());
                                } else {
                                    exerciseRow.createCell(columnOffset + 4).setCellValue("");
                                }
                                if (workoutExercise.getTempo() != null) {
                                    exerciseRow.createCell(columnOffset + 5).setCellValue(workoutExercise.getTempo());
                                } else {
                                    exerciseRow.createCell(columnOffset + 5).setCellValue("");
                                }
                                if (workoutExercise.getRpe() != null) {
                                    exerciseRow.createCell(columnOffset + 6).setCellValue(workoutExercise.getRpe());
                                } else {
                                    exerciseRow.createCell(columnOffset + 6).setCellValue("");
                                }
                                if (workoutExercise.getBreakTime().getValue() != null) {
                                    exerciseRow.createCell(columnOffset + 7).setCellValue(workoutExercise.getBreakTime().getValue() + workoutExercise.getBreakTime().getUnit().name());
                                } else {
                                    exerciseRow.createCell(columnOffset + 7).setCellValue("");
                                }
                            }
                            rowIndex++;
                        }
                    }

                    for (int i = 0; i < headers.length; i++) {
                        sheet.autoSizeColumn(columnOffset + i, true);
                    }

                    columnOffset += headers.length + 1;
                }
            }

            try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
                workbook.write(out);
                return new ByteArrayResource(out.toByteArray());
            }

        } catch (IOException e) {
            e.printStackTrace();
            throw new IOException("Cannot export file");
        }
    }

    private String formatRepetitions(WorkoutExercise workoutExercise) {
        if (workoutExercise.getRepetitionsFrom() != null && workoutExercise.getRepetitionsTo() != null) {
            if (workoutExercise.getRepetitionsFrom().equals(workoutExercise.getRepetitionsTo())) {
                return workoutExercise.getRepetitionsFrom().toString();
            }
            return workoutExercise.getRepetitionsFrom() + " - " + workoutExercise.getRepetitionsTo();
        } else if (workoutExercise.getRepetitionsFrom() != null) {
            return workoutExercise.getRepetitionsFrom().toString();
        } else if (workoutExercise.getRepetitionsTo() != null) {
            return workoutExercise.getRepetitionsTo().toString();
        } else {
            return "";
        }
    }
}
