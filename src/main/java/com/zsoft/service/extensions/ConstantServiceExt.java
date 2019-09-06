package com.zsoft.service.extensions;

import com.zsoft.repository.extensions.ConstantRepositoryExt;
import com.zsoft.service.dto.ConstantDTO;
import com.zsoft.service.mapper.ConstantMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * Service Implementation for managing Constant.
 */
@Service
@Transactional
public class ConstantServiceExt {

    private final Logger log = LoggerFactory.getLogger(ConstantServiceExt.class);

    private final ConstantRepositoryExt constantRepositoryExt;

    private final ConstantMapper constantMapper;

    public ConstantServiceExt(
        ConstantRepositoryExt constantRepositoryExt,
        ConstantMapper constantMapper
    ) {
        this.constantRepositoryExt = constantRepositoryExt;
        this.constantMapper = constantMapper;
    }

    /**
     * Get one constant by key.
     *
     * @param key the key of the constant
     * @return the constant DTO
     */
    @Transactional(readOnly = true)
    public Optional<ConstantDTO> getConstantByKey(String key) {
        log.debug("Request to get Constant by key : {}", key);
        return constantRepositoryExt.findByKey(key)
            .map(constantMapper::toDto);
    }
}
