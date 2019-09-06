package com.zsoft.service.mapper;

import com.zsoft.domain.*;
import com.zsoft.service.dto.AbsenceBalanceDTO;

import org.mapstruct.*;

/**
 * Mapper for the entity AbsenceBalance and its DTO AbsenceBalanceDTO.
 */
@Mapper(componentModel = "spring", uses = {AbsenceTypeMapper.class, ResourceMapper.class})
public interface AbsenceBalanceMapper extends EntityMapper<AbsenceBalanceDTO, AbsenceBalance> {

    @Mapping(source = "type.id", target = "typeId")
    @Mapping(source = "resource.id", target = "resourceId")
    AbsenceBalanceDTO toDto(AbsenceBalance absenceBalance);

    @Mapping(source = "typeId", target = "type")
    @Mapping(source = "resourceId", target = "resource")
    AbsenceBalance toEntity(AbsenceBalanceDTO absenceBalanceDTO);

    default AbsenceBalance fromId(Long id) {
        if (id == null) {
            return null;
        }
        AbsenceBalance absenceBalance = new AbsenceBalance();
        absenceBalance.setId(id);
        return absenceBalance;
    }
}
