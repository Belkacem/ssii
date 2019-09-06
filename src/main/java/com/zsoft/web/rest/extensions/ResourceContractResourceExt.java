package com.zsoft.web.rest.extensions;

import com.zsoft.service.dto.ResourceContractDTO;
import com.zsoft.service.extensions.ResourceContractServiceExt;
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
 * REST controller for managing ResourceContract.
 */
@RestController
@RequestMapping("/api")
public class ResourceContractResourceExt {

    private final Logger log = LoggerFactory.getLogger(ResourceContractResourceExt.class);

    private final ResourceContractServiceExt resourceContractServiceExt;

    public ResourceContractResourceExt(ResourceContractServiceExt resourceContractServiceExt) {
        this.resourceContractServiceExt = resourceContractServiceExt;
    }

    /**
     * GET  /resource-contracts : get all the resourceContracts.
     *
     * @param pageable   the pagination information
     * @param resourceId the id of resource
     * @return the ResponseEntity with status 200 (OK) and the list of resourceContracts in body
     */
    @GetMapping(value = "/resource-contracts", params = {"resourceId"})
    public ResponseEntity<List<ResourceContractDTO>> getAllResourceContractsByResource(
        Pageable pageable,
        @RequestParam(value = "resourceId") Long resourceId
    ) {
        log.debug("REST request to get a page of ResourceContracts by resourceId: {}", resourceId);
        Page<ResourceContractDTO> page = resourceContractServiceExt.findAllByResource(pageable, resourceId);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/resource-contracts");
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * GET  /resource-contracts : get all the resourceContracts.
     *
     * @param pageable   the pagination information
     * @param companyId the id of resource company
     * @return the ResponseEntity with status 200 (OK) and the list of resourceContracts in body
     */
    @GetMapping(value = "/resource-contracts", params = {"companyId"})
    public ResponseEntity<List<ResourceContractDTO>> getAllResourceContractsByCompany(
        Pageable pageable,
        @RequestParam(value = "companyId") Long companyId
    ) {
        log.debug("REST request to get a page of ResourceContracts by resource companyId: {}", companyId);
        Page<ResourceContractDTO> page = resourceContractServiceExt.findAllByCompany(pageable, companyId);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/resource-contracts");
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }
}
