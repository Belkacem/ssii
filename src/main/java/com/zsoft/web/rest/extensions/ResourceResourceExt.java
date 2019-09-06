package com.zsoft.web.rest.extensions;

import com.zsoft.service.dto.ResourceDTO;
import com.zsoft.service.extensions.ResourceServiceExt;
import com.zsoft.web.rest.errors.BadRequestAlertException;
import com.zsoft.web.rest.errors.EmailAlreadyUsedException;
import com.zsoft.web.rest.util.HeaderUtil;
import com.zsoft.web.rest.util.PaginationUtil;
import io.github.jhipster.web.util.ResponseUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;
import java.util.Optional;

/**
 * REST controller for managing Resource.
 */
@RestController
@RequestMapping("/api")
public class ResourceResourceExt {
    private final Logger log = LoggerFactory.getLogger(ResourceResourceExt.class);

    private static final String ENTITY_NAME = "resource";

    private final ResourceServiceExt resourceServiceExt;

    public ResourceResourceExt(ResourceServiceExt resourceServiceExt) {
        this.resourceServiceExt = resourceServiceExt;
    }

    /**
     * POST  /resources : Create a new resource.
     *
     * @param resourceDTO the resourceDTO to create
     * @return the ResponseEntity with status 201 (Created) and with body the new resourceDTO, or with status 400 (Bad Request) if the resource has already an ID
     * @throws EmailAlreadyUsedException 400 (Bad Request) if the email is already used
     */
    @PostMapping(value = "/resources", params = {"override"})
    public ResponseEntity<ResourceDTO> createResource(@Valid @RequestBody ResourceDTO resourceDTO) {
        log.debug("REST request to save Resource : {}", resourceDTO);
        if (resourceDTO.getId() != null) {
            throw new BadRequestAlertException("A new resource cannot already have an ID", ENTITY_NAME, "idexists");
        }
        Optional<ResourceDTO> result = resourceServiceExt.create(resourceDTO);
        return ResponseUtil.wrapOrNotFound(result);
    }

    /**
     * PUT  /resources : Updates an existing resource.
     *
     * @param resourceDTO the resourceDTO to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated resourceDTO,
     * or with status 400 (Bad Request) if the resourceDTO is not valid,
     * or with status 500 (Internal Server Error) if the resourceDTO couldn't be updated
     */
    @PutMapping(value = "/resources", params = {"override"})
    public ResponseEntity<ResourceDTO> updateResource(@Valid @RequestBody ResourceDTO resourceDTO) {
        log.debug("REST request to update Resource : {}", resourceDTO);
        if (resourceDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        ResourceDTO result = resourceServiceExt.update(resourceDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, resourceDTO.getId().toString()))
            .body(result);
    }

    /**
     * GET  /resources/resend-ticket/:resource_id : resend a new invitation with ticket to resource.
     *
     * @param resourceId the id of resource
     * @return the ResponseEntity with status 200 (OK) and with body resourceDTO
     */
    @GetMapping("/resources/resend-ticket/{resource_id}")
    public ResponseEntity<ResourceDTO> resetTicket(@PathVariable("resource_id") Long resourceId) {
        log.debug("REST request to resend a resource invitation : {}", resourceId);
        ResourceDTO result = resourceServiceExt.resendTicket(resourceId);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, resourceId.toString()))
            .body(result);
    }

    /**
     * DELETE  /resources :bulk delete resource.
     *
     * @param ids the id list of the resource to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/resources/bulk")
    public ResponseEntity<Void> deleteResource(@RequestParam("ids") List<Long> ids) {
        log.debug("REST request to delete Resources : {}", ids);
        resourceServiceExt.delete(ids);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, ids.toString())).build();
    }

    /**
     * GET  /resources/current/:company_id : get the current resource.
     *
     * @param companyId the company id of resource to get
     * @return the ResponseEntity with status 200 (OK) and with body the resourceDTO, or with status 404 (Not Found)
     */
    @GetMapping("/resources/current/{company_id}")
    public ResponseEntity<ResourceDTO> getCurrentResource(@PathVariable("company_id") Long companyId) {
        log.debug("REST request to get Current Resource in company: {}", companyId);
        Optional<ResourceDTO> resourceDTO = resourceServiceExt.getCurrent(companyId);
        return ResponseEntity.ok().body(resourceDTO.orElse(null));
    }

    /**
     * GET  /resources : get all the resources.
     *
     * @param pageable  the pagination information
     * @param companyId the id of company
     * @param idIn      the list of resource ids
     * @return the ResponseEntity with status 200 (OK) and the list of resources in body
     */
    @GetMapping(value = "/resources", params = {"override"})
    public ResponseEntity<List<ResourceDTO>> getAllResources(
        Pageable pageable,
        @RequestParam(value = "companyId", required = false) Long companyId,
        @RequestParam(value = "idIn", required = false) List<Long> idIn
    ) {
        log.debug("REST request to get a page of Resources by companyId: {}, ids: {}", companyId, idIn);
        Page<ResourceDTO> page = resourceServiceExt.findAll(pageable, companyId, idIn);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/resources");
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * PUT  /resources?ticket : Updates an existing resource.
     *
     * @param ticket the ticket of resource to update
     * @return the ResponseEntity with status 200 (OK)
     */
    @PutMapping(value = "/resources", params = {"ticket"})
    public ResponseEntity assignAccount(@Valid @RequestParam String ticket) {
        log.debug("REST request to assign a Resource to an user account by ticket : {}", ticket);
        try {
            resourceServiceExt.assignToAccount(ticket);
        } catch (Exception cve) {
            throw new BadRequestAlertException("You already connected as resource", ENTITY_NAME, "isunique");
        }
        return ResponseEntity.ok(200);
    }

    /**
     * GET /resources/new-tickets : Check for new resource ticket.
     *
     * @return the ResponseEntity with status 200 (OK) and with body the resourceDTO or null
     */
    @GetMapping(value = "/resources/new-tickets")
    public ResponseEntity checkNewTickets() {
        log.debug("REST request to check for new Resource ticket");
        Optional<ResourceDTO> resourceDTO = resourceServiceExt.checkNewTickets();
        return ResponseEntity.ok().body(resourceDTO.orElse(null));
    }
}
