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
 * A Absence.
 */
@Entity
@Table(name = "absence")
public class Absence implements Serializable {

    private static final long serialVersionUID = 1L;
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "submission_date")
    private Instant submissionDate;

    @NotNull
    @Column(name = "zs_start", nullable = false)
    private LocalDate start;

    @NotNull
    @Column(name = "start_half_day", nullable = false)
    private Boolean startHalfDay;

    @NotNull
    @Column(name = "zs_end", nullable = false)
    private LocalDate end;

    @NotNull
    @Column(name = "end_half_day", nullable = false)
    private Boolean endHalfDay;

    @Column(name = "description")
    private String description;

    @NotNull
    @Column(name = "number_days", nullable = false)
    private Float numberDays;

    @Column(name = "validation_date")
    private Instant validationDate;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "validation_status", nullable = false)
    private ValidationStatus validationStatus;

    @Column(name = "validation_comment")
    private String validationComment;

    @ManyToOne(optional = false)
    @NotNull
    @JsonIgnoreProperties("absences")
    private Resource resource;

    @ManyToOne(optional = false)
    @NotNull
    @JsonIgnoreProperties("absences")
    private AbsenceType type;

    @ManyToOne(optional = false)
    @NotNull
    @JsonIgnoreProperties("absences")
    private User creator;

    @ManyToOne
    @JsonIgnoreProperties("absences")
    private AbsenceValidator validator;

    // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Instant getSubmissionDate() {
        return submissionDate;
    }

    public Absence submissionDate(Instant submissionDate) {
        this.submissionDate = submissionDate;
        return this;
    }

    public void setSubmissionDate(Instant submissionDate) {
        this.submissionDate = submissionDate;
    }

    public LocalDate getStart() {
        return start;
    }

    public Absence start(LocalDate start) {
        this.start = start;
        return this;
    }

    public void setStart(LocalDate start) {
        this.start = start;
    }

    public Boolean isStartHalfDay() {
        return startHalfDay;
    }

    public Absence startHalfDay(Boolean startHalfDay) {
        this.startHalfDay = startHalfDay;
        return this;
    }

    public void setStartHalfDay(Boolean startHalfDay) {
        this.startHalfDay = startHalfDay;
    }

    public LocalDate getEnd() {
        return end;
    }

    public Absence end(LocalDate end) {
        this.end = end;
        return this;
    }

    public void setEnd(LocalDate end) {
        this.end = end;
    }

    public Boolean isEndHalfDay() {
        return endHalfDay;
    }

    public Absence endHalfDay(Boolean endHalfDay) {
        this.endHalfDay = endHalfDay;
        return this;
    }

    public void setEndHalfDay(Boolean endHalfDay) {
        this.endHalfDay = endHalfDay;
    }

    public String getDescription() {
        return description;
    }

    public Absence description(String description) {
        this.description = description;
        return this;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Float getNumberDays() {
        return numberDays;
    }

    public Absence numberDays(Float numberDays) {
        this.numberDays = numberDays;
        return this;
    }

    public void setNumberDays(Float numberDays) {
        this.numberDays = numberDays;
    }

    public Instant getValidationDate() {
        return validationDate;
    }

    public Absence validationDate(Instant validationDate) {
        this.validationDate = validationDate;
        return this;
    }

    public void setValidationDate(Instant validationDate) {
        this.validationDate = validationDate;
    }

    public ValidationStatus getValidationStatus() {
        return validationStatus;
    }

    public Absence validationStatus(ValidationStatus validationStatus) {
        this.validationStatus = validationStatus;
        return this;
    }

    public void setValidationStatus(ValidationStatus validationStatus) {
        this.validationStatus = validationStatus;
    }

    public String getValidationComment() {
        return validationComment;
    }

    public Absence validationComment(String validationComment) {
        this.validationComment = validationComment;
        return this;
    }

    public void setValidationComment(String validationComment) {
        this.validationComment = validationComment;
    }

    public Resource getResource() {
        return resource;
    }

    public Absence resource(Resource resource) {
        this.resource = resource;
        return this;
    }

    public void setResource(Resource resource) {
        this.resource = resource;
    }

    public AbsenceType getType() {
        return type;
    }

    public Absence type(AbsenceType absenceType) {
        this.type = absenceType;
        return this;
    }

    public void setType(AbsenceType absenceType) {
        this.type = absenceType;
    }

    public User getCreator() {
        return creator;
    }

    public Absence creator(User user) {
        this.creator = user;
        return this;
    }

    public void setCreator(User user) {
        this.creator = user;
    }

    public AbsenceValidator getValidator() {
        return validator;
    }

    public Absence validator(AbsenceValidator absenceValidator) {
        this.validator = absenceValidator;
        return this;
    }

    public void setValidator(AbsenceValidator absenceValidator) {
        this.validator = absenceValidator;
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
        Absence absence = (Absence) o;
        if (absence.getId() == null || getId() == null) {
            return false;
        }
        return Objects.equals(getId(), absence.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }

    @Override
    public String toString() {
        return "Absence{" +
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
            "}";
    }
}
