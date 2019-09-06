package com.zsoft.service.mapper;

import com.zsoft.domain.*;
import com.zsoft.service.dto.AbsenceValidatorDTO;

import org.mapstruct.*;

/**
 * Mapper for the entity AbsenceValidator and its DTO AbsenceValidatorDTO.
 */
@Mapper(componentModel = "spring", uses = {UserMapper.class, CompanyMapper.class, ResourceMapper.class})
public interface AbsenceValidatorMapper extends EntityMapper<AbsenceValidatorDTO, AbsenceValidator> {

    @Mapping(source = "user.id", target = "userId")
    @Mapping(source = "company.id", target = "companyId")
    AbsenceValidatorDTO toDto(AbsenceValidator absenceValidator);

    @Mapping(source = "userId", target = "user")
    @Mapping(source = "companyId", target = "company")
    AbsenceValidator toEntity(AbsenceValidatorDTO absenceValidatorDTO);

    default AbsenceValidator fromId(Long id) {
        if (id == null) {
            return null;
        }
        AbsenceValidator absenceValidator = new AbsenceValidator();
        absenceValidator.setId(id);
        return absenceValidator;
    }
}
