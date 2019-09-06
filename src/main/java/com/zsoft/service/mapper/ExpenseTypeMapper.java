package com.zsoft.service.mapper;

import com.zsoft.domain.*;
import com.zsoft.service.dto.ExpenseTypeDTO;

import org.mapstruct.*;

/**
 * Mapper for the entity ExpenseType and its DTO ExpenseTypeDTO.
 */
@Mapper(componentModel = "spring", uses = {})
public interface ExpenseTypeMapper extends EntityMapper<ExpenseTypeDTO, ExpenseType> {



    default ExpenseType fromId(Long id) {
        if (id == null) {
            return null;
        }
        ExpenseType expenseType = new ExpenseType();
        expenseType.setId(id);
        return expenseType;
    }
}
