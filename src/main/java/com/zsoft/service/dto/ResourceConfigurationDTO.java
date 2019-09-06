package com.zsoft.service.dto;
import javax.validation.constraints.*;
import java.io.Serializable;
import java.util.Objects;

/**
 * A DTO for the ResourceConfiguration entity.
 */
public class ResourceConfigurationDTO implements Serializable {

    private Long id;

    private Boolean active;

    private Boolean canReportExpenses;

    private Boolean hasRTT;

    private Integer daysCP;

    private Integer daysRTT;


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

    public Boolean isCanReportExpenses() {
        return canReportExpenses;
    }

    public void setCanReportExpenses(Boolean canReportExpenses) {
        this.canReportExpenses = canReportExpenses;
    }

    public Boolean isHasRTT() {
        return hasRTT;
    }

    public void setHasRTT(Boolean hasRTT) {
        this.hasRTT = hasRTT;
    }

    public Integer getDaysCP() {
        return daysCP;
    }

    public void setDaysCP(Integer daysCP) {
        this.daysCP = daysCP;
    }

    public Integer getDaysRTT() {
        return daysRTT;
    }

    public void setDaysRTT(Integer daysRTT) {
        this.daysRTT = daysRTT;
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

        ResourceConfigurationDTO resourceConfigurationDTO = (ResourceConfigurationDTO) o;
        if (resourceConfigurationDTO.getId() == null || getId() == null) {
            return false;
        }
        return Objects.equals(getId(), resourceConfigurationDTO.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }

    @Override
    public String toString() {
        return "ResourceConfigurationDTO{" +
            "id=" + getId() +
            ", active='" + isActive() + "'" +
            ", canReportExpenses='" + isCanReportExpenses() + "'" +
            ", hasRTT='" + isHasRTT() + "'" +
            ", daysCP=" + getDaysCP() +
            ", daysRTT=" + getDaysRTT() +
            ", resource=" + getResourceId() +
            "}";
    }
}
