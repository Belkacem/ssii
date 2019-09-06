package com.zsoft.web.rest.extensions;

import com.zsoft.service.dto.PersistedConfigurationDTO;
import com.zsoft.service.extensions.PersistedConfigurationServiceExt;
import com.zsoft.web.rest.util.PaginationUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * REST controller for managing PersistedConfiguration.
 */
@RestController
@RequestMapping("/api")
public class PersistedConfigurationResourceExt {

    private final Logger log = LoggerFactory.getLogger(PersistedConfigurationResourceExt.class);

    private final PersistedConfigurationServiceExt persistedConfigurationServiceExt;

    public PersistedConfigurationResourceExt(PersistedConfigurationServiceExt persistedConfigurationServiceExt) {
        this.persistedConfigurationServiceExt = persistedConfigurationServiceExt;
    }

    /**
     * GET  /persisted-configurations : get all the persistedConfigurations.
     *
     * @param pageable the pagination information
     * @param userId   the user id of configuration
     * @param key      the key of configuration
     * @return the ResponseEntity with status 200 (OK) and the list of persistedConfigurations in body
     */
    @GetMapping(value = "/persisted-configurations", params = {"override"})
    public ResponseEntity<List<PersistedConfigurationDTO>> getAllPersistedConfigurations(
        Pageable pageable,
        @RequestParam(value = "userId", required = false) Long userId,
        @RequestParam(value = "key", required = false) String key
    ) {
        log.debug("REST request to get a page of PersistedConfigurations by userId: {}, key: {}", userId, key);
        Page<PersistedConfigurationDTO> page = persistedConfigurationServiceExt.findAll(pageable, userId, key);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/persisted-configurations");
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }
}
