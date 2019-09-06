package com.zsoft.repository.extensions;

import com.zsoft.domain.PersistedConfiguration;
import com.zsoft.repository.PersistedConfigurationRepository;
import com.zsoft.security.AuthoritiesConstants;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Spring Data  repository for the PersistedConfiguration entity.
 */
@SuppressWarnings("unused")
@Repository
@PreAuthorize("hasAnyAuthority('" + AuthoritiesConstants.ADMIN + "')")
public interface PersistedConfigurationRepositoryExt extends PersistedConfigurationRepository {

    @PreAuthorize("isAuthenticated()")
    Optional<PersistedConfiguration> findByKey(String key);

    @PreAuthorize("isAuthenticated()")
    Page<PersistedConfiguration> findAllByUserId(Long userId, Pageable pageable);

    @PreAuthorize("isAuthenticated()")
    Page<PersistedConfiguration> findAllByKeyContains(String key, Pageable pageable);
}
