package com.zsoft.repository.extensions;

import com.zsoft.domain.ClientContact;
import com.zsoft.repository.ClientContactRepository;
import com.zsoft.security.AuthoritiesConstants;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

import javax.annotation.Nonnull;
import java.util.List;

/**
 * Spring Data  repository for the Client Contact entity.
 */
@SuppressWarnings("unused")
@Repository
@PreAuthorize("hasAnyAuthority('" + AuthoritiesConstants.ADMIN + "')")
public interface ClientContactRepositoryExt extends ClientContactRepository {

    @Nonnull
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@clientContactSecurity.checkReadPage(returnObject)")
    Page<ClientContact> findAllByClientIdIn(List<Long> clientIds, @Nonnull Pageable pageable);

    @Nonnull
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@clientContactSecurity.checkReadPage(returnObject)")
    Page<ClientContact> findAllByIdIn(List<Long> ids, @Nonnull Pageable pageable);

    @Nonnull
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@clientContactSecurity.checkReadCollection(returnObject)")
    List<ClientContact> findAllByClientId(Long clientId);
}
