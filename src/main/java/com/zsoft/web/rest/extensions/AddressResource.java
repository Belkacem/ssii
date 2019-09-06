package com.zsoft.web.rest.extensions;

import com.zsoft.service.extensions.AddressService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller for managing Address Auto complete.
 */
@RestController
@RequestMapping("/api")
public class AddressResource {
    private final Logger log = LoggerFactory.getLogger(AddressResource.class);

    private AddressService addressService;

    public AddressResource(AddressService addressService) {
        this.addressService = addressService;
    }

    /**
     * GET  /api/address?q=:query : search addresses by query.
     *
     * @param query the query to find
     * @return the ResponseEntity with status 200 (OK) and with body the Addresses list
     */
    @GetMapping(value = "address", params = {"q"})
    public ResponseEntity<String> fetchAddress(@RequestParam("q") String query) {
        log.debug("Rest GET Addresses by query : {}", query);
        return ResponseEntity.ok(addressService.fetchAddresses(query));
    }
}
