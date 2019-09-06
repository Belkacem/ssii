package com.zsoft.service.extensions;

import com.zsoft.config.Constants;
import com.zsoft.config.PersistedConfigurationKeys;
import com.zsoft.domain.*;
import com.zsoft.repository.extensions.*;
import com.zsoft.service.dto.AbsenceBalanceAdjustmentDTO;
import com.zsoft.service.dto.AbsenceBalanceDTO;
import com.zsoft.service.dto.ConstantDTO;
import com.zsoft.service.dto.PersistedConfigurationDTO;
import com.zsoft.service.mapper.AbsenceBalanceAdjustmentMapper;
import com.zsoft.service.mapper.AbsenceBalanceMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static java.lang.String.format;
import static java.time.LocalDate.now;
import static java.time.temporal.TemporalAdjusters.*;

/**
 * Service Implementation for managing AbsenceBalance.
 */
@Service
@Transactional
public class AbsenceBalanceServiceExt {

    private final Logger log = LoggerFactory.getLogger(AbsenceBalanceServiceExt.class);

    private final AbsenceBalanceRepositoryExt absenceBalanceRepositoryExt;

    private final AbsenceBalanceAdjustmentRepositoryExt absenceBalanceAdjustmentRepositoryExt;

    private final AbsenceTypeRepositoryExt absenceTypeRepositoryExt;

    private final ResourceRepositoryExt resourceRepositoryExt;

    private final AbsenceBalanceMapper balanceMapper;

    private final AbsenceBalanceAdjustmentMapper adjustmentMapper;

    private final PersistedConfigurationServiceExt configurationServiceExt;

    private final ResourceConfigurationRepositoryExt resourceConfigurationRepositoryExt;

    private final ConstantServiceExt constantService;

    private static final int CP = 1;

    private static final int RTT = 2;

    public AbsenceBalanceServiceExt(
        AbsenceBalanceRepositoryExt absenceBalanceRepositoryExt,
        AbsenceBalanceAdjustmentRepositoryExt absenceBalanceAdjustmentRepositoryExt,
        AbsenceTypeRepositoryExt absenceTypeRepositoryExt,
        ResourceRepositoryExt resourceRepositoryExt,
        AbsenceBalanceMapper balanceMapper,
        AbsenceBalanceAdjustmentMapper adjustmentMapper,
        PersistedConfigurationServiceExt configurationServiceExt,
        ResourceConfigurationRepositoryExt resourceConfigurationRepositoryExt,
        ConstantServiceExt constantService
    ) {
        this.absenceBalanceRepositoryExt = absenceBalanceRepositoryExt;
        this.absenceBalanceAdjustmentRepositoryExt = absenceBalanceAdjustmentRepositoryExt;
        this.absenceTypeRepositoryExt = absenceTypeRepositoryExt;
        this.resourceRepositoryExt = resourceRepositoryExt;
        this.balanceMapper = balanceMapper;
        this.adjustmentMapper = adjustmentMapper;
        this.configurationServiceExt = configurationServiceExt;
        this.resourceConfigurationRepositoryExt = resourceConfigurationRepositoryExt;
        this.constantService = constantService;
    }

    private AbsenceBalance createClearAbsenceBalance(Resource resource, AbsenceType absenceType, LocalDate date) {
        AbsenceBalance absenceBalance = new AbsenceBalance();
        absenceBalance.setResource(resource);
        absenceBalance.setType(absenceType);
        absenceBalance.setBalance(0F);
        absenceBalance.setTaken(0F);
        absenceBalance.setDate(date);
        return absenceBalanceRepositoryExt.save(absenceBalance);
    }

    public void createBalances(Resource resource) {
        log.debug("Request to create new Absence Balance for Resource : {}", resource);
        absenceTypeRepositoryExt
            .findAllByHasBalanceIsTrue()
            .forEach(absenceType -> createClearAbsenceBalance(resource, absenceType, LocalDate.now()));
    }

    @Transactional(readOnly = true)
    public void deleteBalances(Resource resource) {
        absenceBalanceAdjustmentRepositoryExt.deleteByAbsenceBalance_Resource(resource);
        absenceBalanceRepositoryExt.deleteByResource(resource);
    }

    private void addAdjustment(AbsenceType absenceType, Resource resource, LocalDate date, float balance, String comment, Absence absence) {
        log.debug("Request to add Absence Balance Adjustment: {}, for resource : {}", balance, resource);
        if (date == null || absenceType == null) {
            return;
        }
        LocalDate startDate = null, endDate = null;
        if (absenceType.getCode() == RTT) {
            startDate = date.with(firstDayOfYear());
            endDate = date.with(lastDayOfYear());
        } else if (absenceType.getCode() == CP) {
            if (date.getMonthValue() < 6) {
                startDate = date.minusYears(1).withMonth(6).with(firstDayOfMonth());
                endDate = date.withMonth(5).with(lastDayOfMonth());
            } else {
                startDate = date.withMonth(6).with(firstDayOfMonth());
                endDate = date.plusYears(1).withMonth(5).with(lastDayOfMonth());
            }
        }
        absenceBalanceRepositoryExt
            .findByTypeAndResourceAndDateBetween(absenceType, resource, startDate, endDate)
            .map(absenceBalance -> new AbsenceBalanceAdjustment()
                .absenceBalance(absenceBalance)
                .balance(balance)
                .date(date)
                .absence(absence)
                .comment(comment)
                .manualAdjustment(false))
            .ifPresent(absenceBalanceAdjustmentRepositoryExt::save);
    }

    public Absence addAdjustment(Absence absence) {
        Optional<AbsenceType> absenceType = absenceTypeRepositoryExt.findById(absence.getType().getId());
        if (!absenceType.isPresent() || !absenceType.get().isHasBalance()) {
            return absence;
        }
        addAdjustment(
            absenceType.get(),
            absence.getResource(),
            absence.getStart(),
            -absence.getNumberDays(),
            Constants.AUTOMATIC_ADJUSTMENT_COMMENT,
            absence);
        return absence;
    }

    private int getCompanyCpConfig(Long companyId) {
        Integer defaultCP = constantService.getConstantByKey(PersistedConfigurationKeys.DEFAULTS_CP_KEY)
            .map(ConstantDTO::getValue).map(Integer::parseInt)
            .orElse(Constants.DEFAULT_CP);
        return configurationServiceExt
            .getByKey(format(PersistedConfigurationKeys.COMPANY_CP_KEY_FORMAT, companyId))
            .map(PersistedConfigurationDTO::getValue)
            .map(Integer::parseInt)
            .orElse(defaultCP);
    }

    private int getCompanyRttConfig(Long companyId) {
        Integer defaultRTT = constantService.getConstantByKey(PersistedConfigurationKeys.DEFAULTS_RTT_KEY)
            .map(ConstantDTO::getValue).map(Integer::parseInt)
            .orElse(Constants.DEFAULT_RTT);
        return configurationServiceExt
            .getByKey(format(PersistedConfigurationKeys.COMPANY_RTT_KEY_FORMAT, companyId))
            .map(PersistedConfigurationDTO::getValue)
            .map(Integer::parseInt)
            .orElse(defaultRTT);
    }

    /**
     * Add Absence Balance Adjustment of type CP
     */
    private void addAdjustmentsCP(Resource resource, ResourceConfiguration configuration, LocalDate date) {
        int NBR_CP_PER_YEAR = getCompanyCpConfig(resource.getCompany().getId()) + configuration.getDaysCP();
        absenceTypeRepositoryExt
            .findByCode(CP)
            .ifPresent(absenceType -> {
                float balance = ((float) NBR_CP_PER_YEAR) / 12F;
                String comment = "Add the monthly solde of CP";
                this.addAdjustment(absenceType, resource, date, balance, comment, null);
            });
    }

    /**
     * Add Absence Balance Adjustment of type RTT
     */
    private void addAdjustmentsRTT(Resource resource, ResourceConfiguration configuration, LocalDate date) {
        int NBR_RTT_PER_YEAR = (configuration.getDaysRTT() == 0)
            ? getCompanyRttConfig(resource.getCompany().getId())
            : configuration.getDaysRTT();
        absenceTypeRepositoryExt
            .findByCode(RTT)
            .ifPresent(absenceType -> {
                float balance = ((float) NBR_RTT_PER_YEAR) / 12F;
                String comment = "Add the monthly solde of RTT";
                this.addAdjustment(absenceType, resource, date, balance, comment, null);
            });
    }

    public void monthlyAdjustments(LocalDate date) {
        LocalDate today = date == null ? now() : date;
        if (today.isEqual(today.with(lastDayOfMonth()))) {
            resourceRepositoryExt
                .findAll()
                .forEach(resource ->
                    resourceConfigurationRepositoryExt.findByResourceId(resource.getId())
                        .ifPresent(config -> {
                            // Add monthly balances
                            if (config.isActive()) {
                                addAdjustmentsCP(resource, config, today);
                                if (config.isHasRTT()) {
                                    addAdjustmentsRTT(resource, config, today);
                                }
                            }
                        })
                );
        }
    }

    /**
     * the monthly adjustments
     * every last day of month at 23:00
     * ex: January 31, 2019 23:00
     */
    @Scheduled(cron = "0 0 23 28-31 * ?")
    @Transactional
    public void monthlySchedule() {
        log.debug("Request to cronjob Monthly Schedule at : {}", now());
        monthlyAdjustments(now());
    }

    /**
     * Init Absence Balance Adjustment of type CP
     */
    private void initBalanceCP(Resource resource, LocalDate date) {
        log.debug("Request to init CP Absence Balance for resource : {}", resource);
        absenceTypeRepositoryExt
            .findByCode(CP)
            .ifPresent(absenceType -> createClearAbsenceBalance(resource, absenceType, date));
    }

    /**
     * Init Absence Balance Adjustment of type RTT
     */
    private void initBalanceRTT(Resource resource, LocalDate date) {
        log.debug("Request to init RTT Absence Balance for resource : {}", resource);
        absenceTypeRepositoryExt
            .findByCode(RTT)
            .ifPresent(absenceType -> createClearAbsenceBalance(resource, absenceType, date));
    }

    public void initBalances(LocalDate date) {
        LocalDate today = date == null ? now() : date;
        List<Resource> resources = resourceRepositoryExt.findAll();
        // if date is 01 Juin init CP Balance
        if (today.getMonthValue() == 6) {
            resources.forEach(resource -> initBalanceCP(resource, today));
        }
        // if date is 01 Jan init RTT Balance
        if (today.getMonthValue() == 1) {
            resources.forEach(resource -> initBalanceRTT(resource, today));
        }
    }

    /**
     * the yearly initialisation
     * every first day of month at 01:00 AM
     * ex: January 1, 2019 01:00 AM
     */
    @Scheduled(cron = "0 0 1 1 * ?")
    @Transactional
    public void yearlySchedule() {
        log.debug("Request to cronjob Yearly Schedule at : {}", now());
        initBalances(now());
    }

    /**
     * Get all the absenceBalances.
     *
     * @param pageable   the pagination information
     * @param resourceId the absence balance resource ID
     * @return the list of entities
     */
    @Transactional(readOnly = true)
    public Page<AbsenceBalanceDTO> findAll(Pageable pageable, Long resourceId) {
        log.debug("Request to get all AbsenceBalances by resourceId: {}", resourceId);
        return absenceBalanceRepositoryExt.findAllByResource_Id(resourceId, pageable)
            .map(balanceMapper::toDto);
    }

    /**
     * Get all the absenceBalancesAdjustments by absence balance ids.
     *
     * @param pageable          the pagination information
     * @param absenceBalanceIds the list of absence balance ids
     * @return the list of entities
     */
    @Transactional(readOnly = true)
    public Page<AbsenceBalanceAdjustmentDTO> findAllAdjustments(Pageable pageable, List<Long> absenceBalanceIds) {
        log.debug("Request to get all AbsenceBalanceAdjustments by absenceBalanceIds: {}", absenceBalanceIds);
        return absenceBalanceAdjustmentRepositoryExt.findAllByAbsenceBalance_IdIn(absenceBalanceIds, pageable)
            .map(adjustmentMapper::toDto);
    }
}
