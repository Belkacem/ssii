package com.zsoft.service.extensions;

import com.zsoft.domain.ActivityReportFile;
import com.zsoft.repository.extensions.ActivityReportFileRepositoryExt;
import com.zsoft.service.dto.ActivityReportFileDTO;
import com.zsoft.service.mapper.ActivityReportFileMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service Implementation for managing ActivityReportFile.
 */
@Service
@Transactional
public class ActivityReportFileServiceExt {

    private final Logger log = LoggerFactory.getLogger(ActivityReportFileServiceExt.class);

    private final ActivityReportFileRepositoryExt activityReportFileRepositoryExt;

    private final ActivityReportFileMapper activityReportFileMapper;

    public ActivityReportFileServiceExt(ActivityReportFileRepositoryExt activityReportFileRepositoryExt, ActivityReportFileMapper activityReportFileMapper) {
        this.activityReportFileRepositoryExt = activityReportFileRepositoryExt;
        this.activityReportFileMapper = activityReportFileMapper;
    }

    /**
     * Set a activityReportFile to activityReport.
     *
     * @param activityReportId the id of activity report
     * @return the persisted entity
     */
    public ActivityReportFileDTO setFile(Long activityReportId, byte[] file, String contentType) {
        log.debug("Request to save ActivityReportFile : {}", activityReportId);
        ActivityReportFile activityReportFile = activityReportFileRepositoryExt
            .findByActivityReport_Id(activityReportId)
            .orElse(new ActivityReportFile());

        ActivityReportFileDTO activityReportFileDTO = activityReportFileMapper.toDto(activityReportFile);
        activityReportFileDTO.setActivityReportId(activityReportId);
        activityReportFileDTO.setFile(file);
        activityReportFileDTO.setFileContentType(contentType);

        activityReportFile = activityReportFileMapper.toEntity(activityReportFileDTO);
        activityReportFile = activityReportFileRepositoryExt.save(activityReportFile);
        return activityReportFileMapper.toDto(activityReportFile);
    }


    /**
     * Get activityReportFile by activityReportId.
     *
     * @param activityReportId the id of the activityReport
     * @return the activityReportFile
     */
    @Transactional(readOnly = true)
    public Optional<ActivityReportFileDTO> getFile(Long activityReportId) {
        log.debug("Request to get ActivityReportFile by activityReportId : {}", activityReportId);
        return activityReportFileRepositoryExt.findByActivityReport_Id(activityReportId)
            .map(activityReportFileMapper::toDto);
    }


    /**
     * Get all activityReportFiles by activityReportIds.
     *
     * @param activityReportIds the ids list of the activityReports
     * @return the List of activityReportFiles
     */
    @Transactional(readOnly = true)
    public List<ActivityReportFileDTO> getFiles(List<Long> activityReportIds) {
        log.debug("Request to get all ActivityReportFile by activityReportIds : {}", activityReportIds);
        return activityReportFileRepositoryExt.findAllByActivityReport_Id_In(activityReportIds)
            .stream()
            .map(activityReportFileMapper::toDto)
            .collect(Collectors.toList());
    }
}
