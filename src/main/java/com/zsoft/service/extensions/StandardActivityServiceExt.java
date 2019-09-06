package com.zsoft.service.extensions;

import com.zsoft.domain.*;
import com.zsoft.domain.enumeration.ValidationStatus;
import com.zsoft.repository.extensions.StandardActivityRepositoryExt;
import com.zsoft.service.dto.StandardActivityDTO;
import com.zsoft.service.mapper.StandardActivityMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service Implementation for managing StandardActivity.
 */
@Service
@Transactional
public class StandardActivityServiceExt {

    private final Logger log = LoggerFactory.getLogger(StandardActivityServiceExt.class);

    private final StandardActivityRepositoryExt standardActivityRepositoryExt;

    private final StandardActivityMapper standardActivityMapper;

    private final ProjectValidatorServiceExt projectValidatorServiceExt;

    public StandardActivityServiceExt(
        StandardActivityRepositoryExt standardActivityRepositoryExt,
        StandardActivityMapper standardActivityMapper,
        ProjectValidatorServiceExt projectValidatorServiceExt
    ) {
        this.standardActivityRepositoryExt = standardActivityRepositoryExt;
        this.standardActivityMapper = standardActivityMapper;
        this.projectValidatorServiceExt = projectValidatorServiceExt;
    }

    /**
     * Bulk Save an Standard Activities.
     * Set Current Project Validator if activities validation status are changed
     *
     * @param standardActivityDTOs the entities to save
     * @return the persisted entity
     */
    @Transactional
    public List<StandardActivityDTO> bulkSave(List<StandardActivityDTO> standardActivityDTOs) {
        log.debug("Request to save Standard Activities : {}", standardActivityDTOs);

        List<Long> ids = standardActivityDTOs.stream().map(StandardActivityDTO::getId).collect(Collectors.toList());
        List<StandardActivity> oldActivities = standardActivityRepositoryExt.findAllByIdIn(ids);

        boolean updateStatus = oldActivities.stream().anyMatch(act1 ->
            standardActivityDTOs.stream()
                .filter(act2 -> act2.getId().equals(act1.getId()))
                .findFirst()
                .map(act2 -> act2.getValidationStatus() != act1.getValidationStatus())
                .orElse(false)
        );

        if (updateStatus) {
            oldActivities
                .stream()
                .findAny()
                .map(StandardActivity::getActivityReport)
                .map(ActivityReport::getProjectResource)
                .map(ProjectResource::getProject)
                .map(Project::getId)
                .flatMap(projectValidatorServiceExt::getCurrent)
                .ifPresent(projectValidatorDTO ->
                    standardActivityDTOs
                        .stream()
                        .filter(act1 ->
                            oldActivities.stream()
                                .filter(act2 -> act2.getId().equals(act1.getId()))
                                .findFirst()
                                .map(act2 -> act2.getValidationStatus() != act1.getValidationStatus())
                                .orElse(false)
                        )
                        .forEach(activityDTO -> activityDTO.setValidatorId(projectValidatorDTO.getId()))
                );
        }
        return standardActivityDTOs
            .stream()
            .map(standardActivityMapper::toEntity)
            .map(standardActivityRepositoryExt::save)
            .map(standardActivityMapper::toDto)
            .collect(Collectors.toList());
    }

    /**
     * Update a status of Standard Activities by activity report id.
     *
     * @param validator the project validator
     * @param reportId  the id of the activityReportDTO
     */
    @Transactional
    public List<StandardActivity> updateStatus(ProjectValidator validator, Long reportId, ValidationStatus status) {
        log.debug("Request to Update a status of standard activities by report : {}, to status : {}", reportId, status);
        Instant now = Instant.now();
        return standardActivityRepositoryExt
            .findAllByActivityReport_Id(reportId)
            .stream()
            .map(
                activity -> {
                    activity.setValidationStatus(status);
                    activity.setValidator(validator);
                    activity.setValidationDate(now);
                    return standardActivityRepositoryExt.save(activity);
                }
            )
            .collect(Collectors.toList());
    }

    /**
     * Delete the Standard Activities by id.
     *
     * @param ids the ids to be deleted
     */
    @Transactional
    public void bulkDelete(List<Long> ids) {
        log.debug("Request to delete Standard Activities : {}", ids);
        standardActivityRepositoryExt.findAllByIdIn(ids)
            .stream()
            .map(StandardActivity::getId)
            .forEach(standardActivityRepositoryExt::deleteById);
    }

    public StandardActivity getValidationStatus(Long activityReportId) {
        List<StandardActivity> activities = standardActivityRepositoryExt
            .findAllByActivityReport_Id(activityReportId)
            .stream()
            .filter(activity -> activity.isMorning() || activity.isAfternoon())
            .collect(Collectors.toList());
        if (activities.size() == 0) {
            StandardActivity activity = new StandardActivity();
            activity.setValidationStatus(ValidationStatus.PENDING);
            return activity;
        } else {
            return activities.stream()
                .filter(act -> act.getValidationStatus() == ValidationStatus.PENDING)
                .findFirst()
                .orElse(
                    activities.stream()
                        .filter(act -> act.getValidationStatus() == ValidationStatus.REJECTED)
                        .findFirst()
                        .orElse(activities.get(0))
                );
        }
    }

    /**
     * Get all the Standard Activities.
     *
     * @param pageable           the pagination information
     * @param activityReportIdIn the list if activity report IDs
     * @param resourceId         the Resource ID
     * @param startDate          the start of month
     * @param endDate            the end of month
     * @return the list of entities
     */
    @Transactional(readOnly = true)
    public Page<StandardActivityDTO> findAll(Pageable pageable, List<Long> activityReportIdIn, Long resourceId, LocalDate startDate, LocalDate endDate) {
        log.debug("Request to get all Standard Activities");
        if (activityReportIdIn != null && startDate != null && endDate != null) {
            return standardActivityRepositoryExt
                .findAllByActivityReport_IdInAndDateBetween(activityReportIdIn, startDate, endDate, pageable)
                .map(standardActivityMapper::toDto);
        } else if (activityReportIdIn != null) {
            return standardActivityRepositoryExt
                .findAllByActivityReport_IdIn(activityReportIdIn, pageable)
                .map(standardActivityMapper::toDto);
        } else if (resourceId != null && startDate != null && endDate != null) {
            return standardActivityRepositoryExt
                .findAllByActivityReport_ProjectResource_Resource_IdAndDateBetween(resourceId, startDate, endDate, pageable)
                .map(standardActivityMapper::toDto);
        } else {
            return standardActivityRepositoryExt
                .findAll(pageable)
                .map(standardActivityMapper::toDto);
        }
    }
}
