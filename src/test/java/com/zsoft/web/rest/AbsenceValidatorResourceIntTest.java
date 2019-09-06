package com.zsoft.web.rest;

import com.zsoft.SsiiApp;

import com.zsoft.domain.AbsenceValidator;
import com.zsoft.domain.Company;
import com.zsoft.repository.AbsenceValidatorRepository;
import com.zsoft.service.AbsenceValidatorService;
import com.zsoft.service.dto.AbsenceValidatorDTO;
import com.zsoft.service.mapper.AbsenceValidatorMapper;
import com.zsoft.web.rest.errors.ExceptionTranslator;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
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
import java.util.ArrayList;
import java.util.List;


import static com.zsoft.web.rest.TestUtil.createFormattingConversionService;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Test class for the AbsenceValidatorResource REST controller.
 *
 * @see AbsenceValidatorResource
 */
@RunWith(SpringRunner.class)
@SpringBootTest(classes = SsiiApp.class)
public class AbsenceValidatorResourceIntTest {

    private static final String DEFAULT_FULLNAME = "AAAAAAAAAA";
    private static final String UPDATED_FULLNAME = "BBBBBBBBBB";

    private static final String DEFAULT_EMAIL = "AAAAAAAAAA";
    private static final String UPDATED_EMAIL = "BBBBBBBBBB";

    private static final Instant DEFAULT_EMAIL_NOTIFICATION_DATE = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_EMAIL_NOTIFICATION_DATE = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final Boolean DEFAULT_ACTIVE = false;
    private static final Boolean UPDATED_ACTIVE = true;

    private static final String DEFAULT_TICKET = "AAAAAAAAAA";
    private static final String UPDATED_TICKET = "BBBBBBBBBB";

    @Autowired
    private AbsenceValidatorRepository absenceValidatorRepository;

    @Mock
    private AbsenceValidatorRepository absenceValidatorRepositoryMock;

    @Autowired
    private AbsenceValidatorMapper absenceValidatorMapper;

    @Mock
    private AbsenceValidatorService absenceValidatorServiceMock;

    @Autowired
    private AbsenceValidatorService absenceValidatorService;

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

    private MockMvc restAbsenceValidatorMockMvc;

    private AbsenceValidator absenceValidator;

    @Before
    public void setup() {
        MockitoAnnotations.initMocks(this);
        final AbsenceValidatorResource absenceValidatorResource = new AbsenceValidatorResource(absenceValidatorService);
        this.restAbsenceValidatorMockMvc = MockMvcBuilders.standaloneSetup(absenceValidatorResource)
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
    public static AbsenceValidator createEntity(EntityManager em) {
        AbsenceValidator absenceValidator = new AbsenceValidator()
            .fullname(DEFAULT_FULLNAME)
            .email(DEFAULT_EMAIL)
            .emailNotificationDate(DEFAULT_EMAIL_NOTIFICATION_DATE)
            .active(DEFAULT_ACTIVE)
            .ticket(DEFAULT_TICKET);
        // Add required entity
        Company company = CompanyResourceIntTest.createEntity(em);
        em.persist(company);
        em.flush();
        absenceValidator.setCompany(company);
        return absenceValidator;
    }

    @Before
    public void initTest() {
        absenceValidator = createEntity(em);
    }

    @Test
    @Transactional
    public void createAbsenceValidator() throws Exception {
        int databaseSizeBeforeCreate = absenceValidatorRepository.findAll().size();

        // Create the AbsenceValidator
        AbsenceValidatorDTO absenceValidatorDTO = absenceValidatorMapper.toDto(absenceValidator);
        restAbsenceValidatorMockMvc.perform(post("/api/absence-validators")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(absenceValidatorDTO)))
            .andExpect(status().isCreated());

        // Validate the AbsenceValidator in the database
        List<AbsenceValidator> absenceValidatorList = absenceValidatorRepository.findAll();
        assertThat(absenceValidatorList).hasSize(databaseSizeBeforeCreate + 1);
        AbsenceValidator testAbsenceValidator = absenceValidatorList.get(absenceValidatorList.size() - 1);
        assertThat(testAbsenceValidator.getFullname()).isEqualTo(DEFAULT_FULLNAME);
        assertThat(testAbsenceValidator.getEmail()).isEqualTo(DEFAULT_EMAIL);
        assertThat(testAbsenceValidator.getEmailNotificationDate()).isEqualTo(DEFAULT_EMAIL_NOTIFICATION_DATE);
        assertThat(testAbsenceValidator.isActive()).isEqualTo(DEFAULT_ACTIVE);
        assertThat(testAbsenceValidator.getTicket()).isEqualTo(DEFAULT_TICKET);
    }

    @Test
    @Transactional
    public void createAbsenceValidatorWithExistingId() throws Exception {
        int databaseSizeBeforeCreate = absenceValidatorRepository.findAll().size();

        // Create the AbsenceValidator with an existing ID
        absenceValidator.setId(1L);
        AbsenceValidatorDTO absenceValidatorDTO = absenceValidatorMapper.toDto(absenceValidator);

        // An entity with an existing ID cannot be created, so this API call must fail
        restAbsenceValidatorMockMvc.perform(post("/api/absence-validators")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(absenceValidatorDTO)))
            .andExpect(status().isBadRequest());

        // Validate the AbsenceValidator in the database
        List<AbsenceValidator> absenceValidatorList = absenceValidatorRepository.findAll();
        assertThat(absenceValidatorList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    public void checkFullnameIsRequired() throws Exception {
        int databaseSizeBeforeTest = absenceValidatorRepository.findAll().size();
        // set the field null
        absenceValidator.setFullname(null);

        // Create the AbsenceValidator, which fails.
        AbsenceValidatorDTO absenceValidatorDTO = absenceValidatorMapper.toDto(absenceValidator);

        restAbsenceValidatorMockMvc.perform(post("/api/absence-validators")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(absenceValidatorDTO)))
            .andExpect(status().isBadRequest());

        List<AbsenceValidator> absenceValidatorList = absenceValidatorRepository.findAll();
        assertThat(absenceValidatorList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    public void checkEmailIsRequired() throws Exception {
        int databaseSizeBeforeTest = absenceValidatorRepository.findAll().size();
        // set the field null
        absenceValidator.setEmail(null);

        // Create the AbsenceValidator, which fails.
        AbsenceValidatorDTO absenceValidatorDTO = absenceValidatorMapper.toDto(absenceValidator);

        restAbsenceValidatorMockMvc.perform(post("/api/absence-validators")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(absenceValidatorDTO)))
            .andExpect(status().isBadRequest());

        List<AbsenceValidator> absenceValidatorList = absenceValidatorRepository.findAll();
        assertThat(absenceValidatorList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    public void getAllAbsenceValidators() throws Exception {
        // Initialize the database
        absenceValidatorRepository.saveAndFlush(absenceValidator);

        // Get all the absenceValidatorList
        restAbsenceValidatorMockMvc.perform(get("/api/absence-validators?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(absenceValidator.getId().intValue())))
            .andExpect(jsonPath("$.[*].fullname").value(hasItem(DEFAULT_FULLNAME.toString())))
            .andExpect(jsonPath("$.[*].email").value(hasItem(DEFAULT_EMAIL.toString())))
            .andExpect(jsonPath("$.[*].emailNotificationDate").value(hasItem(DEFAULT_EMAIL_NOTIFICATION_DATE.toString())))
            .andExpect(jsonPath("$.[*].active").value(hasItem(DEFAULT_ACTIVE.booleanValue())))
            .andExpect(jsonPath("$.[*].ticket").value(hasItem(DEFAULT_TICKET.toString())));
    }
    
    @SuppressWarnings({"unchecked"})
    public void getAllAbsenceValidatorsWithEagerRelationshipsIsEnabled() throws Exception {
        AbsenceValidatorResource absenceValidatorResource = new AbsenceValidatorResource(absenceValidatorServiceMock);
        when(absenceValidatorServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        MockMvc restAbsenceValidatorMockMvc = MockMvcBuilders.standaloneSetup(absenceValidatorResource)
            .setCustomArgumentResolvers(pageableArgumentResolver)
            .setControllerAdvice(exceptionTranslator)
            .setConversionService(createFormattingConversionService())
            .setMessageConverters(jacksonMessageConverter).build();

        restAbsenceValidatorMockMvc.perform(get("/api/absence-validators?eagerload=true"))
        .andExpect(status().isOk());

        verify(absenceValidatorServiceMock, times(1)).findAllWithEagerRelationships(any());
    }

    @SuppressWarnings({"unchecked"})
    public void getAllAbsenceValidatorsWithEagerRelationshipsIsNotEnabled() throws Exception {
        AbsenceValidatorResource absenceValidatorResource = new AbsenceValidatorResource(absenceValidatorServiceMock);
            when(absenceValidatorServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));
            MockMvc restAbsenceValidatorMockMvc = MockMvcBuilders.standaloneSetup(absenceValidatorResource)
            .setCustomArgumentResolvers(pageableArgumentResolver)
            .setControllerAdvice(exceptionTranslator)
            .setConversionService(createFormattingConversionService())
            .setMessageConverters(jacksonMessageConverter).build();

        restAbsenceValidatorMockMvc.perform(get("/api/absence-validators?eagerload=true"))
        .andExpect(status().isOk());

            verify(absenceValidatorServiceMock, times(1)).findAllWithEagerRelationships(any());
    }

    @Test
    @Transactional
    public void getAbsenceValidator() throws Exception {
        // Initialize the database
        absenceValidatorRepository.saveAndFlush(absenceValidator);

        // Get the absenceValidator
        restAbsenceValidatorMockMvc.perform(get("/api/absence-validators/{id}", absenceValidator.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.id").value(absenceValidator.getId().intValue()))
            .andExpect(jsonPath("$.fullname").value(DEFAULT_FULLNAME.toString()))
            .andExpect(jsonPath("$.email").value(DEFAULT_EMAIL.toString()))
            .andExpect(jsonPath("$.emailNotificationDate").value(DEFAULT_EMAIL_NOTIFICATION_DATE.toString()))
            .andExpect(jsonPath("$.active").value(DEFAULT_ACTIVE.booleanValue()))
            .andExpect(jsonPath("$.ticket").value(DEFAULT_TICKET.toString()));
    }

    @Test
    @Transactional
    public void getNonExistingAbsenceValidator() throws Exception {
        // Get the absenceValidator
        restAbsenceValidatorMockMvc.perform(get("/api/absence-validators/{id}", Long.MAX_VALUE))
            .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateAbsenceValidator() throws Exception {
        // Initialize the database
        absenceValidatorRepository.saveAndFlush(absenceValidator);

        int databaseSizeBeforeUpdate = absenceValidatorRepository.findAll().size();

        // Update the absenceValidator
        AbsenceValidator updatedAbsenceValidator = absenceValidatorRepository.findById(absenceValidator.getId()).get();
        // Disconnect from session so that the updates on updatedAbsenceValidator are not directly saved in db
        em.detach(updatedAbsenceValidator);
        updatedAbsenceValidator
            .fullname(UPDATED_FULLNAME)
            .email(UPDATED_EMAIL)
            .emailNotificationDate(UPDATED_EMAIL_NOTIFICATION_DATE)
            .active(UPDATED_ACTIVE)
            .ticket(UPDATED_TICKET);
        AbsenceValidatorDTO absenceValidatorDTO = absenceValidatorMapper.toDto(updatedAbsenceValidator);

        restAbsenceValidatorMockMvc.perform(put("/api/absence-validators")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(absenceValidatorDTO)))
            .andExpect(status().isOk());

        // Validate the AbsenceValidator in the database
        List<AbsenceValidator> absenceValidatorList = absenceValidatorRepository.findAll();
        assertThat(absenceValidatorList).hasSize(databaseSizeBeforeUpdate);
        AbsenceValidator testAbsenceValidator = absenceValidatorList.get(absenceValidatorList.size() - 1);
        assertThat(testAbsenceValidator.getFullname()).isEqualTo(UPDATED_FULLNAME);
        assertThat(testAbsenceValidator.getEmail()).isEqualTo(UPDATED_EMAIL);
        assertThat(testAbsenceValidator.getEmailNotificationDate()).isEqualTo(UPDATED_EMAIL_NOTIFICATION_DATE);
        assertThat(testAbsenceValidator.isActive()).isEqualTo(UPDATED_ACTIVE);
        assertThat(testAbsenceValidator.getTicket()).isEqualTo(UPDATED_TICKET);
    }

    @Test
    @Transactional
    public void updateNonExistingAbsenceValidator() throws Exception {
        int databaseSizeBeforeUpdate = absenceValidatorRepository.findAll().size();

        // Create the AbsenceValidator
        AbsenceValidatorDTO absenceValidatorDTO = absenceValidatorMapper.toDto(absenceValidator);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restAbsenceValidatorMockMvc.perform(put("/api/absence-validators")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(absenceValidatorDTO)))
            .andExpect(status().isBadRequest());

        // Validate the AbsenceValidator in the database
        List<AbsenceValidator> absenceValidatorList = absenceValidatorRepository.findAll();
        assertThat(absenceValidatorList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    public void deleteAbsenceValidator() throws Exception {
        // Initialize the database
        absenceValidatorRepository.saveAndFlush(absenceValidator);

        int databaseSizeBeforeDelete = absenceValidatorRepository.findAll().size();

        // Delete the absenceValidator
        restAbsenceValidatorMockMvc.perform(delete("/api/absence-validators/{id}", absenceValidator.getId())
            .accept(TestUtil.APPLICATION_JSON_UTF8))
            .andExpect(status().isOk());

        // Validate the database is empty
        List<AbsenceValidator> absenceValidatorList = absenceValidatorRepository.findAll();
        assertThat(absenceValidatorList).hasSize(databaseSizeBeforeDelete - 1);
    }

    @Test
    @Transactional
    public void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(AbsenceValidator.class);
        AbsenceValidator absenceValidator1 = new AbsenceValidator();
        absenceValidator1.setId(1L);
        AbsenceValidator absenceValidator2 = new AbsenceValidator();
        absenceValidator2.setId(absenceValidator1.getId());
        assertThat(absenceValidator1).isEqualTo(absenceValidator2);
        absenceValidator2.setId(2L);
        assertThat(absenceValidator1).isNotEqualTo(absenceValidator2);
        absenceValidator1.setId(null);
        assertThat(absenceValidator1).isNotEqualTo(absenceValidator2);
    }

    @Test
    @Transactional
    public void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(AbsenceValidatorDTO.class);
        AbsenceValidatorDTO absenceValidatorDTO1 = new AbsenceValidatorDTO();
        absenceValidatorDTO1.setId(1L);
        AbsenceValidatorDTO absenceValidatorDTO2 = new AbsenceValidatorDTO();
        assertThat(absenceValidatorDTO1).isNotEqualTo(absenceValidatorDTO2);
        absenceValidatorDTO2.setId(absenceValidatorDTO1.getId());
        assertThat(absenceValidatorDTO1).isEqualTo(absenceValidatorDTO2);
        absenceValidatorDTO2.setId(2L);
        assertThat(absenceValidatorDTO1).isNotEqualTo(absenceValidatorDTO2);
        absenceValidatorDTO1.setId(null);
        assertThat(absenceValidatorDTO1).isNotEqualTo(absenceValidatorDTO2);
    }

    @Test
    @Transactional
    public void testEntityFromId() {
        assertThat(absenceValidatorMapper.fromId(42L).getId()).isEqualTo(42);
        assertThat(absenceValidatorMapper.fromId(null)).isNull();
    }
}
