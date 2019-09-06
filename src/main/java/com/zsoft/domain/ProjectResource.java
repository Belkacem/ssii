package com.zsoft.domain;


import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import javax.persistence.*;
import javax.validation.constraints.*;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.Objects;

/**
 * A ProjectResource.
 */
@Entity
@Table(name = "project_resource")
public class ProjectResource implements Serializable {

    private static final long serialVersionUID = 1L;
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(name = "active", nullable = false)
    private Boolean active;

    @Column(name = "project_email")
    private String projectEmail;

    @Column(name = "can_report_expenses")
    private Boolean canReportExpenses;

    @NotNull
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @ManyToOne(optional = false)
    @NotNull
    @JsonIgnoreProperties("projectResources")
    private Project project;

    @ManyToOne(optional = false)
    @NotNull
    @JsonIgnoreProperties("projectResources")
    private Resource resource;

    // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Boolean isActive() {
        return active;
    }

    public ProjectResource active(Boolean active) {
        this.active = active;
        return this;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public String getProjectEmail() {
        return projectEmail;
    }

    public ProjectResource projectEmail(String projectEmail) {
        this.projectEmail = projectEmail;
        return this;
    }

    public void setProjectEmail(String projectEmail) {
        this.projectEmail = projectEmail;
    }

    public Boolean isCanReportExpenses() {
        return canReportExpenses;
    }

    public ProjectResource canReportExpenses(Boolean canReportExpenses) {
        this.canReportExpenses = canReportExpenses;
        return this;
    }

    public void setCanReportExpenses(Boolean canReportExpenses) {
        this.canReportExpenses = canReportExpenses;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public ProjectResource startDate(LocalDate startDate) {
        this.startDate = startDate;
        return this;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public ProjectResource endDate(LocalDate endDate) {
        this.endDate = endDate;
        return this;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public Project getProject() {
        return project;
    }

    public ProjectResource project(Project project) {
        this.project = project;
        return this;
    }

    public void setProject(Project project) {
        this.project = project;
    }

    public Resource getResource() {
        return resource;
    }

    public ProjectResource resource(Resource resource) {
        this.resource = resource;
        return this;
    }

    public void setResource(Resource resource) {
        this.resource = resource;
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
        ProjectResource projectResource = (ProjectResource) o;
        if (projectResource.getId() == null || getId() == null) {
            return false;
        }
        return Objects.equals(getId(), projectResource.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }

    @Override
    public String toString() {
        return "ProjectResource{" +
            "id=" + getId() +
            ", active='" + isActive() + "'" +
            ", projectEmail='" + getProjectEmail() + "'" +
            ", canReportExpenses='" + isCanReportExpenses() + "'" +
            ", startDate='" + getStartDate() + "'" +
            ", endDate='" + getEndDate() + "'" +
            "}";
    }
}
