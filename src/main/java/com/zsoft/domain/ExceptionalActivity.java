package com.zsoft.domain;


import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import javax.persistence.*;
import javax.validation.constraints.*;

import java.io.Serializable;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Objects;

import com.zsoft.domain.enumeration.ValidationStatus;

import com.zsoft.domain.enumeration.ExceptionalActivityType;

/**
 * A ExceptionalActivity.
 */
@Entity
@Table(name = "exceptional_activity")
public class ExceptionalActivity implements Serializable {

    private static final long serialVersionUID = 1L;
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(name = "zs_date", nullable = false)
    private LocalDate date;

    @DecimalMin(value = "0")
    @DecimalMax(value = "24")
    @Column(name = "zs_start")
    private Float start;

    @NotNull
    @DecimalMin(value = "0")
    @DecimalMax(value = "24")
    @Column(name = "nb_hours", nullable = false)
    private Float nbHours;

    @Column(name = "validation_date")
    private Instant validationDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "validation_status")
    private ValidationStatus validationStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "zs_type")
    private ExceptionalActivityType type;

    @ManyToOne(optional = false)
    @NotNull
    @JsonIgnoreProperties("exceptionalActivities")
    private ActivityReport activityReport;

    @ManyToOne
    @JsonIgnoreProperties("exceptionalActivities")
    private ProjectValidator validator;

    // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getDate() {
        return date;
    }

    public ExceptionalActivity date(LocalDate date) {
        this.date = date;
        return this;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public Float getStart() {
        return start;
    }

    public ExceptionalActivity start(Float start) {
        this.start = start;
        return this;
    }

    public void setStart(Float start) {
        this.start = start;
    }

    public Float getNbHours() {
        return nbHours;
    }

    public ExceptionalActivity nbHours(Float nbHours) {
        this.nbHours = nbHours;
        return this;
    }

    public void setNbHours(Float nbHours) {
        this.nbHours = nbHours;
    }

    public Instant getValidationDate() {
        return validationDate;
    }

    public ExceptionalActivity validationDate(Instant validationDate) {
        this.validationDate = validationDate;
        return this;
    }

    public void setValidationDate(Instant validationDate) {
        this.validationDate = validationDate;
    }

    public ValidationStatus getValidationStatus() {
        return validationStatus;
    }

    public ExceptionalActivity validationStatus(ValidationStatus validationStatus) {
        this.validationStatus = validationStatus;
        return this;
    }

    public void setValidationStatus(ValidationStatus validationStatus) {
        this.validationStatus = validationStatus;
    }

    public ExceptionalActivityType getType() {
        return type;
    }

    public ExceptionalActivity type(ExceptionalActivityType type) {
        this.type = type;
        return this;
    }

    public void setType(ExceptionalActivityType type) {
        this.type = type;
    }

    public ActivityReport getActivityReport() {
        return activityReport;
    }

    public ExceptionalActivity activityReport(ActivityReport activityReport) {
        this.activityReport = activityReport;
        return this;
    }

    public void setActivityReport(ActivityReport activityReport) {
        this.activityReport = activityReport;
    }

    public ProjectValidator getValidator() {
        return validator;
    }

    public ExceptionalActivity validator(ProjectValidator projectValidator) {
        this.validator = projectValidator;
        return this;
    }

    public void setValidator(ProjectValidator projectValidator) {
        this.validator = projectValidator;
    }
    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here, do not remove

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        ExceptionalActivity exceptionalActivity = (ExceptionalActivity) o;
        if (exceptionalActivity.getId() == null || getId() == null) {
            return false;
        }
        return Objects.equals(getId(), exceptionalActivity.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }

    @Override
    public String toString() {
        return "ExceptionalActivity{" +
            "id=" + getId() +
            ", date='" + getDate() + "'" +
            ", start=" + getStart() +
            ", nbHours=" + getNbHours() +
            ", validationDate='" + getValidationDate() + "'" +
            ", validationStatus='" + getValidationStatus() + "'" +
            ", type='" + getType() + "'" +
            "}";
    }
}
