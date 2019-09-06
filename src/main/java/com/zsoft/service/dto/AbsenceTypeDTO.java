package com.zsoft.service.dto;
import javax.validation.constraints.*;
import java.io.Serializable;
import java.util.Objects;
import com.zsoft.domain.enumeration.Gender;

/**
 * A DTO for the AbsenceType entity.
 */
public class AbsenceTypeDTO implements Serializable {

    private Long id;

    @NotNull
    private String type;

    @NotNull
    private Integer code;

    @NotNull
    private Boolean hasBalance;

    private Gender gender;


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Integer getCode() {
        return code;
    }

    public void setCode(Integer code) {
        this.code = code;
    }

    public Boolean isHasBalance() {
        return hasBalance;
    }

    public void setHasBalance(Boolean hasBalance) {
        this.hasBalance = hasBalance;
    }

    public Gender getGender() {
        return gender;
    }

    public void setGender(Gender gender) {
        this.gender = gender;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }

        AbsenceTypeDTO absenceTypeDTO = (AbsenceTypeDTO) o;
        if (absenceTypeDTO.getId() == null || getId() == null) {
            return false;
        }
        return Objects.equals(getId(), absenceTypeDTO.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }

    @Override
    public String toString() {
        return "AbsenceTypeDTO{" +
            "id=" + getId() +
            ", type='" + getType() + "'" +
            ", code=" + getCode() +
            ", hasBalance='" + isHasBalance() + "'" +
            ", gender='" + getGender() + "'" +
            "}";
    }
}
