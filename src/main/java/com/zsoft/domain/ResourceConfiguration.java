package com.zsoft.domain;



import javax.persistence.*;
import javax.validation.constraints.*;

import java.io.Serializable;
import java.util.Objects;

/**
 * A ResourceConfiguration.
 */
@Entity
@Table(name = "resource_configuration")
public class ResourceConfiguration implements Serializable {

    private static final long serialVersionUID = 1L;
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "active")
    private Boolean active;

    @Column(name = "can_report_expenses")
    private Boolean canReportExpenses;

    @Column(name = "has_rtt")
    private Boolean hasRTT;

    @Column(name = "days_cp")
    private Integer daysCP;

    @Column(name = "days_rtt")
    private Integer daysRTT;

    @OneToOne(optional = false)    @NotNull

    @JoinColumn(unique = true)
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

    public ResourceConfiguration active(Boolean active) {
        this.active = active;
        return this;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public Boolean isCanReportExpenses() {
        return canReportExpenses;
    }

    public ResourceConfiguration canReportExpenses(Boolean canReportExpenses) {
        this.canReportExpenses = canReportExpenses;
        return this;
    }

    public void setCanReportExpenses(Boolean canReportExpenses) {
        this.canReportExpenses = canReportExpenses;
    }

    public Boolean isHasRTT() {
        return hasRTT;
    }

    public ResourceConfiguration hasRTT(Boolean hasRTT) {
        this.hasRTT = hasRTT;
        return this;
    }

    public void setHasRTT(Boolean hasRTT) {
        this.hasRTT = hasRTT;
    }

    public Integer getDaysCP() {
        return daysCP;
    }

    public ResourceConfiguration daysCP(Integer daysCP) {
        this.daysCP = daysCP;
        return this;
    }

    public void setDaysCP(Integer daysCP) {
        this.daysCP = daysCP;
    }

    public Integer getDaysRTT() {
        return daysRTT;
    }

    public ResourceConfiguration daysRTT(Integer daysRTT) {
        this.daysRTT = daysRTT;
        return this;
    }

    public void setDaysRTT(Integer daysRTT) {
        this.daysRTT = daysRTT;
    }

    public Resource getResource() {
        return resource;
    }

    public ResourceConfiguration resource(Resource resource) {
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
        ResourceConfiguration resourceConfiguration = (ResourceConfiguration) o;
        if (resourceConfiguration.getId() == null || getId() == null) {
            return false;
        }
        return Objects.equals(getId(), resourceConfiguration.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }

    @Override
    public String toString() {
        return "ResourceConfiguration{" +
            "id=" + getId() +
            ", active='" + isActive() + "'" +
            ", canReportExpenses='" + isCanReportExpenses() + "'" +
            ", hasRTT='" + isHasRTT() + "'" +
            ", daysCP=" + getDaysCP() +
            ", daysRTT=" + getDaysRTT() +
            "}";
    }
}
