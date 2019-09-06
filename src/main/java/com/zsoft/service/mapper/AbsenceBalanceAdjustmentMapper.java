package com.zsoft.service.mapper;

import com.zsoft.domain.*;
import com.zsoft.service.dto.AbsenceBalanceAdjustmentDTO;

import org.mapstruct.*;

/**
 * Mapper for the entity AbsenceBalanceAdjustment and its DTO AbsenceBalanceAdjustmentDTO.
 */
@Mapper(componentModel = "spring", uses = {AbsenceBalanceMapper.class, AbsenceMapper.class})
public interface AbsenceBalanceAdjustmentMapper extends EntityMapper<AbsenceBalanceAdjustmentDTO, AbsenceBalanceAdjustment> {

    @Mapping(source = "absenceBalance.id", target = "absenceBalanceId")
    @Mapping(source = "absence.id", target = "absenceId")
    AbsenceBalanceAdjustmentDTO toDto(AbsenceBalanceAdjustment absenceBalanceAdjustment);

    @Mapping(source = "absenceBalanceId", target = "absenceBalance")
    @Mapping(source = "absenceId", target = "absence")
    AbsenceBalanceAdjustment toEntity(AbsenceBalanceAdjustmentDTO absenceBalanceAdjustmentDTO);

    default AbsenceBalanceAdjustment fromId(Long id) {
        if (id == null) {
            return null;
        }
        AbsenceBalanceAdjustment absenceBalanceAdjustment = new AbsenceBalanceAdjustment();
        absenceBalanceAdjustment.setId(id);
        return absenceBalanceAdjustment;
    }
}
