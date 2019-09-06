package com.zsoft.service.extensions;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zsoft.config.Constants;
import com.zsoft.domain.Company;
import com.zsoft.domain.enumeration.Form;
import com.zsoft.repository.extensions.CompanyRepositoryExt;
import com.zsoft.repository.extensions.SirenRepository;
import com.zsoft.security.SecurityUtils;
import com.zsoft.service.UserService;
import com.zsoft.service.dto.CompanyDTO;
import com.zsoft.service.dto.ConstantDTO;
import com.zsoft.service.dto.PersistedConfigurationDTO;
import com.zsoft.service.mapper.CompanyMapper;
import com.zsoft.web.rest.errors.BadRequestAlertException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import static com.zsoft.config.PersistedConfigurationKeys.*;
import static java.lang.String.format;

@SuppressWarnings("ALL")
@Service
@Transactional
public class CompanyServiceExt {
    private final Logger log = LoggerFactory.getLogger(CompanyServiceExt.class);

    private final CompanyRepositoryExt companyRepositoryExt;
    private final SirenRepository sirenRepository;
    private final UserService userService;
    private final CompanyMapper companyMapper;
    private final PersistedConfigurationServiceExt persistedConfigurationService;
    private final ConstantServiceExt constantService;

    public CompanyServiceExt(
        CompanyRepositoryExt companyRepositoryExt,
        SirenRepository sirenRepository,
        UserService userService,
        CompanyMapper companyMapper,
        PersistedConfigurationServiceExt persistedConfigurationService,
        ConstantServiceExt constantService
    ) {
        this.companyRepositoryExt = companyRepositoryExt;
        this.sirenRepository = sirenRepository;
        this.userService = userService;
        this.companyMapper = companyMapper;
        this.persistedConfigurationService = persistedConfigurationService;
        this.constantService = constantService;
    }

    @Transactional(readOnly = true)
    public Optional<Company> findOne(Long id) {
        log.debug("Request to get Company : {}", id);
        return companyRepositoryExt.findById(id);
    }

    public Optional<CompanyDTO> getBySiren(String siren) {
        log.debug("Request to get Company by Siren : {}", siren);
        return companyRepositoryExt.findOneBySiren(siren)
            .map(companyMapper::toDto);
    }

    public Optional<CompanyDTO> getByDomainName(String domain) {
        log.debug("Request to get Company by Domain Name : {}", domain);
        return companyRepositoryExt.findOneByDomainName(domain)
            .map(companyMapper::toDto);
    }

    public Optional<CompanyDTO> fetchBySiren(String siren) {
        log.debug("Request to Fetch Company by Siren : {}", siren);
        try {
            String JsonStrResult = sirenRepository.getSirenInfo(siren);
            ObjectMapper mapper = new ObjectMapper();
            JsonNode jsonObj = mapper.readTree(JsonStrResult);
            if (!jsonObj.get("sirene").isNull()) {
                JsonNode json = jsonObj.get("sirene").get("data").get("siege_social");
                CompanyDTO companyDTO = new CompanyDTO();
                companyDTO.setName(json.get("l1_normalisee").asText());
                companyDTO.setSiren(json.get("siren").asText());
                if (
                    !jsonObj.get("computed").isNull()
                        && !jsonObj.get("computed").get("data").isNull()
                        && !jsonObj.get("computed").get("data").get("numero_tva_intra").isNull()
                    ) {
                    companyDTO.setTva(jsonObj.get("computed").get("data").get("numero_tva_intra").asText());
                }
                Form form = null;
                String libnj = json.get("libelle_nature_juridique_entreprise").asText();
                if (libnj.contains("SARL")) {
                    form = Form.SARL;
                } else if (libnj.contains("SAS")) {
                    form = Form.SAS;
                } else if (libnj.contains("Société")) {
                    form = Form.EURL;
                } else {
                    form = Form.SASU;
                }
                companyDTO.setForm(form);
                companyDTO.setAddressLine1(json.get("l4_normalisee").asText());
                companyDTO.setAddressLine2(json.get("libelle_region").asText());
                companyDTO.setCity(json.get("libelle_commune").asText());
                companyDTO.setPostalCode(json.get("code_postal").asText());
                if (json.get("l7_normalisee").isNull()) {
                    companyDTO.setCountry("France");
                } else {
                    companyDTO.setCountry(json.get("l7_normalisee").asText());
                }
                return Optional.of(companyDTO);
            } else {
                throw new BadRequestAlertException("Cannot find information by this Siren Number", "company", "siren.parse");
            }
        } catch (Exception e) {
            throw new BadRequestAlertException("Siren Number not exist", "company", "siren.notexist");
        }
    }

    public boolean isExist(String siren) {
        return companyRepositoryExt.findOneBySiren(siren).isPresent();
    }

    /**
     * Create a company.
     *
     * @param companyDTO the entity to save
     * @return the persisted entity
     */
    public Optional<CompanyDTO> create(CompanyDTO companyDTO) {
        log.debug("Request to save Company : {}", companyDTO);
        return SecurityUtils.getCurrentUserId()
            .map(userId -> {
                companyDTO.setOwnerId(userId);
                return companyDTO;
            })
            .map(companyMapper::toEntity)
            .map(companyRepositoryExt::save)
            .map(company -> {
                Optional<ConstantDTO> constantCP = constantService.getConstantByKey(DEFAULTS_CP_KEY);
                String companyCpKey = format(COMPANY_CP_KEY_FORMAT, company.getId());
                if (constantCP.isPresent()) {
                    persistedConfigurationService.save(companyCpKey, constantCP.get().getValue());
                } else {
                    persistedConfigurationService.save(companyCpKey, String.valueOf(Constants.DEFAULT_CP));
                }
                Optional<ConstantDTO> constantRTT = constantService.getConstantByKey(DEFAULTS_RTT_KEY);
                String companyRttKey = format(COMPANY_RTT_KEY_FORMAT, company.getId());
                if (constantRTT.isPresent()) {
                    persistedConfigurationService.save(companyRttKey, constantRTT.get().getValue());
                } else {
                    persistedConfigurationService.save(companyRttKey, String.valueOf(Constants.DEFAULT_RTT));
                }
                saveCurrentCompanyConfiguration(company.getId());
                // TODO create default roles for company owner (AbsenceValidator, ExpenseValidator)
                return company;
            })
            .map(companyMapper::toDto);
    }

    public Optional<Long> saveCurrentCompanyConfiguration(Long company_id) {
        return Optional.ofNullable(company_id)
            .map(companyId -> {
                persistedConfigurationService.save(CURRENT_COMPANY_CONFIGURATION_KEY, companyId.toString());
                return companyId;
            });
    }

    public Optional<CompanyDTO> getSession() {
        return getCurrentCompanyId()
            .flatMap(companyRepositoryExt::findById)
            .map(companyMapper::toDto);
    }

    public Optional<Long> getCurrentCompanyId() {
        Optional<Long> connected = persistedConfigurationService.getByKeyCurrentUser(CURRENT_COMPANY_CONFIGURATION_KEY)
            .map(PersistedConfigurationDTO::getValue)
            .map(Long::parseLong);
        if (connected.isPresent()) {
            return connected;
        } else {
            return this.findAll()
                .stream()
                .findFirst()
                .map(CompanyDTO::getId)
                .flatMap(this::saveCurrentCompanyConfiguration);
        }
    }

    /**
     * Get all the companies.
     *
     * @return the list of entities
     */
    @Transactional(readOnly = true)
    public List<CompanyDTO> findAll() {
        log.debug("Request to get all companies of current user {}");
        return companyRepositoryExt
            .findAllCurrentUserCompanies()
            .stream()
            .map(companyMapper::toDto)
            .collect(Collectors.toList());
    }
}
