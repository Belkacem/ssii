package com.zsoft.repository.extensions;

import com.zsoft.domain.AbsenceValidator;
import com.zsoft.domain.Resource;
import com.zsoft.repository.AbsenceValidatorRepository;
import com.zsoft.security.AuthoritiesConstants;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

import javax.annotation.Nonnull;
import java.util.List;
import java.util.Optional;

/**
 * Spring Data  repository for the AbsenceValidator entity.
 */
@SuppressWarnings("all")
@Repository
@PreAuthorize("hasAuthority('" + AuthoritiesConstants.ADMIN + "')")
public interface AbsenceValidatorRepositoryExt extends AbsenceValidatorRepository {

    @Nonnull
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@absenceValidatorSecurity.checkReadCollection(returnObject)")
    List<AbsenceValidator> findAllByResourcesInAndActiveIsTrue(List<Resource> resources);

    @Nonnull
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@absenceValidatorSecurity.checkReadPage(returnObject)")
    Page<AbsenceValidator> findAllByCompanyId(Long companyId, Pageable pageable);

    @Nonnull
    @PreAuthorize("permitAll()")
    Optional<AbsenceValidator> findByTicket(String ticket);

    @Modifying
    @PreAuthorize("isAuthenticated()")
    @Query(value = "UPDATE absence_validator " +
        "INNER JOIN zs_user user ON user.id = ?#{principal.userId} " +
        "SET absence_validator.user_id = user.id, absence_validator.fullname = CONCAT(user.first_name, ' ', user.last_name), absence_validator.ticket = '' " +
        "WHERE absence_validator.ticket = :ticket", nativeQuery = true)
    void updateUserIdByTicket(@Param("ticket") String ticket);

    @Nonnull
    @PreAuthorize("isAuthenticated()")
    @Query("SELECT absence_validator FROM AbsenceValidator absence_validator " +
        "LEFT join User user ON user.login = ?#{principal.username} " +
        "WHERE absence_validator.ticket IS NOT NULL AND absence_validator.email=user.email AND absence_validator.user IS NULL ")
    Optional<AbsenceValidator> checkNewTickets();
}
