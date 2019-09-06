package com.zsoft.service.extensions;

import com.zsoft.domain.Absence;
import com.zsoft.domain.Company;
import com.zsoft.domain.Resource;
import com.zsoft.domain.enumeration.ValidationStatus;
import com.zsoft.repository.extensions.AbsenceRepositoryExt;
import com.zsoft.repository.extensions.AbsenceValidatorRepositoryExt;
import com.zsoft.repository.extensions.ResourceRepositoryExt;
import com.zsoft.service.UserService;
import com.zsoft.service.dto.AbsenceDTO;
import com.zsoft.service.dto.AbsenceValidatorDTO;
import com.zsoft.service.dto.ResourceDTO;
import com.zsoft.service.mapper.AbsenceMapper;
import io.github.jhipster.service.QueryService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static com.zsoft.security.SecurityUtils.getCurrentUserId;
import static java.lang.String.format;
import static java.util.Optional.of;

@SuppressWarnings("ALL")
@Service
@Transactional
public class AbsenceServiceExt extends QueryService<Absence> {
    private final Logger log = LoggerFactory.getLogger(AbsenceServiceExt.class);

    private final AbsenceRepositoryExt absenceRepositoryExt;

    private final UserService userService;

    private final ResourceServiceExt resourceServiceExt;

    private final AbsenceMapper absenceMapper;

    private final CompanyServiceExt companyServiceExt;

    private final HolidayServiceExt holidayServiceExt;

    private final AbsenceValidatorRepositoryExt absenceValidatorRepositoryExt;

    private final ResourceRepositoryExt resourceRepositoryExt;

    private final AbsenceValidatorServiceExt absenceValidatorServiceExt;

    private final AbsenceBalanceServiceExt absenceBalanceServiceExt;

    private final MailServiceExt mailServiceExt;

    public AbsenceServiceExt(
        AbsenceRepositoryExt absenceRepositoryExt,
        UserService userService,
        ResourceServiceExt resourceServiceExt,
        AbsenceMapper absenceMapper,
        CompanyServiceExt companyServiceExt,
        HolidayServiceExt holidayServiceExt,
        AbsenceValidatorRepositoryExt absenceValidatorRepositoryExt,
        ResourceRepositoryExt resourceRepositoryExt,
        AbsenceValidatorServiceExt absenceValidatorServiceExt,
        AbsenceBalanceServiceExt absenceBalanceServiceExt,
        MailServiceExt mailServiceExt
    ) {
        this.absenceRepositoryExt = absenceRepositoryExt;
        this.userService = userService;
        this.resourceServiceExt = resourceServiceExt;
        this.absenceMapper = absenceMapper;
        this.companyServiceExt = companyServiceExt;
        this.holidayServiceExt = holidayServiceExt;
        this.absenceValidatorRepositoryExt = absenceValidatorRepositoryExt;
        this.resourceRepositoryExt = resourceRepositoryExt;
        this.absenceValidatorServiceExt = absenceValidatorServiceExt;
        this.absenceBalanceServiceExt = absenceBalanceServiceExt;
        this.mailServiceExt = mailServiceExt;
    }

    /**
     * Create an absence.
     *
     * @param absenceDTO the absence DTO to create
     * @return the persisted absenceDTO
     */
    public Optional<AbsenceDTO> create(AbsenceDTO absenceDTO) {
        log.debug("Request to create Absence : {}", absenceDTO);
        return this.resourceRepositoryExt
            .findByUserIsCurrentUser()
            .stream()
            .map(Resource::getId)
            .anyMatch(absenceDTO.getResourceId()::equals)
            ?
            createAbsenceRequest(absenceDTO)
            :
            createAbsence(absenceDTO);
    }

    /**
     * create a Absence for employee and validated.
     * this function called by company owner
     *
     * @param absenceDTO the Absence to save
     * @return the requested Absence
     */
    private Optional<AbsenceDTO> createAbsence(AbsenceDTO absenceDTO) {
        log.debug("Request to save Employee request a Absence : {}", absenceDTO);
        absenceDTO.setCreatorId(getCurrentUserId()
            .orElseThrow(() -> new IllegalStateException("User should be logged in."))
        );
        absenceDTO.setValidatorId(
            resourceRepositoryExt.findById(absenceDTO.getResourceId())
                .map(Resource::getCompany)
                .map(Company::getId)
                .flatMap(absenceValidatorServiceExt::getCurrentByCompany)
                .map(AbsenceValidatorDTO::getId)
                .orElseThrow(() -> new IllegalArgumentException("The current user shoud have a validator"))
        );
        absenceDTO.setSubmissionDate(Instant.now());
        absenceDTO.setValidationStatus(ValidationStatus.APPROVED);
        absenceDTO.setValidationDate(Instant.now());
        absenceDTO.setValidationComment("Validation automatique d'aprés le système !");
        absenceDTO.setNumberDays(calculateNumberOfDays(absenceDTO));
        return of(absenceDTO)
            .map(absenceMapper::toEntity)
            .map(absenceRepositoryExt::save)
            .map(absenceBalanceServiceExt::addAdjustment)
            .map(absenceMapper::toDto);
    }

    /**
     * request a Absence for employee.
     *
     * @param absenceDTO the Absence to save
     * @return the requested Absence
     */
    private Optional<AbsenceDTO> createAbsenceRequest(AbsenceDTO absenceDTO) {
        log.debug("Request to save Employee request a Absence : {}", absenceDTO);
        return getCurrentUserId()
            .map(userId -> {
                absenceDTO.setCreatorId(userId);
                return absenceDTO;
            })
            .map(absenceMapper::toEntity)
            .map(absence -> {
                absence.setValidationStatus(ValidationStatus.PENDING);
                absence.setSubmissionDate(Instant.now());
                absence.setNumberDays(calculateNumberOfDays(absenceDTO));
                return absence;
            })
            .map(absenceRepositoryExt::save)
            .map(absenceMapper::toDto);
    }

    /**
     * Update an absence.
     *
     * @param absenceDTO the absence DTO to update
     * @return the persisted absenceDTO
     */
    public Optional<AbsenceDTO> update(AbsenceDTO absenceDTO) {
        log.debug("Request to update Absence : {}", absenceDTO);
        return of(absenceDTO)
            .map(absenceMapper::toEntity)
            .map(absenceRepositoryExt::save)
            .map(absenceMapper::toDto);
    }

    /**
     * Delete the absence by id.
     *
     * @param id the id of the entity
     */
    public void delete(Long id) {
        log.debug("Request to delete Absence : {}", id);
        absenceRepositoryExt.deleteById(id);
    }

    /**
     * Get one absence by id.
     *
     * @param id the id of the entity
     * @return the entity
     */
    @Transactional(readOnly = true)
    public Optional<AbsenceDTO> findOne(Long id) {
        log.debug("Request to get Absence : {}", id);
        return absenceRepositoryExt.findById(id)
            .map(absenceMapper::toDto);
    }

    /**
     * Get all the absences.
     *
     * @param pageable the pagination information
     * @return the list of entities
     */
    @Transactional(readOnly = true)
    public Page<AbsenceDTO> findAll(Pageable page, Long resourceId, Boolean submissionDateSpecified, List<ValidationStatus> validationStatusIn) {
        log.debug("Request to get all Absences by resourceId: {}, validationStatus: {}, submissionDate is Specified", resourceId, validationStatusIn);
        return absenceRepositoryExt.findAllByResource_IdAndValidationStatusInAndSubmissionDateIsNotNull(resourceId, validationStatusIn, page)
            .map(absenceMapper::toDto);
    }

    /**
     * Get all the absences.
     *
     * @param pageable the pagination information
     * @return the list of entities
     */
    @Transactional(readOnly = true)
    public Page<AbsenceDTO> findAll(Pageable page, List<ValidationStatus> validationStatusIn, List<Long> validatorIdIn, Long companyId) {
        List<Long> resourceIds = this.absenceValidatorServiceExt
            .getCurrentByCompany(companyId)
            .map(AbsenceValidatorDTO::getResources)
            .map(Collection::stream)
            .orElse(Stream.empty())
            .map(ResourceDTO::getId)
            .collect(Collectors.toList());
        log.debug("Request to get all Absences by resourceIds: {}, validationStatus: {}, validators: {}, submissionDate is Specified", resourceIds, validationStatusIn, validatorIdIn);
        return absenceRepositoryExt.findAllByResource_IdInAndValidationStatusInAndValidator_IdInAndSubmissionDateIsNotNull(resourceIds, validationStatusIn, validatorIdIn, page)
            .map(absenceMapper::toDto);
    }

    /**
     * Get all the absences.
     *
     * @param pageable the pagination information
     * @return the list of entities
     */
    @Transactional(readOnly = true)
    public Page<AbsenceDTO> findAll(Pageable page, List<ValidationStatus> validationStatusIn, Long companyId) {
        List<Long> resourceIds = this.absenceValidatorServiceExt
            .getCurrentByCompany(companyId)
            .map(AbsenceValidatorDTO::getResources)
            .map(Collection::stream)
            .orElse(Stream.empty())
            .map(ResourceDTO::getId)
            .collect(Collectors.toList());
        log.debug("Request to get all Absences by resourceIds: {}, validationStatus: {}, submissionDate is Specified", resourceIds, validationStatusIn);
        return absenceRepositoryExt.findAllByResource_IdInAndValidationStatusInAndSubmissionDateIsNotNull(resourceIds, validationStatusIn, page)
            .map(absenceMapper::toDto);
    }

    /**
     * Get all the absences.
     *
     * @param pageable the pagination information
     * @return the list of entities
     */
    @Transactional(readOnly = true)
    public Page<AbsenceDTO> findAll(Pageable page, Long resourceId, List<ValidationStatus> validationStatusIn) {
        log.debug("Request to get all Absences by resourceId: {}, validationStatus: {}", resourceId, validationStatusIn);
        return absenceRepositoryExt.findAllByResource_IdAndValidationStatusIn(resourceId, validationStatusIn, page)
            .map(absenceMapper::toDto);
    }

    /**
     * Get all the absences by month and resources.
     *
     * @param pageable the pagination information
     * @param resourceIds the ids list of resources
     * @param month     the month of absence
     * @return the list of entities
     */
    @Transactional(readOnly = true)
    public Page<AbsenceDTO> findAll(Pageable page, List<Long> resourceIds, LocalDate month) {
        LocalDate startOfMonth = month.with(TemporalAdjusters.firstDayOfMonth());
        LocalDate endOfMonth = month.with(TemporalAdjusters.lastDayOfMonth());
        log.debug("Request to get all Absences of resources: [{}], between [{} - {}]", resourceIds, startOfMonth, endOfMonth);
        return absenceRepositoryExt.findAllByResourcesAndMonth(resourceIds, startOfMonth, endOfMonth, page)
            .map(absenceMapper::toDto);
    }

    private float calculateNumberOfDays(AbsenceDTO absenceDTO) {
        LocalDate startDate = absenceDTO.getStart();
        LocalDate endDate = absenceDTO.getEnd();
        float daysNbr = 0;
        for (LocalDate d = startDate; !d.isAfter(endDate); d = d.plusDays(1)) {
            if (d.getDayOfWeek() != DayOfWeek.SATURDAY && d.getDayOfWeek() != DayOfWeek.SUNDAY && !holidayServiceExt.isHoliday(d)) {
                if ((d.isEqual(startDate) && !absenceDTO.isStartHalfDay()) || !d.isEqual(startDate)) {
                    daysNbr += 0.5;
                }
                if ((d.isEqual(endDate) && !absenceDTO.isEndHalfDay()) || !d.isEqual(endDate)) {
                    daysNbr += 0.5;
                }
            }
        }
        return daysNbr;
    }

    /**
     * Send Notification email to Absence Validator After submitting an absence
     *
     * @param absenceDTO the submitted absence
     */
    public void sendSubmissionNotification(AbsenceDTO absenceDTO) {
        log.debug("Request to send an notification email of Submitted Absence : {}", absenceDTO);
        absenceRepositoryExt.findById(absenceDTO.getId())
            .ifPresent(absence -> {
                resourceRepositoryExt.findById(absenceDTO.getResourceId())
                    .ifPresent(resource -> {
                        List<Resource> resources = Collections.singletonList(resource);
                        absenceValidatorRepositoryExt
                            .findAllByResourcesInAndActiveIsTrue(resources)
                            .forEach(validator -> {
                                mailServiceExt.sendAbsenceSubmissionEmail(absence, validator);
                            });
                    });
            });
    }

    /**
     * Send Notification email to Resource After Approving an absence
     *
     * @param absenceDTO the approved absence
     */
    public void sendApprovedNotification(AbsenceDTO absenceDTO) {
        log.debug("Request to send an notification email of Approved Absence : {}", absenceDTO);
        absenceRepositoryExt.findById(absenceDTO.getId())
            .ifPresent(mailServiceExt::sendAbsenceApprovedEmail);
    }

    /**
     * Send Notification email to Resource After Rejecting an absence
     *
     * @param absenceDTO the rejected absence
     */
    public void sendRejectedNotification(AbsenceDTO absenceDTO) {
        log.debug("Request to send an notification email of Rejected Absence : {}", absenceDTO);
        absenceRepositoryExt.findById(absenceDTO.getId())
            .ifPresent(mailServiceExt::sendAbsenceRejectedEmail);
    }

    /**
     * Add Absence Adjustment
     */
    public Absence addAdjustment(Long absenceId) {
        return this.absenceRepositoryExt
            .findById(absenceId)
            .map(absenceBalanceServiceExt::addAdjustment)
            .orElseThrow(() -> new IllegalArgumentException(format("Can't find Absence with id : %d", absenceId)));
    }
}
