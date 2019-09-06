package com.zsoft.service.extensions;

import com.zsoft.repository.extensions.AbsenceJustificationRepositoryExt;
import com.zsoft.service.dto.AbsenceJustificationDTO;
import com.zsoft.service.mapper.AbsenceJustificationMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service Implementation for managing AbsenceJustification.
 */
@Service
@Transactional
public class AbsenceJustificationServiceExt {

    private final Logger log = LoggerFactory.getLogger(AbsenceJustificationServiceExt.class);

    private final AbsenceJustificationRepositoryExt absenceJustificationRepositoryExt;

    private final AbsenceJustificationMapper absenceJustificationMapper;

    public AbsenceJustificationServiceExt(
        AbsenceJustificationRepositoryExt absenceJustificationRepositoryExt,
        AbsenceJustificationMapper absenceJustificationMapper
    ) {
        this.absenceJustificationRepositoryExt = absenceJustificationRepositoryExt;
        this.absenceJustificationMapper = absenceJustificationMapper;
    }

    /**
     * Get all the absenceJustifications by absenceId.
     *
     * @param absenceId the id of absence
     * @return the list of entities
     */
    @Transactional(readOnly = true)
    public List<AbsenceJustificationDTO> findAllByAbsenceId(Long absenceId) {
        log.debug("Request to get all AbsenceJustifications");
        return absenceJustificationRepositoryExt.findAllByAbsence_Id(absenceId)
            .stream()
            .map(absenceJustificationMapper::toDto)
            .collect(Collectors.toList());
    }
}
