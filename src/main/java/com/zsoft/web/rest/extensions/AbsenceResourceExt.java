package com.zsoft.web.rest.extensions;

import com.zsoft.domain.enumeration.ValidationStatus;
import com.zsoft.service.dto.AbsenceDTO;
import com.zsoft.service.extensions.AbsenceServiceExt;
import com.zsoft.web.rest.errors.BadRequestAlertException;
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
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * REST controller for managing Absence.
 */
@RestController
@RequestMapping("/api")
public class AbsenceResourceExt {
    private final Logger log = LoggerFactory.getLogger(AbsenceResourceExt.class);

    private static final String ENTITY_NAME = "Absence";

    private final AbsenceServiceExt absenceServiceExt;

    public AbsenceResourceExt(AbsenceServiceExt absenceServiceExt) {
        this.absenceServiceExt = absenceServiceExt;
    }

    /**
     * POST  /absences : Create a new absence.
     *
     * @param absenceDTO the absenceDTO to create
     * @return the ResponseEntity with status 201 (Created) and with body the new absenceDTO, or with status 400 (Bad Request) if the absence has already an ID
     */
    @PostMapping(value = "/absences", params = {"override"})
    public ResponseEntity<AbsenceDTO> createAbsence(@Valid @RequestBody AbsenceDTO absenceDTO) {
        log.debug("REST request to save Absence : {}", absenceDTO);
        if (absenceDTO.getId() != null) {
            throw new BadRequestAlertException("A new absence cannot already have an ID", ENTITY_NAME, "idexists");
        }
        Optional<AbsenceDTO> result = absenceServiceExt.create(absenceDTO);
        return ResponseUtil.wrapOrNotFound(result);
    }

    /**
     * PUT  /absences : Updates an existing absence.
     *
     * @param absenceDTO the absenceDTO to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated absenceDTO,
     * or with status 400 (Bad Request) if the absenceDTO is not valid,
     * or with status 500 (Internal Server Error) if the absenceDTO couldn't be updated
     */
    @PutMapping(value = "/absences", params = {"override"})
    public ResponseEntity<AbsenceDTO> updateAbsence(@Valid @RequestBody AbsenceDTO absenceDTO) {
        log.debug("REST request to update Absence : {}", absenceDTO);
        if (absenceDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        // Get Absence saved on database
        AbsenceDTO oldAbsence = absenceServiceExt.findOne(absenceDTO.getId())
            .orElseThrow(() -> new BadRequestAlertException("Invalid id", "absence", "idnull"));
        // Save the new updates
        Optional<AbsenceDTO> result = absenceServiceExt.update(absenceDTO);
        // Send notification emails
        result.ifPresent(newAbsenceDTO -> {
            if (oldAbsence.getValidationStatus() != newAbsenceDTO.getValidationStatus()) {
                if (newAbsenceDTO.getValidationStatus() == ValidationStatus.APPROVED) {
                    absenceServiceExt.sendApprovedNotification(newAbsenceDTO);
                    absenceServiceExt.addAdjustment(newAbsenceDTO.getId());
                } else {
                    absenceServiceExt.sendRejectedNotification(newAbsenceDTO);
                }
            }
            if (oldAbsence.getSubmissionDate() == null && newAbsenceDTO.getSubmissionDate() != null) {
                absenceServiceExt.sendSubmissionNotification(newAbsenceDTO);
            }
        });
        return ResponseUtil.wrapOrNotFound(result);
    }

    /**
     * DELETE  /absences/:id : delete the "id" absence.
     *
     * @param id the id of the absenceDTO to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping(value = "/absences/{id}", params = {"override"})
    public ResponseEntity<Void> deleteAbsence(@PathVariable Long id) {
        log.debug("REST request to delete Absence : {}", id);
        Optional<AbsenceDTO> absenceDTO = absenceServiceExt.findOne(id);
        if (!absenceDTO.isPresent()) {
            throw new BadRequestAlertException("Can't delete absence not exist", ENTITY_NAME, "notfound");
        } else {
            if (absenceDTO.get().getSubmissionDate() != null) {
                throw new BadRequestAlertException("Can't delete absence already submitted", ENTITY_NAME, "alreadysubmitted");
            }
        }
        absenceServiceExt.delete(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
    }

    /**
     * GET  /absences : get all the absences.
     *
     * @param pageable                the pagination information
     * @param submissionDateSpecified is the submissionDate is specified
     * @param validationStatusIn      List of validation Status
     * @param resourceId              the id of resource
     * @return the ResponseEntity with status 200 (OK) and the list of absences in body
     */
    @GetMapping(value = "/absences", params = {"override", "submissionDateSpecified", "resourceId", "validationStatusIn"})
    public ResponseEntity<List<AbsenceDTO>> getAllAbsences(
        Pageable pageable,
        @RequestParam("submissionDateSpecified") Boolean submissionDateSpecified,
        @RequestParam("resourceId") Long resourceId,
        @RequestParam("validationStatusIn") List<ValidationStatus> validationStatusIn
    ) {
        log.debug("REST request to get Absences by submissionDate.specified: {}, validationStatus.in: {}, resourceId: {}", submissionDateSpecified, validationStatusIn, resourceId);
        Page<AbsenceDTO> page = absenceServiceExt.findAll(pageable, resourceId, submissionDateSpecified, validationStatusIn);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/absences");
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * GET  /absences : get all the absences.
     *
     * @param pageable           the pagination information
     * @param validationStatusIn List of validation Status
     * @param companyId          the id of resources company
     * @param validatorIdIn      List of validators
     * @return the ResponseEntity with status 200 (OK) and the list of absences in body
     */
    @GetMapping(value = "/absences", params = {"override", "validationStatusIn", "companyId", "validatorIdIn"})
    public ResponseEntity<List<AbsenceDTO>> getAllAbsences(
        Pageable pageable,
        @RequestParam("validationStatusIn") List<ValidationStatus> validationStatusIn,
        @RequestParam("companyId") Long companyId,
        @RequestParam("validatorIdIn") List<Long> validatorIdIn
    ) {
        log.debug("REST request to get Absences by validationStatus.in: {}, companyId: {}, validatorId.in: {}", validationStatusIn, companyId, validatorIdIn);
        Page<AbsenceDTO> page = absenceServiceExt.findAll(pageable, validationStatusIn, validatorIdIn, companyId);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/absences");
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * GET  /absences : get all the absences.
     *
     * @param pageable           the pagination information
     * @param validationStatusIn List of validation Status
     * @param companyId          the id of resources company
     * @return the ResponseEntity with status 200 (OK) and the list of absences in body
     */
    @GetMapping(value = "/absences", params = {"override", "validationStatusIn", "companyId"})
    public ResponseEntity<List<AbsenceDTO>> getAllAbsences(
        Pageable pageable,
        @RequestParam("validationStatusIn") List<ValidationStatus> validationStatusIn,
        @RequestParam("companyId") Long companyId
    ) {
        log.debug("REST request to get Absences by validationStatus.in: {}, companyId: {}", validationStatusIn, companyId);
        Page<AbsenceDTO> page = absenceServiceExt.findAll(pageable, validationStatusIn, companyId);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/absences");
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * GET  /absences : get all the absences.
     *
     * @param pageable           the pagination information
     * @param validationStatusIn List of validation Status
     * @param resourceId         the id of resource
     * @return the ResponseEntity with status 200 (OK) and the list of absences in body
     */
    @GetMapping(value = "/absences", params = {"override", "resourceId", "validationStatusIn"})
    public ResponseEntity<List<AbsenceDTO>> getAllAbsences(
        Pageable pageable,
        @RequestParam("resourceId") Long resourceId,
        @RequestParam("validationStatusIn") List<ValidationStatus> validationStatusIn
    ) {
        log.debug("REST request to get Absences by validationStatus.in: {}, resourceId: {}", validationStatusIn, resourceId);
        Page<AbsenceDTO> page = absenceServiceExt.findAll(pageable, resourceId, validationStatusIn);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/absences");
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * GET  /absences : get all the absences by month and resources.
     *
     * @param pageable  the pagination information
     * @param resourceIds the ids list of resources
     * @param month     the month of absence
     * @return the ResponseEntity with status 200 (OK) and the list of absences in body
     */
    @GetMapping(value = "/absences", params = {"override", "resourceIdIn", "month"})
    public ResponseEntity<List<AbsenceDTO>> getAllAbsencesByMonth(
        Pageable pageable,
        @RequestParam("resourceIdIn") List<Long> resourceIds,
        @RequestParam("month") LocalDate month
    ) {
        log.debug("REST request to get Absences resourceIds: {}, in {}", resourceIds, month);
        Page<AbsenceDTO> page = absenceServiceExt.findAll(pageable, resourceIds, month);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/absences");
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }
}
