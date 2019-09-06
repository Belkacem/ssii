package com.zsoft.web.rest.extensions;

import com.zsoft.security.AuthoritiesConstants;
import com.zsoft.service.dto.CompanyDTO;
import com.zsoft.service.extensions.CompanyServiceExt;
import com.zsoft.web.rest.CompanyResource;
import com.zsoft.web.rest.errors.BadRequestAlertException;
import io.github.jhipster.web.util.ResponseUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;
import java.util.Optional;

/**
 * REST controller for managing Gateway configuration.
 */
@RestController
@RequestMapping("/api")
public class CompanyResourceExt {
    private final Logger log = LoggerFactory.getLogger(CompanyResource.class);
    private static final String ENTITY_NAME = "company";

    private CompanyServiceExt companyServiceExt;

    public CompanyResourceExt(CompanyServiceExt companyServiceExt) {
        this.companyServiceExt = companyServiceExt;
    }

    /**
     * GET /ext/companies/siren/:siren : get company info by siren number.
     *
     * @param siren the siren number of company
     * @return the ResponseEntity with status 200 (OK) and with body the company info
     */
    @GetMapping("companies/siren/{siren}")
    @Secured(AuthoritiesConstants.COMPANY_OWNER)
    public ResponseEntity<CompanyDTO> getBySiren(@PathVariable String siren) {
        Optional<CompanyDTO> companyDTO;
        // check if siren already exist on database
        if (companyServiceExt.isExist(siren)) {
            companyDTO = companyServiceExt.getBySiren(siren);
        } else {
            companyDTO = companyServiceExt.fetchBySiren(siren);
        }
        return ResponseUtil.wrapOrNotFound(companyDTO);
    }

    /**
     * POST /companies : Create a new company.
     *
     * @param companyDTO the companyDTO to create
     * @return the ResponseEntity with status 201 (Created) and with body the new companyDTO, or with status 400 (Bad Request) if the company has already an ID
     */
    @PostMapping(value = "/companies", params = {"override"})
    public ResponseEntity<CompanyDTO> createCompany(@Valid @RequestBody CompanyDTO companyDTO) {
        log.debug("REST request to save Company : {}", companyDTO);
        if (companyDTO.getId() != null) {
            throw new BadRequestAlertException("A new company cannot already have an ID", ENTITY_NAME, "idexists");
        }
        Optional<CompanyDTO> result = companyServiceExt.create(companyDTO);
        return ResponseUtil.wrapOrNotFound(result);
    }

    /**
     * Put /companies/connect/company_id : connect to company.
     *
     * @param company_id the id of company to connect
     * @return the ResponseEntity with status 200 (OK) and with body the companyDTO, or with status 404 (Not Found)
     */
    @PutMapping("/companies/connect")
    public ResponseEntity<Long> connect(@Valid @RequestParam Long company_id) {
        log.debug("REST request connection to Company : {}", company_id);

        if (company_id == null) {
            throw new BadRequestAlertException("the company ID not found", ENTITY_NAME, "notfound");
        }
        return ResponseUtil.wrapOrNotFound(companyServiceExt.saveCurrentCompanyConfiguration(company_id));
    }

    /**
     * GET /companies/current-company : get current connected company.
     *
     * @return the ResponseEntity with status 200 (OK) and with body the company_id, or with status 404 (Not Found)
     */
    @GetMapping("/companies/current-company")
    public ResponseEntity<CompanyDTO> getCurrentCompany() {
        log.debug("REST request current connected Company : {}");
        return ResponseUtil.wrapOrNotFound(companyServiceExt.getSession());
    }

    /**
     * GET  /companies : get all the companies.
     *
     * @return the ResponseEntity with status 200 (OK) and the list of companies in body
     */
    @GetMapping(value = "/companies", params = {"override"})
    public ResponseEntity<List<CompanyDTO>> getAllCompanies() {
        log.debug("REST request to get all Companies of current user");
        List<CompanyDTO> companies = companyServiceExt.findAll();
        return ResponseEntity.ok(companies);
    }
}
