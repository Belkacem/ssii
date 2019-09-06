package com.zsoft.service.mapper;

import com.zsoft.domain.*;
import com.zsoft.service.dto.ConstantDTO;

import org.mapstruct.*;

/**
 * Mapper for the entity Constant and its DTO ConstantDTO.
 */
@Mapper(componentModel = "spring", uses = {})
public interface ConstantMapper extends EntityMapper<ConstantDTO, Constant> {
    default Constant fromId(Long id) {
        if (id == null) {
            return null;
        }
        Constant constant = new Constant();
        constant.setId(id);
        return constant;
    }
}
