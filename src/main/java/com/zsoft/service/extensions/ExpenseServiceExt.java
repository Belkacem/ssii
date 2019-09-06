package com.zsoft.service.extensions;

import com.zsoft.domain.Company;
import com.zsoft.domain.Resource;
import com.zsoft.repository.extensions.ExpenseRepositoryExt;
import com.zsoft.repository.extensions.ExpenseValidatorRepositoryExt;
import com.zsoft.repository.extensions.ResourceRepositoryExt;
import com.zsoft.security.CustomUser;
import com.zsoft.service.dto.ExpenseDTO;
import com.zsoft.service.dto.ExpenseValidatorDTO;
import com.zsoft.service.mapper.ExpenseMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static com.zsoft.security.SecurityUtils.getCurrentUserId;
import static java.util.Optional.of;

/**
 * Service Implementation for managing Expense.
 */
@Service
@Transactional
public class ExpenseServiceExt {

    private final Logger log = LoggerFactory.getLogger(ExpenseServiceExt.class);

    private final ExpenseRepositoryExt expenseRepositoryExt;

    private final ExpenseMapper expenseMapper;

    private final ExpenseValidatorServiceExt expenseValidatorServiceExt;

    private final ExpenseValidatorRepositoryExt expenseValidatorRepositoryExt;

    private final ResourceRepositoryExt resourceRepositoryExt;

    private final MailServiceExt mailServiceExt;

    public ExpenseServiceExt(
        ExpenseRepositoryExt expenseRepositoryExt,
        ExpenseMapper expenseMapper,
        ExpenseValidatorServiceExt expenseValidatorServiceExt,
        ExpenseValidatorRepositoryExt expenseValidatorRepositoryExt,
        ResourceRepositoryExt resourceRepositoryExt,
        MailServiceExt mailServiceExt
    ) {
        this.expenseRepositoryExt = expenseRepositoryExt;
        this.expenseMapper = expenseMapper;
        this.expenseValidatorServiceExt = expenseValidatorServiceExt;
        this.expenseValidatorRepositoryExt = expenseValidatorRepositoryExt;
        this.resourceRepositoryExt = resourceRepositoryExt;
        this.mailServiceExt = mailServiceExt;
    }

    /**
     * Create a new expense.
     *
     * @param expenseDTO the expense to create
     * @return the created expense
     */
    public Optional<ExpenseDTO> create(ExpenseDTO expenseDTO) {
        log.debug("Request to create Expense : {}", expenseDTO);
        return this.resourceRepositoryExt
            .findByUserIsCurrentUser()
            .stream()
            .map(Resource::getId)
            .anyMatch(expenseDTO.getResourceId()::equals)
            ? createByResource(expenseDTO)
            : createByExpenseValidator(expenseDTO);
    }

    /**
     * create a new Expense by Expense validator.
     *
     * @param expenseDTO the expense to create
     * @return the created expense
     */
    private Optional<ExpenseDTO> createByExpenseValidator(ExpenseDTO expenseDTO) {
        log.debug("Request to create a new expense by expenseValidator : {}", expenseDTO);
        expenseDTO.setCreatorId(getCurrentUserId()
            .orElseThrow(() -> new IllegalStateException("User should be logged in."))
        );
        expenseDTO.setValidatorId(
            resourceRepositoryExt.findById(expenseDTO.getResourceId())
                .map(Resource::getCompany)
                .map(Company::getId)
                .flatMap(expenseValidatorServiceExt::getCurrentByCompany)
                .map(ExpenseValidatorDTO::getId)
                .orElseThrow(() -> new IllegalArgumentException("The current user shoud have a validator"))
        );
        expenseDTO.setSubmissionDate(Instant.now());
        return of(expenseDTO)
            .map(expenseMapper::toEntity)
            .map(expenseRepositoryExt::save)
            .map(expenseMapper::toDto);
    }

    /**
     * create a new Expense by Resource.
     *
     * @param expenseDTO the expense to create
     * @return the created expense
     */
    private Optional<ExpenseDTO> createByResource(ExpenseDTO expenseDTO) {
        log.debug("Request to create a new Expense by Resource : {}", expenseDTO);
        return getCurrentUserId()
            .map(userId -> {
                expenseDTO.setCreatorId(userId);
                expenseDTO.setSubmissionDate(Instant.now());
                return expenseDTO;
            })
            .map(expenseMapper::toEntity)
            .map(expenseRepositoryExt::save)
            .map(expenseMapper::toDto);
    }

    /**
     * Update an existing expense.
     *
     * @param expenseDTO the entity to update
     * @return the updated expenseDTO
     */
    public Optional<ExpenseDTO> update(ExpenseDTO expenseDTO) {
        log.debug("Request to update an existing Expense : {}", expenseDTO);
        return of(expenseDTO)
            .map(expenseMapper::toEntity)
            .map(expenseRepositoryExt::save)
            .map(expenseMapper::toDto);
    }

    /**
     * Get one expense by id.
     *
     * @param id the id of the expense
     * @return the expense
     */
    @Transactional(readOnly = true)
    public Optional<ExpenseDTO> findOne(Long id) {
        log.debug("Request to get Expense : {}", id);
        return expenseRepositoryExt.findById(id)
            .map(expenseMapper::toDto);
    }

    /**
     * Delete the expense by id.
     *
     * @param id the id of the expense
     */
    public void delete(Long id) {
        log.debug("Request to delete Expense : {}", id);
        expenseRepositoryExt.deleteById(id);
    }

    /**
     * Get all the expenses.
     *
     * @param pageable             the pagination information
     * @param resourceIds          the list of expense resource ids
     * @param validatorIdSpecified is the validatorId is specified
     * @return the list of entities
     */
    @Transactional(readOnly = true)
    public Page<ExpenseDTO> findAll(Pageable pageable, List<Long> resourceIds, Boolean validatorIdSpecified) {
        log.debug("Request to get all Expenses by resources: {} and Validator is Specified: {}", resourceIds, validatorIdSpecified);
        if (validatorIdSpecified) {
            return expenseRepositoryExt.findAllByResource_IdInAndValidatorIsNotNull(resourceIds, pageable)
                .map(expenseMapper::toDto);
        }
        return expenseRepositoryExt.findAllByResource_IdInAndValidatorIsNull(resourceIds, pageable)
            .map(expenseMapper::toDto);
    }

    /**
     * Get all the expenses.
     *
     * @param pageable             the pagination information
     * @param companyId            the id of expense resource company
     * @param validatorIdSpecified is the validatorId is specified
     * @return the list of entities
     */
    @Transactional(readOnly = true)
    public Page<ExpenseDTO> findAll(Pageable pageable, Long companyId, Boolean validatorIdSpecified) {
        log.debug("Request to get all Expenses by company: {} and Validator is Specified: {}", companyId, validatorIdSpecified);
        if (validatorIdSpecified) {
            return expenseRepositoryExt.findDistinctByResource_Company_IdAndValidatorIsNotNullAndSubmissionDateIsNotNull(companyId, pageable)
                .map(expenseMapper::toDto);
        }
        return expenseRepositoryExt.findDistinctByResource_Company_IdAndValidatorIsNullAndSubmissionDateIsNotNull(companyId, pageable)
            .map(expenseMapper::toDto);
    }

    /**
     * Get all the expenses.
     *
     * @param pageable    the pagination information
     * @param companyId   the id of expense resource company
     * @param validatorId is the id of validator
     * @return the list of entities
     */
    @Transactional(readOnly = true)
    public Page<ExpenseDTO> findAll(Pageable pageable, Long companyId, Long validatorId) {
        log.debug("Request to get all Expenses by company: {} and Validator: {}", companyId, validatorId);
        return expenseRepositoryExt.findDistinctByResource_Company_IdAndValidator_IdAndSubmissionDateIsNotNull(companyId, validatorId, pageable)
            .map(expenseMapper::toDto);
    }

    /**
     * Send Notification email to Expense Validator After submitting of an expense
     *
     * @param expenseDTO the submitted expense
     */
    public void sendSubmissionNotification(ExpenseDTO expenseDTO) {
        log.debug("Request to send an notification email of Submitted Expense : {}", expenseDTO);
        expenseRepositoryExt.findById(expenseDTO.getId())
            .ifPresent(expense ->
                resourceRepositoryExt.findById(expenseDTO.getResourceId())
                    .ifPresent(resource ->
                        expenseValidatorRepositoryExt
                            .findAllByCompanyIdAndActiveIsTrue(resource.getCompany().getId())
                            .forEach(validator -> mailServiceExt.sendExpenseSubmissionEmail(expense, validator))
                    )
            );
    }

    /**
     * Send Notification email to Resource After validation of an expense
     *
     * @param expenseDTO the validated expense
     */
    public void sendValidationNotification(ExpenseDTO expenseDTO) {
        log.debug("Request to send an notification email of Validated Expense : {}", expenseDTO);
        expenseRepositoryExt.findById(expenseDTO.getId())
            .ifPresent(mailServiceExt::sendExpenseValidationEmail);
    }
}
