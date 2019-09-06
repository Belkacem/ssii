package com.zsoft.domain;



import javax.persistence.*;
import javax.validation.constraints.*;

import java.io.Serializable;
import java.util.Objects;

import com.zsoft.domain.enumeration.Gender;

/**
 * A AbsenceType.
 */
@Entity
@Table(name = "absence_type")
public class AbsenceType implements Serializable {

    private static final long serialVersionUID = 1L;
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(name = "zs_type", nullable = false)
    private String type;

    @NotNull
    @Column(name = "code", nullable = false, unique = true)
    private Integer code;

    @NotNull
    @Column(name = "has_balance", nullable = false)
    private Boolean hasBalance;

    @Enumerated(EnumType.STRING)
    @Column(name = "gender")
    private Gender gender;

    // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getType() {
        return type;
    }

    public AbsenceType type(String type) {
        this.type = type;
        return this;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Integer getCode() {
        return code;
    }

    public AbsenceType code(Integer code) {
        this.code = code;
        return this;
    }

    public void setCode(Integer code) {
        this.code = code;
    }

    public Boolean isHasBalance() {
        return hasBalance;
    }

    public AbsenceType hasBalance(Boolean hasBalance) {
        this.hasBalance = hasBalance;
        return this;
    }

    public void setHasBalance(Boolean hasBalance) {
        this.hasBalance = hasBalance;
    }

    public Gender getGender() {
        return gender;
    }

    public AbsenceType gender(Gender gender) {
        this.gender = gender;
        return this;
    }

    public void setGender(Gender gender) {
        this.gender = gender;
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
        AbsenceType absenceType = (AbsenceType) o;
        if (absenceType.getId() == null || getId() == null) {
            return false;
        }
        return Objects.equals(getId(), absenceType.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }

    @Override
    public String toString() {
        return "AbsenceType{" +
            "id=" + getId() +
            ", type='" + getType() + "'" +
            ", code=" + getCode() +
            ", hasBalance='" + isHasBalance() + "'" +
            ", gender='" + getGender() + "'" +
            "}";
    }
}
