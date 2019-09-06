package com.zsoft.service.extensions;

import com.zsoft.domain.*;
import com.zsoft.repository.AuthorityRepository;
import com.zsoft.repository.UserRepository;
import com.zsoft.repository.extensions.AbsenceValidatorRepositoryExt;
import com.zsoft.repository.extensions.ExpenseValidatorRepositoryExt;
import com.zsoft.repository.extensions.ProjectValidatorRepositoryExt;
import com.zsoft.repository.extensions.ResourceRepositoryExt;
import com.zsoft.repository.extensions.ProjectContractorRepositoryExt;
import com.zsoft.service.UserService;
import com.zsoft.service.dto.UserDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;
import java.util.Optional;
import java.util.Set;

import static java.util.Optional.empty;

/**
 * Service class for managing users.
 */
@SuppressWarnings("ALL")
@Service
@Transactional
public class UserServiceExt {

    private final Logger log = LoggerFactory.getLogger(UserServiceExt.class);

    private final UserService userService;

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    private final AuthorityRepository authorityRepository;

    private final AuthenticationManager authenticationManager;

    private final ResourceRepositoryExt resourceRepositoryExt;

    private final AbsenceValidatorRepositoryExt absenceValidatorRepositoryExt;

    private final ProjectValidatorRepositoryExt projectValidatorRepositoryExt;

    private final ExpenseValidatorRepositoryExt expenseValidatorRepositoryExt;

    private final ProjectContractorRepositoryExt projectContractorRepositoryExt;

    public UserServiceExt(
        UserService userService,
        UserRepository userRepository,
        PasswordEncoder passwordEncoder,
        AuthorityRepository authorityRepository,
        AuthenticationManager authenticationManager,
        ResourceRepositoryExt resourceRepositoryExt,
        AbsenceValidatorRepositoryExt absenceValidatorRepositoryExt,
        ProjectValidatorRepositoryExt projectValidatorRepositoryExt,
        ExpenseValidatorRepositoryExt expenseValidatorRepositoryExt,
        ProjectContractorRepositoryExt projectContractorRepositoryExt
    ) {
        this.userService = userService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authorityRepository = authorityRepository;
        this.authenticationManager = authenticationManager;
        this.resourceRepositoryExt = resourceRepositoryExt;
        this.absenceValidatorRepositoryExt = absenceValidatorRepositoryExt;
        this.projectValidatorRepositoryExt = projectValidatorRepositoryExt;
        this.expenseValidatorRepositoryExt = expenseValidatorRepositoryExt;
        this.projectContractorRepositoryExt = projectContractorRepositoryExt;
    }

    public User signupUser(UserDTO userDTO, String password, String ticket, String ticketType) {
        User newUser = userService.registerUser(userDTO, password);
        Optional<String> result;
        switch (ticketType) {
            case "project-validator-ticket":
                result = this.projectValidatorRepositoryExt.findByTicket(ticket)
                    .map(ProjectValidator::getEmail);
                break;
            case "absence-validator-ticket":
                result = this.absenceValidatorRepositoryExt.findByTicket(ticket)
                    .map(AbsenceValidator::getEmail);
                break;
            case "resource-ticket":
                result = this.resourceRepositoryExt.findByTicket(ticket)
                    .map(Resource::getEmail);
                break;
            case "expense-validator-ticket":
                result = this.expenseValidatorRepositoryExt.findByTicket(ticket)
                    .map(ExpenseValidator::getEmail);
                break;
            case "project-contractor-ticket":
                result = this.projectContractorRepositoryExt.findByTicket(ticket)
                    .map(ProjectContractor::getEmail);
                break;
            default:
                result = empty();
        }
        return result.filter(newUser.getEmail()::equalsIgnoreCase)
            .flatMap(e -> userService.activateRegistration(newUser.getActivationKey()))
            .orElse(newUser);
    }

    /**
     * Update basic information (first name, last name, activated) for the current user.
     *
     * @param userId    the id of user to update
     * @param firstName first name of user
     * @param lastName  last name of user
     * @param activated activation of user
     * @return updated user
     */
    public Optional<UserDTO> updateUser(Long userId, String firstName, String lastName, Boolean activated) {
        return userRepository.findById(userId)
            .map(user -> {
                user.setFirstName(firstName);
                user.setLastName(lastName);
                user.setActivated(activated);
                log.debug("Changed Information for User: {}", user);
                return user;
            })
            .map(UserDTO::new);
    }

    public Optional<User> getUserWithAuthorities(Long id) {
        return userRepository.findOneWithAuthoritiesById(id);
    }

    public Optional<User> findOneByEmailIgnoreCase(String email) {
        return userRepository.findOneByEmailIgnoreCase(email);
    }

    public boolean checkLogin(String email, String password) {
        return userRepository
            .findOneByEmailIgnoreCase(email)
            .map(user -> {
                UsernamePasswordAuthenticationToken authenticationToken =
                    new UsernamePasswordAuthenticationToken(user.getLogin(), password);
                Authentication authentication = authenticationManager.authenticate(authenticationToken);
                return authentication.isAuthenticated();
            })
            .orElse(false);
    }

    /**
     * Add Authority to user.
     *
     * @param userId    the id of user to update
     * @param authority authority name
     * @return updated user
     */
    public Optional<UserDTO> addAuthority(Long userId, String authority) {
        return userRepository.findOneWithAuthoritiesById(userId)
            .map(user -> {
                Set<Authority> authorities = user.getAuthorities();
                if (authorities.stream().noneMatch(auth -> auth.getName().equals(authority))) {
                    return authorityRepository.findAll()
                        .stream()
                        .filter(auth -> auth.getName().equals(authority))
                        .findFirst()
                        .map(auth -> {
                            authorities.add(auth);
                            return authorities;
                        })
                        .map(userAuthorities -> {
                            user.setAuthorities(userAuthorities);
                            log.debug("Changed Information for User: {}", user);
                            return userRepository.save(user);
                        })
                        .get();

                }
                return user;
            })
            .map(UserDTO::new);
    }
}
