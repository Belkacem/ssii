package com.zsoft.repository.extensions;

import com.zsoft.domain.Absence;
import com.zsoft.domain.enumeration.ValidationStatus;
import com.zsoft.repository.AbsenceRepository;
import com.zsoft.security.AuthoritiesConstants;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

import javax.annotation.Nonnull;
import java.time.LocalDate;
import java.util.List;

@SuppressWarnings("unused")
@Repository
@PreAuthorize("hasAuthority('" + AuthoritiesConstants.ADMIN + "')")
public interface AbsenceRepositoryExt extends AbsenceRepository {

    @Nonnull
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@absenceSecurity.checkReadPage(returnObject)")
    Page<Absence> findAllByResource_IdInAndValidationStatusInAndSubmissionDateIsNotNull(List<Long> resourceIds, List<ValidationStatus> validationStatus, Pageable pageable);

    @Nonnull
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@absenceSecurity.checkReadPage(returnObject)")
    Page<Absence> findAllByResource_IdInAndValidationStatusInAndValidator_IdInAndSubmissionDateIsNotNull(List<Long> resourceIds, List<ValidationStatus> validationStatus, List<Long> validatorId, Pageable pageable);

    @Nonnull
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@absenceSecurity.checkReadPage(returnObject)")
    Page<Absence> findAllByResource_IdAndValidationStatusIn(Long resourceId, List<ValidationStatus> validationStatus, Pageable pageable);

    @Nonnull
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@absenceSecurity.checkReadPage(returnObject)")
    Page<Absence> findAllByResource_IdAndValidationStatusInAndSubmissionDateIsNotNull(Long resourceId, List<ValidationStatus> validationStatus, Pageable pageable);

    @Nonnull
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@absenceSecurity.checkReadPage(returnObject)")
    @Query("SELECT absence FROM Absence absence " +
        "WHERE absence.resource.id IN (:resource_ids) " +
        "AND ((absence.start between :start_of_month AND :end_of_month) OR (absence.end between :start_of_month AND :end_of_month)) " +
         "AND absence.validationStatus <> 'REJECTED' ")
    Page<Absence> findAllByResourcesAndMonth(@Param("resource_ids") List<Long> resourceIds, @Param("start_of_month") LocalDate startOfMonth, @Param("end_of_month") LocalDate endOfMonth, Pageable pageable);
}
