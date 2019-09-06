package com.zsoft.service.extensions;

import com.zsoft.domain.ProjectResource;
import com.zsoft.domain.ProjectResourceInfo;
import com.zsoft.repository.extensions.ProjectResourceInfoRepositoryExt;
import com.zsoft.service.dto.ProjectResourceInfoDTO;
import com.zsoft.service.mapper.ProjectResourceInfoMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

/**
 * Service Implementation for managing ProjectResourceInfo.
 */
@Service
@Transactional
public class ProjectResourceInfoServiceExt {

    private final Logger log = LoggerFactory.getLogger(ProjectResourceInfoServiceExt.class);

    private final ProjectResourceInfoRepositoryExt projectResourceInfoRepositoryExt;

    private final ProjectResourceInfoMapper projectResourceInfoMapper;

    public ProjectResourceInfoServiceExt(ProjectResourceInfoRepositoryExt projectResourceInfoRepositoryExt, ProjectResourceInfoMapper projectResourceInfoMapper) {
        this.projectResourceInfoRepositoryExt = projectResourceInfoRepositoryExt;
        this.projectResourceInfoMapper = projectResourceInfoMapper;
    }

    /**
     * Get all the projectResourceInfos.
     *
     * @param pageable           the pagination information
     * @param projectResourceIds the list of project resource ids
     * @return the list of entities
     */
    @Transactional(readOnly = true)
    public Page<ProjectResourceInfoDTO> findAll(Pageable pageable, List<Long> projectResourceIds) {
        log.debug("Request to get all ProjectResourceInfos by projectResourceIds: {}", projectResourceIds);
        if (projectResourceIds != null) {
            return projectResourceInfoRepositoryExt.findAllByProjectResource_IdIn(projectResourceIds, pageable)
                .map(projectResourceInfoMapper::toDto);
        }
        return projectResourceInfoRepositoryExt.findAll(pageable)
            .map(projectResourceInfoMapper::toDto);
    }

    /**
     * Save a projectResourceInfo.
     *
     * @param projectResourceInfoDTO the entity to save
     * @return the persisted entity
     */
    public ProjectResourceInfoDTO save(ProjectResourceInfoDTO projectResourceInfoDTO) {
        log.debug("Request to save ProjectResourceInfo : {}", projectResourceInfoDTO);
        ProjectResourceInfo projectResourceInfo = projectResourceInfoMapper.toEntity(projectResourceInfoDTO);
        projectResourceInfo = projectResourceInfoRepositoryExt.save(projectResourceInfo);
        return projectResourceInfoMapper.toDto(projectResourceInfo);
    }

    public Optional<ProjectResourceInfo> getLastProjectResourcesInfo(ProjectResource projectResource, LocalDate date) {
        return projectResourceInfoRepositoryExt
            .findAllByProjectResource(projectResource)
            .stream()
            .filter(pri -> pri.getStartDate().isEqual(date) || pri.getStartDate().isBefore(date))
            .max(Comparator.comparing(ProjectResourceInfo::getStartDate));
    }
}
