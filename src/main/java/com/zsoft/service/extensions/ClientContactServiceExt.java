package com.zsoft.service.extensions;

import com.zsoft.domain.ClientContact;
import com.zsoft.repository.extensions.ClientContactRepositoryExt;
import com.zsoft.service.dto.ClientContactDTO;
import com.zsoft.service.mapper.ClientContactMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@SuppressWarnings("ALL")
@Service
@Transactional
public class ClientContactServiceExt {
    private final Logger log = LoggerFactory.getLogger(ClientContactServiceExt.class);

    private ClientContactRepositoryExt clientContactRepositoryExt;
    private ClientContactMapper clientContactMapper;

    public ClientContactServiceExt(
        ClientContactRepositoryExt clientContactRepositoryExt,
        ClientContactMapper clientContactMapper
    ) {
        this.clientContactRepositoryExt = clientContactRepositoryExt;
        this.clientContactMapper = clientContactMapper;
    }

    /**
     * Get all the clients contacts.
     *
     * @param pageable  the pagination information
     * @param clientIds the ids list of clients
     * @param ids       the list of ids
     * @return the list of ClientContactDTO
     */
    @Transactional(readOnly = true)
    public Page<ClientContactDTO> findAll(Pageable pageable, List<Long> clientIds, List<Long> ids) {
        log.debug("Request to get all Clients contacts by [client ids: {}, ids: {}]", clientIds, ids);
        if (clientIds != null && clientIds.size() > 0) {
            return clientContactRepositoryExt.findAllByClientIdIn(clientIds, pageable)
                .map(clientContactMapper::toDto);
        }
        if (ids != null && ids.size() > 0) {
            return clientContactRepositoryExt.findAllByIdIn(ids, pageable)
                .map(clientContactMapper::toDto);
        }
        return clientContactRepositoryExt.findAll(pageable)
            .map(clientContactMapper::toDto);
    }

    public List<ClientContact> getByClientId(Long clientId) {
        return clientContactRepositoryExt.findAllByClientId(clientId);
    }
}
