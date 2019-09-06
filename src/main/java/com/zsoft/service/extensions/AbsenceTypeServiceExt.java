package com.zsoft.service.extensions;

import com.zsoft.repository.extensions.AbsenceTypeRepositoryExt;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@SuppressWarnings("ALL")
@Service
@Transactional
public class AbsenceTypeServiceExt {
    private final Logger log = LoggerFactory.getLogger(AbsenceTypeServiceExt.class);

    private final AbsenceTypeRepositoryExt absenceTypeRepositoryExt;

    public AbsenceTypeServiceExt(AbsenceTypeRepositoryExt absenceTypeRepositoryExt) {
        this.absenceTypeRepositoryExt = absenceTypeRepositoryExt;
    }

    /**
     * Delete by ids list (bulk).
     *
     * @param ids the ids list
     */
    public void delete(List<Long> ids) {
        log.debug("Request to delete Absence types : {}", ids);
        absenceTypeRepositoryExt.deleteByIdIn(ids);
    }
}
