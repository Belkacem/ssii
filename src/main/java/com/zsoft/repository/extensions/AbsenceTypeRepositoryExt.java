package com.zsoft.repository.extensions;

import com.zsoft.domain.AbsenceType;
import com.zsoft.repository.AbsenceTypeRepository;
import com.zsoft.security.AuthoritiesConstants;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.parameters.P;
import org.springframework.stereotype.Repository;

import javax.annotation.Nonnull;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

/**
 * Spring Data  repository for the AbsenceType entity.
 */
@SuppressWarnings("unused")
@Repository
@PreAuthorize("hasAuthority('"+ AuthoritiesConstants.ADMIN +"')")
public interface AbsenceTypeRepositoryExt extends AbsenceTypeRepository {

    @Nonnull
    @PreAuthorize("isAuthenticated()")
    Collection<AbsenceType> findAllByHasBalanceIsTrue();

    @Nonnull
    @PreAuthorize("isAuthenticated()")
    Optional<AbsenceType> findByCode(int code);

    @PreAuthorize("@absenceTypeSecurity.checkDeleteIds(#ids)")
    void deleteByIdIn(@Nonnull @P("ids") List<Long> ids);
}
