package com.zsoft.domain;


import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import javax.persistence.*;
import javax.validation.constraints.*;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.Objects;

/**
 * A AbsenceBalance.
 */
@Entity
@Table(name = "absence_balance")
public class AbsenceBalance implements Serializable {

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

    @NotNull
    @Column(name = "taken", nullable = false)
    private Float taken;

    @ManyToOne(optional = false)
    @NotNull
    @JsonIgnoreProperties("absenceBalances")
    private AbsenceType type;

    @ManyToOne(optional = false)
    @NotNull
    @JsonIgnoreProperties("absenceBalances")
    private Resource resource;

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

    public AbsenceBalance date(LocalDate date) {
        this.date = date;
        return this;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public Float getBalance() {
        return balance;
    }

    public AbsenceBalance balance(Float balance) {
        this.balance = balance;
        return this;
    }

    public void setBalance(Float balance) {
        this.balance = balance;
    }

    public Float getTaken() {
        return taken;
    }

    public AbsenceBalance taken(Float taken) {
        this.taken = taken;
        return this;
    }

    public void setTaken(Float taken) {
        this.taken = taken;
    }

    public AbsenceType getType() {
        return type;
    }

    public AbsenceBalance type(AbsenceType absenceType) {
        this.type = absenceType;
        return this;
    }

    public void setType(AbsenceType absenceType) {
        this.type = absenceType;
    }

    public Resource getResource() {
        return resource;
    }

    public AbsenceBalance resource(Resource resource) {
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
        AbsenceBalance absenceBalance = (AbsenceBalance) o;
        if (absenceBalance.getId() == null || getId() == null) {
            return false;
        }
        return Objects.equals(getId(), absenceBalance.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }

    @Override
    public String toString() {
        return "AbsenceBalance{" +
            "id=" + getId() +
            ", date='" + getDate() + "'" +
            ", balance=" + getBalance() +
            ", taken=" + getTaken() +
            "}";
    }
}
