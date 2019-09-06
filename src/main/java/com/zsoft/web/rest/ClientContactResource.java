package com.zsoft.web.rest;
import com.zsoft.service.ClientContactService;
import com.zsoft.web.rest.errors.BadRequestAlertException;
import com.zsoft.web.rest.util.HeaderUtil;
import com.zsoft.web.rest.util.PaginationUtil;
import com.zsoft.service.dto.ClientContactDTO;
import io.github.jhipster.web.util.ResponseUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.net.URI;
import java.net.URISyntaxException;

import java.util.List;
import java.util.Optional;

/**
 * REST controller for managing ClientContact.
 */
@RestController
@RequestMapping("/api")
public class ClientContactResource {

    private final Logger log = LoggerFactory.getLogger(ClientContactResource.class);

    private static final String ENTITY_NAME = "clientContact";

    private final ClientContactService clientContactService;

    public ClientContactResource(ClientContactService clientContactService) {
        this.clientContactService = clientContactService;
    }

    /**
     * POST  /client-contacts : Create a new clientContact.
     *
     * @param clientContactDTO the clientContactDTO to create
     * @return the ResponseEntity with status 201 (Created) and with body the new clientContactDTO, or with status 400 (Bad Request) if the clientContact has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/client-contacts")
    public ResponseEntity<ClientContactDTO> createClientContact(@Valid @RequestBody ClientContactDTO clientContactDTO) throws URISyntaxException {
        log.debug("REST request to save ClientContact : {}", clientContactDTO);
        if (clientContactDTO.getId() != null) {
            throw new BadRequestAlertException("A new clientContact cannot already have an ID", ENTITY_NAME, "idexists");
        }
        ClientContactDTO result = clientContactService.save(clientContactDTO);
        return ResponseEntity.created(new URI("/api/client-contacts/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * PUT  /client-contacts : Updates an existing clientContact.
     *
     * @param clientContactDTO the clientContactDTO to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated clientContactDTO,
     * or with status 400 (Bad Request) if the clientContactDTO is not valid,
     * or with status 500 (Internal Server Error) if the clientContactDTO couldn't be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/client-contacts")
    public ResponseEntity<ClientContactDTO> updateClientContact(@Valid @RequestBody ClientContactDTO clientContactDTO) throws URISyntaxException {
        log.debug("REST request to update ClientContact : {}", clientContactDTO);
        if (clientContactDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        ClientContactDTO result = clientContactService.save(clientContactDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, clientContactDTO.getId().toString()))
            .body(result);
    }

    /**
     * GET  /client-contacts : get all the clientContacts.
     *
     * @param pageable the pagination information
     * @return the ResponseEntity with status 200 (OK) and the list of clientContacts in body
     */
    @GetMapping("/client-contacts")
    public ResponseEntity<List<ClientContactDTO>> getAllClientContacts(Pageable pageable) {
        log.debug("REST request to get a page of ClientContacts");
        Page<ClientContactDTO> page = clientContactService.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/client-contacts");
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * GET  /client-contacts/:id : get the "id" clientContact.
     *
     * @param id the id of the clientContactDTO to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the clientContactDTO, or with status 404 (Not Found)
     */
    @GetMapping("/client-contacts/{id}")
    public ResponseEntity<ClientContactDTO> getClientContact(@PathVariable Long id) {
        log.debug("REST request to get ClientContact : {}", id);
        Optional<ClientContactDTO> clientContactDTO = clientContactService.findOne(id);
        return ResponseUtil.wrapOrNotFound(clientContactDTO);
    }

    /**
     * DELETE  /client-contacts/:id : delete the "id" clientContact.
     *
     * @param id the id of the clientContactDTO to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/client-contacts/{id}")
    public ResponseEntity<Void> deleteClientContact(@PathVariable Long id) {
        log.debug("REST request to delete ClientContact : {}", id);
        clientContactService.delete(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
    }
}
