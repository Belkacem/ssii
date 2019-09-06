package com.zsoft.repository.extensions;

import com.zsoft.domain.Constant;
import com.zsoft.repository.ConstantRepository;
import com.zsoft.security.AuthoritiesConstants;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

import javax.annotation.Nonnull;
import java.util.Optional;

/**
 * Spring Data repository for the Constant entity.
 */
@SuppressWarnings("unused")
@Repository
@PreAuthorize("hasAnyAuthority('" + AuthoritiesConstants.ADMIN + "')")
public interface ConstantRepositoryExt extends ConstantRepository {

    @Nonnull
    @PreAuthorize("isAuthenticated()")
    @PostAuthorize("@constantSecurity.checkReadOptional(returnObject)")
    Optional<Constant> findByKey(String key);

}
