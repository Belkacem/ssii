package com.zsoft.service.mapper;

import com.zsoft.domain.*;
import com.zsoft.service.dto.ExpenseJustificationDTO;

import org.mapstruct.*;

/**
 * Mapper for the entity ExpenseJustification and its DTO ExpenseJustificationDTO.
 */
@Mapper(componentModel = "spring", uses = {ExpenseMapper.class})
public interface ExpenseJustificationMapper extends EntityMapper<ExpenseJustificationDTO, ExpenseJustification> {

    @Mapping(source = "expense.id", target = "expenseId")
    ExpenseJustificationDTO toDto(ExpenseJustification expenseJustification);

    @Mapping(source = "expenseId", target = "expense")
    ExpenseJustification toEntity(ExpenseJustificationDTO expenseJustificationDTO);

    default ExpenseJustification fromId(Long id) {
        if (id == null) {
            return null;
        }
        ExpenseJustification expenseJustification = new ExpenseJustification();
        expenseJustification.setId(id);
        return expenseJustification;
    }
}
