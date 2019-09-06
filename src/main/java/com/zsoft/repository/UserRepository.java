package com.zsoft.repository;

import com.zsoft.domain.User;

import com.zsoft.security.AuthoritiesConstants;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

import javax.annotation.Nonnull;
import java.util.List;
import java.util.Optional;
import java.time.Instant;

/**
 * Spring Data JPA repository for the User entity.
 */
@Repository
@PreAuthorize("hasAuthority('" + AuthoritiesConstants.ADMIN + "')")
public interface UserRepository extends JpaRepository<User, Long> {

    String USERS_BY_LOGIN_CACHE = "usersByLogin";

    String USERS_BY_EMAIL_CACHE = "usersByEmail";

    @PreAuthorize("permitAll()")
    Optional<User> findOneByActivationKey(String activationKey);

    @PreAuthorize("hasAuthority('" + AuthoritiesConstants.SYSTEM + "')")
    List<User> findAllByActivatedIsFalseAndCreatedDateBefore(Instant dateTime);

    @PreAuthorize("permitAll()")
    Optional<User> findOneByResetKey(String resetKey);

    @PreAuthorize("permitAll()")
    Optional<User> findOneByEmailIgnoreCase(String email);

    @PreAuthorize("permitAll()")
    Optional<User> findOneByLogin(String login);

    @PreAuthorize("isAuthenticated()")
    @EntityGraph(attributePaths = "authorities")
    Optional<User> findOneWithAuthoritiesById(Long id);

    @PreAuthorize("permitAll()")
    @EntityGraph(attributePaths = "authorities")
    Optional<User> findOneWithAuthoritiesByLogin(String login);

    @PreAuthorize("permitAll()")
    @EntityGraph(attributePaths = "authorities")
    Optional<User> findOneWithAuthoritiesByEmail(String email);

    Page<User> findAllByLoginNot(Pageable pageable, String login);

    @Nonnull
    @Override
    @PreAuthorize("permitAll()")
    <S extends User> S save(@Nonnull S entity);
}
