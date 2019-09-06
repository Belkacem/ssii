package com.zsoft.web.rest;

import com.zsoft.SsiiApp;

import com.zsoft.domain.ExpenseValidator;
import com.zsoft.domain.Company;
import com.zsoft.repository.ExpenseValidatorRepository;
import com.zsoft.service.ExpenseValidatorService;
import com.zsoft.service.dto.ExpenseValidatorDTO;
import com.zsoft.service.mapper.ExpenseValidatorMapper;
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
 * Test class for the ExpenseValidatorResource REST controller.
 *
 * @see ExpenseValidatorResource
 */
@RunWith(SpringRunner.class)
@SpringBootTest(classes = SsiiApp.class)
public class ExpenseValidatorResourceIntTest {

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
    private ExpenseValidatorRepository expenseValidatorRepository;

    @Autowired
    private ExpenseValidatorMapper expenseValidatorMapper;

    @Autowired
    private ExpenseValidatorService expenseValidatorService;

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

    private MockMvc restExpenseValidatorMockMvc;

    private ExpenseValidator expenseValidator;

    @Before
    public void setup() {
        MockitoAnnotations.initMocks(this);
        final ExpenseValidatorResource expenseValidatorResource = new ExpenseValidatorResource(expenseValidatorService);
        this.restExpenseValidatorMockMvc = MockMvcBuilders.standaloneSetup(expenseValidatorResource)
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
    public static ExpenseValidator createEntity(EntityManager em) {
        ExpenseValidator expenseValidator = new ExpenseValidator()
            .fullname(DEFAULT_FULLNAME)
            .email(DEFAULT_EMAIL)
            .emailNotificationDate(DEFAULT_EMAIL_NOTIFICATION_DATE)
            .active(DEFAULT_ACTIVE)
            .ticket(DEFAULT_TICKET);
        // Add required entity
        Company company = CompanyResourceIntTest.createEntity(em);
        em.persist(company);
        em.flush();
        expenseValidator.setCompany(company);
        return expenseValidator;
    }

    @Before
    public void initTest() {
        expenseValidator = createEntity(em);
    }

    @Test
    @Transactional
    public void createExpenseValidator() throws Exception {
        int databaseSizeBeforeCreate = expenseValidatorRepository.findAll().size();

        // Create the ExpenseValidator
        ExpenseValidatorDTO expenseValidatorDTO = expenseValidatorMapper.toDto(expenseValidator);
        restExpenseValidatorMockMvc.perform(post("/api/expense-validators")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(expenseValidatorDTO)))
            .andExpect(status().isCreated());

        // Validate the ExpenseValidator in the database
        List<ExpenseValidator> expenseValidatorList = expenseValidatorRepository.findAll();
        assertThat(expenseValidatorList).hasSize(databaseSizeBeforeCreate + 1);
        ExpenseValidator testExpenseValidator = expenseValidatorList.get(expenseValidatorList.size() - 1);
        assertThat(testExpenseValidator.getFullname()).isEqualTo(DEFAULT_FULLNAME);
        assertThat(testExpenseValidator.getEmail()).isEqualTo(DEFAULT_EMAIL);
        assertThat(testExpenseValidator.getEmailNotificationDate()).isEqualTo(DEFAULT_EMAIL_NOTIFICATION_DATE);
        assertThat(testExpenseValidator.isActive()).isEqualTo(DEFAULT_ACTIVE);
        assertThat(testExpenseValidator.getTicket()).isEqualTo(DEFAULT_TICKET);
    }

    @Test
    @Transactional
    public void createExpenseValidatorWithExistingId() throws Exception {
        int databaseSizeBeforeCreate = expenseValidatorRepository.findAll().size();

        // Create the ExpenseValidator with an existing ID
        expenseValidator.setId(1L);
        ExpenseValidatorDTO expenseValidatorDTO = expenseValidatorMapper.toDto(expenseValidator);

        // An entity with an existing ID cannot be created, so this API call must fail
        restExpenseValidatorMockMvc.perform(post("/api/expense-validators")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(expenseValidatorDTO)))
            .andExpect(status().isBadRequest());

        // Validate the ExpenseValidator in the database
        List<ExpenseValidator> expenseValidatorList = expenseValidatorRepository.findAll();
        assertThat(expenseValidatorList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    public void checkFullnameIsRequired() throws Exception {
        int databaseSizeBeforeTest = expenseValidatorRepository.findAll().size();
        // set the field null
        expenseValidator.setFullname(null);

        // Create the ExpenseValidator, which fails.
        ExpenseValidatorDTO expenseValidatorDTO = expenseValidatorMapper.toDto(expenseValidator);

        restExpenseValidatorMockMvc.perform(post("/api/expense-validators")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(expenseValidatorDTO)))
            .andExpect(status().isBadRequest());

        List<ExpenseValidator> expenseValidatorList = expenseValidatorRepository.findAll();
        assertThat(expenseValidatorList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    public void checkEmailIsRequired() throws Exception {
        int databaseSizeBeforeTest = expenseValidatorRepository.findAll().size();
        // set the field null
        expenseValidator.setEmail(null);

        // Create the ExpenseValidator, which fails.
        ExpenseValidatorDTO expenseValidatorDTO = expenseValidatorMapper.toDto(expenseValidator);

        restExpenseValidatorMockMvc.perform(post("/api/expense-validators")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(expenseValidatorDTO)))
            .andExpect(status().isBadRequest());

        List<ExpenseValidator> expenseValidatorList = expenseValidatorRepository.findAll();
        assertThat(expenseValidatorList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    public void getAllExpenseValidators() throws Exception {
        // Initialize the database
        expenseValidatorRepository.saveAndFlush(expenseValidator);

        // Get all the expenseValidatorList
        restExpenseValidatorMockMvc.perform(get("/api/expense-validators?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(expenseValidator.getId().intValue())))
            .andExpect(jsonPath("$.[*].fullname").value(hasItem(DEFAULT_FULLNAME.toString())))
            .andExpect(jsonPath("$.[*].email").value(hasItem(DEFAULT_EMAIL.toString())))
            .andExpect(jsonPath("$.[*].emailNotificationDate").value(hasItem(DEFAULT_EMAIL_NOTIFICATION_DATE.toString())))
            .andExpect(jsonPath("$.[*].active").value(hasItem(DEFAULT_ACTIVE.booleanValue())))
            .andExpect(jsonPath("$.[*].ticket").value(hasItem(DEFAULT_TICKET.toString())));
    }
    
    @Test
    @Transactional
    public void getExpenseValidator() throws Exception {
        // Initialize the database
        expenseValidatorRepository.saveAndFlush(expenseValidator);

        // Get the expenseValidator
        restExpenseValidatorMockMvc.perform(get("/api/expense-validators/{id}", expenseValidator.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.id").value(expenseValidator.getId().intValue()))
            .andExpect(jsonPath("$.fullname").value(DEFAULT_FULLNAME.toString()))
            .andExpect(jsonPath("$.email").value(DEFAULT_EMAIL.toString()))
            .andExpect(jsonPath("$.emailNotificationDate").value(DEFAULT_EMAIL_NOTIFICATION_DATE.toString()))
            .andExpect(jsonPath("$.active").value(DEFAULT_ACTIVE.booleanValue()))
            .andExpect(jsonPath("$.ticket").value(DEFAULT_TICKET.toString()));
    }

    @Test
    @Transactional
    public void getNonExistingExpenseValidator() throws Exception {
        // Get the expenseValidator
        restExpenseValidatorMockMvc.perform(get("/api/expense-validators/{id}", Long.MAX_VALUE))
            .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateExpenseValidator() throws Exception {
        // Initialize the database
        expenseValidatorRepository.saveAndFlush(expenseValidator);

        int databaseSizeBeforeUpdate = expenseValidatorRepository.findAll().size();

        // Update the expenseValidator
        ExpenseValidator updatedExpenseValidator = expenseValidatorRepository.findById(expenseValidator.getId()).get();
        // Disconnect from session so that the updates on updatedExpenseValidator are not directly saved in db
        em.detach(updatedExpenseValidator);
        updatedExpenseValidator
            .fullname(UPDATED_FULLNAME)
            .email(UPDATED_EMAIL)
            .emailNotificationDate(UPDATED_EMAIL_NOTIFICATION_DATE)
            .active(UPDATED_ACTIVE)
            .ticket(UPDATED_TICKET);
        ExpenseValidatorDTO expenseValidatorDTO = expenseValidatorMapper.toDto(updatedExpenseValidator);

        restExpenseValidatorMockMvc.perform(put("/api/expense-validators")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(expenseValidatorDTO)))
            .andExpect(status().isOk());

        // Validate the ExpenseValidator in the database
        List<ExpenseValidator> expenseValidatorList = expenseValidatorRepository.findAll();
        assertThat(expenseValidatorList).hasSize(databaseSizeBeforeUpdate);
        ExpenseValidator testExpenseValidator = expenseValidatorList.get(expenseValidatorList.size() - 1);
        assertThat(testExpenseValidator.getFullname()).isEqualTo(UPDATED_FULLNAME);
        assertThat(testExpenseValidator.getEmail()).isEqualTo(UPDATED_EMAIL);
        assertThat(testExpenseValidator.getEmailNotificationDate()).isEqualTo(UPDATED_EMAIL_NOTIFICATION_DATE);
        assertThat(testExpenseValidator.isActive()).isEqualTo(UPDATED_ACTIVE);
        assertThat(testExpenseValidator.getTicket()).isEqualTo(UPDATED_TICKET);
    }

    @Test
    @Transactional
    public void updateNonExistingExpenseValidator() throws Exception {
        int databaseSizeBeforeUpdate = expenseValidatorRepository.findAll().size();

        // Create the ExpenseValidator
        ExpenseValidatorDTO expenseValidatorDTO = expenseValidatorMapper.toDto(expenseValidator);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restExpenseValidatorMockMvc.perform(put("/api/expense-validators")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(expenseValidatorDTO)))
            .andExpect(status().isBadRequest());

        // Validate the ExpenseValidator in the database
        List<ExpenseValidator> expenseValidatorList = expenseValidatorRepository.findAll();
        assertThat(expenseValidatorList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    public void deleteExpenseValidator() throws Exception {
        // Initialize the database
        expenseValidatorRepository.saveAndFlush(expenseValidator);

        int databaseSizeBeforeDelete = expenseValidatorRepository.findAll().size();

        // Delete the expenseValidator
        restExpenseValidatorMockMvc.perform(delete("/api/expense-validators/{id}", expenseValidator.getId())
            .accept(TestUtil.APPLICATION_JSON_UTF8))
            .andExpect(status().isOk());

        // Validate the database is empty
        List<ExpenseValidator> expenseValidatorList = expenseValidatorRepository.findAll();
        assertThat(expenseValidatorList).hasSize(databaseSizeBeforeDelete - 1);
    }

    @Test
    @Transactional
    public void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(ExpenseValidator.class);
        ExpenseValidator expenseValidator1 = new ExpenseValidator();
        expenseValidator1.setId(1L);
        ExpenseValidator expenseValidator2 = new ExpenseValidator();
        expenseValidator2.setId(expenseValidator1.getId());
        assertThat(expenseValidator1).isEqualTo(expenseValidator2);
        expenseValidator2.setId(2L);
        assertThat(expenseValidator1).isNotEqualTo(expenseValidator2);
        expenseValidator1.setId(null);
        assertThat(expenseValidator1).isNotEqualTo(expenseValidator2);
    }

    @Test
    @Transactional
    public void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(ExpenseValidatorDTO.class);
        ExpenseValidatorDTO expenseValidatorDTO1 = new ExpenseValidatorDTO();
        expenseValidatorDTO1.setId(1L);
        ExpenseValidatorDTO expenseValidatorDTO2 = new ExpenseValidatorDTO();
        assertThat(expenseValidatorDTO1).isNotEqualTo(expenseValidatorDTO2);
        expenseValidatorDTO2.setId(expenseValidatorDTO1.getId());
        assertThat(expenseValidatorDTO1).isEqualTo(expenseValidatorDTO2);
        expenseValidatorDTO2.setId(2L);
        assertThat(expenseValidatorDTO1).isNotEqualTo(expenseValidatorDTO2);
        expenseValidatorDTO1.setId(null);
        assertThat(expenseValidatorDTO1).isNotEqualTo(expenseValidatorDTO2);
    }

    @Test
    @Transactional
    public void testEntityFromId() {
        assertThat(expenseValidatorMapper.fromId(42L).getId()).isEqualTo(42);
        assertThat(expenseValidatorMapper.fromId(null)).isNull();
    }
}
