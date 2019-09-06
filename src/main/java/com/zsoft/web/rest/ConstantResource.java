package com.zsoft.web.rest;
import com.zsoft.service.ConstantService;
import com.zsoft.web.rest.errors.BadRequestAlertException;
import com.zsoft.web.rest.util.HeaderUtil;
import com.zsoft.web.rest.util.PaginationUtil;
import com.zsoft.service.dto.ConstantDTO;
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
 * REST controller for managing Constant.
 */
@RestController
@RequestMapping("/api")
public class ConstantResource {

    private final Logger log = LoggerFactory.getLogger(ConstantResource.class);

    private static final String ENTITY_NAME = "constant";

    private final ConstantService constantService;

    public ConstantResource(ConstantService constantService) {
        this.constantService = constantService;
    }

    /**
     * POST  /constants : Create a new constant.
     *
     * @param constantDTO the constantDTO to create
     * @return the ResponseEntity with status 201 (Created) and with body the new constantDTO, or with status 400 (Bad Request) if the constant has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/constants")
    public ResponseEntity<ConstantDTO> createConstant(@Valid @RequestBody ConstantDTO constantDTO) throws URISyntaxException {
        log.debug("REST request to save Constant : {}", constantDTO);
        if (constantDTO.getId() != null) {
            throw new BadRequestAlertException("A new constant cannot already have an ID", ENTITY_NAME, "idexists");
        }
        ConstantDTO result = constantService.save(constantDTO);
        return ResponseEntity.created(new URI("/api/constants/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * PUT  /constants : Updates an existing constant.
     *
     * @param constantDTO the constantDTO to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated constantDTO,
     * or with status 400 (Bad Request) if the constantDTO is not valid,
     * or with status 500 (Internal Server Error) if the constantDTO couldn't be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/constants")
    public ResponseEntity<ConstantDTO> updateConstant(@Valid @RequestBody ConstantDTO constantDTO) throws URISyntaxException {
        log.debug("REST request to update Constant : {}", constantDTO);
        if (constantDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        ConstantDTO result = constantService.save(constantDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, constantDTO.getId().toString()))
            .body(result);
    }

    /**
     * GET  /constants : get all the constants.
     *
     * @param pageable the pagination information
     * @return the ResponseEntity with status 200 (OK) and the list of constants in body
     */
    @GetMapping("/constants")
    public ResponseEntity<List<ConstantDTO>> getAllConstants(Pageable pageable) {
        log.debug("REST request to get a page of Constants");
        Page<ConstantDTO> page = constantService.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/constants");
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * GET  /constants/:id : get the "id" constant.
     *
     * @param id the id of the constantDTO to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the constantDTO, or with status 404 (Not Found)
     */
    @GetMapping("/constants/{id}")
    public ResponseEntity<ConstantDTO> getConstant(@PathVariable Long id) {
        log.debug("REST request to get Constant : {}", id);
        Optional<ConstantDTO> constantDTO = constantService.findOne(id);
        return ResponseUtil.wrapOrNotFound(constantDTO);
    }

    /**
     * DELETE  /constants/:id : delete the "id" constant.
     *
     * @param id the id of the constantDTO to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/constants/{id}")
    public ResponseEntity<Void> deleteConstant(@PathVariable Long id) {
        log.debug("REST request to delete Constant : {}", id);
        constantService.delete(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
    }
}
