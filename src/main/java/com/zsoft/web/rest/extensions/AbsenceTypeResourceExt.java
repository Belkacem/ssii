package com.zsoft.web.rest.extensions;

import com.zsoft.service.extensions.AbsenceTypeServiceExt;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * REST controller for managing Absence Type.
 */
@RestController
@RequestMapping("/api")
public class AbsenceTypeResourceExt {
    private final Logger log = LoggerFactory.getLogger(AbsenceTypeResourceExt.class);

    private final AbsenceTypeServiceExt absenceTypeServiceExt;

    public AbsenceTypeResourceExt(AbsenceTypeServiceExt absenceTypeServiceExt) {
        this.absenceTypeServiceExt = absenceTypeServiceExt;
    }

    /**
     * DELETE  /absence-types : bulk delete absence types.
     *
     * @param ids the ids of the Absence Type to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/absence-types/bulk")
    public ResponseEntity<Void> bulkDelete(@RequestParam("ids") List<Long> ids) {
        log.debug("REST request to delete Absence Type : {}", ids);
        absenceTypeServiceExt.delete(ids);
        return ResponseEntity.ok().build();
    }
}
