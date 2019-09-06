package com.zsoft.repository;

import com.zsoft.domain.ResourceContract;
import com.zsoft.security.AuthoritiesConstants;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.parameters.P;
import org.springframework.stereotype.Repository;

import javax.annotation.Nonnull;
import java.util.List;
import java.util.Optional;


/**
 * Spring Data  repository for the ResourceContract entity.
 */
@SuppressWarnings("unused")
@Repository
@PreAuthorize("hasAnyAuthority('" + AuthoritiesConstants.ADMIN + "')")
public interface ResourceContractRepository extends JpaRepository<ResourceContract, Long>, JpaSpecificationExecutor<ResourceContract> {

    @Nonnull
    @Override
    @PreAuthorize("@resourceContractSecurity.checkWrite(#entity)")
    <S extends ResourceContract> S save(@Nonnull  @P("entity") S entity);

    @Override
    @PreAuthorize("@resourceContractSecurity.checkDeleteId(#id)")
    void deleteById(@Nonnull @P("id") Long id);

    @Nonnull
    @Override
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@resourceContractSecurity.checkReadCollection(returnObject)")
    List<ResourceContract> findAll();

    @Nonnull
    @Override
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@resourceContractSecurity.checkReadPage(returnObject)")
    Page<ResourceContract> findAll(@Nonnull Pageable pageable);

    @Nonnull
    @Override
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@resourceContractSecurity.checkReadOptional(returnObject)")
    Optional<ResourceContract> findById(@Nonnull Long id);
}
