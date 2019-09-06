package com.zsoft.service.dto;
import java.time.LocalDate;
import javax.validation.constraints.*;
import java.io.Serializable;
import java.util.Objects;

/**
 * A DTO for the AbsenceBalanceAdjustment entity.
 */
public class AbsenceBalanceAdjustmentDTO implements Serializable {

    private Long id;

    @NotNull
    private LocalDate date;

    @NotNull
    private Float balance;

    private Boolean manualAdjustment;

    private String comment;


    private Long absenceBalanceId;

    private Long absenceId;

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

    public Boolean isManualAdjustment() {
        return manualAdjustment;
    }

    public void setManualAdjustment(Boolean manualAdjustment) {
        this.manualAdjustment = manualAdjustment;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public Long getAbsenceBalanceId() {
        return absenceBalanceId;
    }

    public void setAbsenceBalanceId(Long absenceBalanceId) {
        this.absenceBalanceId = absenceBalanceId;
    }

    public Long getAbsenceId() {
        return absenceId;
    }

    public void setAbsenceId(Long absenceId) {
        this.absenceId = absenceId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }

        AbsenceBalanceAdjustmentDTO absenceBalanceAdjustmentDTO = (AbsenceBalanceAdjustmentDTO) o;
        if (absenceBalanceAdjustmentDTO.getId() == null || getId() == null) {
            return false;
        }
        return Objects.equals(getId(), absenceBalanceAdjustmentDTO.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }

    @Override
    public String toString() {
        return "AbsenceBalanceAdjustmentDTO{" +
            "id=" + getId() +
            ", date='" + getDate() + "'" +
            ", balance=" + getBalance() +
            ", manualAdjustment='" + isManualAdjustment() + "'" +
            ", comment='" + getComment() + "'" +
            ", absenceBalance=" + getAbsenceBalanceId() +
            ", absence=" + getAbsenceId() +
            "}";
    }
}
