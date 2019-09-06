package com.zsoft.service.extensions;

import com.zsoft.repository.extensions.AddressRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@SuppressWarnings("ALL")
@Service
@Transactional
public class AddressService {
    private final Logger log = LoggerFactory.getLogger(AddressService.class);

    private final AddressRepository addressRepository;

    public AddressService(AddressRepository addressRepository) {
        this.addressRepository = addressRepository;
    }

    public String fetchAddresses(String query) {
        log.debug("Request to Search Addresses by query : {}", query);
        return addressRepository.getAddresses(query);
    }
}
