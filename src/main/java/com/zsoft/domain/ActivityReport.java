package com.zsoft.domain;


import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import javax.persistence.*;
import javax.validation.constraints.*;

import java.io.Serializable;
import java.time.Instant;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;
import java.util.Objects;

/**
 * A ActivityReport.
 */
@Entity
@Table(name = "activity_report")
public class ActivityReport implements Serializable {

    private static final long serialVersionUID = 1L;
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(name = "month", nullable = false)
    private LocalDate month;

    @Column(name = "submitted")
    private Boolean submitted;

    @Column(name = "submission_date")
    private Instant submissionDate;

    @Column(name = "editable")
    private Boolean editable;

    @Column(name = "zs_comment")
    private String comment;

    @ManyToOne(optional = false)
    @NotNull
    @JsonIgnoreProperties("activityReports")
    private ProjectResource projectResource;

    @OneToMany(mappedBy = "activityReport")
    private Set<StandardActivity> standardActivities = new HashSet<>();
    @OneToMany(mappedBy = "activityReport")
    private Set<ExceptionalActivity> exceptionalActivities = new HashSet<>();
    // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getMonth() {
        return month;
    }

    public ActivityReport month(LocalDate month) {
        this.month = month;
        return this;
    }

    public void setMonth(LocalDate month) {
        this.month = month;
    }

    public Boolean isSubmitted() {
        return submitted;
    }

    public ActivityReport submitted(Boolean submitted) {
        this.submitted = submitted;
        return this;
    }

    public void setSubmitted(Boolean submitted) {
        this.submitted = submitted;
    }

    public Instant getSubmissionDate() {
        return submissionDate;
    }

    public ActivityReport submissionDate(Instant submissionDate) {
        this.submissionDate = submissionDate;
        return this;
    }

    public void setSubmissionDate(Instant submissionDate) {
        this.submissionDate = submissionDate;
    }

    public Boolean isEditable() {
        return editable;
    }

    public ActivityReport editable(Boolean editable) {
        this.editable = editable;
        return this;
    }

    public void setEditable(Boolean editable) {
        this.editable = editable;
    }

    public String getComment() {
        return comment;
    }

    public ActivityReport comment(String comment) {
        this.comment = comment;
        return this;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public ProjectResource getProjectResource() {
        return projectResource;
    }

    public ActivityReport projectResource(ProjectResource projectResource) {
        this.projectResource = projectResource;
        return this;
    }

    public void setProjectResource(ProjectResource projectResource) {
        this.projectResource = projectResource;
    }

    public Set<StandardActivity> getStandardActivities() {
        return standardActivities;
    }

    public ActivityReport standardActivities(Set<StandardActivity> standardActivities) {
        this.standardActivities = standardActivities;
        return this;
    }

    public ActivityReport addStandardActivity(StandardActivity standardActivity) {
        this.standardActivities.add(standardActivity);
        standardActivity.setActivityReport(this);
        return this;
    }

    public ActivityReport removeStandardActivity(StandardActivity standardActivity) {
        this.standardActivities.remove(standardActivity);
        standardActivity.setActivityReport(null);
        return this;
    }

    public void setStandardActivities(Set<StandardActivity> standardActivities) {
        this.standardActivities = standardActivities;
    }

    public Set<ExceptionalActivity> getExceptionalActivities() {
        return exceptionalActivities;
    }

    public ActivityReport exceptionalActivities(Set<ExceptionalActivity> exceptionalActivities) {
        this.exceptionalActivities = exceptionalActivities;
        return this;
    }

    public ActivityReport addExceptionalActivity(ExceptionalActivity exceptionalActivity) {
        this.exceptionalActivities.add(exceptionalActivity);
        exceptionalActivity.setActivityReport(this);
        return this;
    }

    public ActivityReport removeExceptionalActivity(ExceptionalActivity exceptionalActivity) {
        this.exceptionalActivities.remove(exceptionalActivity);
        exceptionalActivity.setActivityReport(null);
        return this;
    }

    public void setExceptionalActivities(Set<ExceptionalActivity> exceptionalActivities) {
        this.exceptionalActivities = exceptionalActivities;
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
        ActivityReport activityReport = (ActivityReport) o;
        if (activityReport.getId() == null || getId() == null) {
            return false;
        }
        return Objects.equals(getId(), activityReport.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }

    @Override
    public String toString() {
        return "ActivityReport{" +
            "id=" + getId() +
            ", month='" + getMonth() + "'" +
            ", submitted='" + isSubmitted() + "'" +
            ", submissionDate='" + getSubmissionDate() + "'" +
            ", editable='" + isEditable() + "'" +
            ", comment='" + getComment() + "'" +
            "}";
    }
}
