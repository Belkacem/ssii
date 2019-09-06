package com.zsoft.service.mapper;

import com.zsoft.domain.*;
import com.zsoft.service.dto.PersistedConfigurationDTO;

import org.mapstruct.*;

/**
 * Mapper for the entity PersistedConfiguration and its DTO PersistedConfigurationDTO.
 */
@Mapper(componentModel = "spring", uses = {UserMapper.class})
public interface PersistedConfigurationMapper extends EntityMapper<PersistedConfigurationDTO, PersistedConfiguration> {

    @Mapping(source = "user.id", target = "userId")
    PersistedConfigurationDTO toDto(PersistedConfiguration persistedConfiguration);

    @Mapping(source = "userId", target = "user")
    PersistedConfiguration toEntity(PersistedConfigurationDTO persistedConfigurationDTO);

    default PersistedConfiguration fromId(Long id) {
        if (id == null) {
            return null;
        }
        PersistedConfiguration persistedConfiguration = new PersistedConfiguration();
        persistedConfiguration.setId(id);
        return persistedConfiguration;
    }
}
