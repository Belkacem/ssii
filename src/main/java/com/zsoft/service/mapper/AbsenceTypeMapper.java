package com.zsoft.service.mapper;

import com.zsoft.domain.*;
import com.zsoft.service.dto.AbsenceTypeDTO;

import org.mapstruct.*;

/**
 * Mapper for the entity AbsenceType and its DTO AbsenceTypeDTO.
 */
@Mapper(componentModel = "spring", uses = {})
public interface AbsenceTypeMapper extends EntityMapper<AbsenceTypeDTO, AbsenceType> {



    default AbsenceType fromId(Long id) {
        if (id == null) {
            return null;
        }
        AbsenceType absenceType = new AbsenceType();
        absenceType.setId(id);
        return absenceType;
    }
}
