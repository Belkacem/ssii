package com.zsoft.domain;


import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import javax.persistence.*;
import javax.validation.constraints.*;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.Objects;

import com.zsoft.domain.enumeration.ContractType;

/**
 * A ResourceContract.
 */
@Entity
@Table(name = "resource_contract")
public class ResourceContract implements Serializable {

    private static final long serialVersionUID = 1L;
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "zs_type", nullable = false)
    private ContractType type;

    @NotNull
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "compensation")
    private Float compensation;

    @ManyToOne(optional = false)
    @NotNull
    @JsonIgnoreProperties("resourceContracts")
    private Resource resource;

    // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public ContractType getType() {
        return type;
    }

    public ResourceContract type(ContractType type) {
        this.type = type;
        return this;
    }

    public void setType(ContractType type) {
        this.type = type;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public ResourceContract startDate(LocalDate startDate) {
        this.startDate = startDate;
        return this;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public ResourceContract endDate(LocalDate endDate) {
        this.endDate = endDate;
        return this;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public Float getCompensation() {
        return compensation;
    }

    public ResourceContract compensation(Float compensation) {
        this.compensation = compensation;
        return this;
    }

    public void setCompensation(Float compensation) {
        this.compensation = compensation;
    }

    public Resource getResource() {
        return resource;
    }

    public ResourceContract resource(Resource resource) {
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
        ResourceContract resourceContract = (ResourceContract) o;
        if (resourceContract.getId() == null || getId() == null) {
            return false;
        }
        return Objects.equals(getId(), resourceContract.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }

    @Override
    public String toString() {
        return "ResourceContract{" +
            "id=" + getId() +
            ", type='" + getType() + "'" +
            ", startDate='" + getStartDate() + "'" +
            ", endDate='" + getEndDate() + "'" +
            ", compensation=" + getCompensation() +
            "}";
    }
}
