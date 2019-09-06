package com.zsoft.service.dto;
import java.time.LocalDate;
import javax.validation.constraints.*;
import java.io.Serializable;
import java.util.Objects;

/**
 * A DTO for the ProjectResourceInfo entity.
 */
public class ProjectResourceInfoDTO implements Serializable {

    private Long id;

    @NotNull
    private LocalDate startDate;

    @NotNull
    private Float dailyRate;

    private Integer paymentDelay;

    private String reference;


    private Long projectResourceId;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public Float getDailyRate() {
        return dailyRate;
    }

    public void setDailyRate(Float dailyRate) {
        this.dailyRate = dailyRate;
    }

    public Integer getPaymentDelay() {
        return paymentDelay;
    }

    public void setPaymentDelay(Integer paymentDelay) {
        this.paymentDelay = paymentDelay;
    }

    public String getReference() {
        return reference;
    }

    public void setReference(String reference) {
        this.reference = reference;
    }

    public Long getProjectResourceId() {
        return projectResourceId;
    }

    public void setProjectResourceId(Long projectResourceId) {
        this.projectResourceId = projectResourceId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }

        ProjectResourceInfoDTO projectResourceInfoDTO = (ProjectResourceInfoDTO) o;
        if (projectResourceInfoDTO.getId() == null || getId() == null) {
            return false;
        }
        return Objects.equals(getId(), projectResourceInfoDTO.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }

    @Override
    public String toString() {
        return "ProjectResourceInfoDTO{" +
            "id=" + getId() +
            ", startDate='" + getStartDate() + "'" +
            ", dailyRate=" + getDailyRate() +
            ", paymentDelay=" + getPaymentDelay() +
            ", reference='" + getReference() + "'" +
            ", projectResource=" + getProjectResourceId() +
            "}";
    }
}
