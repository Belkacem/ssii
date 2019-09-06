package com.zsoft.repository;

import com.zsoft.domain.PersistedConfiguration;
import com.zsoft.security.AuthoritiesConstants;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.parameters.P;
import org.springframework.stereotype.Repository;

import javax.annotation.Nonnull;
import java.util.List;

/**
 * Spring Data  repository for the PersistedConfiguration entity.
 */
@SuppressWarnings("unused")
@Repository
@PreAuthorize("hasAnyAuthority('" + AuthoritiesConstants.ADMIN + "')")
public interface PersistedConfigurationRepository extends JpaRepository<PersistedConfiguration, Long>, JpaSpecificationExecutor<PersistedConfiguration> {

    @PreAuthorize("isAuthenticated()")
    @Query("select persisted_configuration from PersistedConfiguration persisted_configuration where persisted_configuration.user.login = ?#{principal.username}")
    List<PersistedConfiguration> findByUserIsCurrentUser();

    @Nonnull
    @Override
    @PreAuthorize("@persistedConfigurationSecurity.checkWrite(#entity)")
    <S extends PersistedConfiguration> S save(@Nonnull  @P("entity") S entity);

    @Override
    @PreAuthorize("@persistedConfigurationSecurity.checkDeleteId(#id)")
    void deleteById(@Nonnull @P("id") Long id);

    @PreAuthorize("isAuthenticated()")
    @Modifying
    @Query("delete from PersistedConfiguration persisted_configuration " +
          "where persisted_configuration.user.id = ?#{principal.userId} " +
          "and persisted_configuration.key = :key")
    void deleteByUserIsCurrentAndKey(@Param("key") String key);
}
