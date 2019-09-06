package com.zsoft.service.mapper;

import com.zsoft.domain.*;
import com.zsoft.service.dto.ClientDTO;

import org.mapstruct.*;

/**
 * Mapper for the entity Client and its DTO ClientDTO.
 */
@Mapper(componentModel = "spring", uses = {CompanyMapper.class})
public interface ClientMapper extends EntityMapper<ClientDTO, Client> {

    @Mapping(source = "company.id", target = "companyId")
    ClientDTO toDto(Client client);

    @Mapping(source = "companyId", target = "company")
    @Mapping(target = "contacts", ignore = true)
    Client toEntity(ClientDTO clientDTO);

    default Client fromId(Long id) {
        if (id == null) {
            return null;
        }
        Client client = new Client();
        client.setId(id);
        return client;
    }
}
