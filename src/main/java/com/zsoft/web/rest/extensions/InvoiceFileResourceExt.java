package com.zsoft.web.rest.extensions;

import com.zsoft.service.dto.InvoiceFileDTO;
import com.zsoft.service.extensions.InvoiceFileServiceExt;
import io.github.jhipster.web.util.ResponseUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

/**
 * REST controller for managing InvoiceFile.
 */
@RestController
@RequestMapping("/api")
public class InvoiceFileResourceExt {

    private final Logger log = LoggerFactory.getLogger(InvoiceFileResourceExt.class);

    private final InvoiceFileServiceExt invoiceFileServiceExt;

    public InvoiceFileResourceExt(InvoiceFileServiceExt invoiceFileServiceExt) {
        this.invoiceFileServiceExt = invoiceFileServiceExt;
    }

    /**
     * GET  /invoice-files/:invoice_id : get the "id" invoice.
     *
     * @param invoiceId the id of the invoice
     * @return the ResponseEntity with status 200 (OK) and with body the invoiceFileDTO, or with status 404 (Not Found)
     */
    @GetMapping(value = "/invoice-files/{invoice_id}", params = {"override"})
    public ResponseEntity<InvoiceFileDTO> getInvoiceFileByInvoiceId(@PathVariable(value = "invoice_id") Long invoiceId) {
        log.debug("REST request to get InvoiceFile by invoiceId : {}", invoiceId);
        Optional<InvoiceFileDTO> invoiceFileDTO = invoiceFileServiceExt.getFile(invoiceId);
        return ResponseUtil.wrapOrNotFound(invoiceFileDTO);
    }
}
