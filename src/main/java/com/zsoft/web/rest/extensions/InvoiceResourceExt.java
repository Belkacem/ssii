package com.zsoft.web.rest.extensions;

import com.zsoft.service.dto.InvoiceDTO;
import com.zsoft.service.extensions.InvoiceServiceExt;
import com.zsoft.web.rest.errors.BadRequestAlertException;
import com.zsoft.web.rest.util.HeaderUtil;
import com.zsoft.web.rest.util.PaginationUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * REST controller for managing Invoice.
 */
@RestController
@RequestMapping("/api")
public class InvoiceResourceExt {

    private final Logger log = LoggerFactory.getLogger(InvoiceResourceExt.class);

    private static final String ENTITY_NAME = "invoice";

    private final InvoiceServiceExt invoiceServiceExt;

    public InvoiceResourceExt(InvoiceServiceExt invoiceServiceExt) {
        this.invoiceServiceExt = invoiceServiceExt;
    }

    /**
     * POST  /invoices : Create a new invoice.
     *
     * @param invoiceDTO the invoiceDTO to create
     * @return the ResponseEntity with status 201 (Created) and with body the new invoiceDTO, or with status 400 (Bad Request) if the invoice has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping(value = "/invoices", params = {"override"})
    public ResponseEntity<InvoiceDTO> createInvoice(@Valid @RequestBody InvoiceDTO invoiceDTO) throws URISyntaxException {
        log.debug("REST request to save Invoice : {}", invoiceDTO);
        if (invoiceDTO.getId() != null) {
            throw new BadRequestAlertException("A new invoice cannot already have an ID", ENTITY_NAME, "idexists");
        }
        InvoiceDTO result = invoiceServiceExt.create(invoiceDTO);
        return ResponseEntity.created(new URI("/api/invoices/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * PUT  /invoices : Updates an existing invoice.
     *
     * @param invoiceDTO the invoiceDTO to update
     * @param sendEmail  boolean to send email after update or not
     * @return the ResponseEntity with status 200 (OK) and with body the updated invoiceDTO,
     * or with status 400 (Bad Request) if the invoiceDTO is not valid,
     * or with status 500 (Internal Server Error) if the invoiceDTO couldn't be updated
     */
    @PutMapping(value = "/invoices", params = {"override", "email"})
    public ResponseEntity<InvoiceDTO> updateInvoice(
        @Valid @RequestBody InvoiceDTO invoiceDTO,
        @RequestParam(value = "email", required = false) Boolean sendEmail
    ) {
        log.debug("REST request to update Invoice : {}", invoiceDTO);
        if (invoiceDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        InvoiceDTO result = invoiceServiceExt.update(invoiceDTO, sendEmail);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, invoiceDTO.getId().toString()))
            .body(result);
    }

    /**
     * PUT  /invoices : Updates an existing invoice.
     *
     * @param invoiceDTOs the list of invoiceDTO to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated invoiceDTO,
     * or with status 400 (Bad Request) if the invoiceDTO is not valid,
     * or with status 500 (Internal Server Error) if the invoiceDTO couldn't be updated
     */
    @PutMapping(value = "/invoices", params = {"bulk"})
    public ResponseEntity<List<InvoiceDTO>> updateInvoice(@Valid @RequestBody List<InvoiceDTO> invoiceDTOs) {
        log.debug("REST request to update Invoices : {}", invoiceDTOs);
        if (invoiceDTOs.stream().anyMatch(invoiceDTO -> invoiceDTO.getId() == null)) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        List<InvoiceDTO> result = invoiceServiceExt.updateBulk(invoiceDTOs);
        return ResponseEntity.ok(result);
    }

    /**
     * Get  /invoices/send-reminder : send an email of invoice to client.
     *
     * @param invoiceIdList the id list of the invoiceDTO
     */
    @GetMapping("/invoices/send-reminder/{invoiceIdList}")
    public void sendReminder(@PathVariable List<Long> invoiceIdList) {
        log.debug("REST request to send an reminder email of invoices: {}", invoiceIdList);
        invoiceServiceExt.sendReminder(invoiceIdList);
    }

    /**
     * Get  /invoices/:id/download : get PDF file of an invoice as Base64 encoded.
     *
     * @param id the id of the invoiceDTO
     * @return the ResponseEntity with status 200 (OK) and the pdf file as Base64 encoded of invoice in body
     */
    @GetMapping("/invoices/{id}/download")
    public ResponseEntity<String> downloadPDF(@PathVariable Long id) {
        log.debug("REST request to get PDF file of an invoice: {}", id);
        return invoiceServiceExt.getInvoicePDF(id)
            .map(ResponseEntity::ok)
            .orElseThrow(() -> new BadRequestAlertException("File not found", "invoice", "filenotfound"));
    }

    /**
     * DELETE  /invoices/:id : delete the "id" invoice.
     *
     * @param id the id of the invoiceDTO to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping(value = "/invoices/{id}", params = {"override"})
    public ResponseEntity<Void> deleteInvoice(@PathVariable Long id) {
        log.debug("REST request to delete Invoice : {}", id);
        invoiceServiceExt.delete(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
    }

    /**
     * GET  /invoices : get all the invoices.
     *
     * @param pageable           the pagination information
     * @param companyId          the id of company
     * @param projectId          the id of project
     * @param clientId           the id of client
     * @param activityReportIdIn the id list of activity reports
     * @return the ResponseEntity with status 200 (OK) and the list of invoices in body
     */
    @GetMapping(value = "/invoices", params = {"override"})
    public ResponseEntity<List<InvoiceDTO>> getAllInvoices(
        Pageable pageable,
        @RequestParam(value = "companyId", required = false) Long companyId,
        @RequestParam(value = "projectId", required = false) Long projectId,
        @RequestParam(value = "clientId", required = false) Long clientId,
        @RequestParam(value = "activityReportIdIn", required = false) List<Long> activityReportIdIn
    ) {
        log.debug("REST request to get a page of Invoices by companyId: {}, projectId: {}, clientId: {}, activityReportIds: {}", companyId, projectId, clientId, activityReportIdIn);
        Page<InvoiceDTO> page = invoiceServiceExt.findAll(pageable, companyId, projectId, clientId, activityReportIdIn);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/invoices");
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * POST  /invoices/generate/:activity_report_id : generate invoices from activity report.
     *
     * @param activity_report_id the id of the activityReport to generate
     * @return the ResponseEntity with status 200 (OK)
     */
    @PostMapping(value = "/invoices/generate/{activity_report_id}")
    public ResponseEntity<List<InvoiceDTO>> generateInvoices(@PathVariable("activity_report_id") Long activity_report_id) {
        log.debug("REST request to generated Invoices from Activity Report : {}, [is separated: {}]", activity_report_id);
        invoiceServiceExt.deleteByActivityReportId(activity_report_id);
        List<InvoiceDTO> invoices = invoiceServiceExt.generateInvoices(activity_report_id);
        invoices = invoices.stream().map(invoiceServiceExt::generateInvoiceTemplate)
            .filter(Optional::isPresent)
            .map(Optional::get)
            .collect(Collectors.toList());
        return ResponseEntity.ok().body(invoices);
    }
}
