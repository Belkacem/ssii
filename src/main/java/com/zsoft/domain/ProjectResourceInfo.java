package com.zsoft.domain;


import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import javax.persistence.*;
import javax.validation.constraints.*;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.Objects;

/**
 * A ProjectResourceInfo.
 */
@Entity
@Table(name = "project_resource_info")
public class ProjectResourceInfo implements Serializable {

    private static final long serialVersionUID = 1L;
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @NotNull
    @Column(name = "daily_rate", nullable = false)
    private Float dailyRate;

    @Column(name = "payment_delay")
    private Integer paymentDelay;

    @Column(name = "reference")
    private String reference;

    @ManyToOne(optional = false)
    @NotNull
    @JsonIgnoreProperties("projectResourceInfos")
    private ProjectResource projectResource;

    // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public ProjectResourceInfo startDate(LocalDate startDate) {
        this.startDate = startDate;
        return this;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public Float getDailyRate() {
        return dailyRate;
    }

    public ProjectResourceInfo dailyRate(Float dailyRate) {
        this.dailyRate = dailyRate;
        return this;
    }

    public void setDailyRate(Float dailyRate) {
        this.dailyRate = dailyRate;
    }

    public Integer getPaymentDelay() {
        return paymentDelay;
    }

    public ProjectResourceInfo paymentDelay(Integer paymentDelay) {
        this.paymentDelay = paymentDelay;
        return this;
    }

    public void setPaymentDelay(Integer paymentDelay) {
        this.paymentDelay = paymentDelay;
    }

    public String getReference() {
        return reference;
    }

    public ProjectResourceInfo reference(String reference) {
        this.reference = reference;
        return this;
    }

    public void setReference(String reference) {
        this.reference = reference;
    }

    public ProjectResource getProjectResource() {
        return projectResource;
    }

    public ProjectResourceInfo projectResource(ProjectResource projectResource) {
        this.projectResource = projectResource;
        return this;
    }

    public void setProjectResource(ProjectResource projectResource) {
        this.projectResource = projectResource;
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
        ProjectResourceInfo projectResourceInfo = (ProjectResourceInfo) o;
        if (projectResourceInfo.getId() == null || getId() == null) {
            return false;
        }
        return Objects.equals(getId(), projectResourceInfo.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }

    @Override
    public String toString() {
        return "ProjectResourceInfo{" +
            "id=" + getId() +
            ", startDate='" + getStartDate() + "'" +
            ", dailyRate=" + getDailyRate() +
            ", paymentDelay=" + getPaymentDelay() +
            ", reference='" + getReference() + "'" +
            "}";
    }
}
