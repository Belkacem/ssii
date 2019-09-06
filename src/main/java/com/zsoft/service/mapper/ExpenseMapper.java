package com.zsoft.service.mapper;

import com.zsoft.domain.*;
import com.zsoft.service.dto.ExpenseDTO;

import org.mapstruct.*;

/**
 * Mapper for the entity Expense and its DTO ExpenseDTO.
 */
@Mapper(componentModel = "spring", uses = {ResourceMapper.class, ProjectResourceMapper.class, ExpenseTypeMapper.class, UserMapper.class, ExpenseValidatorMapper.class})
public interface ExpenseMapper extends EntityMapper<ExpenseDTO, Expense> {

    @Mapping(source = "resource.id", target = "resourceId")
    @Mapping(source = "projectResource.id", target = "projectResourceId")
    @Mapping(source = "type.id", target = "typeId")
    @Mapping(source = "creator.id", target = "creatorId")
    @Mapping(source = "validator.id", target = "validatorId")
    ExpenseDTO toDto(Expense expense);

    @Mapping(source = "resourceId", target = "resource")
    @Mapping(source = "projectResourceId", target = "projectResource")
    @Mapping(source = "typeId", target = "type")
    @Mapping(source = "creatorId", target = "creator")
    @Mapping(source = "validatorId", target = "validator")
    Expense toEntity(ExpenseDTO expenseDTO);

    default Expense fromId(Long id) {
        if (id == null) {
            return null;
        }
        Expense expense = new Expense();
        expense.setId(id);
        return expense;
    }
}
