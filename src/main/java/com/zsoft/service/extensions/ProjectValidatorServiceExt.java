package com.zsoft.service.extensions;

import com.zsoft.domain.ProjectValidator;
import com.zsoft.repository.ProjectRepository;
import com.zsoft.repository.extensions.ProjectValidatorRepositoryExt;
import com.zsoft.service.dto.ProjectValidatorDTO;
import com.zsoft.service.mapper.ProjectValidatorMapper;
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
 * Service Implementation for managing ProjectValidator.
 */
@Service
@Transactional
public class ProjectValidatorServiceExt {

    private final Logger log = LoggerFactory.getLogger(ProjectValidatorServiceExt.class);

    private final ProjectValidatorRepositoryExt projectValidatorRepositoryExt;

    private final ProjectValidatorMapper projectValidatorMapper;

    private final ProjectRepository projectRepository;

    private final MailServiceExt mailServiceExt;

    public ProjectValidatorServiceExt(
        ProjectValidatorRepositoryExt projectValidatorRepositoryExt,
        ProjectValidatorMapper projectValidatorMapper,
        ProjectRepository projectRepository,
        MailServiceExt mailServiceExt
    ) {
        this.projectValidatorRepositoryExt = projectValidatorRepositoryExt;
        this.projectValidatorMapper = projectValidatorMapper;
        this.projectRepository = projectRepository;
        this.mailServiceExt = mailServiceExt;
    }

    /**
     * Save a projectValidator.
     *
     * @param projectValidatorDTO the entity to save
     * @return the persisted entity
     */
    public ProjectValidatorDTO create(ProjectValidatorDTO projectValidatorDTO) {
        log.debug("Request to save ProjectValidator : {}", projectValidatorDTO);
        ProjectValidator projectValidator = projectValidatorMapper.toEntity(projectValidatorDTO);
        if (projectValidator.getUser() == null) {
            projectValidator.setTicket(RandomStringUtils.randomNumeric(32));
        }
        projectValidator = projectValidatorRepositoryExt.save(projectValidator);
        if (projectValidator.getUser() == null) {
            sendWelcomeEmail(projectValidator.getId());
        }
        return projectValidatorMapper.toDto(projectValidator);
    }

    /**
     * Update a projectValidator.
     *
     * @param projectValidatorDTO the entity to update
     * @return the persisted entity
     */
    public ProjectValidatorDTO update(ProjectValidatorDTO projectValidatorDTO) {
        log.debug("Request to update ProjectValidator : {}", projectValidatorDTO);
        return Optional.ofNullable(projectValidatorDTO)
            .map(projectValidatorMapper::toEntity)
            .map(projectValidatorRepositoryExt::save)
            .map(projectValidatorMapper::toDto)
            .orElseThrow(() -> new NullPointerException("ProjectValidatorDTO is null for method update."));
    }


    /**
     * Get all projectValidator by Project Id.
     *
     * @param projectId the id of Project
     * @return the list Project Validator
     */
    @Transactional(readOnly = true)
    public List<ProjectValidator> getValidatorsByProjectId(Long projectId) {
        log.debug("Request to get ProjectValidator by Project Id: {}", projectId);
        return projectValidatorRepositoryExt
            .findAllByProject_Id(projectId)
            .stream()
            .filter(ProjectValidator::isActive)
            .collect(Collectors.toList());
    }

    /**
     * Get current project validator
     *
     * @return Project Validator DTO
     */
    public Optional<ProjectValidatorDTO> getCurrent(Long projectId) {
        return projectValidatorRepositoryExt.findByUserIsCurrentUserAndProjectId(projectId)
            .stream()
            .map(projectValidatorMapper::toDto)
            .findFirst();
    }

    /**
     * Get current project validator by company
     *
     * @return Project Validator DTO
     */
    public List<ProjectValidatorDTO> getCurrentByCompany(Long companyId) {
        return projectValidatorRepositoryExt.findByUserIsCurrentUserAndCompanyId(companyId)
            .stream()
            .map(projectValidatorMapper::toDto)
            .collect(Collectors.toList());
    }

    /**
     * Get one projectValidator by id.
     *
     * @param id the id of the entity
     * @return the entity
     */
    @Transactional(readOnly = true)
    public Optional<ProjectValidator> findOne(Long id) {
        log.debug("Request to get ProjectValidator : {}", id);
        return projectValidatorRepositoryExt.findById(id);
    }

    /**
     * Get one projectValidatorDTO by ticket.
     *
     * @param ticket the ticket of the project Validator
     * @return the project Validator
     */
    @Transactional(readOnly = true)
    public Optional<ProjectValidatorDTO> findOneByTicket(String ticket) {
        log.debug("Request to get ProjectValidator by ticket : {}", ticket);
        return projectValidatorRepositoryExt.findByTicket(ticket)
            .filter(ProjectValidator::isActive)
            .map(projectValidatorMapper::toDto);
    }

    /**
     * Get one projectValidator by ticket.
     *
     * @param ticket the ticket of the project Validator
     * @return the project Validator
     */
    @Transactional(readOnly = true)
    public Optional<ProjectValidator> findByTicket(String ticket) {
        log.debug("Request to get Project Validator by ticket : {}", ticket);
        return projectValidatorRepositoryExt
            .findByTicket(ticket)
            .filter(ProjectValidator::isActive);
    }

    /**
     * Assign an project validator to current user account by ticket.
     *
     * @param ticket the ticket of the project Validator
     */
    public void assignToAccount(String ticket) throws ConstraintViolationException {
        log.debug("Request to assign project validator to current account by ticket : {}", ticket);
        projectValidatorRepositoryExt.updateUserIdByTicket(ticket);
    }

    /**
     * Send welcome notification email to project validator.
     *
     * @param projectValidatorId the id of project validator
     */
    private void sendWelcomeEmail(Long projectValidatorId) {
        log.debug("Request to Send welcome notification email to Project Validator : {}", projectValidatorId);
        projectValidatorRepositoryExt
            .findById(projectValidatorId)
            .ifPresent(validator ->
                projectRepository
                    .findById(validator.getProject().getId())
                    .ifPresent(project ->
                        mailServiceExt.sendProjectValidatorWelcomenEmail(validator, project)
                    )
            );
    }

    /**
     * Get all the projectValidators.
     *
     * @param pageable   the pagination information
     * @param projectIds the ids list of projects
     * @param ids        the list of ids
     * @return the list of entities
     */
    @Transactional(readOnly = true)
    public Page<ProjectValidatorDTO> findAll(Pageable pageable, List<Long> projectIds, List<Long> ids) {
        log.debug("Request to get all ProjectValidators");
        if (projectIds != null && projectIds.size() > 0) {
            return projectValidatorRepositoryExt.findAllByProject_IdIn(projectIds, pageable)
                .map(projectValidatorMapper::toDto);
        } else if (ids != null) {
            return projectValidatorRepositoryExt.findAllByIdIn(ids, pageable)
                .map(projectValidatorMapper::toDto);
        }
        return projectValidatorRepositoryExt.findAll(pageable)
            .map(projectValidatorMapper::toDto);
    }

    /**
     * Check for new Project Validator ticket.
     * @return ProjectValidatorDTO or null
     */
    public Optional<ProjectValidatorDTO> checkNewTickets() {
        log.debug("REST request to check for new Project Validator ticket");
        return projectValidatorRepositoryExt.checkNewTickets().map(projectValidatorMapper::toDto);
    }

    /**
     * resend a new invitation with ticket to projectValidator.
     *
     * @param projectValidatorId the id of projectValidator
     * @return the updated projectValidator
     */
    public ProjectValidatorDTO resendTicket(Long projectValidatorId) {
        log.debug("Request to reset resend a Project Validator invitation : {}", projectValidatorId);

        return projectValidatorRepositoryExt
            .findById(projectValidatorId)
            .map(projectValidator -> {
                if (projectValidator.getUser() != null) {
                    throw new BadRequestAlertException("Project Validator already has an user", "projectValidator", "useralreadyexist");
                }
                if (projectValidator.getTicket() == null) {
                    projectValidator.setTicket(RandomStringUtils.randomNumeric(32));
                }
                projectValidator = projectValidatorRepositoryExt.save(projectValidator);
                if (projectValidator.getUser() == null) {
                    sendWelcomeEmail(projectValidator.getId());
                }
                return projectValidatorMapper.toDto(projectValidator);
            })
            .orElseThrow(() -> new BadRequestAlertException("Invalid id", "projectValidator", "idnull"));
    }
}
