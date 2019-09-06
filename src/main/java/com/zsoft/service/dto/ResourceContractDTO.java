package com.zsoft.service.dto;
import java.time.LocalDate;
import javax.validation.constraints.*;
import java.io.Serializable;
import java.util.Objects;
import com.zsoft.domain.enumeration.ContractType;

/**
 * A DTO for the ResourceContract entity.
 */
public class ResourceContractDTO implements Serializable {

    private Long id;

    @NotNull
    private ContractType type;

    @NotNull
    private LocalDate startDate;

    private LocalDate endDate;

    private Float compensation;


    private Long resourceId;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public ContractType getType() {
        return type;
    }

    public void setType(ContractType type) {
        this.type = type;
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

    public Float getCompensation() {
        return compensation;
    }

    public void setCompensation(Float compensation) {
        this.compensation = compensation;
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

        ResourceContractDTO resourceContractDTO = (ResourceContractDTO) o;
        if (resourceContractDTO.getId() == null || getId() == null) {
            return false;
        }
        return Objects.equals(getId(), resourceContractDTO.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }

    @Override
    public String toString() {
        return "ResourceContractDTO{" +
            "id=" + getId() +
            ", type='" + getType() + "'" +
            ", startDate='" + getStartDate() + "'" +
            ", endDate='" + getEndDate() + "'" +
            ", compensation=" + getCompensation() +
            ", resource=" + getResourceId() +
            "}";
    }
}
