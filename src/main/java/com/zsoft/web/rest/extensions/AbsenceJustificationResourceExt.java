package com.zsoft.web.rest.extensions;

import com.zsoft.service.dto.AbsenceJustificationDTO;
import com.zsoft.service.extensions.AbsenceJustificationServiceExt;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * REST controller for managing AbsenceJustification.
 */
@RestController
@RequestMapping("/api")
public class AbsenceJustificationResourceExt {

    private final Logger log = LoggerFactory.getLogger(AbsenceJustificationResourceExt.class);

    private final AbsenceJustificationServiceExt absenceJustificationServiceExt;

    public AbsenceJustificationResourceExt(AbsenceJustificationServiceExt absenceJustificationServiceExt) {
        this.absenceJustificationServiceExt = absenceJustificationServiceExt;
    }

    /**
     * GET  /absence-justifications/:absence_id : get all the AbsenceJustificaiton by absenceId.
     *
     * @param absenceId the id of the Absence
     * @return the ResponseEntity with status 200 (OK) and the list of absenceJustificationDTOs in body
     */
    @GetMapping(value = "/absence-justifications/{absence_id}", params = {"override"})
    public ResponseEntity<List<AbsenceJustificationDTO>> getAllAbsenceJustifications(@PathVariable(value = "absence_id") Long absenceId) {
        log.debug("REST request to get a list of AbsenceJustification by absenceId: {}", absenceId);
        List<AbsenceJustificationDTO> absenceJustificationDTOS = absenceJustificationServiceExt.findAllByAbsenceId(absenceId);
        return ResponseEntity.ok().body(absenceJustificationDTOS);
    }
}
