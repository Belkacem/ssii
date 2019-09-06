package com.zsoft.repository.extensions;

import com.zsoft.domain.ProjectValidator;
import com.zsoft.repository.ProjectValidatorRepository;
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
 * Spring Data  repository for the ProjectValidator entity.
 */
@SuppressWarnings("all")
@Repository
@PreAuthorize("hasAnyAuthority('" + AuthoritiesConstants.ADMIN + "')")
public interface ProjectValidatorRepositoryExt extends ProjectValidatorRepository {

    @Nonnull
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@projectValidatorSecurity.checkReadCollection(returnObject)")
    List<ProjectValidator> findAllByProject_Id(Long projectId);

    @PreAuthorize("permitAll()")
    Optional<ProjectValidator> findByTicket(String ticket);

    @Nonnull
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@projectValidatorSecurity.checkReadPage(returnObject)")
    Page<ProjectValidator> findAllByProject_IdIn(List<Long> projectIds, Pageable pageable);

    @Nonnull
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@projectValidatorSecurity.checkReadPage(returnObject)")
    Page<ProjectValidator> findAllByIdIn(List<Long> ids, Pageable pageable);

    @Modifying
    @PreAuthorize("isAuthenticated()")
    @Query(value = "UPDATE project_validator " +
        "INNER JOIN zs_user user ON user.id = ?#{principal.userId} " +
        "SET project_validator.user_id = user.id, project_validator.fullname = CONCAT(user.first_name, ' ', user.last_name), project_validator.ticket = '' " +
        "WHERE project_validator.ticket = :ticket", nativeQuery = true)
    void updateUserIdByTicket(@Param("ticket") String ticket);

    @Nonnull
    @PreAuthorize("isAuthenticated()")
    @Query("SELECT project_validator FROM ProjectValidator project_validator " +
        "LEFT join User user ON user.login = ?#{principal.username} " +
        "WHERE project_validator.ticket IS NOT NULL AND project_validator.email=user.email AND project_validator.user IS NULL ")
    Optional<ProjectValidator> checkNewTickets();
}
