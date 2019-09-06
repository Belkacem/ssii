package com.zsoft.service.extensions;

import com.zsoft.domain.PersistedConfiguration;
import com.zsoft.repository.extensions.PersistedConfigurationRepositoryExt;
import com.zsoft.service.UserService;
import com.zsoft.service.dto.PersistedConfigurationDTO;
import com.zsoft.service.mapper.PersistedConfigurationMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * Service Implementation for managing PersistedConfiguration.
 */
@Service
@Transactional
public class PersistedConfigurationServiceExt {
    private final Logger log = LoggerFactory.getLogger(PersistedConfigurationServiceExt.class);

    private final PersistedConfigurationRepositoryExt persistedConfigurationRepository;

    private final PersistedConfigurationMapper persistedConfigurationMapper;

    private final UserService userService;

    public PersistedConfigurationServiceExt(PersistedConfigurationRepositoryExt persistedConfigurationRepository, PersistedConfigurationMapper persistedConfigurationMapper, UserService userService) {
        this.persistedConfigurationRepository = persistedConfigurationRepository;
        this.persistedConfigurationMapper = persistedConfigurationMapper;
        this.userService = userService;
    }

    /**
     * Save a persistedConfiguration for current User
     *
     * @param key   the key of configuration
     * @param value the value of configuration
     * @return the persisted Configuration
     */
    public Optional<PersistedConfigurationDTO> save(String key, String value) {
        log.debug("Request to save PersistedConfiguration : {}", key);
        delete(key);
        PersistedConfiguration persistedConfiguration = new PersistedConfiguration().key(key).value(value);
        return userService.getUserWithAuthorities()
            .map(persistedConfiguration::user)
            .map(persistedConfigurationRepository::save)
            .map(persistedConfigurationMapper::toDto);
    }


    /**
     * Get one persistedConfiguration by key and current user.
     *
     * @param key the key of configuration
     * @return the persisted Configuration
     */
    @Transactional(readOnly = true)
    public Optional<PersistedConfigurationDTO> getByKeyCurrentUser(String key) {
        log.debug("Request to get PersistedConfiguration : {}", key);
        return persistedConfigurationRepository.findByUserIsCurrentUser()
            .stream()
            .filter(conf -> conf.getKey().equals(key))
            .findFirst()
            .map(persistedConfigurationMapper::toDto);
    }


    /**
     * Get one persistedConfiguration by key.
     *
     * @param key the key of configuration
     * @return the persisted Configuration
     */
    @Transactional(readOnly = true)
    public Optional<PersistedConfigurationDTO> getByKey(String key) {
        log.debug("Request to get PersistedConfiguration : {}", key);
        return persistedConfigurationRepository.findByKey(key)
            .map(persistedConfigurationMapper::toDto);
    }

    /**
     * Delete the persistedConfiguration by key.
     *
     * @param key the key of configuration
     */
    public void delete(String key) {
        log.debug("Request to delete PersistedConfiguration : {}", key);
        persistedConfigurationRepository.deleteByUserIsCurrentAndKey(key);
    }

    /**
     * Get all the persistedConfigurations.
     *
     * @param userId   the user id of configuration
     * @param key      the key of configuration
     * @param pageable the pagination information
     * @return the list of entities
     */
    @Transactional(readOnly = true)
    public Page<PersistedConfigurationDTO> findAll(Pageable pageable, Long userId, String key) {
        log.debug("Request to get all PersistedConfigurations by userId: {}, key: {}", userId, key);
        if (userId != null) {
            return persistedConfigurationRepository.findAllByUserId(userId, pageable)
                .map(persistedConfigurationMapper::toDto);
        } else if (key != null) {
            return persistedConfigurationRepository.findAllByKeyContains(key, pageable)
                .map(persistedConfigurationMapper::toDto);
        }
        return persistedConfigurationRepository.findAll(pageable)
            .map(persistedConfigurationMapper::toDto);
    }
}
