package com.zsoft.service.extensions;

import com.zsoft.domain.ExpenseValidator;
import com.zsoft.repository.extensions.ExpenseValidatorRepositoryExt;
import com.zsoft.service.UserService;
import com.zsoft.service.dto.ExpenseValidatorDTO;
import com.zsoft.service.mapper.ExpenseValidatorMapper;
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

/**
 * Service Implementation for managing ExpenseValidator.
 */
@Service
@Transactional
public class ExpenseValidatorServiceExt {

    private final Logger log = LoggerFactory.getLogger(ExpenseValidatorServiceExt.class);

    private final ExpenseValidatorRepositoryExt expenseValidatorRepositoryExt;

    private final ExpenseValidatorMapper expenseValidatorMapper;

    private final UserService userService;

    private final CompanyServiceExt companyServiceExt;

    private final MailServiceExt mailServiceExt;

    public ExpenseValidatorServiceExt(
        ExpenseValidatorRepositoryExt expenseValidatorRepositoryExt,
        ExpenseValidatorMapper expenseValidatorMapper,
        UserService userService,
        CompanyServiceExt companyServiceExt,
        MailServiceExt mailServiceExt
    ) {
        this.expenseValidatorRepositoryExt = expenseValidatorRepositoryExt;
        this.expenseValidatorMapper = expenseValidatorMapper;
        this.userService = userService;
        this.companyServiceExt = companyServiceExt;
        this.mailServiceExt = mailServiceExt;
    }

    /**
     * create a expenseValidator.
     *
     * @param expenseValidatorDTO the entity to save
     * @return the persisted entity
     */
    public ExpenseValidatorDTO create(ExpenseValidatorDTO expenseValidatorDTO) {
        log.debug("Request to save ExpenseValidator : {}", expenseValidatorDTO);
        if (expenseValidatorDTO.getUserId() == null) {
            expenseValidatorDTO.setTicket(RandomStringUtils.randomNumeric(32));
        }
        expenseValidatorDTO = Optional.of(expenseValidatorDTO)
            .map(expenseValidatorMapper::toEntity)
            .map(expenseValidatorRepositoryExt::save)
            .map(expenseValidatorMapper::toDto)
            .orElseThrow(() -> new NullPointerException("ExpenseValidatorDTO is null for method create."));
        if (expenseValidatorDTO.getUserId() == null) {
            sendWelcomeEmail(expenseValidatorDTO.getId());
        }
        return expenseValidatorDTO;
    }


    /**
     * Get current expense validator by company id
     *
     * @param companyId the id of company
     * @return Expense Validator DTO
     */
    public Optional<ExpenseValidatorDTO> getCurrentByCompany(Long companyId) {
        ExpenseValidatorDTO validatorDTO = expenseValidatorRepositoryExt.findByUserIsCurrentUserAndCompany(companyId)
            .stream()
            .findFirst()
            .map(expenseValidatorMapper::toDto)
            .orElseGet(() ->
                UserSecurityUtils.isCurrentUserCompanyOwner() ?
                    userService.getUserWithAuthorities()
                        .map(user -> {
                            ExpenseValidatorDTO newValidatorDTO = new ExpenseValidatorDTO();
                            newValidatorDTO.setActive(true);
                            newValidatorDTO.setEmail(user.getEmail());
                            newValidatorDTO.setUserId(user.getId());
                            newValidatorDTO.setFullname(user.getFirstName() + " " + user.getLastName());
                            newValidatorDTO.setCompanyId(companyId);
                            return newValidatorDTO;
                        })
                        .map(this::create)
                        .get()
                    : null
            );
        return Optional.ofNullable(validatorDTO);
    }

    /**
     * Get all the expenseValidators.
     *
     * @param pageable  the pagination information
     * @param companyId the id of company
     * @return the list of entities
     */
    @Transactional(readOnly = true)
    public Page<ExpenseValidatorDTO> findAll(Pageable pageable, Long companyId) {
        log.debug("Request to get all ExpenseValidators");
        return expenseValidatorRepositoryExt.findAllByCompanyId(companyId, pageable)
            .map(expenseValidatorMapper::toDto);
    }

    /**
     * Get one expenseValidatorDTO by ticket.
     *
     * @param ticket the ticket of the expense Validator DTO
     * @return the expense Validator DTO
     */
    @Transactional(readOnly = true)
    public Optional<ExpenseValidatorDTO> findOneByTicket(String ticket) {
        log.debug("Request to get Expense Validator by ticket : {}", ticket);
        return expenseValidatorRepositoryExt
            .findByTicket(ticket)
            .filter(ExpenseValidator::isActive)
            .map(expenseValidatorMapper::toDto);
    }

    /**
     * Assign an expense validator to current user account by ticket.
     *
     * @param ticket the ticket of the expense Validator
     */
    public void assignToAccount(String ticket) throws ConstraintViolationException {
        log.debug("Request to assign expense validator to current account by ticket : {}", ticket);
        expenseValidatorRepositoryExt.updateUserIdByTicket(ticket);
    }

    /**
     * Send welcome notification email to expense validator.
     *
     * @param expenseValidatorId the id of expense validator
     */
    private void sendWelcomeEmail(Long expenseValidatorId) {
        log.debug("Request to Send welcome notification email to Expense Validator : {}", expenseValidatorId);
        expenseValidatorRepositoryExt
            .findById(expenseValidatorId)
            .ifPresent(validator ->
                companyServiceExt
                    .findOne(validator.getCompany().getId())
                    .ifPresent(company -> mailServiceExt.sendExpenseValidatorWelcomenEmail(company, validator))
            );
    }

    /**
     * Check for new Expense Validator ticket.
     * @return ExpenseValidatorDTO or null
     */
    public Optional<ExpenseValidatorDTO> checkNewTickets() {
        log.debug("REST request to check for new Expense Validator ticket");
        return expenseValidatorRepositoryExt.checkNewTickets().map(expenseValidatorMapper::toDto);
    }

    /**
     * resend a new invitation with ticket to expenseValidator.
     *
     * @param expenseValidatorId the id of expenseValidator
     * @return the updated expenseValidator
     */
    public ExpenseValidatorDTO resendTicket(Long expenseValidatorId) {
        log.debug("Request to reset resend a Expense Validator invitation : {}", expenseValidatorId);

        return expenseValidatorRepositoryExt
            .findById(expenseValidatorId)
            .map(expenseValidator -> {
                if (expenseValidator.getUser() != null) {
                    throw new BadRequestAlertException("Expense Validator already has an user", "expenseValidator", "useralreadyexist");
                }
                if (expenseValidator.getTicket() == null) {
                    expenseValidator.setTicket(RandomStringUtils.randomNumeric(32));
                }
                expenseValidator = expenseValidatorRepositoryExt.save(expenseValidator);
                if (expenseValidator.getUser() == null) {
                    sendWelcomeEmail(expenseValidator.getId());
                }
                return expenseValidatorMapper.toDto(expenseValidator);
            })
            .orElseThrow(() -> new BadRequestAlertException("Invalid id", "expenseValidator", "idnull"));
    }
}
