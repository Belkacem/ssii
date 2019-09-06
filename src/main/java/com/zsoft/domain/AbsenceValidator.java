package com.zsoft.domain;


import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import javax.persistence.*;
import javax.validation.constraints.*;

import java.io.Serializable;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import java.util.Objects;

/**
 * A AbsenceValidator.
 */
@Entity
@Table(name = "absence_validator")
public class AbsenceValidator implements Serializable {

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

    @ManyToOne
    @JsonIgnoreProperties("absenceValidators")
    private User user;

    @ManyToOne(optional = false)
    @NotNull
    @JsonIgnoreProperties("absenceValidators")
    private Company company;

    @ManyToMany
    @JoinTable(name = "absence_validator_resource",
               joinColumns = @JoinColumn(name = "absence_validator_id", referencedColumnName = "id"),
               inverseJoinColumns = @JoinColumn(name = "resource_id", referencedColumnName = "id"))
    private Set<Resource> resources = new HashSet<>();

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

    public AbsenceValidator fullname(String fullname) {
        this.fullname = fullname;
        return this;
    }

    public void setFullname(String fullname) {
        this.fullname = fullname;
    }

    public String getEmail() {
        return email;
    }

    public AbsenceValidator email(String email) {
        this.email = email;
        return this;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Instant getEmailNotificationDate() {
        return emailNotificationDate;
    }

    public AbsenceValidator emailNotificationDate(Instant emailNotificationDate) {
        this.emailNotificationDate = emailNotificationDate;
        return this;
    }

    public void setEmailNotificationDate(Instant emailNotificationDate) {
        this.emailNotificationDate = emailNotificationDate;
    }

    public Boolean isActive() {
        return active;
    }

    public AbsenceValidator active(Boolean active) {
        this.active = active;
        return this;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public String getTicket() {
        return ticket;
    }

    public AbsenceValidator ticket(String ticket) {
        this.ticket = ticket;
        return this;
    }

    public void setTicket(String ticket) {
        this.ticket = ticket;
    }

    public User getUser() {
        return user;
    }

    public AbsenceValidator user(User user) {
        this.user = user;
        return this;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Company getCompany() {
        return company;
    }

    public AbsenceValidator company(Company company) {
        this.company = company;
        return this;
    }

    public void setCompany(Company company) {
        this.company = company;
    }

    public Set<Resource> getResources() {
        return resources;
    }

    public AbsenceValidator resources(Set<Resource> resources) {
        this.resources = resources;
        return this;
    }

    public AbsenceValidator addResource(Resource resource) {
        this.resources.add(resource);
        resource.getValidators().add(this);
        return this;
    }

    public AbsenceValidator removeResource(Resource resource) {
        this.resources.remove(resource);
        resource.getValidators().remove(this);
        return this;
    }

    public void setResources(Set<Resource> resources) {
        this.resources = resources;
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
        AbsenceValidator absenceValidator = (AbsenceValidator) o;
        if (absenceValidator.getId() == null || getId() == null) {
            return false;
        }
        return Objects.equals(getId(), absenceValidator.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }

    @Override
    public String toString() {
        return "AbsenceValidator{" +
            "id=" + getId() +
            ", fullname='" + getFullname() + "'" +
            ", email='" + getEmail() + "'" +
            ", emailNotificationDate='" + getEmailNotificationDate() + "'" +
            ", active='" + isActive() + "'" +
            ", ticket='" + getTicket() + "'" +
            "}";
    }
}
