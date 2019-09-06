package com.zsoft.service.extensions;

import com.zsoft.domain.Project;
import com.zsoft.domain.ProjectContractor;
import com.zsoft.repository.ProjectRepository;
import com.zsoft.repository.extensions.ProjectContractorRepositoryExt;
import com.zsoft.service.dto.ProjectContractorDTO;
import com.zsoft.service.mapper.ProjectContractorMapper;
import com.zsoft.web.rest.errors.BadRequestAlertException;
import org.apache.commons.lang3.RandomStringUtils;
import org.hibernate.exception.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service Implementation for managing ProjectContractor.
 */
@Service
@Transactional
public class ProjectContractorServiceExt {

    private final Logger log = LoggerFactory.getLogger(ProjectContractorServiceExt.class);

    private final ProjectContractorRepositoryExt projectContractorRepositoryExt;

    private final ProjectContractorMapper projectContractorMapper;

    private final ProjectRepository projectRepository;

    private final MailServiceExt mailServiceExt;

    public ProjectContractorServiceExt(
        ProjectContractorRepositoryExt projectContractorRepositoryExt,
        ProjectContractorMapper projectContractorMapper,
        ProjectRepository projectRepository,
        MailServiceExt mailServiceExt
    ) {
        this.projectContractorRepositoryExt = projectContractorRepositoryExt;
        this.projectContractorMapper = projectContractorMapper;
        this.projectRepository = projectRepository;
        this.mailServiceExt = mailServiceExt;
    }

    /**
     * Get all the projectContractors.
     *
     * @param pageable  the pagination information
     * @param projectIds the ids list of projects
     * @return the list of entities
     */
    @Transactional(readOnly = true)
    public Page<ProjectContractorDTO> findAll(Pageable pageable, List<Long> projectIds) {
        log.debug("Request to get all ProjectContractors by projectId: [{}]", projectIds);
        if (projectIds != null && projectIds.size() > 0) {
            return projectContractorRepositoryExt.findAllByProject_IdIn(projectIds, pageable)
                .map(projectContractorMapper::toDto);
        }
        return projectContractorRepositoryExt.findAll(pageable)
            .map(projectContractorMapper::toDto);
    }

    /**
     * Save a projectContractor.
     *
     * @param projectContractorDTO the entity to save
     * @return the persisted entity
     */
    public ProjectContractorDTO create(ProjectContractorDTO projectContractorDTO) {
        log.debug("Request to save projectContractor : {}", projectContractorDTO);
        ProjectContractor projectContractor = projectContractorMapper.toEntity(projectContractorDTO);
        if (projectContractor.getUser() == null) {
            projectContractor.setTicket(RandomStringUtils.randomNumeric(32));
        }
        projectContractor = projectContractorRepositoryExt.save(projectContractor);
        if (projectContractor.getUser() == null) {
            sendWelcomeEmail(projectContractor.getId());
        }
        return projectContractorMapper.toDto(projectContractor);
    }

    /**
     * Send welcome notification email to project contractor.
     *
     * @param projectContractorId the id of project contractor
     */
    private void sendWelcomeEmail(Long projectContractorId) {
        log.debug("Request to Send welcome notification email to Project Contractor : {}", projectContractorId);
        projectContractorRepositoryExt
            .findById(projectContractorId)
            .ifPresent(contractor ->
                projectRepository
                    .findById(contractor.getProject().getId())
                    .ifPresent(project ->
                        mailServiceExt.sendProjectContractorWelcomeEmail(contractor, project)
                    )
            );
    }

    /**
     * Get current project contractor by company
     *
     * @return Project Contractor DTO
     */
    public List<ProjectContractorDTO> getCurrentByCompany(Long companyId) {
        return projectContractorRepositoryExt.findByUserIsCurrentUserAndCompanyId(companyId)
            .stream()
            .map(projectContractorMapper::toDto)
            .collect(Collectors.toList());
    }

    /**
     * Get one ProjectContractor by id.
     *
     * @param id the id of the entity
     * @return the entity
     */
    @Transactional(readOnly = true)
    public Optional<ProjectContractor> findOne(Long id) {
        log.debug("Request to get Project Contractor : {}", id);
        return projectContractorRepositoryExt.findById(id);
    }

    /**
     * Get ProjectContractors by project.
     *
     * @param project the project of the projectContractor
     * @return the projectContractor entities
     */
    @Transactional(readOnly = true)
    public List<ProjectContractor> findByProjectId(Project project) {
        log.debug("Request to get Project Contractors by project : {}", project);
        return projectContractorRepositoryExt.findAllByProject(project);
    }

    /**
     * Get one ProjectContractorDTO by ticket.
     *
     * @param ticket the ticket of the project Contractor
     * @return the project Contractor
     */
    @Transactional(readOnly = true)
    public Optional<ProjectContractorDTO> findOneByTicket(String ticket) {
        log.debug("Request to get Project Contractor by ticket : {}", ticket);
        return projectContractorRepositoryExt
            .findByTicket(ticket)
            .filter(ProjectContractor::isActive)
            .map(projectContractorMapper::toDto);
    }

    /**
     * Get one ProjectContractor by ticket.
     *
     * @param ticket the ticket of the project Contractor
     * @return the project Contractor
     */
    @Transactional(readOnly = true)
    public Optional<ProjectContractor> findByTicket(String ticket) {
        log.debug("Request to get Project Contractor by ticket : {}", ticket);
        return projectContractorRepositoryExt
            .findByTicket(ticket)
            .filter(ProjectContractor::isActive);
    }

    /**
     * Assign an project contractor to current user account by ticket.
     *
     * @param ticket the ticket of the project contractor
     */
    public void assignToAccount(String ticket) throws ConstraintViolationException {
        log.debug("Request to assign project contractor to current account by ticket : {}", ticket);
        projectContractorRepositoryExt.updateUserIdByTicket(ticket);
    }

    /**
     * Check for new project contractor ticket.
     * @return ProjectContractorDTO or null
     */
    public Optional<ProjectContractorDTO> checkNewTickets() {
        log.debug("REST request to check for new project contractor ticket");
        return projectContractorRepositoryExt.checkNewTickets().map(projectContractorMapper::toDto);
    }

    /**
     * resend a new invitation with ticket to projectContractor.
     *
     * @param projectContractorId the id of projectContractor
     * @return the updated projectContractor
     */
    public ProjectContractorDTO resendTicket(Long projectContractorId) {
        log.debug("Request to reset resend a Project Contractor invitation : {}", projectContractorId);

        return projectContractorRepositoryExt
            .findById(projectContractorId)
            .map(projectContractor -> {
                if (projectContractor.getUser() != null) {
                    throw new BadRequestAlertException("Project Contractor already has an user", "projectContractor", "useralreadyexist");
                }
                if (projectContractor.getTicket() == null) {
                    projectContractor.setTicket(RandomStringUtils.randomNumeric(32));
                }
                projectContractor = projectContractorRepositoryExt.save(projectContractor);
                if (projectContractor.getUser() == null) {
                    sendWelcomeEmail(projectContractor.getId());
                }
                return projectContractorMapper.toDto(projectContractor);
            })
            .orElseThrow(() -> new BadRequestAlertException("Invalid id", "projectContractor", "idnull"));
    }
}
