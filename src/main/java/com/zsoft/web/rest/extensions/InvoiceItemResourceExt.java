package com.zsoft.web.rest.extensions;

import com.zsoft.service.dto.InvoiceItemDTO;
import com.zsoft.service.extensions.InvoiceItemServiceExt;
import com.zsoft.web.rest.errors.BadRequestAlertException;
import com.zsoft.web.rest.util.PaginationUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.net.URISyntaxException;
import java.util.List;

/**
 * REST controller for managing InvoiceItem.
 */
@RestController
@RequestMapping("/api")
public class InvoiceItemResourceExt {

    private final Logger log = LoggerFactory.getLogger(InvoiceItemResourceExt.class);

    private static final String ENTITY_NAME = "invoiceItem";

    private final InvoiceItemServiceExt invoiceItemServiceExt;

    public InvoiceItemResourceExt(InvoiceItemServiceExt invoiceItemServiceExt) {
        this.invoiceItemServiceExt = invoiceItemServiceExt;
    }

    /**
     * POST  /invoice-items/bulk : Create a new invoiceItems.
     *
     * @param invoiceItemDTOs the invoiceItemDTO list to create
     * @return the ResponseEntity with status 201 (Created) and with body the new invoiceItemDTOs, or with status 400 (Bad Request) if the invoiceItem has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/invoice-items/bulk")
    public ResponseEntity<List<InvoiceItemDTO>> createInvoiceItem(@Valid @RequestBody List<InvoiceItemDTO> invoiceItemDTOs) throws URISyntaxException {
        log.debug("REST request to save InvoiceItems");
        if (invoiceItemDTOs.stream().anyMatch(item -> item.getId() != null)) {
            throw new BadRequestAlertException("A new invoiceItem cannot already have an ID", ENTITY_NAME, "idexists");
        }
        List<InvoiceItemDTO> result = invoiceItemServiceExt.bulkSave(invoiceItemDTOs);
        return ResponseEntity.ok().body(result);
    }

    /**
     * DELETE  /invoice-items : bulk delete invoiceItems.
     *
     * @param ids the ids of the invoiceItems to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/invoice-items/bulk")
    public ResponseEntity<Void> bulkDelete(@RequestParam("ids") List<Long> ids) {
        log.debug("REST request to delete invoiceItems : {}", ids);
        invoiceItemServiceExt.bulkDelete(ids);
        return ResponseEntity.ok().build();
    }

    /**
     * GET  /invoice-items : get all the invoiceItems.
     *
     * @param pageable    the pagination information
     * @param invoiceIdIn the list of invoice ids
     * @return the ResponseEntity with status 200 (OK) and the list of invoiceItems in body
     */
    @GetMapping(value = "/invoice-items", params = {"override"})
    public ResponseEntity<List<InvoiceItemDTO>> getAllInvoiceItems(
        Pageable pageable,
        @RequestParam(value = "invoiceIdIn", required = false) List<Long> invoiceIdIn
    ) {
        log.debug("REST request to get a page of InvoiceItems by invoiceIdIn: {}", invoiceIdIn);
        Page<InvoiceItemDTO> page = invoiceItemServiceExt.findAll(pageable, invoiceIdIn);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/invoice-items");
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }
}
