package com.zsoft.web.rest.extensions;

import com.zsoft.service.dto.ClientContactDTO;
import com.zsoft.service.extensions.ClientContactServiceExt;
import com.zsoft.web.rest.util.PaginationUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * REST controller for managing ClientContact.
 */
@RestController
@RequestMapping("/api")
public class ClientContactResourceExt {
    private final Logger log = LoggerFactory.getLogger(ClientContactResourceExt.class);

    private ClientContactServiceExt clientContactServiceExt;

    public ClientContactResourceExt(
        ClientContactServiceExt clientContactServiceExt
    ) {
        this.clientContactServiceExt = clientContactServiceExt;
    }

    /**
     * GET  /client-contacts : get all the clients contacts.
     *
     * @param pageable  the pagination information
     * @param clientIds the ids list of clients
     * @param idIn      the list of ids
     * @return the ResponseEntity with status 200 (OK) and the list of clientsContactsDTO in body
     */
    @GetMapping(value = "/client-contacts", params = {"override"})
    public ResponseEntity<List<ClientContactDTO>> getAllClients(
        Pageable pageable,
        @RequestParam(value = "clientIdIn", required = false) List<Long> clientIds,
        @RequestParam(value = "idIn", required = false) List<Long> idIn
    ) {
        log.debug("REST request to get a page of Clients contacts by [client ids: {}, ids: {}]", clientIds, idIn);
        Page<ClientContactDTO> page = clientContactServiceExt.findAll(pageable, clientIds, idIn);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/clients");
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }
}
