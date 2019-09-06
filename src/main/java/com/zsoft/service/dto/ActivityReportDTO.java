package com.zsoft.service.dto;
import java.time.Instant;
import java.time.LocalDate;
import javax.validation.constraints.*;
import java.io.Serializable;
import java.util.Objects;

/**
 * A DTO for the ActivityReport entity.
 */
public class ActivityReportDTO implements Serializable {

    private Long id;

    @NotNull
    private LocalDate month;

    private Boolean submitted;

    private Instant submissionDate;

    private Boolean editable;

    private String comment;


    private Long projectResourceId;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getMonth() {
        return month;
    }

    public void setMonth(LocalDate month) {
        this.month = month;
    }

    public Boolean isSubmitted() {
        return submitted;
    }

    public void setSubmitted(Boolean submitted) {
        this.submitted = submitted;
    }

    public Instant getSubmissionDate() {
        return submissionDate;
    }

    public void setSubmissionDate(Instant submissionDate) {
        this.submissionDate = submissionDate;
    }

    public Boolean isEditable() {
        return editable;
    }

    public void setEditable(Boolean editable) {
        this.editable = editable;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public Long getProjectResourceId() {
        return projectResourceId;
    }

    public void setProjectResourceId(Long projectResourceId) {
        this.projectResourceId = projectResourceId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }

        ActivityReportDTO activityReportDTO = (ActivityReportDTO) o;
        if (activityReportDTO.getId() == null || getId() == null) {
            return false;
        }
        return Objects.equals(getId(), activityReportDTO.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }

    @Override
    public String toString() {
        return "ActivityReportDTO{" +
            "id=" + getId() +
            ", month='" + getMonth() + "'" +
            ", submitted='" + isSubmitted() + "'" +
            ", submissionDate='" + getSubmissionDate() + "'" +
            ", editable='" + isEditable() + "'" +
            ", comment='" + getComment() + "'" +
            ", projectResource=" + getProjectResourceId() +
            "}";
    }
}
