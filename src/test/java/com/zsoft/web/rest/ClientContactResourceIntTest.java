package com.zsoft.web.rest;

import com.zsoft.SsiiApp;

import com.zsoft.domain.ClientContact;
import com.zsoft.domain.Client;
import com.zsoft.repository.ClientContactRepository;
import com.zsoft.service.ClientContactService;
import com.zsoft.service.dto.ClientContactDTO;
import com.zsoft.service.mapper.ClientContactMapper;
import com.zsoft.web.rest.errors.ExceptionTranslator;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.MockitoAnnotations;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.web.PageableHandlerMethodArgumentResolver;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.Validator;

import javax.persistence.EntityManager;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;


import static com.zsoft.web.rest.TestUtil.createFormattingConversionService;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Test class for the ClientContactResource REST controller.
 *
 * @see ClientContactResource
 */
@RunWith(SpringRunner.class)
@SpringBootTest(classes = SsiiApp.class)
public class ClientContactResourceIntTest {

    private static final String DEFAULT_FULLNAME = "AAAAAAAAAA";
    private static final String UPDATED_FULLNAME = "BBBBBBBBBB";

    private static final String DEFAULT_EMAIL = "AAAAAAAAAA";
    private static final String UPDATED_EMAIL = "BBBBBBBBBB";

    private static final String DEFAULT_PHONE_NUMBER = "AAAAAAAAAA";
    private static final String UPDATED_PHONE_NUMBER = "BBBBBBBBBB";

    private static final Instant DEFAULT_EMAIL_NOTIFICATION_DATE = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_EMAIL_NOTIFICATION_DATE = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final Boolean DEFAULT_ACTIVE = false;
    private static final Boolean UPDATED_ACTIVE = true;

    @Autowired
    private ClientContactRepository clientContactRepository;

    @Autowired
    private ClientContactMapper clientContactMapper;

    @Autowired
    private ClientContactService clientContactService;

    @Autowired
    private MappingJackson2HttpMessageConverter jacksonMessageConverter;

    @Autowired
    private PageableHandlerMethodArgumentResolver pageableArgumentResolver;

    @Autowired
    private ExceptionTranslator exceptionTranslator;

    @Autowired
    private EntityManager em;

    @Autowired
    private Validator validator;

    private MockMvc restClientContactMockMvc;

    private ClientContact clientContact;

    @Before
    public void setup() {
        MockitoAnnotations.initMocks(this);
        final ClientContactResource clientContactResource = new ClientContactResource(clientContactService);
        this.restClientContactMockMvc = MockMvcBuilders.standaloneSetup(clientContactResource)
            .setCustomArgumentResolvers(pageableArgumentResolver)
            .setControllerAdvice(exceptionTranslator)
            .setConversionService(createFormattingConversionService())
            .setMessageConverters(jacksonMessageConverter)
            .setValidator(validator).build();
    }

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static ClientContact createEntity(EntityManager em) {
        ClientContact clientContact = new ClientContact()
            .fullname(DEFAULT_FULLNAME)
            .email(DEFAULT_EMAIL)
            .phoneNumber(DEFAULT_PHONE_NUMBER)
            .emailNotificationDate(DEFAULT_EMAIL_NOTIFICATION_DATE)
            .active(DEFAULT_ACTIVE);
        // Add required entity
        Client client = ClientResourceIntTest.createEntity(em);
        em.persist(client);
        em.flush();
        clientContact.setClient(client);
        return clientContact;
    }

    @Before
    public void initTest() {
        clientContact = createEntity(em);
    }

    @Test
    @Transactional
    public void createClientContact() throws Exception {
        int databaseSizeBeforeCreate = clientContactRepository.findAll().size();

        // Create the ClientContact
        ClientContactDTO clientContactDTO = clientContactMapper.toDto(clientContact);
        restClientContactMockMvc.perform(post("/api/client-contacts")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(clientContactDTO)))
            .andExpect(status().isCreated());

        // Validate the ClientContact in the database
        List<ClientContact> clientContactList = clientContactRepository.findAll();
        assertThat(clientContactList).hasSize(databaseSizeBeforeCreate + 1);
        ClientContact testClientContact = clientContactList.get(clientContactList.size() - 1);
        assertThat(testClientContact.getFullname()).isEqualTo(DEFAULT_FULLNAME);
        assertThat(testClientContact.getEmail()).isEqualTo(DEFAULT_EMAIL);
        assertThat(testClientContact.getPhoneNumber()).isEqualTo(DEFAULT_PHONE_NUMBER);
        assertThat(testClientContact.getEmailNotificationDate()).isEqualTo(DEFAULT_EMAIL_NOTIFICATION_DATE);
        assertThat(testClientContact.isActive()).isEqualTo(DEFAULT_ACTIVE);
    }

    @Test
    @Transactional
    public void createClientContactWithExistingId() throws Exception {
        int databaseSizeBeforeCreate = clientContactRepository.findAll().size();

        // Create the ClientContact with an existing ID
        clientContact.setId(1L);
        ClientContactDTO clientContactDTO = clientContactMapper.toDto(clientContact);

        // An entity with an existing ID cannot be created, so this API call must fail
        restClientContactMockMvc.perform(post("/api/client-contacts")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(clientContactDTO)))
            .andExpect(status().isBadRequest());

        // Validate the ClientContact in the database
        List<ClientContact> clientContactList = clientContactRepository.findAll();
        assertThat(clientContactList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    public void checkFullnameIsRequired() throws Exception {
        int databaseSizeBeforeTest = clientContactRepository.findAll().size();
        // set the field null
        clientContact.setFullname(null);

        // Create the ClientContact, which fails.
        ClientContactDTO clientContactDTO = clientContactMapper.toDto(clientContact);

        restClientContactMockMvc.perform(post("/api/client-contacts")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(clientContactDTO)))
            .andExpect(status().isBadRequest());

        List<ClientContact> clientContactList = clientContactRepository.findAll();
        assertThat(clientContactList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    public void checkEmailIsRequired() throws Exception {
        int databaseSizeBeforeTest = clientContactRepository.findAll().size();
        // set the field null
        clientContact.setEmail(null);

        // Create the ClientContact, which fails.
        ClientContactDTO clientContactDTO = clientContactMapper.toDto(clientContact);

        restClientContactMockMvc.perform(post("/api/client-contacts")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(clientContactDTO)))
            .andExpect(status().isBadRequest());

        List<ClientContact> clientContactList = clientContactRepository.findAll();
        assertThat(clientContactList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    public void getAllClientContacts() throws Exception {
        // Initialize the database
        clientContactRepository.saveAndFlush(clientContact);

        // Get all the clientContactList
        restClientContactMockMvc.perform(get("/api/client-contacts?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(clientContact.getId().intValue())))
            .andExpect(jsonPath("$.[*].fullname").value(hasItem(DEFAULT_FULLNAME.toString())))
            .andExpect(jsonPath("$.[*].email").value(hasItem(DEFAULT_EMAIL.toString())))
            .andExpect(jsonPath("$.[*].phoneNumber").value(hasItem(DEFAULT_PHONE_NUMBER.toString())))
            .andExpect(jsonPath("$.[*].emailNotificationDate").value(hasItem(DEFAULT_EMAIL_NOTIFICATION_DATE.toString())))
            .andExpect(jsonPath("$.[*].active").value(hasItem(DEFAULT_ACTIVE.booleanValue())));
    }
    
    @Test
    @Transactional
    public void getClientContact() throws Exception {
        // Initialize the database
        clientContactRepository.saveAndFlush(clientContact);

        // Get the clientContact
        restClientContactMockMvc.perform(get("/api/client-contacts/{id}", clientContact.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.id").value(clientContact.getId().intValue()))
            .andExpect(jsonPath("$.fullname").value(DEFAULT_FULLNAME.toString()))
            .andExpect(jsonPath("$.email").value(DEFAULT_EMAIL.toString()))
            .andExpect(jsonPath("$.phoneNumber").value(DEFAULT_PHONE_NUMBER.toString()))
            .andExpect(jsonPath("$.emailNotificationDate").value(DEFAULT_EMAIL_NOTIFICATION_DATE.toString()))
            .andExpect(jsonPath("$.active").value(DEFAULT_ACTIVE.booleanValue()));
    }

    @Test
    @Transactional
    public void getNonExistingClientContact() throws Exception {
        // Get the clientContact
        restClientContactMockMvc.perform(get("/api/client-contacts/{id}", Long.MAX_VALUE))
            .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateClientContact() throws Exception {
        // Initialize the database
        clientContactRepository.saveAndFlush(clientContact);

        int databaseSizeBeforeUpdate = clientContactRepository.findAll().size();

        // Update the clientContact
        ClientContact updatedClientContact = clientContactRepository.findById(clientContact.getId()).get();
        // Disconnect from session so that the updates on updatedClientContact are not directly saved in db
        em.detach(updatedClientContact);
        updatedClientContact
            .fullname(UPDATED_FULLNAME)
            .email(UPDATED_EMAIL)
            .phoneNumber(UPDATED_PHONE_NUMBER)
            .emailNotificationDate(UPDATED_EMAIL_NOTIFICATION_DATE)
            .active(UPDATED_ACTIVE);
        ClientContactDTO clientContactDTO = clientContactMapper.toDto(updatedClientContact);

        restClientContactMockMvc.perform(put("/api/client-contacts")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(clientContactDTO)))
            .andExpect(status().isOk());

        // Validate the ClientContact in the database
        List<ClientContact> clientContactList = clientContactRepository.findAll();
        assertThat(clientContactList).hasSize(databaseSizeBeforeUpdate);
        ClientContact testClientContact = clientContactList.get(clientContactList.size() - 1);
        assertThat(testClientContact.getFullname()).isEqualTo(UPDATED_FULLNAME);
        assertThat(testClientContact.getEmail()).isEqualTo(UPDATED_EMAIL);
        assertThat(testClientContact.getPhoneNumber()).isEqualTo(UPDATED_PHONE_NUMBER);
        assertThat(testClientContact.getEmailNotificationDate()).isEqualTo(UPDATED_EMAIL_NOTIFICATION_DATE);
        assertThat(testClientContact.isActive()).isEqualTo(UPDATED_ACTIVE);
    }

    @Test
    @Transactional
    public void updateNonExistingClientContact() throws Exception {
        int databaseSizeBeforeUpdate = clientContactRepository.findAll().size();

        // Create the ClientContact
        ClientContactDTO clientContactDTO = clientContactMapper.toDto(clientContact);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restClientContactMockMvc.perform(put("/api/client-contacts")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(clientContactDTO)))
            .andExpect(status().isBadRequest());

        // Validate the ClientContact in the database
        List<ClientContact> clientContactList = clientContactRepository.findAll();
        assertThat(clientContactList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    public void deleteClientContact() throws Exception {
        // Initialize the database
        clientContactRepository.saveAndFlush(clientContact);

        int databaseSizeBeforeDelete = clientContactRepository.findAll().size();

        // Delete the clientContact
        restClientContactMockMvc.perform(delete("/api/client-contacts/{id}", clientContact.getId())
            .accept(TestUtil.APPLICATION_JSON_UTF8))
            .andExpect(status().isOk());

        // Validate the database is empty
        List<ClientContact> clientContactList = clientContactRepository.findAll();
        assertThat(clientContactList).hasSize(databaseSizeBeforeDelete - 1);
    }

    @Test
    @Transactional
    public void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(ClientContact.class);
        ClientContact clientContact1 = new ClientContact();
        clientContact1.setId(1L);
        ClientContact clientContact2 = new ClientContact();
        clientContact2.setId(clientContact1.getId());
        assertThat(clientContact1).isEqualTo(clientContact2);
        clientContact2.setId(2L);
        assertThat(clientContact1).isNotEqualTo(clientContact2);
        clientContact1.setId(null);
        assertThat(clientContact1).isNotEqualTo(clientContact2);
    }

    @Test
    @Transactional
    public void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(ClientContactDTO.class);
        ClientContactDTO clientContactDTO1 = new ClientContactDTO();
        clientContactDTO1.setId(1L);
        ClientContactDTO clientContactDTO2 = new ClientContactDTO();
        assertThat(clientContactDTO1).isNotEqualTo(clientContactDTO2);
        clientContactDTO2.setId(clientContactDTO1.getId());
        assertThat(clientContactDTO1).isEqualTo(clientContactDTO2);
        clientContactDTO2.setId(2L);
        assertThat(clientContactDTO1).isNotEqualTo(clientContactDTO2);
        clientContactDTO1.setId(null);
        assertThat(clientContactDTO1).isNotEqualTo(clientContactDTO2);
    }

    @Test
    @Transactional
    public void testEntityFromId() {
        assertThat(clientContactMapper.fromId(42L).getId()).isEqualTo(42);
        assertThat(clientContactMapper.fromId(null)).isNull();
    }
}
