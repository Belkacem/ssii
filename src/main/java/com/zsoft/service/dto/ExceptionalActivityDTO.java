package com.zsoft.service.dto;
import java.time.Instant;
import java.time.LocalDate;
import javax.validation.constraints.*;
import java.io.Serializable;
import java.util.Objects;
import com.zsoft.domain.enumeration.ValidationStatus;
import com.zsoft.domain.enumeration.ExceptionalActivityType;

/**
 * A DTO for the ExceptionalActivity entity.
 */
public class ExceptionalActivityDTO implements Serializable {

    private Long id;

    @NotNull
    private LocalDate date;

    @DecimalMin(value = "0")
    @DecimalMax(value = "24")
    private Float start;

    @NotNull
    @DecimalMin(value = "0")
    @DecimalMax(value = "24")
    private Float nbHours;

    private Instant validationDate;

    private ValidationStatus validationStatus;

    private ExceptionalActivityType type;


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

    public Float getStart() {
        return start;
    }

    public void setStart(Float start) {
        this.start = start;
    }

    public Float getNbHours() {
        return nbHours;
    }

    public void setNbHours(Float nbHours) {
        this.nbHours = nbHours;
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

    public ExceptionalActivityType getType() {
        return type;
    }

    public void setType(ExceptionalActivityType type) {
        this.type = type;
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

        ExceptionalActivityDTO exceptionalActivityDTO = (ExceptionalActivityDTO) o;
        if (exceptionalActivityDTO.getId() == null || getId() == null) {
            return false;
        }
        return Objects.equals(getId(), exceptionalActivityDTO.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }

    @Override
    public String toString() {
        return "ExceptionalActivityDTO{" +
            "id=" + getId() +
            ", date='" + getDate() + "'" +
            ", start=" + getStart() +
            ", nbHours=" + getNbHours() +
            ", validationDate='" + getValidationDate() + "'" +
            ", validationStatus='" + getValidationStatus() + "'" +
            ", type='" + getType() + "'" +
            ", activityReport=" + getActivityReportId() +
            ", validator=" + getValidatorId() +
            "}";
    }
}
