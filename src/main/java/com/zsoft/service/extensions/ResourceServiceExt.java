package com.zsoft.service.extensions;

import com.zsoft.domain.Resource;
import com.zsoft.domain.User;
import com.zsoft.repository.extensions.ResourceRepositoryExt;
import com.zsoft.service.dto.ResourceConfigurationDTO;
import com.zsoft.service.dto.ResourceDTO;
import com.zsoft.service.mapper.ResourceMapper;
import com.zsoft.web.rest.errors.BadRequestAlertException;
import com.zsoft.web.rest.errors.ErrorConstants;
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

/**
 * Service Implementation for managing Resource.
 */
@Service
@Transactional
public class ResourceServiceExt {

    private final Logger log = LoggerFactory.getLogger(ResourceServiceExt.class);

    private final ResourceRepositoryExt resourceRepositoryExt;

    private final ResourceMapper resourceMapper;

    private final CompanyServiceExt companyServiceExt;

    private final AbsenceValidatorServiceExt absenceValidatorServiceExt;

    private final AbsenceBalanceServiceExt absenceBalanceServiceExt;

    private final ResourceConfigurationServiceExt resourceConfigurationServiceExt;

    private final MailServiceExt mailServiceExt;

    public ResourceServiceExt(
        ResourceRepositoryExt resourceRepositoryExt,
        ResourceMapper resourceMapper,
        CompanyServiceExt companyServiceExt,
        AbsenceValidatorServiceExt absenceValidatorServiceExt,
        AbsenceBalanceServiceExt absenceBalanceServiceExt,
        ResourceConfigurationServiceExt resourceConfigurationServiceExt,
        MailServiceExt mailServiceExt
    ) {
        this.resourceRepositoryExt = resourceRepositoryExt;
        this.resourceMapper = resourceMapper;
        this.companyServiceExt = companyServiceExt;
        this.absenceValidatorServiceExt = absenceValidatorServiceExt;
        this.absenceBalanceServiceExt = absenceBalanceServiceExt;
        this.resourceConfigurationServiceExt = resourceConfigurationServiceExt;
        this.mailServiceExt = mailServiceExt;
    }

    /**
     * create a resource.
     *
     * @param resourceDTO the resource to save
     * @return the created resource
     */
    public Optional<ResourceDTO> create(ResourceDTO resourceDTO) {
        log.debug("Request to save Resource : {}", resourceDTO);
        resourceRepositoryExt.findOneByEmailIgnoreCaseAndCompanyId(resourceDTO.getEmail(), resourceDTO.getCompanyId())
            .ifPresent(existingUser -> {
                throw new BadRequestAlertException(ErrorConstants.EMAIL_ALREADY_USED_TYPE, "Email is already in use!", "resource", "emailexists");
            });
        if (resourceDTO.getFirstName() == null) {
            resourceDTO.setDraft(true);
        }
        // set Ticket
        if (resourceDTO.getUserId() == null) {
            resourceDTO.setTicket(RandomStringUtils.randomNumeric(32));
        }
        return Optional.of(resourceDTO)
            .map(resourceMapper::toEntity)
            .map(resourceRepositoryExt::save)
            .map(resource -> {
                resourceConfigurationServiceExt.create(resource);
                absenceValidatorServiceExt.appendToCurrent(resource);
                absenceBalanceServiceExt.createBalances(resource);
                if (resource.getUser() == null) {
                    sendWelcomeEmail(resource.getId());
                }
                return resource;
            })
            .map(resourceMapper::toDto);
    }

    /**
     * update a resource.
     *
     * @param resourceDTO the resource to save
     * @return the updated resource
     */
    public ResourceDTO update(ResourceDTO resourceDTO) {
        log.debug("Request to save Resource : {}", resourceDTO);
        Optional<ResourceDTO> current = getCurrent(resourceDTO.getCompanyId());
        if (current.isPresent() && current.get().getId().equals(resourceDTO.getId())) {
            this.findOne(resourceDTO.getId()).map(oldResource ->
                companyServiceExt.findOne(oldResource.getCompanyId()).map(company -> {
                    User companyOwner = company.getOwner();
                    if (companyOwner != null) {
                        Resource old = resourceMapper.toEntity(oldResource);
                        Resource resource = resourceMapper.toEntity(resourceDTO);
                        mailServiceExt.sendResourceUpdates(company, old, resource, companyOwner);
                    }
                    return company;
                })
            );
        }
        Resource resource = resourceMapper.toEntity(resourceDTO);
        resource = resourceRepositoryExt.save(resource);
        return resourceMapper.toDto(resource);
    }

    /**
     * resend a new invitation with ticket to resource.
     *
     * @param resourceId the id of resource
     * @return the updated resource
     */
    public ResourceDTO resendTicket(Long resourceId) {
        log.debug("Request to reset resend a resource invitation : {}", resourceId);

        return resourceRepositoryExt
            .findById(resourceId)
            .map(resource -> {
                if (resource.getUser() != null) {
                    throw new BadRequestAlertException("Resource already has an user", "resource", "useralreadyexist");
                }
                if (resource.getTicket() == null) {
                    resource.setTicket(RandomStringUtils.randomNumeric(32));
                }
                resource = resourceRepositoryExt.save(resource);
                if (resource.getUser() == null) {
                    sendWelcomeEmail(resource.getId());
                }
                return resourceMapper.toDto(resource);
            })
            .orElseThrow(() -> new BadRequestAlertException("Invalid id", "resource", "idnull"));
    }

    /**
     * Get one resource by id.
     *
     * @param id the id of the resource
     * @return the resource
     */
    @Transactional(readOnly = true)
    public Optional<ResourceDTO> findOne(Long id) {
        log.debug("Request to get Resource : {}", id);
        return resourceRepositoryExt.findById(id)
            .map(resourceMapper::toDto);
    }

    /**
     * Delete the resources by ids list.
     *
     * @param ids the ids list of the resources
     */
    public void delete(List<Long> ids) {
        log.debug("Request to delete Resources : {}", ids);
        resourceRepositoryExt.
            findAllByIdIn(ids)
            .forEach(resource -> {
                resourceConfigurationServiceExt.deleteByResource(resource);
                absenceValidatorServiceExt.removeFromCurrent(resource);
                absenceBalanceServiceExt.deleteBalances(resource);
                resourceRepositoryExt.deleteById(resource.getId());
            });
    }

    /**
     * Get all resources.
     *
     * @return the list of resources
     */
    @Transactional(readOnly = true)
    public List<Resource> getAll() {
        log.debug("Request to get all Resources: {}");
        return resourceRepositoryExt.findAll();
    }

    /**
     * Get the current resource.
     *
     * @param companyId the company id of resource to get
     * @return the resource
     */
    @Transactional(readOnly = true)
    public Optional<ResourceDTO> getCurrent(Long companyId) {
        log.debug("Request to get Current Resource : {}");
        return resourceRepositoryExt
            .findByUserIsCurrentUser()
            .stream()
            .filter(resource -> resource.getCompany().getId().equals(companyId))
            .findFirst()
            .map(resourceMapper::toDto);
    }

    /**
     * Get all the resources.
     *
     * @param pageable  the pagination information
     * @param companyId the company Id of resource
     * @param ids       the list of resources ids
     * @return the list of entities
     */
    @Transactional(readOnly = true)
    public Page<ResourceDTO> findAll(Pageable pageable, Long companyId, List<Long> ids) {
        log.debug("Request to get all Resources By companyId: {}, ids: {}", companyId, ids);
        if (companyId != null) {
            return resourceRepositoryExt.findAllByCompanyId(pageable, companyId)
                .map(resourceMapper::toDto);
        } else if (ids != null) {
            return resourceRepositoryExt.findAllByIdIn(pageable, ids)
                .map(resourceMapper::toDto);
        }
        return resourceRepositoryExt.findAll(pageable)
            .map(resourceMapper::toDto);
    }

    /**
     * Get one resourceDTO by ticket.
     *
     * @param ticket the ticket of the resource
     * @return the resource DTO
     */
    @Transactional(readOnly = true)
    public Optional<ResourceDTO> findOneByTicket(String ticket) {
        log.debug("Request to get Resource by ticket : {}", ticket);
        return resourceRepositoryExt.findByTicket(ticket)
            .map(resourceMapper::toDto);
    }

    /**
     * Assign an resource to current user account by ticket.
     *
     * @param ticket the ticket of the Resource
     */
    public void assignToAccount(String ticket) throws ConstraintViolationException {
        log.debug("Request to assign resource to current account by ticket : {}", ticket);
        resourceRepositoryExt.updateUserIdByTicket(ticket);
    }

    /**
     * Send welcome notification email to resource.
     *
     * @param resourceId the id of resource
     */
    private void sendWelcomeEmail(Long resourceId) {
        log.debug("Request to Send welcome notification email to Resource : {}", resourceId);
        resourceRepositoryExt
            .findById(resourceId)
            .ifPresent(resource ->
                companyServiceExt
                    .findOne(resource.getCompany().getId())
                    .ifPresent(company -> mailServiceExt.sendResourceWelcomenEmail(company, resource))
            );
    }

    /**
     * Check if Resource is active
     *
     * @param resourceId the id of resource
     * @return active or not
     */
    public boolean isActive(Long resourceId) {
        log.debug("Request to check if Resource {} is active", resourceId);
        return resourceConfigurationServiceExt.findByResource(resourceId)
            .map(ResourceConfigurationDTO::isActive)
            .orElse(false);
    }

    /**
     * Check for new resource ticket.
     *
     * @return ResourceDTO or null
     */
    public Optional<ResourceDTO> checkNewTickets() {
        log.debug("REST request to check for new Resource ticket");
        return resourceRepositoryExt.checkNewTickets().map(resourceMapper::toDto);
    }
}
