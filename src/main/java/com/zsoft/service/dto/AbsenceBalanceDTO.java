package com.zsoft.service.dto;
import java.time.LocalDate;
import javax.validation.constraints.*;
import java.io.Serializable;
import java.util.Objects;

/**
 * A DTO for the AbsenceBalance entity.
 */
public class AbsenceBalanceDTO implements Serializable {

    private Long id;

    @NotNull
    private LocalDate date;

    @NotNull
    private Float balance;

    @NotNull
    private Float taken;


    private Long typeId;

    private Long resourceId;

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

    public Float getBalance() {
        return balance;
    }

    public void setBalance(Float balance) {
        this.balance = balance;
    }

    public Float getTaken() {
        return taken;
    }

    public void setTaken(Float taken) {
        this.taken = taken;
    }

    public Long getTypeId() {
        return typeId;
    }

    public void setTypeId(Long absenceTypeId) {
        this.typeId = absenceTypeId;
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

        AbsenceBalanceDTO absenceBalanceDTO = (AbsenceBalanceDTO) o;
        if (absenceBalanceDTO.getId() == null || getId() == null) {
            return false;
        }
        return Objects.equals(getId(), absenceBalanceDTO.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }

    @Override
    public String toString() {
        return "AbsenceBalanceDTO{" +
            "id=" + getId() +
            ", date='" + getDate() + "'" +
            ", balance=" + getBalance() +
            ", taken=" + getTaken() +
            ", type=" + getTypeId() +
            ", resource=" + getResourceId() +
            "}";
    }
}
