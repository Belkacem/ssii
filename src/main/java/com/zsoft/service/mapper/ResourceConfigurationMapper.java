package com.zsoft.service.mapper;

import com.zsoft.domain.*;
import com.zsoft.service.dto.ResourceConfigurationDTO;

import org.mapstruct.*;

/**
 * Mapper for the entity ResourceConfiguration and its DTO ResourceConfigurationDTO.
 */
@Mapper(componentModel = "spring", uses = {ResourceMapper.class})
public interface ResourceConfigurationMapper extends EntityMapper<ResourceConfigurationDTO, ResourceConfiguration> {

    @Mapping(source = "resource.id", target = "resourceId")
    ResourceConfigurationDTO toDto(ResourceConfiguration resourceConfiguration);

    @Mapping(source = "resourceId", target = "resource")
    ResourceConfiguration toEntity(ResourceConfigurationDTO resourceConfigurationDTO);

    default ResourceConfiguration fromId(Long id) {
        if (id == null) {
            return null;
        }
        ResourceConfiguration resourceConfiguration = new ResourceConfiguration();
        resourceConfiguration.setId(id);
        return resourceConfiguration;
    }
}
