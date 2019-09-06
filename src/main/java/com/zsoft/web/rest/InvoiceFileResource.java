package com.zsoft.web.rest;
import com.zsoft.service.InvoiceFileService;
import com.zsoft.web.rest.errors.BadRequestAlertException;
import com.zsoft.web.rest.util.HeaderUtil;
import com.zsoft.web.rest.util.PaginationUtil;
import com.zsoft.service.dto.InvoiceFileDTO;
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
 * REST controller for managing InvoiceFile.
 */
@RestController
@RequestMapping("/api")
public class InvoiceFileResource {

    private final Logger log = LoggerFactory.getLogger(InvoiceFileResource.class);

    private static final String ENTITY_NAME = "invoiceFile";

    private final InvoiceFileService invoiceFileService;

    public InvoiceFileResource(InvoiceFileService invoiceFileService) {
        this.invoiceFileService = invoiceFileService;
    }

    /**
     * POST  /invoice-files : Create a new invoiceFile.
     *
     * @param invoiceFileDTO the invoiceFileDTO to create
     * @return the ResponseEntity with status 201 (Created) and with body the new invoiceFileDTO, or with status 400 (Bad Request) if the invoiceFile has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/invoice-files")
    public ResponseEntity<InvoiceFileDTO> createInvoiceFile(@Valid @RequestBody InvoiceFileDTO invoiceFileDTO) throws URISyntaxException {
        log.debug("REST request to save InvoiceFile : {}", invoiceFileDTO);
        if (invoiceFileDTO.getId() != null) {
            throw new BadRequestAlertException("A new invoiceFile cannot already have an ID", ENTITY_NAME, "idexists");
        }
        InvoiceFileDTO result = invoiceFileService.save(invoiceFileDTO);
        return ResponseEntity.created(new URI("/api/invoice-files/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * PUT  /invoice-files : Updates an existing invoiceFile.
     *
     * @param invoiceFileDTO the invoiceFileDTO to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated invoiceFileDTO,
     * or with status 400 (Bad Request) if the invoiceFileDTO is not valid,
     * or with status 500 (Internal Server Error) if the invoiceFileDTO couldn't be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/invoice-files")
    public ResponseEntity<InvoiceFileDTO> updateInvoiceFile(@Valid @RequestBody InvoiceFileDTO invoiceFileDTO) throws URISyntaxException {
        log.debug("REST request to update InvoiceFile : {}", invoiceFileDTO);
        if (invoiceFileDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        InvoiceFileDTO result = invoiceFileService.save(invoiceFileDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, invoiceFileDTO.getId().toString()))
            .body(result);
    }

    /**
     * GET  /invoice-files : get all the invoiceFiles.
     *
     * @param pageable the pagination information
     * @return the ResponseEntity with status 200 (OK) and the list of invoiceFiles in body
     */
    @GetMapping("/invoice-files")
    public ResponseEntity<List<InvoiceFileDTO>> getAllInvoiceFiles(Pageable pageable) {
        log.debug("REST request to get a page of InvoiceFiles");
        Page<InvoiceFileDTO> page = invoiceFileService.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/invoice-files");
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * GET  /invoice-files/:id : get the "id" invoiceFile.
     *
     * @param id the id of the invoiceFileDTO to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the invoiceFileDTO, or with status 404 (Not Found)
     */
    @GetMapping("/invoice-files/{id}")
    public ResponseEntity<InvoiceFileDTO> getInvoiceFile(@PathVariable Long id) {
        log.debug("REST request to get InvoiceFile : {}", id);
        Optional<InvoiceFileDTO> invoiceFileDTO = invoiceFileService.findOne(id);
        return ResponseUtil.wrapOrNotFound(invoiceFileDTO);
    }

    /**
     * DELETE  /invoice-files/:id : delete the "id" invoiceFile.
     *
     * @param id the id of the invoiceFileDTO to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/invoice-files/{id}")
    public ResponseEntity<Void> deleteInvoiceFile(@PathVariable Long id) {
        log.debug("REST request to delete InvoiceFile : {}", id);
        invoiceFileService.delete(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
    }
}
