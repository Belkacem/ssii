package com.zsoft.service.extensions;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zsoft.domain.enumeration.Form;
import com.zsoft.repository.extensions.ClientRepositoryExt;
import com.zsoft.repository.extensions.SirenRepository;
import com.zsoft.service.dto.ClientDTO;
import com.zsoft.service.mapper.ClientMapper;
import com.zsoft.web.rest.errors.BadRequestAlertException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@SuppressWarnings("ALL")
@Service
@Transactional
public class ClientServiceExt {
    private final Logger log = LoggerFactory.getLogger(ClientServiceExt.class);

    private ClientRepositoryExt clientRepositoryExt;
    private SirenRepository sirenRepository;
    private ClientMapper clientMapper;

    public ClientServiceExt(
        ClientRepositoryExt clientRepositoryExt,
        SirenRepository sirenRepository,
        ClientMapper clientMapper
    ) {
        this.clientRepositoryExt = clientRepositoryExt;
        this.sirenRepository = sirenRepository;
        this.clientMapper = clientMapper;
    }

    public Optional<ClientDTO> getBySiren(String siren) {
        log.debug("Request to get Client by Siren : {}", siren);
        return clientRepositoryExt.findOneBySiren(siren)
            .map(clientMapper::toDto);
    }

    public Optional<ClientDTO> fetchBySiren(String siren) {
        log.debug("Request to Fetch Client by Siren : {}", siren);
        try {
            String JsonStrResult = sirenRepository.getSirenInfo(siren);
            ObjectMapper mapper = new ObjectMapper();
            JsonNode jsonObj = mapper.readTree(JsonStrResult);
            if (!jsonObj.get("sirene").isNull()) {
                JsonNode json = jsonObj.get("sirene").get("data").get("siege_social");
                ClientDTO clientDTO = new ClientDTO();
                clientDTO.setName(json.get("l1_normalisee").asText());
                clientDTO.setSiren(json.get("siren").asText());
                if (
                    !jsonObj.get("computed").isNull()
                        && !jsonObj.get("computed").get("data").isNull()
                        && !jsonObj.get("computed").get("data").get("numero_tva_intra").isNull()
                    ) {
                    clientDTO.setTva(jsonObj.get("computed").get("data").get("numero_tva_intra").asText());
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
                clientDTO.setForm(form);
                clientDTO.setAddressLine1(json.get("l4_normalisee").asText());
                clientDTO.setAddressLine2(json.get("libelle_region").asText());
                clientDTO.setCity(json.get("libelle_commune").asText());
                clientDTO.setPostalCode(json.get("code_postal").asText());
                if (json.get("l7_normalisee").isNull()) {
                    clientDTO.setCountry("France");
                } else {
                    clientDTO.setCountry(json.get("l7_normalisee").asText());
                }
                return Optional.of(clientDTO);
            } else {
                throw new BadRequestAlertException("Cannot find information by this Siren Number", "client", "siren.parse");
            }
        } catch (Exception e) {
            throw new BadRequestAlertException("Siren Number not exist", "client", "siren.notexist");
        }
    }

    /**
     * Get all the clients.
     *
     * @param pageable the pagination information
     * @param companyId the company id
     * @param ids the list of ids
     * @return the list of entities
     */
    @Transactional(readOnly = true)
    public Page<ClientDTO> findAll(Pageable pageable, Long companyId, List<Long> ids) {
        log.debug("Request to get all Clients");
        if (companyId != null) {
            return clientRepositoryExt.findAllByCompanyId(companyId, pageable)
                .map(clientMapper::toDto);
        }
        return clientRepositoryExt.findAllByIdIn(ids, pageable)
            .map(clientMapper::toDto);
    }
}
