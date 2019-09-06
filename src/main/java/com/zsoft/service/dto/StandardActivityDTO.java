package com.zsoft.service.dto;
import java.time.Instant;
import java.time.LocalDate;
import javax.validation.constraints.*;
import java.io.Serializable;
import java.util.Objects;
import com.zsoft.domain.enumeration.ValidationStatus;

/**
 * A DTO for the StandardActivity entity.
 */
public class StandardActivityDTO implements Serializable {

    private Long id;

    @NotNull
    private LocalDate date;

    private Boolean morning;

    private Boolean afternoon;

    private Instant validationDate;

    private ValidationStatus validationStatus;


    private Long activityReportId;

    private Long validatorId;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public Boolean isMorning() {
        return morning;
    }

    public void setMorning(Boolean morning) {
        this.morning = morning;
    }

    public Boolean isAfternoon() {
        return afternoon;
    }

    public void setAfternoon(Boolean afternoon) {
        this.afternoon = afternoon;
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

    public Long getActivityReportId() {
        return activityReportId;
    }

    public void setActivityReportId(Long activityReportId) {
        this.activityReportId = activityReportId;
    }

    public Long getValidatorId() {
        return validatorId;
    }

    public void setValidatorId(Long projectValidatorId) {
        this.validatorId = projectValidatorId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }

        StandardActivityDTO standardActivityDTO = (StandardActivityDTO) o;
        if (standardActivityDTO.getId() == null || getId() == null) {
            return false;
        }
        return Objects.equals(getId(), standardActivityDTO.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }

    @Override
    public String toString() {
        return "StandardActivityDTO{" +
            "id=" + getId() +
            ", date='" + getDate() + "'" +
            ", morning='" + isMorning() + "'" +
            ", afternoon='" + isAfternoon() + "'" +
            ", validationDate='" + getValidationDate() + "'" +
            ", validationStatus='" + getValidationStatus() + "'" +
            ", activityReport=" + getActivityReportId() +
            ", validator=" + getValidatorId() +
            "}";
    }
}
