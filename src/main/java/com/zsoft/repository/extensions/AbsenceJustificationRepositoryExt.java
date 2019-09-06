package com.zsoft.repository.extensions;

import com.zsoft.domain.AbsenceJustification;
import com.zsoft.repository.AbsenceJustificationRepository;
import com.zsoft.security.AuthoritiesConstants;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

import javax.annotation.Nonnull;
import java.util.List;

@SuppressWarnings("unused")
@Repository
@PreAuthorize("hasAuthority('" + AuthoritiesConstants.ADMIN + "')")
public interface AbsenceJustificationRepositoryExt extends AbsenceJustificationRepository {
    @Nonnull
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@absenceJustificationSecurity.checkReadCollection(returnObject)")
    List<AbsenceJustification> findAllByAbsence_Id(Long absenceId);
}
