package com.zsoft.service.extensions;

import com.zsoft.domain.Project;
import com.zsoft.repository.extensions.ProjectRepositoryExt;
import com.zsoft.service.UserService;
import com.zsoft.service.dto.ProjectDTO;
import com.zsoft.service.dto.ProjectValidatorDTO;
import com.zsoft.service.mapper.ProjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service Implementation for managing Project.
 */
@Service
@Transactional
public class ProjectServiceExt {

    private final Logger log = LoggerFactory.getLogger(ProjectServiceExt.class);

    private final ProjectRepositoryExt projectRepositoryExt;

    private final ProjectMapper projectMapper;

    private final UserService userService;

    private final ProjectValidatorServiceExt projectValidatorServiceExt;

    public ProjectServiceExt(ProjectRepositoryExt projectRepositoryExt, ProjectMapper projectMapper, UserService userService, ProjectValidatorServiceExt projectValidatorServiceExt) {
        this.projectRepositoryExt = projectRepositoryExt;
        this.projectMapper = projectMapper;
        this.userService = userService;
        this.projectValidatorServiceExt = projectValidatorServiceExt;
    }

    /**
     * Save a project.
     *
     * @param projectDTO the entity to save
     * @return the persisted entity
     */
    public ProjectDTO create(ProjectDTO projectDTO) {
        log.debug("Request to save Project : {}", projectDTO);
        return userService
            .getUserWithAuthorities()
            .map(user -> {
                Project project = projectMapper.toEntity(projectDTO);
                project = projectRepositoryExt.save(project);
                ProjectValidatorDTO validatorDTO = new ProjectValidatorDTO();
                validatorDTO.setFullname(user.getFirstName() + ' ' + user.getLastName());
                validatorDTO.setEmail(user.getEmail());
                validatorDTO.setActive(true);
                validatorDTO.setUserId(user.getId());
                validatorDTO.setProjectId(project.getId());
                projectValidatorServiceExt.create(validatorDTO);
                return project;
            })
            .map(projectMapper::toDto)
            .orElse(null);
    }

    /**
     * Get all the projects.
     *
     * @param companyId the id of project company
     * @param ids       the list of project ids
     * @param pageable  the pagination information
     * @return the list of entities
     */
    @Transactional(readOnly = true)
    public Page<ProjectDTO> findAll(Pageable pageable, Long companyId, List<Long> ids) {
        log.debug("Request to get all Projects by companyId: {}, ids: {}", companyId, ids);
        if (companyId != null) {
            return projectRepositoryExt.findAllByCompanyId(companyId, pageable)
                .map(projectMapper::toDto);
        } else if (ids != null) {
            return projectRepositoryExt.findAllByIdIn(ids, pageable)
                .map(projectMapper::toDto);
        }
        return projectRepositoryExt.findAll(pageable)
            .map(projectMapper::toDto);
    }
}
