package com.zsoft.repository.extensions;

import com.zsoft.domain.ResourceContract;
import com.zsoft.repository.ResourceContractRepository;
import com.zsoft.security.AuthoritiesConstants;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

import javax.annotation.Nonnull;

@SuppressWarnings("unused")
@Repository
@PreAuthorize("hasAnyAuthority('" + AuthoritiesConstants.ADMIN + "')")
public interface ResourceContractRepositoryExt extends ResourceContractRepository {

    @Nonnull
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@resourceContractSecurity.checkReadPage(returnObject)")
    Page<ResourceContract> findAllByResource_Id(Long resourceId, Pageable pageable);

    @Nonnull
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@resourceContractSecurity.checkReadPage(returnObject)")
    Page<ResourceContract> findAllByResource_CompanyId(Long resourceId, Pageable pageable);
}
