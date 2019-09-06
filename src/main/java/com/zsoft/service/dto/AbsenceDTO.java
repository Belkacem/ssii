package com.zsoft.service.dto;
import java.time.Instant;
import java.time.LocalDate;
import javax.validation.constraints.*;
import java.io.Serializable;
import java.util.Objects;
import com.zsoft.domain.enumeration.ValidationStatus;

/**
 * A DTO for the Absence entity.
 */
public class AbsenceDTO implements Serializable {

    private Long id;

    private Instant submissionDate;

    @NotNull
    private LocalDate start;

    @NotNull
    private Boolean startHalfDay;

    @NotNull
    private LocalDate end;

    @NotNull
    private Boolean endHalfDay;

    private String description;

    @NotNull
    private Float numberDays;

    private Instant validationDate;

    @NotNull
    private ValidationStatus validationStatus;

    private String validationComment;


    private Long resourceId;

    private Long typeId;

    private Long creatorId;

    private Long validatorId;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Instant getSubmissionDate() {
        return submissionDate;
    }

    public void setSubmissionDate(Instant submissionDate) {
        this.submissionDate = submissionDate;
    }

    public LocalDate getStart() {
        return start;
    }

    public void setStart(LocalDate start) {
        this.start = start;
    }

    public Boolean isStartHalfDay() {
        return startHalfDay;
    }

    public void setStartHalfDay(Boolean startHalfDay) {
        this.startHalfDay = startHalfDay;
    }

    public LocalDate getEnd() {
        return end;
    }

    public void setEnd(LocalDate end) {
        this.end = end;
    }

    public Boolean isEndHalfDay() {
        return endHalfDay;
    }

    public void setEndHalfDay(Boolean endHalfDay) {
        this.endHalfDay = endHalfDay;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Float getNumberDays() {
        return numberDays;
    }

    public void setNumberDays(Float numberDays) {
        this.numberDays = numberDays;
    }

    public Instant getValidationDate() {
        return validationDate;
    }

    public void setValidationDate(Instant validationDate) {
        this.validationDate = validationDate;
    }

    public ValidationStatus getValidationStatus() {
        return validationStatus;
    }

    public void setValidationStatus(ValidationStatus validationStatus) {
        this.validationStatus = validationStatus;
    }

    public String getValidationComment() {
        return validationComment;
    }

    public void setValidationComment(String validationComment) {
        this.validationComment = validationComment;
    }

    public Long getResourceId() {
        return resourceId;
    }

    public void setResourceId(Long resourceId) {
        this.resourceId = resourceId;
    }

    public Long getTypeId() {
        return typeId;
    }

    public void setTypeId(Long absenceTypeId) {
        this.typeId = absenceTypeId;
    }

    public Long getCreatorId() {
        return creatorId;
    }

    public void setCreatorId(Long userId) {
        this.creatorId = userId;
    }

    public Long getValidatorId() {
        return validatorId;
    }

    public void setValidatorId(Long absenceValidatorId) {
        this.validatorId = absenceValidatorId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }

        AbsenceDTO absenceDTO = (AbsenceDTO) o;
        if (absenceDTO.getId() == null || getId() == null) {
            return false;
        }
        return Objects.equals(getId(), absenceDTO.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }

    @Override
    public String toString() {
        return "AbsenceDTO{" +
            "id=" + getId() +
            ", submissionDate='" + getSubmissionDate() + "'" +
            ", start='" + getStart() + "'" +
            ", startHalfDay='" + isStartHalfDay() + "'" +
            ", end='" + getEnd() + "'" +
            ", endHalfDay='" + isEndHalfDay() + "'" +
            ", description='" + getDescription() + "'" +
            ", numberDays=" + getNumberDays() +
            ", validationDate='" + getValidationDate() + "'" +
            ", validationStatus='" + getValidationStatus() + "'" +
            ", validationComment='" + getValidationComment() + "'" +
            ", resource=" + getResourceId() +
            ", type=" + getTypeId() +
            ", creator=" + getCreatorId() +
            ", validator=" + getValidatorId() +
            "}";
    }
}
