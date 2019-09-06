package com.zsoft.service.extensions;

import com.zsoft.domain.ActivityReport;
import com.zsoft.domain.ExceptionalActivity;
import com.zsoft.domain.Project;
import com.zsoft.domain.ProjectResource;
import com.zsoft.domain.enumeration.ValidationStatus;
import com.zsoft.repository.extensions.ExceptionalActivityRepositoryExt;
import com.zsoft.service.dto.ExceptionalActivityDTO;
import com.zsoft.service.mapper.ExceptionalActivityMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service Implementation for managing ExceptionalActivity.
 */
@Service
@Transactional
public class ExceptionalActivityServiceExt {

    private final Logger log = LoggerFactory.getLogger(ExceptionalActivityServiceExt.class);

    private final ExceptionalActivityRepositoryExt exceptionalActivityRepositoryExt;

    private final ExceptionalActivityMapper exceptionalActivityMapper;

    private final ProjectValidatorServiceExt projectValidatorServiceExt;

    public ExceptionalActivityServiceExt(
        ExceptionalActivityRepositoryExt exceptionalActivityRepositoryExt,
        ExceptionalActivityMapper exceptionalActivityMapper,
        ProjectValidatorServiceExt projectValidatorServiceExt
    ) {
        this.exceptionalActivityRepositoryExt = exceptionalActivityRepositoryExt;
        this.exceptionalActivityMapper = exceptionalActivityMapper;
        this.projectValidatorServiceExt = projectValidatorServiceExt;
    }

    /**
     * Bulk Save an Exceptional Activities.
     *
     * @param exceptionalActivityDTOs the entities to save
     * @return the persisted entity
     */
    @Transactional
    public List<ExceptionalActivityDTO> bulkSave(List<ExceptionalActivityDTO> exceptionalActivityDTOs) {
        log.debug("Request to save Exceptional Activities : {}", exceptionalActivityDTOs);

        List<Long> ids = exceptionalActivityDTOs.stream().map(ExceptionalActivityDTO::getId).collect(Collectors.toList());
        List<ExceptionalActivity> oldActivities = exceptionalActivityRepositoryExt.findAllByIdIn(ids);

        boolean updateStatus = oldActivities.stream().anyMatch(act1 ->
            exceptionalActivityDTOs.stream()
                .filter(act2 -> act2.getId().equals(act1.getId()))
                .findFirst()
                .map(act2 -> act2.getValidationStatus() != act1.getValidationStatus())
                .orElse(false)
        );

        if (updateStatus) {
            oldActivities
                .stream()
                .findAny()
                .map(ExceptionalActivity::getActivityReport)
                .map(ActivityReport::getProjectResource)
                .map(ProjectResource::getProject)
                .map(Project::getId)
                .flatMap(projectValidatorServiceExt::getCurrent)
                .ifPresent(projectValidatorDTO ->
                    exceptionalActivityDTOs
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
        return exceptionalActivityDTOs
            .stream()
            .map(exceptionalActivityMapper::toEntity)
            .map(exceptionalActivityRepositoryExt::save)
            .map(exceptionalActivityMapper::toDto)
            .collect(Collectors.toList());
    }

    /**
     * Delete the Exceptional Activities by id.
     *
     * @param ids the ids to be deleted
     */
    @Transactional
    public void bulkDelete(List<Long> ids) {
        log.debug("Request to delete Exceptional Activities : {}", ids);
        exceptionalActivityRepositoryExt.findAllByIdIn(ids)
            .stream()
            .map(ExceptionalActivity::getId)
            .forEach(exceptionalActivityRepositoryExt::deleteById);
    }

    public ExceptionalActivity getValidationStatus(Long activityReportId) {
        List<ExceptionalActivity> activities = exceptionalActivityRepositoryExt.findAllByActivityReport_Id(activityReportId);
        if (activities.size() == 0) {
            ExceptionalActivity activity = new ExceptionalActivity();
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
     * Get all the exceptionalActivities.
     *
     * @param pageable           the pagination information
     * @param activityReportIdIn the list if activity report IDs
     * @param resourceId         the Resource ID
     * @param startDate          the start of month
     * @param endDate            the end of month
     * @return the list of entities
     */
    @Transactional(readOnly = true)
    public Page<ExceptionalActivityDTO> findAll(Pageable pageable, List<Long> activityReportIdIn, Long resourceId, LocalDate startDate, LocalDate endDate) {
        log.debug("Request to get all ExceptionalActivities");
        if (activityReportIdIn != null && startDate != null && endDate != null) {
            return exceptionalActivityRepositoryExt
                .findAllByActivityReport_IdInAndDateBetween(activityReportIdIn, startDate, endDate, pageable)
                .map(exceptionalActivityMapper::toDto);
        } else if (activityReportIdIn != null) {
            return exceptionalActivityRepositoryExt
                .findAllByActivityReport_IdIn(activityReportIdIn, pageable)
                .map(exceptionalActivityMapper::toDto);
        } else if (resourceId != null && startDate != null && endDate != null) {
            return exceptionalActivityRepositoryExt
                .findAllByActivityReport_ProjectResource_Resource_IdAndDateBetween(resourceId, startDate, endDate, pageable)
                .map(exceptionalActivityMapper::toDto);
        }
        return exceptionalActivityRepositoryExt
            .findAll(pageable)
            .map(exceptionalActivityMapper::toDto);
    }
}
