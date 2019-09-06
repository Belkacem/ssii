package com.zsoft.web.rest;
import com.zsoft.service.AbsenceTypeService;
import com.zsoft.web.rest.errors.BadRequestAlertException;
import com.zsoft.web.rest.util.HeaderUtil;
import com.zsoft.web.rest.util.PaginationUtil;
import com.zsoft.service.dto.AbsenceTypeDTO;
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
 * REST controller for managing AbsenceType.
 */
@RestController
@RequestMapping("/api")
public class AbsenceTypeResource {

    private final Logger log = LoggerFactory.getLogger(AbsenceTypeResource.class);

    private static final String ENTITY_NAME = "absenceType";

    private final AbsenceTypeService absenceTypeService;

    public AbsenceTypeResource(AbsenceTypeService absenceTypeService) {
        this.absenceTypeService = absenceTypeService;
    }

    /**
     * POST  /absence-types : Create a new absenceType.
     *
     * @param absenceTypeDTO the absenceTypeDTO to create
     * @return the ResponseEntity with status 201 (Created) and with body the new absenceTypeDTO, or with status 400 (Bad Request) if the absenceType has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/absence-types")
    public ResponseEntity<AbsenceTypeDTO> createAbsenceType(@Valid @RequestBody AbsenceTypeDTO absenceTypeDTO) throws URISyntaxException {
        log.debug("REST request to save AbsenceType : {}", absenceTypeDTO);
        if (absenceTypeDTO.getId() != null) {
            throw new BadRequestAlertException("A new absenceType cannot already have an ID", ENTITY_NAME, "idexists");
        }
        AbsenceTypeDTO result = absenceTypeService.save(absenceTypeDTO);
        return ResponseEntity.created(new URI("/api/absence-types/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * PUT  /absence-types : Updates an existing absenceType.
     *
     * @param absenceTypeDTO the absenceTypeDTO to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated absenceTypeDTO,
     * or with status 400 (Bad Request) if the absenceTypeDTO is not valid,
     * or with status 500 (Internal Server Error) if the absenceTypeDTO couldn't be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/absence-types")
    public ResponseEntity<AbsenceTypeDTO> updateAbsenceType(@Valid @RequestBody AbsenceTypeDTO absenceTypeDTO) throws URISyntaxException {
        log.debug("REST request to update AbsenceType : {}", absenceTypeDTO);
        if (absenceTypeDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        AbsenceTypeDTO result = absenceTypeService.save(absenceTypeDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, absenceTypeDTO.getId().toString()))
            .body(result);
    }

    /**
     * GET  /absence-types : get all the absenceTypes.
     *
     * @param pageable the pagination information
     * @return the ResponseEntity with status 200 (OK) and the list of absenceTypes in body
     */
    @GetMapping("/absence-types")
    public ResponseEntity<List<AbsenceTypeDTO>> getAllAbsenceTypes(Pageable pageable) {
        log.debug("REST request to get a page of AbsenceTypes");
        Page<AbsenceTypeDTO> page = absenceTypeService.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/absence-types");
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * GET  /absence-types/:id : get the "id" absenceType.
     *
     * @param id the id of the absenceTypeDTO to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the absenceTypeDTO, or with status 404 (Not Found)
     */
    @GetMapping("/absence-types/{id}")
    public ResponseEntity<AbsenceTypeDTO> getAbsenceType(@PathVariable Long id) {
        log.debug("REST request to get AbsenceType : {}", id);
        Optional<AbsenceTypeDTO> absenceTypeDTO = absenceTypeService.findOne(id);
        return ResponseUtil.wrapOrNotFound(absenceTypeDTO);
    }

    /**
     * DELETE  /absence-types/:id : delete the "id" absenceType.
     *
     * @param id the id of the absenceTypeDTO to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/absence-types/{id}")
    public ResponseEntity<Void> deleteAbsenceType(@PathVariable Long id) {
        log.debug("REST request to delete AbsenceType : {}", id);
        absenceTypeService.delete(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
    }
}
