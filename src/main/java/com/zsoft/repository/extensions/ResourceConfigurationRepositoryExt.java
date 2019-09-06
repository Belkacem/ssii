package com.zsoft.repository.extensions;

import com.zsoft.domain.ResourceConfiguration;
import com.zsoft.repository.ResourceConfigurationRepository;
import com.zsoft.security.AuthoritiesConstants;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

import javax.annotation.Nonnull;
import java.util.List;
import java.util.Optional;

/**
 * Spring Data  repository for the Resource entity.
 */
@SuppressWarnings("all")
@Repository
@PreAuthorize("hasAnyAuthority('" + AuthoritiesConstants.ADMIN + "')")
public interface ResourceConfigurationRepositoryExt extends ResourceConfigurationRepository {

    @Nonnull
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@resourceConfigurationSecurity.checkReadOptional(returnObject)")
    Optional<ResourceConfiguration> findByResourceId(@Nonnull Long resourceId);

    @Nonnull
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@resourceConfigurationSecurity.checkReadCollection(returnObject)")
    List<ResourceConfiguration> findAllByResource_IdIn(List<Long> resourceIds);
}
