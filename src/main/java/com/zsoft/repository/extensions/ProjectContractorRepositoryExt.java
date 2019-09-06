package com.zsoft.repository.extensions;

import com.zsoft.domain.Project;
import com.zsoft.domain.ProjectContractor;
import com.zsoft.repository.ProjectContractorRepository;
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

@SuppressWarnings("all")
@Repository
@PreAuthorize("hasAnyAuthority('" + AuthoritiesConstants.ADMIN + "')")
public interface ProjectContractorRepositoryExt extends ProjectContractorRepository {

    @Nonnull
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@projectContractorSecurity.checkReadCollection(returnObject)")
    List<ProjectContractor> findAllByProject(Project project);

    @Nonnull
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@projectContractorSecurity.checkReadPage(returnObject)")
    Page<ProjectContractor> findAllByProject_IdIn(List<Long> projectId, Pageable pageable);

    @PreAuthorize("permitAll()")
    Optional<ProjectContractor> findByTicket(String ticket);

    @PreAuthorize("isAuthenticated()")
    @Query("select project_contractor from ProjectContractor project_contractor " +
        "where project_contractor.user.login = ?#{principal.username} " +
        "and project_contractor.project.company.id = :companyId")
    List<ProjectContractor> findByUserIsCurrentUserAndCompanyId(@Param("companyId") Long companyId);

    @PreAuthorize("isAuthenticated()")
    @Query("select project_contractor from ProjectContractor project_contractor " +
        "where project_contractor.user.login = ?#{principal.username} " +
        "and project_contractor.project.id = :projectId")
    List<ProjectContractor> findByUserIsCurrentUserAndProjectId(@Param("projectId") Long projectId);

    @Modifying
    @PreAuthorize("isAuthenticated()")
    @Query(value = "UPDATE project_contractor " +
        "INNER JOIN zs_user user ON user.id = ?#{principal.userId} " +
        "SET project_contractor.user_id = user.id, project_contractor.fullname = CONCAT(user.first_name, ' ', user.last_name), project_contractor.ticket = '' " +
        "WHERE project_contractor.ticket = :ticket", nativeQuery = true)
    void updateUserIdByTicket(@Param("ticket") String ticket);

    @Nonnull
    @PreAuthorize("isAuthenticated()")
    @Query("SELECT project_contractor FROM ProjectContractor project_contractor " +
        "LEFT join User user ON user.login = ?#{principal.username} " +
        "WHERE project_contractor.ticket IS NOT NULL AND project_contractor.email=user.email AND project_contractor.user IS NULL ")
    Optional<ProjectContractor> checkNewTickets();
}
