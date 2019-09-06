package com.zsoft.domain;


import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import javax.persistence.*;
import javax.validation.constraints.*;

import java.io.Serializable;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Objects;

import com.zsoft.domain.enumeration.ValidationStatus;

/**
 * A Expense.
 */
@Entity
@Table(name = "expense")
public class Expense implements Serializable {

    private static final long serialVersionUID = 1L;
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(name = "zs_date", nullable = false)
    private LocalDate date;

    @Column(name = "submission_date")
    private Instant submissionDate;

    @NotNull
    @Column(name = "description", nullable = false)
    private String description;

    @NotNull
    @Column(name = "amount", nullable = false)
    private Float amount;

    @NotNull
    @Column(name = "vat", nullable = false)
    private Float vat;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "validation_status", nullable = false)
    private ValidationStatus validationStatus;

    @ManyToOne(optional = false)
    @NotNull
    @JsonIgnoreProperties("expenses")
    private Resource resource;

    @ManyToOne
    @JsonIgnoreProperties("expenses")
    private ProjectResource projectResource;

    @ManyToOne(optional = false)
    @NotNull
    @JsonIgnoreProperties("expenses")
    private ExpenseType type;

    @ManyToOne(optional = false)
    @NotNull
    @JsonIgnoreProperties("expenses")
    private User creator;

    @ManyToOne
    @JsonIgnoreProperties("expenses")
    private ExpenseValidator validator;

    // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getDate() {
        return date;
    }

    public Expense date(LocalDate date) {
        this.date = date;
        return this;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public Instant getSubmissionDate() {
        return submissionDate;
    }

    public Expense submissionDate(Instant submissionDate) {
        this.submissionDate = submissionDate;
        return this;
    }

    public void setSubmissionDate(Instant submissionDate) {
        this.submissionDate = submissionDate;
    }

    public String getDescription() {
        return description;
    }

    public Expense description(String description) {
        this.description = description;
        return this;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Float getAmount() {
        return amount;
    }

    public Expense amount(Float amount) {
        this.amount = amount;
        return this;
    }

    public void setAmount(Float amount) {
        this.amount = amount;
    }

    public Float getVat() {
        return vat;
    }

    public Expense vat(Float vat) {
        this.vat = vat;
        return this;
    }

    public void setVat(Float vat) {
        this.vat = vat;
    }

    public ValidationStatus getValidationStatus() {
        return validationStatus;
    }

    public Expense validationStatus(ValidationStatus validationStatus) {
        this.validationStatus = validationStatus;
        return this;
    }

    public void setValidationStatus(ValidationStatus validationStatus) {
        this.validationStatus = validationStatus;
    }

    public Resource getResource() {
        return resource;
    }

    public Expense resource(Resource resource) {
        this.resource = resource;
        return this;
    }

    public void setResource(Resource resource) {
        this.resource = resource;
    }

    public ProjectResource getProjectResource() {
        return projectResource;
    }

    public Expense projectResource(ProjectResource projectResource) {
        this.projectResource = projectResource;
        return this;
    }

    public void setProjectResource(ProjectResource projectResource) {
        this.projectResource = projectResource;
    }

    public ExpenseType getType() {
        return type;
    }

    public Expense type(ExpenseType expenseType) {
        this.type = expenseType;
        return this;
    }

    public void setType(ExpenseType expenseType) {
        this.type = expenseType;
    }

    public User getCreator() {
        return creator;
    }

    public Expense creator(User user) {
        this.creator = user;
        return this;
    }

    public void setCreator(User user) {
        this.creator = user;
    }

    public ExpenseValidator getValidator() {
        return validator;
    }

    public Expense validator(ExpenseValidator expenseValidator) {
        this.validator = expenseValidator;
        return this;
    }

    public void setValidator(ExpenseValidator expenseValidator) {
        this.validator = expenseValidator;
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
        Expense expense = (Expense) o;
        if (expense.getId() == null || getId() == null) {
            return false;
        }
        return Objects.equals(getId(), expense.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }

    @Override
    public String toString() {
        return "Expense{" +
            "id=" + getId() +
            ", date='" + getDate() + "'" +
            ", submissionDate='" + getSubmissionDate() + "'" +
            ", description='" + getDescription() + "'" +
            ", amount=" + getAmount() +
            ", vat=" + getVat() +
            ", validationStatus='" + getValidationStatus() + "'" +
            "}";
    }
}
