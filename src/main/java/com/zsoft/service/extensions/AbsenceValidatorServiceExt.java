package com.zsoft.service.extensions;

import com.zsoft.domain.AbsenceValidator;
import com.zsoft.domain.Resource;
import com.zsoft.repository.extensions.AbsenceValidatorRepositoryExt;
import com.zsoft.service.UserService;
import com.zsoft.service.dto.AbsenceValidatorDTO;
import com.zsoft.service.mapper.AbsenceValidatorMapper;
import com.zsoft.service.security.UserSecurityUtils;
import com.zsoft.web.rest.errors.BadRequestAlertException;
import org.apache.commons.lang3.RandomStringUtils;
import org.hibernate.exception.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.Set;

/**
 * Service Implementation for managing AbsenceValidator.
 */
@Service
@Transactional
public class AbsenceValidatorServiceExt {

    private final Logger log = LoggerFactory.getLogger(AbsenceValidatorServiceExt.class);

    private final AbsenceValidatorRepositoryExt absenceValidatorRepositoryExt;

    private final AbsenceValidatorMapper absenceValidatorMapper;

    private final UserService userService;

    private final CompanyServiceExt companyServiceExt;

    private final MailServiceExt mailServiceExt;

    public AbsenceValidatorServiceExt(
        AbsenceValidatorRepositoryExt absenceValidatorRepositoryExt,
        AbsenceValidatorMapper absenceValidatorMapper,
        UserService userService,
        CompanyServiceExt companyServiceExt,
        MailServiceExt mailServiceExt
    ) {
        this.absenceValidatorRepositoryExt = absenceValidatorRepositoryExt;
        this.absenceValidatorMapper = absenceValidatorMapper;
        this.userService = userService;
        this.companyServiceExt = companyServiceExt;
        this.mailServiceExt = mailServiceExt;
    }

    /**
     * Save a absenceValidator.
     *
     * @param absenceValidatorDTO the entity to save
     * @return the persisted entity
     */
    public AbsenceValidatorDTO create(AbsenceValidatorDTO absenceValidatorDTO) {
        log.debug("Request to save Absence Validator : {}", absenceValidatorDTO);
        if (absenceValidatorDTO.getUserId() == null) {
            absenceValidatorDTO.setTicket(RandomStringUtils.randomNumeric(32));
        }
        absenceValidatorDTO = Optional.ofNullable(absenceValidatorDTO)
            .map(absenceValidatorMapper::toEntity)
            .map(absenceValidatorRepositoryExt::save)
            .map(absenceValidatorMapper::toDto)
            .orElseThrow(() -> new NullPointerException("AbsenceValidatorDTO is null for method create."));
        if (absenceValidatorDTO.getUserId() == null) {
            sendWelcomeEmail(absenceValidatorDTO.getId());
        }
        return absenceValidatorDTO;
    }

    /**
     * Update a absenceValidator.
     *
     * @param absenceValidatorDTO the entity to update
     * @return the persisted entity
     */
    public AbsenceValidatorDTO update(AbsenceValidatorDTO absenceValidatorDTO) {
        log.debug("Request to update Absence Validator : {}", absenceValidatorDTO);
        return Optional.ofNullable(absenceValidatorDTO)
            .map(absenceValidatorMapper::toEntity)
            .map(absenceValidatorRepositoryExt::save)
            .map(absenceValidatorMapper::toDto)
            .orElseThrow(() -> new NullPointerException("AbsenceValidatorDTO is null for method update."));
    }

    /**
     * Get current absence validator by resource id
     *
     * @param companyId the id of company
     * @return Absence Validator
     */
    public Optional<AbsenceValidatorDTO> getCurrentByCompany(Long companyId) {
        AbsenceValidatorDTO validatorDTO = absenceValidatorRepositoryExt.findByUserIsCurrentUserAndCompany(companyId)
            .stream()
            .findFirst()
            .map(absenceValidatorMapper::toDto)
            .orElseGet(() ->
                UserSecurityUtils.isCurrentUserCompanyOwner() ?
                    userService.getUserWithAuthorities()
                        .map(user -> {
                            AbsenceValidatorDTO newValidatorDTO = new AbsenceValidatorDTO();
                            newValidatorDTO.setActive(true);
                            newValidatorDTO.setEmail(user.getEmail());
                            newValidatorDTO.setUserId(user.getId());
                            newValidatorDTO.setFullname(user.getFirstName() + " " + user.getLastName());
                            newValidatorDTO.setCompanyId(companyId);
                            return newValidatorDTO;
                        })
                        .map(this::create)
                        .get()
                    :
                    null
            );
        return Optional.ofNullable(validatorDTO);
    }

    public void appendToCurrent(Resource resource) {
        getCurrentByCompany(resource.getCompany().getId())
            .map(absenceValidatorMapper::toEntity)
            .map(validator -> {
                Set<Resource> resources = validator.getResources();
                resources.add(resource);
                return validator;
            })
            .map(absenceValidatorRepositoryExt::save);
    }

    public void removeFromCurrent(Resource resource) {
        getCurrentByCompany(resource.getCompany().getId())
            .map(absenceValidatorMapper::toEntity)
            .map(validator -> {
                Set<Resource> resources = validator.getResources();
                resources.remove(resource);
                return validator;
            })
            .map(absenceValidatorRepositoryExt::save);
    }

    /**
     * Return a {@link Page} of {@link AbsenceValidatorDTO}
     *
     * @param page The page, which should be returned.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public Page<AbsenceValidatorDTO> findAll(Pageable page) {
        log.debug("find by page: {}", page);
        return companyServiceExt.getCurrentCompanyId()
            .map(currentCompanyId -> absenceValidatorRepositoryExt
                .findAllByCompanyId(currentCompanyId, page)
                .map(absenceValidatorMapper::toDto)
            )
            .orElse(Page.empty());
    }

    /**
     * Get one absenceValidatorDTO by ticket.
     *
     * @param ticket the ticket of the absence Validator DTO
     * @return the absence Validator DTO
     */
    @Transactional(readOnly = true)
    public Optional<AbsenceValidatorDTO> findOneByTicket(String ticket) {
        log.debug("Request to get Absence Validator by ticket : {}", ticket);
        return absenceValidatorRepositoryExt
            .findByTicket(ticket)
            .filter(AbsenceValidator::isActive)
            .map(absenceValidatorMapper::toDto);
    }

    /**
     * Assign an absence validator to current user account by ticket.
     *
     * @param ticket the ticket of the project Validator
     */
    public void assignToAccount(String ticket) throws ConstraintViolationException {
        log.debug("Request to assign absence validator to current account by ticket : {}", ticket);
        absenceValidatorRepositoryExt.updateUserIdByTicket(ticket);
    }

    /**
     * Send welcome notification email to absence validator.
     *
     * @param absenceValidatorId the id of absence validator
     */
    private void sendWelcomeEmail(Long absenceValidatorId) {
        log.debug("Request to Send welcome notification email to Absence Validator : {}", absenceValidatorId);
        absenceValidatorRepositoryExt
            .findById(absenceValidatorId)
            .ifPresent(validator ->
                companyServiceExt
                    .findOne(validator.getCompany().getId())
                    .ifPresent(company -> mailServiceExt.sendAbsenceValidatorWelcomeEmail(company, validator))
            );
    }

    /**
     * Check for new absence validator ticket.
     * @return AbsenceValidatorDTO or null
     */
    public Optional<AbsenceValidatorDTO> checkNewTickets() {
        log.debug("REST request to check for new Absence Validator ticket");
        return absenceValidatorRepositoryExt.checkNewTickets().map(absenceValidatorMapper::toDto);
    }

    /**
     * resend a new invitation with ticket to absenceValidator.
     *
     * @param absenceValidatorId the id of absenceValidator
     * @return the updated absenceValidator
     */
    public AbsenceValidatorDTO resendTicket(Long absenceValidatorId) {
        log.debug("Request to reset resend a Absence Validator invitation : {}", absenceValidatorId);

        return absenceValidatorRepositoryExt
            .findById(absenceValidatorId)
            .map(absenceValidator -> {
                if (absenceValidator.getUser() != null) {
                    throw new BadRequestAlertException("Absence Validator already has an user", "absenceValidator", "useralreadyexist");
                }
                if (absenceValidator.getTicket() == null) {
                    absenceValidator.setTicket(RandomStringUtils.randomNumeric(32));
                }
                absenceValidator = absenceValidatorRepositoryExt.save(absenceValidator);
                if (absenceValidator.getUser() == null) {
                    sendWelcomeEmail(absenceValidator.getId());
                }
                return absenceValidatorMapper.toDto(absenceValidator);
            })
            .orElseThrow(() -> new BadRequestAlertException("Invalid id", "absenceValidator", "idnull"));
    }
}
