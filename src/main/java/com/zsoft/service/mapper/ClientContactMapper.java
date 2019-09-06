package com.zsoft.service.mapper;

import com.zsoft.domain.*;
import com.zsoft.service.dto.ClientContactDTO;

import org.mapstruct.*;

/**
 * Mapper for the entity ClientContact and its DTO ClientContactDTO.
 */
@Mapper(componentModel = "spring", uses = {ClientMapper.class})
public interface ClientContactMapper extends EntityMapper<ClientContactDTO, ClientContact> {

    @Mapping(source = "client.id", target = "clientId")
    ClientContactDTO toDto(ClientContact clientContact);

    @Mapping(source = "clientId", target = "client")
    ClientContact toEntity(ClientContactDTO clientContactDTO);

    default ClientContact fromId(Long id) {
        if (id == null) {
            return null;
        }
        ClientContact clientContact = new ClientContact();
        clientContact.setId(id);
        return clientContact;
    }
}
