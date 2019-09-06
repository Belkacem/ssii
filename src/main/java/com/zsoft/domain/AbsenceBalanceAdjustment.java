package com.zsoft.domain;


import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import javax.persistence.*;
import javax.validation.constraints.*;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.Objects;

/**
 * A AbsenceBalanceAdjustment.
 */
@Entity
@Table(name = "absence_balance_adjustment")
public class AbsenceBalanceAdjustment implements Serializable {

    private static final long serialVersionUID = 1L;
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(name = "zs_date", nullable = false)
    private LocalDate date;

    @NotNull
    @Column(name = "balance", nullable = false)
    private Float balance;

    @Column(name = "manual_adjustment")
    private Boolean manualAdjustment;

    @Column(name = "zs_comment")
    private String comment;

    @ManyToOne(optional = false)
    @NotNull
    @JsonIgnoreProperties("absenceBalanceAdjustments")
    private AbsenceBalance absenceBalance;

    @ManyToOne
    @JsonIgnoreProperties("absenceBalanceAdjustments")
    private Absence absence;

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

    public AbsenceBalanceAdjustment date(LocalDate date) {
        this.date = date;
        return this;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public Float getBalance() {
        return balance;
    }

    public AbsenceBalanceAdjustment balance(Float balance) {
        this.balance = balance;
        return this;
    }

    public void setBalance(Float balance) {
        this.balance = balance;
    }

    public Boolean isManualAdjustment() {
        return manualAdjustment;
    }

    public AbsenceBalanceAdjustment manualAdjustment(Boolean manualAdjustment) {
        this.manualAdjustment = manualAdjustment;
        return this;
    }

    public void setManualAdjustment(Boolean manualAdjustment) {
        this.manualAdjustment = manualAdjustment;
    }

    public String getComment() {
        return comment;
    }

    public AbsenceBalanceAdjustment comment(String comment) {
        this.comment = comment;
        return this;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public AbsenceBalance getAbsenceBalance() {
        return absenceBalance;
    }

    public AbsenceBalanceAdjustment absenceBalance(AbsenceBalance absenceBalance) {
        this.absenceBalance = absenceBalance;
        return this;
    }

    public void setAbsenceBalance(AbsenceBalance absenceBalance) {
        this.absenceBalance = absenceBalance;
    }

    public Absence getAbsence() {
        return absence;
    }

    public AbsenceBalanceAdjustment absence(Absence absence) {
        this.absence = absence;
        return this;
    }

    public void setAbsence(Absence absence) {
        this.absence = absence;
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
        AbsenceBalanceAdjustment absenceBalanceAdjustment = (AbsenceBalanceAdjustment) o;
        if (absenceBalanceAdjustment.getId() == null || getId() == null) {
            return false;
        }
        return Objects.equals(getId(), absenceBalanceAdjustment.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }

    @Override
    public String toString() {
        return "AbsenceBalanceAdjustment{" +
            "id=" + getId() +
            ", date='" + getDate() + "'" +
            ", balance=" + getBalance() +
            ", manualAdjustment='" + isManualAdjustment() + "'" +
            ", comment='" + getComment() + "'" +
            "}";
    }
}
