package com.zsoft.service.dto;
import java.time.Instant;
import javax.validation.constraints.*;
import java.io.Serializable;
import java.util.Objects;

/**
 * A DTO for the ProjectContractor entity.
 */
public class ProjectContractorDTO implements Serializable {

    private Long id;

    @NotNull
    private String fullname;

    @NotNull
    private String email;

    private Instant emailNotificationDate;

    private Boolean active;

    private String ticket;


    private Long projectId;

    private Long userId;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFullname() {
        return fullname;
    }

    public void setFullname(String fullname) {
        this.fullname = fullname;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Instant getEmailNotificationDate() {
        return emailNotificationDate;
    }

    public void setEmailNotificationDate(Instant emailNotificationDate) {
        this.emailNotificationDate = emailNotificationDate;
    }

    public Boolean isActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public String getTicket() {
        return ticket;
    }

    public void setTicket(String ticket) {
        this.ticket = ticket;
    }

    public Long getProjectId() {
        return projectId;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }

        ProjectContractorDTO projectContractorDTO = (ProjectContractorDTO) o;
        if (projectContractorDTO.getId() == null || getId() == null) {
            return false;
        }
        return Objects.equals(getId(), projectContractorDTO.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }

    @Override
    public String toString() {
        return "ProjectContractorDTO{" +
            "id=" + getId() +
            ", fullname='" + getFullname() + "'" +
            ", email='" + getEmail() + "'" +
            ", emailNotificationDate='" + getEmailNotificationDate() + "'" +
            ", active='" + isActive() + "'" +
            ", ticket='" + getTicket() + "'" +
            ", project=" + getProjectId() +
            ", user=" + getUserId() +
            "}";
    }
}
