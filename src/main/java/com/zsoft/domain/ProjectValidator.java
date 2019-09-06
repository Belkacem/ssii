package com.zsoft.domain;


import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import javax.persistence.*;
import javax.validation.constraints.*;

import java.io.Serializable;
import java.time.Instant;
import java.util.Objects;

/**
 * A ProjectValidator.
 */
@Entity
@Table(name = "project_validator")
public class ProjectValidator implements Serializable {

    private static final long serialVersionUID = 1L;
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(name = "fullname", nullable = false)
    private String fullname;

    @NotNull
    @Column(name = "email", nullable = false)
    private String email;

    @Column(name = "email_notification_date")
    private Instant emailNotificationDate;

    @Column(name = "active")
    private Boolean active;

    @Column(name = "ticket")
    private String ticket;

    @ManyToOne(optional = false)
    @NotNull
    @JsonIgnoreProperties("projectValidators")
    private Project project;

    @ManyToOne
    @JsonIgnoreProperties("projectValidators")
    private User user;

    // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFullname() {
        return fullname;
    }

    public ProjectValidator fullname(String fullname) {
        this.fullname = fullname;
        return this;
    }

    public void setFullname(String fullname) {
        this.fullname = fullname;
    }

    public String getEmail() {
        return email;
    }

    public ProjectValidator email(String email) {
        this.email = email;
        return this;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Instant getEmailNotificationDate() {
        return emailNotificationDate;
    }

    public ProjectValidator emailNotificationDate(Instant emailNotificationDate) {
        this.emailNotificationDate = emailNotificationDate;
        return this;
    }

    public void setEmailNotificationDate(Instant emailNotificationDate) {
        this.emailNotificationDate = emailNotificationDate;
    }

    public Boolean isActive() {
        return active;
    }

    public ProjectValidator active(Boolean active) {
        this.active = active;
        return this;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public String getTicket() {
        return ticket;
    }

    public ProjectValidator ticket(String ticket) {
        this.ticket = ticket;
        return this;
    }

    public void setTicket(String ticket) {
        this.ticket = ticket;
    }

    public Project getProject() {
        return project;
    }

    public ProjectValidator project(Project project) {
        this.project = project;
        return this;
    }

    public void setProject(Project project) {
        this.project = project;
    }

    public User getUser() {
        return user;
    }

    public ProjectValidator user(User user) {
        this.user = user;
        return this;
    }

    public void setUser(User user) {
        this.user = user;
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
        ProjectValidator projectValidator = (ProjectValidator) o;
        if (projectValidator.getId() == null || getId() == null) {
            return false;
        }
        return Objects.equals(getId(), projectValidator.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }

    @Override
    public String toString() {
        return "ProjectValidator{" +
            "id=" + getId() +
            ", fullname='" + getFullname() + "'" +
            ", email='" + getEmail() + "'" +
            ", emailNotificationDate='" + getEmailNotificationDate() + "'" +
            ", active='" + isActive() + "'" +
            ", ticket='" + getTicket() + "'" +
            "}";
    }
}
