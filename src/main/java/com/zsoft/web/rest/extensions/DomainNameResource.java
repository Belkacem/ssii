package com.zsoft.web.rest.extensions;

import com.zsoft.service.dto.CompanyDTO;
import com.zsoft.service.extensions.CompanyServiceExt;
import com.zsoft.web.rest.CompanyResource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.InetSocketAddress;
import java.util.Optional;

/**
 * REST controller for managing Gateway configuration.
 */
@RestController
@RequestMapping("/api")
public class DomainNameResource {
    private final Logger log = LoggerFactory.getLogger(CompanyResource.class);

    private CompanyServiceExt companyServiceExt;


    public DomainNameResource(CompanyServiceExt companyServiceExt) {
        this.companyServiceExt = companyServiceExt;
    }

    /**
     * GET /ext/host : get company by current domain name.
     *
     * @return the ResponseEntity with status 200 (OK) and with body the company info or Null
     */
    @GetMapping("host")
    public ResponseEntity<CompanyDTO> getCompanyByDomainName(@RequestHeader HttpHeaders headers) {
        InetSocketAddress host = headers.getHost();
        Optional<CompanyDTO> companyDTO = companyServiceExt.getByDomainName(host.getHostName());
        return ResponseEntity.ok().body(companyDTO.orElse(null));
    }
}
