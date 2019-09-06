package com.zsoft.service.mapper;

import com.zsoft.domain.*;
import com.zsoft.service.dto.AbsenceJustificationDTO;

import org.mapstruct.*;

/**
 * Mapper for the entity AbsenceJustification and its DTO AbsenceJustificationDTO.
 */
@Mapper(componentModel = "spring", uses = {AbsenceMapper.class})
public interface AbsenceJustificationMapper extends EntityMapper<AbsenceJustificationDTO, AbsenceJustification> {

    @Mapping(source = "absence.id", target = "absenceId")
    AbsenceJustificationDTO toDto(AbsenceJustification absenceJustification);

    @Mapping(source = "absenceId", target = "absence")
    AbsenceJustification toEntity(AbsenceJustificationDTO absenceJustificationDTO);

    default AbsenceJustification fromId(Long id) {
        if (id == null) {
            return null;
        }
        AbsenceJustification absenceJustification = new AbsenceJustification();
        absenceJustification.setId(id);
        return absenceJustification;
    }
}
