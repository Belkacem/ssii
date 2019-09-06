package com.zsoft.service.mapper;

import com.zsoft.domain.*;
import com.zsoft.service.dto.ResourceDTO;

import org.mapstruct.*;

/**
 * Mapper for the entity Resource and its DTO ResourceDTO.
 */
@Mapper(componentModel = "spring", uses = {CompanyMapper.class, UserMapper.class})
public interface ResourceMapper extends EntityMapper<ResourceDTO, Resource> {

    @Mapping(source = "company.id", target = "companyId")
    @Mapping(source = "user.id", target = "userId")
    ResourceDTO toDto(Resource resource);

    @Mapping(source = "companyId", target = "company")
    @Mapping(source = "userId", target = "user")
    @Mapping(target = "validators", ignore = true)
    Resource toEntity(ResourceDTO resourceDTO);

    default Resource fromId(Long id) {
        if (id == null) {
            return null;
        }
        Resource resource = new Resource();
        resource.setId(id);
        return resource;
    }
}
