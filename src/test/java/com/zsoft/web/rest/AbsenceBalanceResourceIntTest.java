package com.zsoft.web.rest;

import com.zsoft.SsiiApp;

import com.zsoft.domain.AbsenceBalance;
import com.zsoft.domain.AbsenceType;
import com.zsoft.domain.Resource;
import com.zsoft.repository.AbsenceBalanceRepository;
import com.zsoft.service.AbsenceBalanceService;
import com.zsoft.service.dto.AbsenceBalanceDTO;
import com.zsoft.service.mapper.AbsenceBalanceMapper;
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
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;


import static com.zsoft.web.rest.TestUtil.createFormattingConversionService;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Test class for the AbsenceBalanceResource REST controller.
 *
 * @see AbsenceBalanceResource
 */
@RunWith(SpringRunner.class)
@SpringBootTest(classes = SsiiApp.class)
public class AbsenceBalanceResourceIntTest {

    private static final LocalDate DEFAULT_DATE = LocalDate.ofEpochDay(0L);
    private static final LocalDate UPDATED_DATE = LocalDate.now(ZoneId.systemDefault());

    private static final Float DEFAULT_BALANCE = 1F;
    private static final Float UPDATED_BALANCE = 2F;

    private static final Float DEFAULT_TAKEN = 1F;
    private static final Float UPDATED_TAKEN = 2F;

    @Autowired
    private AbsenceBalanceRepository absenceBalanceRepository;

    @Autowired
    private AbsenceBalanceMapper absenceBalanceMapper;

    @Autowired
    private AbsenceBalanceService absenceBalanceService;

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

    private MockMvc restAbsenceBalanceMockMvc;

    private AbsenceBalance absenceBalance;

    @Before
    public void setup() {
        MockitoAnnotations.initMocks(this);
        final AbsenceBalanceResource absenceBalanceResource = new AbsenceBalanceResource(absenceBalanceService);
        this.restAbsenceBalanceMockMvc = MockMvcBuilders.standaloneSetup(absenceBalanceResource)
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
    public static AbsenceBalance createEntity(EntityManager em) {
        AbsenceBalance absenceBalance = new AbsenceBalance()
            .date(DEFAULT_DATE)
            .balance(DEFAULT_BALANCE)
            .taken(DEFAULT_TAKEN);
        // Add required entity
        AbsenceType absenceType = AbsenceTypeResourceIntTest.createEntity(em);
        em.persist(absenceType);
        em.flush();
        absenceBalance.setType(absenceType);
        // Add required entity
        Resource resource = ResourceResourceIntTest.createEntity(em);
        em.persist(resource);
        em.flush();
        absenceBalance.setResource(resource);
        return absenceBalance;
    }

    @Before
    public void initTest() {
        absenceBalance = createEntity(em);
    }

    @Test
    @Transactional
    public void createAbsenceBalance() throws Exception {
        int databaseSizeBeforeCreate = absenceBalanceRepository.findAll().size();

        // Create the AbsenceBalance
        AbsenceBalanceDTO absenceBalanceDTO = absenceBalanceMapper.toDto(absenceBalance);
        restAbsenceBalanceMockMvc.perform(post("/api/absence-balances")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(absenceBalanceDTO)))
            .andExpect(status().isCreated());

        // Validate the AbsenceBalance in the database
        List<AbsenceBalance> absenceBalanceList = absenceBalanceRepository.findAll();
        assertThat(absenceBalanceList).hasSize(databaseSizeBeforeCreate + 1);
        AbsenceBalance testAbsenceBalance = absenceBalanceList.get(absenceBalanceList.size() - 1);
        assertThat(testAbsenceBalance.getDate()).isEqualTo(DEFAULT_DATE);
        assertThat(testAbsenceBalance.getBalance()).isEqualTo(DEFAULT_BALANCE);
        assertThat(testAbsenceBalance.getTaken()).isEqualTo(DEFAULT_TAKEN);
    }

    @Test
    @Transactional
    public void createAbsenceBalanceWithExistingId() throws Exception {
        int databaseSizeBeforeCreate = absenceBalanceRepository.findAll().size();

        // Create the AbsenceBalance with an existing ID
        absenceBalance.setId(1L);
        AbsenceBalanceDTO absenceBalanceDTO = absenceBalanceMapper.toDto(absenceBalance);

        // An entity with an existing ID cannot be created, so this API call must fail
        restAbsenceBalanceMockMvc.perform(post("/api/absence-balances")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(absenceBalanceDTO)))
            .andExpect(status().isBadRequest());

        // Validate the AbsenceBalance in the database
        List<AbsenceBalance> absenceBalanceList = absenceBalanceRepository.findAll();
        assertThat(absenceBalanceList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    public void checkDateIsRequired() throws Exception {
        int databaseSizeBeforeTest = absenceBalanceRepository.findAll().size();
        // set the field null
        absenceBalance.setDate(null);

        // Create the AbsenceBalance, which fails.
        AbsenceBalanceDTO absenceBalanceDTO = absenceBalanceMapper.toDto(absenceBalance);

        restAbsenceBalanceMockMvc.perform(post("/api/absence-balances")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(absenceBalanceDTO)))
            .andExpect(status().isBadRequest());

        List<AbsenceBalance> absenceBalanceList = absenceBalanceRepository.findAll();
        assertThat(absenceBalanceList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    public void checkBalanceIsRequired() throws Exception {
        int databaseSizeBeforeTest = absenceBalanceRepository.findAll().size();
        // set the field null
        absenceBalance.setBalance(null);

        // Create the AbsenceBalance, which fails.
        AbsenceBalanceDTO absenceBalanceDTO = absenceBalanceMapper.toDto(absenceBalance);

        restAbsenceBalanceMockMvc.perform(post("/api/absence-balances")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(absenceBalanceDTO)))
            .andExpect(status().isBadRequest());

        List<AbsenceBalance> absenceBalanceList = absenceBalanceRepository.findAll();
        assertThat(absenceBalanceList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    public void checkTakenIsRequired() throws Exception {
        int databaseSizeBeforeTest = absenceBalanceRepository.findAll().size();
        // set the field null
        absenceBalance.setTaken(null);

        // Create the AbsenceBalance, which fails.
        AbsenceBalanceDTO absenceBalanceDTO = absenceBalanceMapper.toDto(absenceBalance);

        restAbsenceBalanceMockMvc.perform(post("/api/absence-balances")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(absenceBalanceDTO)))
            .andExpect(status().isBadRequest());

        List<AbsenceBalance> absenceBalanceList = absenceBalanceRepository.findAll();
        assertThat(absenceBalanceList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    public void getAllAbsenceBalances() throws Exception {
        // Initialize the database
        absenceBalanceRepository.saveAndFlush(absenceBalance);

        // Get all the absenceBalanceList
        restAbsenceBalanceMockMvc.perform(get("/api/absence-balances?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(absenceBalance.getId().intValue())))
            .andExpect(jsonPath("$.[*].date").value(hasItem(DEFAULT_DATE.toString())))
            .andExpect(jsonPath("$.[*].balance").value(hasItem(DEFAULT_BALANCE.doubleValue())))
            .andExpect(jsonPath("$.[*].taken").value(hasItem(DEFAULT_TAKEN.doubleValue())));
    }
    
    @Test
    @Transactional
    public void getAbsenceBalance() throws Exception {
        // Initialize the database
        absenceBalanceRepository.saveAndFlush(absenceBalance);

        // Get the absenceBalance
        restAbsenceBalanceMockMvc.perform(get("/api/absence-balances/{id}", absenceBalance.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.id").value(absenceBalance.getId().intValue()))
            .andExpect(jsonPath("$.date").value(DEFAULT_DATE.toString()))
            .andExpect(jsonPath("$.balance").value(DEFAULT_BALANCE.doubleValue()))
            .andExpect(jsonPath("$.taken").value(DEFAULT_TAKEN.doubleValue()));
    }

    @Test
    @Transactional
    public void getNonExistingAbsenceBalance() throws Exception {
        // Get the absenceBalance
        restAbsenceBalanceMockMvc.perform(get("/api/absence-balances/{id}", Long.MAX_VALUE))
            .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateAbsenceBalance() throws Exception {
        // Initialize the database
        absenceBalanceRepository.saveAndFlush(absenceBalance);

        int databaseSizeBeforeUpdate = absenceBalanceRepository.findAll().size();

        // Update the absenceBalance
        AbsenceBalance updatedAbsenceBalance = absenceBalanceRepository.findById(absenceBalance.getId()).get();
        // Disconnect from session so that the updates on updatedAbsenceBalance are not directly saved in db
        em.detach(updatedAbsenceBalance);
        updatedAbsenceBalance
            .date(UPDATED_DATE)
            .balance(UPDATED_BALANCE)
            .taken(UPDATED_TAKEN);
        AbsenceBalanceDTO absenceBalanceDTO = absenceBalanceMapper.toDto(updatedAbsenceBalance);

        restAbsenceBalanceMockMvc.perform(put("/api/absence-balances")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(absenceBalanceDTO)))
            .andExpect(status().isOk());

        // Validate the AbsenceBalance in the database
        List<AbsenceBalance> absenceBalanceList = absenceBalanceRepository.findAll();
        assertThat(absenceBalanceList).hasSize(databaseSizeBeforeUpdate);
        AbsenceBalance testAbsenceBalance = absenceBalanceList.get(absenceBalanceList.size() - 1);
        assertThat(testAbsenceBalance.getDate()).isEqualTo(UPDATED_DATE);
        assertThat(testAbsenceBalance.getBalance()).isEqualTo(UPDATED_BALANCE);
        assertThat(testAbsenceBalance.getTaken()).isEqualTo(UPDATED_TAKEN);
    }

    @Test
    @Transactional
    public void updateNonExistingAbsenceBalance() throws Exception {
        int databaseSizeBeforeUpdate = absenceBalanceRepository.findAll().size();

        // Create the AbsenceBalance
        AbsenceBalanceDTO absenceBalanceDTO = absenceBalanceMapper.toDto(absenceBalance);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restAbsenceBalanceMockMvc.perform(put("/api/absence-balances")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(absenceBalanceDTO)))
            .andExpect(status().isBadRequest());

        // Validate the AbsenceBalance in the database
        List<AbsenceBalance> absenceBalanceList = absenceBalanceRepository.findAll();
        assertThat(absenceBalanceList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    public void deleteAbsenceBalance() throws Exception {
        // Initialize the database
        absenceBalanceRepository.saveAndFlush(absenceBalance);

        int databaseSizeBeforeDelete = absenceBalanceRepository.findAll().size();

        // Delete the absenceBalance
        restAbsenceBalanceMockMvc.perform(delete("/api/absence-balances/{id}", absenceBalance.getId())
            .accept(TestUtil.APPLICATION_JSON_UTF8))
            .andExpect(status().isOk());

        // Validate the database is empty
        List<AbsenceBalance> absenceBalanceList = absenceBalanceRepository.findAll();
        assertThat(absenceBalanceList).hasSize(databaseSizeBeforeDelete - 1);
    }

    @Test
    @Transactional
    public void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(AbsenceBalance.class);
        AbsenceBalance absenceBalance1 = new AbsenceBalance();
        absenceBalance1.setId(1L);
        AbsenceBalance absenceBalance2 = new AbsenceBalance();
        absenceBalance2.setId(absenceBalance1.getId());
        assertThat(absenceBalance1).isEqualTo(absenceBalance2);
        absenceBalance2.setId(2L);
        assertThat(absenceBalance1).isNotEqualTo(absenceBalance2);
        absenceBalance1.setId(null);
        assertThat(absenceBalance1).isNotEqualTo(absenceBalance2);
    }

    @Test
    @Transactional
    public void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(AbsenceBalanceDTO.class);
        AbsenceBalanceDTO absenceBalanceDTO1 = new AbsenceBalanceDTO();
        absenceBalanceDTO1.setId(1L);
        AbsenceBalanceDTO absenceBalanceDTO2 = new AbsenceBalanceDTO();
        assertThat(absenceBalanceDTO1).isNotEqualTo(absenceBalanceDTO2);
        absenceBalanceDTO2.setId(absenceBalanceDTO1.getId());
        assertThat(absenceBalanceDTO1).isEqualTo(absenceBalanceDTO2);
        absenceBalanceDTO2.setId(2L);
        assertThat(absenceBalanceDTO1).isNotEqualTo(absenceBalanceDTO2);
        absenceBalanceDTO1.setId(null);
        assertThat(absenceBalanceDTO1).isNotEqualTo(absenceBalanceDTO2);
    }

    @Test
    @Transactional
    public void testEntityFromId() {
        assertThat(absenceBalanceMapper.fromId(42L).getId()).isEqualTo(42);
        assertThat(absenceBalanceMapper.fromId(null)).isNull();
    }
}
