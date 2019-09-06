package com.zsoft.repository.extensions;

import com.zsoft.domain.Client;
import com.zsoft.repository.ClientRepository;
import com.zsoft.security.AuthoritiesConstants;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

import javax.annotation.Nonnull;
import java.util.List;
import java.util.Optional;

/**
 * Spring Data  repository for the Client entity.
 */
@SuppressWarnings("unused")
@Repository
@PreAuthorize("hasAnyAuthority('" + AuthoritiesConstants.ADMIN + "')")
public interface ClientRepositoryExt extends ClientRepository {

    @Nonnull
    @PreAuthorize("isAuthenticated()")
    Optional<Client> findOneBySiren(String siren);

    @Nonnull
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@clientSecurity.checkReadPage(returnObject)")
    Page<Client> findAllByCompanyId(Long companyId, Pageable pageable);

    @Nonnull
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@clientSecurity.checkReadPage(returnObject)")
    Page<Client> findAllByIdIn(List<Long> ids, Pageable pageable);
}
