package com.zsoft.service.mapper;

import com.zsoft.domain.*;
import com.zsoft.service.dto.ExpenseValidatorDTO;

import org.mapstruct.*;

/**
 * Mapper for the entity ExpenseValidator and its DTO ExpenseValidatorDTO.
 */
@Mapper(componentModel = "spring", uses = {UserMapper.class, CompanyMapper.class})
public interface ExpenseValidatorMapper extends EntityMapper<ExpenseValidatorDTO, ExpenseValidator> {

    @Mapping(source = "user.id", target = "userId")
    @Mapping(source = "company.id", target = "companyId")
    ExpenseValidatorDTO toDto(ExpenseValidator expenseValidator);

    @Mapping(source = "userId", target = "user")
    @Mapping(source = "companyId", target = "company")
    ExpenseValidator toEntity(ExpenseValidatorDTO expenseValidatorDTO);

    default ExpenseValidator fromId(Long id) {
        if (id == null) {
            return null;
        }
        ExpenseValidator expenseValidator = new ExpenseValidator();
        expenseValidator.setId(id);
        return expenseValidator;
    }
}
