package com.zsoft.web.rest;

import com.zsoft.SsiiApp;

import com.zsoft.domain.AbsenceBalanceAdjustment;
import com.zsoft.domain.AbsenceBalance;
import com.zsoft.repository.AbsenceBalanceAdjustmentRepository;
import com.zsoft.service.AbsenceBalanceAdjustmentService;
import com.zsoft.service.dto.AbsenceBalanceAdjustmentDTO;
import com.zsoft.service.mapper.AbsenceBalanceAdjustmentMapper;
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
 * Test class for the AbsenceBalanceAdjustmentResource REST controller.
 *
 * @see AbsenceBalanceAdjustmentResource
 */
@RunWith(SpringRunner.class)
@SpringBootTest(classes = SsiiApp.class)
public class AbsenceBalanceAdjustmentResourceIntTest {

    private static final LocalDate DEFAULT_DATE = LocalDate.ofEpochDay(0L);
    private static final LocalDate UPDATED_DATE = LocalDate.now(ZoneId.systemDefault());

    private static final Float DEFAULT_BALANCE = 1F;
    private static final Float UPDATED_BALANCE = 2F;

    private static final Boolean DEFAULT_MANUAL_ADJUSTMENT = false;
    private static final Boolean UPDATED_MANUAL_ADJUSTMENT = true;

    private static final String DEFAULT_COMMENT = "AAAAAAAAAA";
    private static final String UPDATED_COMMENT = "BBBBBBBBBB";

    @Autowired
    private AbsenceBalanceAdjustmentRepository absenceBalanceAdjustmentRepository;

    @Autowired
    private AbsenceBalanceAdjustmentMapper absenceBalanceAdjustmentMapper;

    @Autowired
    private AbsenceBalanceAdjustmentService absenceBalanceAdjustmentService;

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

    private MockMvc restAbsenceBalanceAdjustmentMockMvc;

    private AbsenceBalanceAdjustment absenceBalanceAdjustment;

    @Before
    public void setup() {
        MockitoAnnotations.initMocks(this);
        final AbsenceBalanceAdjustmentResource absenceBalanceAdjustmentResource = new AbsenceBalanceAdjustmentResource(absenceBalanceAdjustmentService);
        this.restAbsenceBalanceAdjustmentMockMvc = MockMvcBuilders.standaloneSetup(absenceBalanceAdjustmentResource)
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
    public static AbsenceBalanceAdjustment createEntity(EntityManager em) {
        AbsenceBalanceAdjustment absenceBalanceAdjustment = new AbsenceBalanceAdjustment()
            .date(DEFAULT_DATE)
            .balance(DEFAULT_BALANCE)
            .manualAdjustment(DEFAULT_MANUAL_ADJUSTMENT)
            .comment(DEFAULT_COMMENT);
        // Add required entity
        AbsenceBalance absenceBalance = AbsenceBalanceResourceIntTest.createEntity(em);
        em.persist(absenceBalance);
        em.flush();
        absenceBalanceAdjustment.setAbsenceBalance(absenceBalance);
        return absenceBalanceAdjustment;
    }

    @Before
    public void initTest() {
        absenceBalanceAdjustment = createEntity(em);
    }

    @Test
    @Transactional
    public void createAbsenceBalanceAdjustment() throws Exception {
        int databaseSizeBeforeCreate = absenceBalanceAdjustmentRepository.findAll().size();

        // Create the AbsenceBalanceAdjustment
        AbsenceBalanceAdjustmentDTO absenceBalanceAdjustmentDTO = absenceBalanceAdjustmentMapper.toDto(absenceBalanceAdjustment);
        restAbsenceBalanceAdjustmentMockMvc.perform(post("/api/absence-balance-adjustments")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(absenceBalanceAdjustmentDTO)))
            .andExpect(status().isCreated());

        // Validate the AbsenceBalanceAdjustment in the database
        List<AbsenceBalanceAdjustment> absenceBalanceAdjustmentList = absenceBalanceAdjustmentRepository.findAll();
        assertThat(absenceBalanceAdjustmentList).hasSize(databaseSizeBeforeCreate + 1);
        AbsenceBalanceAdjustment testAbsenceBalanceAdjustment = absenceBalanceAdjustmentList.get(absenceBalanceAdjustmentList.size() - 1);
        assertThat(testAbsenceBalanceAdjustment.getDate()).isEqualTo(DEFAULT_DATE);
        assertThat(testAbsenceBalanceAdjustment.getBalance()).isEqualTo(DEFAULT_BALANCE);
        assertThat(testAbsenceBalanceAdjustment.isManualAdjustment()).isEqualTo(DEFAULT_MANUAL_ADJUSTMENT);
        assertThat(testAbsenceBalanceAdjustment.getComment()).isEqualTo(DEFAULT_COMMENT);
    }

    @Test
    @Transactional
    public void createAbsenceBalanceAdjustmentWithExistingId() throws Exception {
        int databaseSizeBeforeCreate = absenceBalanceAdjustmentRepository.findAll().size();

        // Create the AbsenceBalanceAdjustment with an existing ID
        absenceBalanceAdjustment.setId(1L);
        AbsenceBalanceAdjustmentDTO absenceBalanceAdjustmentDTO = absenceBalanceAdjustmentMapper.toDto(absenceBalanceAdjustment);

        // An entity with an existing ID cannot be created, so this API call must fail
        restAbsenceBalanceAdjustmentMockMvc.perform(post("/api/absence-balance-adjustments")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(absenceBalanceAdjustmentDTO)))
            .andExpect(status().isBadRequest());

        // Validate the AbsenceBalanceAdjustment in the database
        List<AbsenceBalanceAdjustment> absenceBalanceAdjustmentList = absenceBalanceAdjustmentRepository.findAll();
        assertThat(absenceBalanceAdjustmentList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    public void checkDateIsRequired() throws Exception {
        int databaseSizeBeforeTest = absenceBalanceAdjustmentRepository.findAll().size();
        // set the field null
        absenceBalanceAdjustment.setDate(null);

        // Create the AbsenceBalanceAdjustment, which fails.
        AbsenceBalanceAdjustmentDTO absenceBalanceAdjustmentDTO = absenceBalanceAdjustmentMapper.toDto(absenceBalanceAdjustment);

        restAbsenceBalanceAdjustmentMockMvc.perform(post("/api/absence-balance-adjustments")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(absenceBalanceAdjustmentDTO)))
            .andExpect(status().isBadRequest());

        List<AbsenceBalanceAdjustment> absenceBalanceAdjustmentList = absenceBalanceAdjustmentRepository.findAll();
        assertThat(absenceBalanceAdjustmentList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    public void checkBalanceIsRequired() throws Exception {
        int databaseSizeBeforeTest = absenceBalanceAdjustmentRepository.findAll().size();
        // set the field null
        absenceBalanceAdjustment.setBalance(null);

        // Create the AbsenceBalanceAdjustment, which fails.
        AbsenceBalanceAdjustmentDTO absenceBalanceAdjustmentDTO = absenceBalanceAdjustmentMapper.toDto(absenceBalanceAdjustment);

        restAbsenceBalanceAdjustmentMockMvc.perform(post("/api/absence-balance-adjustments")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(absenceBalanceAdjustmentDTO)))
            .andExpect(status().isBadRequest());

        List<AbsenceBalanceAdjustment> absenceBalanceAdjustmentList = absenceBalanceAdjustmentRepository.findAll();
        assertThat(absenceBalanceAdjustmentList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    public void getAllAbsenceBalanceAdjustments() throws Exception {
        // Initialize the database
        absenceBalanceAdjustmentRepository.saveAndFlush(absenceBalanceAdjustment);

        // Get all the absenceBalanceAdjustmentList
        restAbsenceBalanceAdjustmentMockMvc.perform(get("/api/absence-balance-adjustments?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(absenceBalanceAdjustment.getId().intValue())))
            .andExpect(jsonPath("$.[*].date").value(hasItem(DEFAULT_DATE.toString())))
            .andExpect(jsonPath("$.[*].balance").value(hasItem(DEFAULT_BALANCE.doubleValue())))
            .andExpect(jsonPath("$.[*].manualAdjustment").value(hasItem(DEFAULT_MANUAL_ADJUSTMENT.booleanValue())))
            .andExpect(jsonPath("$.[*].comment").value(hasItem(DEFAULT_COMMENT.toString())));
    }
    
    @Test
    @Transactional
    public void getAbsenceBalanceAdjustment() throws Exception {
        // Initialize the database
        absenceBalanceAdjustmentRepository.saveAndFlush(absenceBalanceAdjustment);

        // Get the absenceBalanceAdjustment
        restAbsenceBalanceAdjustmentMockMvc.perform(get("/api/absence-balance-adjustments/{id}", absenceBalanceAdjustment.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.id").value(absenceBalanceAdjustment.getId().intValue()))
            .andExpect(jsonPath("$.date").value(DEFAULT_DATE.toString()))
            .andExpect(jsonPath("$.balance").value(DEFAULT_BALANCE.doubleValue()))
            .andExpect(jsonPath("$.manualAdjustment").value(DEFAULT_MANUAL_ADJUSTMENT.booleanValue()))
            .andExpect(jsonPath("$.comment").value(DEFAULT_COMMENT.toString()));
    }

    @Test
    @Transactional
    public void getNonExistingAbsenceBalanceAdjustment() throws Exception {
        // Get the absenceBalanceAdjustment
        restAbsenceBalanceAdjustmentMockMvc.perform(get("/api/absence-balance-adjustments/{id}", Long.MAX_VALUE))
            .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateAbsenceBalanceAdjustment() throws Exception {
        // Initialize the database
        absenceBalanceAdjustmentRepository.saveAndFlush(absenceBalanceAdjustment);

        int databaseSizeBeforeUpdate = absenceBalanceAdjustmentRepository.findAll().size();

        // Update the absenceBalanceAdjustment
        AbsenceBalanceAdjustment updatedAbsenceBalanceAdjustment = absenceBalanceAdjustmentRepository.findById(absenceBalanceAdjustment.getId()).get();
        // Disconnect from session so that the updates on updatedAbsenceBalanceAdjustment are not directly saved in db
        em.detach(updatedAbsenceBalanceAdjustment);
        updatedAbsenceBalanceAdjustment
            .date(UPDATED_DATE)
            .balance(UPDATED_BALANCE)
            .manualAdjustment(UPDATED_MANUAL_ADJUSTMENT)
            .comment(UPDATED_COMMENT);
        AbsenceBalanceAdjustmentDTO absenceBalanceAdjustmentDTO = absenceBalanceAdjustmentMapper.toDto(updatedAbsenceBalanceAdjustment);

        restAbsenceBalanceAdjustmentMockMvc.perform(put("/api/absence-balance-adjustments")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(absenceBalanceAdjustmentDTO)))
            .andExpect(status().isOk());

        // Validate the AbsenceBalanceAdjustment in the database
        List<AbsenceBalanceAdjustment> absenceBalanceAdjustmentList = absenceBalanceAdjustmentRepository.findAll();
        assertThat(absenceBalanceAdjustmentList).hasSize(databaseSizeBeforeUpdate);
        AbsenceBalanceAdjustment testAbsenceBalanceAdjustment = absenceBalanceAdjustmentList.get(absenceBalanceAdjustmentList.size() - 1);
        assertThat(testAbsenceBalanceAdjustment.getDate()).isEqualTo(UPDATED_DATE);
        assertThat(testAbsenceBalanceAdjustment.getBalance()).isEqualTo(UPDATED_BALANCE);
        assertThat(testAbsenceBalanceAdjustment.isManualAdjustment()).isEqualTo(UPDATED_MANUAL_ADJUSTMENT);
        assertThat(testAbsenceBalanceAdjustment.getComment()).isEqualTo(UPDATED_COMMENT);
    }

    @Test
    @Transactional
    public void updateNonExistingAbsenceBalanceAdjustment() throws Exception {
        int databaseSizeBeforeUpdate = absenceBalanceAdjustmentRepository.findAll().size();

        // Create the AbsenceBalanceAdjustment
        AbsenceBalanceAdjustmentDTO absenceBalanceAdjustmentDTO = absenceBalanceAdjustmentMapper.toDto(absenceBalanceAdjustment);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restAbsenceBalanceAdjustmentMockMvc.perform(put("/api/absence-balance-adjustments")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(absenceBalanceAdjustmentDTO)))
            .andExpect(status().isBadRequest());

        // Validate the AbsenceBalanceAdjustment in the database
        List<AbsenceBalanceAdjustment> absenceBalanceAdjustmentList = absenceBalanceAdjustmentRepository.findAll();
        assertThat(absenceBalanceAdjustmentList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    public void deleteAbsenceBalanceAdjustment() throws Exception {
        // Initialize the database
        absenceBalanceAdjustmentRepository.saveAndFlush(absenceBalanceAdjustment);

        int databaseSizeBeforeDelete = absenceBalanceAdjustmentRepository.findAll().size();

        // Delete the absenceBalanceAdjustment
        restAbsenceBalanceAdjustmentMockMvc.perform(delete("/api/absence-balance-adjustments/{id}", absenceBalanceAdjustment.getId())
            .accept(TestUtil.APPLICATION_JSON_UTF8))
            .andExpect(status().isOk());

        // Validate the database is empty
        List<AbsenceBalanceAdjustment> absenceBalanceAdjustmentList = absenceBalanceAdjustmentRepository.findAll();
        assertThat(absenceBalanceAdjustmentList).hasSize(databaseSizeBeforeDelete - 1);
    }

    @Test
    @Transactional
    public void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(AbsenceBalanceAdjustment.class);
        AbsenceBalanceAdjustment absenceBalanceAdjustment1 = new AbsenceBalanceAdjustment();
        absenceBalanceAdjustment1.setId(1L);
        AbsenceBalanceAdjustment absenceBalanceAdjustment2 = new AbsenceBalanceAdjustment();
        absenceBalanceAdjustment2.setId(absenceBalanceAdjustment1.getId());
        assertThat(absenceBalanceAdjustment1).isEqualTo(absenceBalanceAdjustment2);
        absenceBalanceAdjustment2.setId(2L);
        assertThat(absenceBalanceAdjustment1).isNotEqualTo(absenceBalanceAdjustment2);
        absenceBalanceAdjustment1.setId(null);
        assertThat(absenceBalanceAdjustment1).isNotEqualTo(absenceBalanceAdjustment2);
    }

    @Test
    @Transactional
    public void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(AbsenceBalanceAdjustmentDTO.class);
        AbsenceBalanceAdjustmentDTO absenceBalanceAdjustmentDTO1 = new AbsenceBalanceAdjustmentDTO();
        absenceBalanceAdjustmentDTO1.setId(1L);
        AbsenceBalanceAdjustmentDTO absenceBalanceAdjustmentDTO2 = new AbsenceBalanceAdjustmentDTO();
        assertThat(absenceBalanceAdjustmentDTO1).isNotEqualTo(absenceBalanceAdjustmentDTO2);
        absenceBalanceAdjustmentDTO2.setId(absenceBalanceAdjustmentDTO1.getId());
        assertThat(absenceBalanceAdjustmentDTO1).isEqualTo(absenceBalanceAdjustmentDTO2);
        absenceBalanceAdjustmentDTO2.setId(2L);
        assertThat(absenceBalanceAdjustmentDTO1).isNotEqualTo(absenceBalanceAdjustmentDTO2);
        absenceBalanceAdjustmentDTO1.setId(null);
        assertThat(absenceBalanceAdjustmentDTO1).isNotEqualTo(absenceBalanceAdjustmentDTO2);
    }

    @Test
    @Transactional
    public void testEntityFromId() {
        assertThat(absenceBalanceAdjustmentMapper.fromId(42L).getId()).isEqualTo(42);
        assertThat(absenceBalanceAdjustmentMapper.fromId(null)).isNull();
    }
}
