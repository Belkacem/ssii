package com.zsoft.web.rest.extensions;

import com.zsoft.service.dto.ClientDTO;
import com.zsoft.service.extensions.ClientServiceExt;
import com.zsoft.web.rest.util.PaginationUtil;
import io.github.jhipster.web.util.ResponseUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

/**
 * REST controller for managing Gateway configuration.
 */
@RestController
@RequestMapping("/api")
public class ClientResourceExt {
    private final Logger log = LoggerFactory.getLogger(ClientResourceExt.class);

    private ClientServiceExt clientServiceExt;

    public ClientResourceExt(ClientServiceExt clientServiceExt) {
        this.clientServiceExt = clientServiceExt;
    }

    /**
     * GET /ext/clients/siren/:siren : get client by siren number.
     *
     * @param siren the siren number of client
     * @return the ResponseEntity with status 200 (OK) and with body the clientDTO
     */
    @GetMapping("clients/siren/{siren}")
    public ResponseEntity<ClientDTO> getBySiren(@PathVariable String siren) {
        log.debug("REST request to get Client by siren number: {}", siren);
        Optional<ClientDTO> clientDTO = clientServiceExt.getBySiren(siren);
        if (!clientDTO.isPresent()) {
            clientDTO = clientServiceExt.fetchBySiren(siren);
        }
        return ResponseUtil.wrapOrNotFound(clientDTO);
    }

    /**
     * GET  /clients : get all the clients.
     *
     * @param pageable the pagination information
     * @param companyId the company id
     * @param idIn the list of ids
     * @return the ResponseEntity with status 200 (OK) and the list of clients in body
     */
    @GetMapping(value = "/clients", params = {"override"})
    public ResponseEntity<List<ClientDTO>> getAllClients(
        Pageable pageable,
        @RequestParam(value = "companyId", required = false) Long companyId,
        @RequestParam(value = "idIn", required = false) List<Long> idIn
    ) {
        log.debug("REST request to get a page of Clients");
        Page<ClientDTO> page = clientServiceExt.findAll(pageable, companyId, idIn);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/clients");
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }
}
