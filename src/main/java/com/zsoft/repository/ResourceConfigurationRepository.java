package com.zsoft.repository;

import com.zsoft.domain.ResourceConfiguration;
import com.zsoft.security.AuthoritiesConstants;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.parameters.P;
import org.springframework.stereotype.Repository;

import javax.annotation.Nonnull;
import java.util.Optional;

/**
 * Spring Data  repository for the ResourceConfiguration entity.
 */
@SuppressWarnings("unused")
@Repository
@PreAuthorize("hasAnyAuthority('" + AuthoritiesConstants.ADMIN + "')")
public interface ResourceConfigurationRepository extends JpaRepository<ResourceConfiguration, Long> {

    @Nonnull
    @Override
    @PreAuthorize("@resourceConfigurationSecurity.checkWrite(#entity)")
    <S extends ResourceConfiguration> S save(@Nonnull @P("entity") S entity);

    @Override
    @PreAuthorize("@resourceConfigurationSecurity.checkDelete(#entity)")
    void delete(@Nonnull @P("entity") ResourceConfiguration entity);

    @Nonnull
    @Override
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@resourceConfigurationSecurity.checkReadOptional(returnObject)")
    Optional<ResourceConfiguration> findById(@Nonnull Long id);
}
