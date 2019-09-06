package com.zsoft.repository.extensions;

import com.zsoft.domain.Resource;
import com.zsoft.repository.ResourceRepository;
import com.zsoft.security.AuthoritiesConstants;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.parameters.P;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.Nonnull;
import java.util.List;
import java.util.Optional;

/**
 * Spring Data  repository for the Resource entity.
 */
@SuppressWarnings("all")
@Repository
@PreAuthorize("hasAnyAuthority('" + AuthoritiesConstants.ADMIN + "')")
public interface ResourceRepositoryExt extends ResourceRepository {

    @Nonnull
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@resourceSecurity.checkReadCollection(returnObject)")
    List<Resource> findAllByCompanyId(@Param("company_id") Long company_id);

    @Nonnull
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@resourceSecurity.checkReadCollection(returnObject)")
    @Query("SELECT resource FROM Resource resource " +
        "LEFT JOIN ProjectResource projectResource ON projectResource.resource.id=resource.id AND projectResource.project.id=:project_id " +
        "WHERE projectResource IS NOT NULL")
    List<Resource> findAllByProject(@Param("project_id") Long project_id);

    @Transactional
    @PreAuthorize("@resourceSecurity.checkDeleteIds(#ids)")
    void deleteByIdIn(@Nonnull @P("ids") List<Long> ids);

    @Nonnull
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@resourceSecurity.checkReadCollection(returnObject)")
    List<Resource> findAllByIdIn(List<Long> ids);

    @Nonnull
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@resourceSecurity.checkReadPage(returnObject)")
    Page<Resource> findAllByCompanyId(Pageable pageable, Long companyId);

    @Nonnull
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@resourceSecurity.checkReadPage(returnObject)")
    Page<Resource> findAllByIdIn(Pageable pageable, List<Long> ids);

    @PreAuthorize("permitAll()")
    @Query("SELECT resource FROM Resource resource " +
        "LEFT JOIN ResourceConfiguration conf ON conf.resource.id=resource.id WHERE resource.ticket=:ticket AND conf.active=1 ")
    Optional<Resource> findByTicket(@Param("ticket") String ticket);

    @Modifying
    @PreAuthorize("isAuthenticated()")
    @Query(value = "UPDATE resource " +
        "INNER JOIN zs_user user ON user.id = ?#{principal.userId} " +
        "SET resource.user_id = user.id, resource.first_name = user.first_name, resource.last_name = user.last_name, resource.ticket = '' " +
        "WHERE resource.ticket = :ticket", nativeQuery = true)
    void updateUserIdByTicket(@Param("ticket") String ticket);

    @Nonnull
    @PreAuthorize("@companySecurity.checkUpdateId(#company_id)")
    Optional<Resource> findOneByEmailIgnoreCaseAndCompanyId(@Nonnull String email, @Nonnull @P("company_id") Long companyId);

    @Nonnull
    @PreAuthorize("isAuthenticated()")
    @Query("SELECT resource FROM Resource resource " +
        "LEFT join User user ON user.login = ?#{principal.username} " +
        "WHERE resource.ticket IS NOT NULL AND resource.email=user.email AND resource.user IS NULL ")
    Optional<Resource> checkNewTickets();
}
