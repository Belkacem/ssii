package com.zsoft.service.dto;
import javax.validation.constraints.*;
import java.io.Serializable;
import java.util.Objects;

/**
 * A DTO for the ExpenseType entity.
 */
public class ExpenseTypeDTO implements Serializable {

    private Long id;

    @NotNull
    private String type;

    @NotNull
    private Integer code;


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

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }

        ExpenseTypeDTO expenseTypeDTO = (ExpenseTypeDTO) o;
        if (expenseTypeDTO.getId() == null || getId() == null) {
            return false;
        }
        return Objects.equals(getId(), expenseTypeDTO.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }

    @Override
    public String toString() {
        return "ExpenseTypeDTO{" +
            "id=" + getId() +
            ", type='" + getType() + "'" +
            ", code=" + getCode() +
            "}";
    }
}
