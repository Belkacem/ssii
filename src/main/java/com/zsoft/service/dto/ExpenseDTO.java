package com.zsoft.service.dto;
import java.time.Instant;
import java.time.LocalDate;
import javax.validation.constraints.*;
import java.io.Serializable;
import java.util.Objects;
import com.zsoft.domain.enumeration.ValidationStatus;

/**
 * A DTO for the Expense entity.
 */
public class ExpenseDTO implements Serializable {

    private Long id;

    @NotNull
    private LocalDate date;

    private Instant submissionDate;

    @NotNull
    private String description;

    @NotNull
    private Float amount;

    @NotNull
    private Float vat;

    @NotNull
    private ValidationStatus validationStatus;


    private Long resourceId;

    private Long projectResourceId;

    private Long typeId;

    private Long creatorId;

    private Long validatorId;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public Instant getSubmissionDate() {
        return submissionDate;
    }

    public void setSubmissionDate(Instant submissionDate) {
        this.submissionDate = submissionDate;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Float getAmount() {
        return amount;
    }

    public void setAmount(Float amount) {
        this.amount = amount;
    }

    public Float getVat() {
        return vat;
    }

    public void setVat(Float vat) {
        this.vat = vat;
    }

    public ValidationStatus getValidationStatus() {
        return validationStatus;
    }

    public void setValidationStatus(ValidationStatus validationStatus) {
        this.validationStatus = validationStatus;
    }

    public Long getResourceId() {
        return resourceId;
    }

    public void setResourceId(Long resourceId) {
        this.resourceId = resourceId;
    }

    public Long getProjectResourceId() {
        return projectResourceId;
    }

    public void setProjectResourceId(Long projectResourceId) {
        this.projectResourceId = projectResourceId;
    }

    public Long getTypeId() {
        return typeId;
    }

    public void setTypeId(Long expenseTypeId) {
        this.typeId = expenseTypeId;
    }

    public Long getCreatorId() {
        return creatorId;
    }

    public void setCreatorId(Long userId) {
        this.creatorId = userId;
    }

    public Long getValidatorId() {
        return validatorId;
    }

    public void setValidatorId(Long expenseValidatorId) {
        this.validatorId = expenseValidatorId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }

        ExpenseDTO expenseDTO = (ExpenseDTO) o;
        if (expenseDTO.getId() == null || getId() == null) {
            return false;
        }
        return Objects.equals(getId(), expenseDTO.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }

    @Override
    public String toString() {
        return "ExpenseDTO{" +
            "id=" + getId() +
            ", date='" + getDate() + "'" +
            ", submissionDate='" + getSubmissionDate() + "'" +
            ", description='" + getDescription() + "'" +
            ", amount=" + getAmount() +
            ", vat=" + getVat() +
            ", validationStatus='" + getValidationStatus() + "'" +
            ", resource=" + getResourceId() +
            ", projectResource=" + getProjectResourceId() +
            ", type=" + getTypeId() +
            ", creator=" + getCreatorId() +
            ", validator=" + getValidatorId() +
            "}";
    }
}
