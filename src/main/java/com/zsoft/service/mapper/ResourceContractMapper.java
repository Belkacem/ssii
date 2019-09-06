package com.zsoft.service.mapper;

import com.zsoft.domain.*;
import com.zsoft.service.dto.ResourceContractDTO;

import org.mapstruct.*;

/**
 * Mapper for the entity ResourceContract and its DTO ResourceContractDTO.
 */
@Mapper(componentModel = "spring", uses = {ResourceMapper.class})
public interface ResourceContractMapper extends EntityMapper<ResourceContractDTO, ResourceContract> {

    @Mapping(source = "resource.id", target = "resourceId")
    ResourceContractDTO toDto(ResourceContract resourceContract);

    @Mapping(source = "resourceId", target = "resource")
    ResourceContract toEntity(ResourceContractDTO resourceContractDTO);

    default ResourceContract fromId(Long id) {
        if (id == null) {
            return null;
        }
        ResourceContract resourceContract = new ResourceContract();
        resourceContract.setId(id);
        return resourceContract;
    }
}
