package com.zsoft.service.dto;
import java.time.LocalDate;
import javax.validation.constraints.*;
import java.io.Serializable;
import java.util.Objects;

/**
 * A DTO for the ProjectResource entity.
 */
public class ProjectResourceDTO implements Serializable {

    private Long id;

    @NotNull
    private Boolean active;

    private String projectEmail;

    private Boolean canReportExpenses;

    @NotNull
    private LocalDate startDate;

    private LocalDate endDate;


    private Long projectId;

    private Long resourceId;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Boolean isActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public String getProjectEmail() {
        return projectEmail;
    }

    public void setProjectEmail(String projectEmail) {
        this.projectEmail = projectEmail;
    }

    public Boolean isCanReportExpenses() {
        return canReportExpenses;
    }

    public void setCanReportExpenses(Boolean canReportExpenses) {
        this.canReportExpenses = canReportExpenses;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public Long getProjectId() {
        return projectId;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }

    public Long getResourceId() {
        return resourceId;
    }

    public void setResourceId(Long resourceId) {
        this.resourceId = resourceId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }

        ProjectResourceDTO projectResourceDTO = (ProjectResourceDTO) o;
        if (projectResourceDTO.getId() == null || getId() == null) {
            return false;
        }
        return Objects.equals(getId(), projectResourceDTO.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }

    @Override
    public String toString() {
        return "ProjectResourceDTO{" +
            "id=" + getId() +
            ", active='" + isActive() + "'" +
            ", projectEmail='" + getProjectEmail() + "'" +
            ", canReportExpenses='" + isCanReportExpenses() + "'" +
            ", startDate='" + getStartDate() + "'" +
            ", endDate='" + getEndDate() + "'" +
            ", project=" + getProjectId() +
            ", resource=" + getResourceId() +
            "}";
    }
}
