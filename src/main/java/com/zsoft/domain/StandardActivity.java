package com.zsoft.domain;


import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import javax.persistence.*;
import javax.validation.constraints.*;

import java.io.Serializable;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Objects;

import com.zsoft.domain.enumeration.ValidationStatus;

/**
 * A StandardActivity.
 */
@Entity
@Table(name = "standard_activity")
public class StandardActivity implements Serializable {

    private static final long serialVersionUID = 1L;
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(name = "zs_date", nullable = false)
    private LocalDate date;

    @Column(name = "morning")
    private Boolean morning;

    @Column(name = "afternoon")
    private Boolean afternoon;

    @Column(name = "validation_date")
    private Instant validationDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "validation_status")
    private ValidationStatus validationStatus;

    @ManyToOne(optional = false)
    @NotNull
    @JsonIgnoreProperties("standardActivities")
    private ActivityReport activityReport;

    @ManyToOne
    @JsonIgnoreProperties("standardActivities")
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

    public StandardActivity date(LocalDate date) {
        this.date = date;
        return this;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public Boolean isMorning() {
        return morning;
    }

    public StandardActivity morning(Boolean morning) {
        this.morning = morning;
        return this;
    }

    public void setMorning(Boolean morning) {
        this.morning = morning;
    }

    public Boolean isAfternoon() {
        return afternoon;
    }

    public StandardActivity afternoon(Boolean afternoon) {
        this.afternoon = afternoon;
        return this;
    }

    public void setAfternoon(Boolean afternoon) {
        this.afternoon = afternoon;
    }

    public Instant getValidationDate() {
        return validationDate;
    }

    public StandardActivity validationDate(Instant validationDate) {
        this.validationDate = validationDate;
        return this;
    }

    public void setValidationDate(Instant validationDate) {
        this.validationDate = validationDate;
    }

    public ValidationStatus getValidationStatus() {
        return validationStatus;
    }

    public StandardActivity validationStatus(ValidationStatus validationStatus) {
        this.validationStatus = validationStatus;
        return this;
    }

    public void setValidationStatus(ValidationStatus validationStatus) {
        this.validationStatus = validationStatus;
    }

    public ActivityReport getActivityReport() {
        return activityReport;
    }

    public StandardActivity activityReport(ActivityReport activityReport) {
        this.activityReport = activityReport;
        return this;
    }

    public void setActivityReport(ActivityReport activityReport) {
        this.activityReport = activityReport;
    }

    public ProjectValidator getValidator() {
        return validator;
    }

    public StandardActivity validator(ProjectValidator projectValidator) {
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
        StandardActivity standardActivity = (StandardActivity) o;
        if (standardActivity.getId() == null || getId() == null) {
            return false;
        }
        return Objects.equals(getId(), standardActivity.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }

    @Override
    public String toString() {
        return "StandardActivity{" +
            "id=" + getId() +
            ", date='" + getDate() + "'" +
            ", morning='" + isMorning() + "'" +
            ", afternoon='" + isAfternoon() + "'" +
            ", validationDate='" + getValidationDate() + "'" +
            ", validationStatus='" + getValidationStatus() + "'" +
            "}";
    }
}
