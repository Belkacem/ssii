package com.zsoft.service.mapper;

import com.zsoft.domain.*;
import com.zsoft.service.dto.AbsenceDTO;

import org.mapstruct.*;

/**
 * Mapper for the entity Absence and its DTO AbsenceDTO.
 */
@Mapper(componentModel = "spring", uses = {ResourceMapper.class, AbsenceTypeMapper.class, UserMapper.class, AbsenceValidatorMapper.class})
public interface AbsenceMapper extends EntityMapper<AbsenceDTO, Absence> {

    @Mapping(source = "resource.id", target = "resourceId")
    @Mapping(source = "type.id", target = "typeId")
    @Mapping(source = "creator.id", target = "creatorId")
    @Mapping(source = "validator.id", target = "validatorId")
    AbsenceDTO toDto(Absence absence);

    @Mapping(source = "resourceId", target = "resource")
    @Mapping(source = "typeId", target = "type")
    @Mapping(source = "creatorId", target = "creator")
    @Mapping(source = "validatorId", target = "validator")
    Absence toEntity(AbsenceDTO absenceDTO);

    default Absence fromId(Long id) {
        if (id == null) {
            return null;
        }
        Absence absence = new Absence();
        absence.setId(id);
        return absence;
    }
}
