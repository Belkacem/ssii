package com.zsoft.web.rest;

import com.zsoft.SsiiApp;

import com.zsoft.domain.StandardActivity;
import com.zsoft.domain.ActivityReport;
import com.zsoft.repository.StandardActivityRepository;
import com.zsoft.service.StandardActivityService;
import com.zsoft.service.dto.StandardActivityDTO;
import com.zsoft.service.mapper.StandardActivityMapper;
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
import java.time.Instant;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.List;


import static com.zsoft.web.rest.TestUtil.createFormattingConversionService;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.zsoft.domain.enumeration.ValidationStatus;
/**
 * Test class for the StandardActivityResource REST controller.
 *
 * @see StandardActivityResource
 */
@RunWith(SpringRunner.class)
@SpringBootTest(classes = SsiiApp.class)
public class StandardActivityResourceIntTest {

    private static final LocalDate DEFAULT_DATE = LocalDate.ofEpochDay(0L);
    private static final LocalDate UPDATED_DATE = LocalDate.now(ZoneId.systemDefault());

    private static final Boolean DEFAULT_MORNING = false;
    private static final Boolean UPDATED_MORNING = true;

    private static final Boolean DEFAULT_AFTERNOON = false;
    private static final Boolean UPDATED_AFTERNOON = true;

    private static final Instant DEFAULT_VALIDATION_DATE = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_VALIDATION_DATE = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final ValidationStatus DEFAULT_VALIDATION_STATUS = ValidationStatus.APPROVED;
    private static final ValidationStatus UPDATED_VALIDATION_STATUS = ValidationStatus.REJECTED;

    @Autowired
    private StandardActivityRepository standardActivityRepository;

    @Autowired
    private StandardActivityMapper standardActivityMapper;

    @Autowired
    private StandardActivityService standardActivityService;

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

    private MockMvc restStandardActivityMockMvc;

    private StandardActivity standardActivity;

    @Before
    public void setup() {
        MockitoAnnotations.initMocks(this);
        final StandardActivityResource standardActivityResource = new StandardActivityResource(standardActivityService);
        this.restStandardActivityMockMvc = MockMvcBuilders.standaloneSetup(standardActivityResource)
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
    public static StandardActivity createEntity(EntityManager em) {
        StandardActivity standardActivity = new StandardActivity()
            .date(DEFAULT_DATE)
            .morning(DEFAULT_MORNING)
            .afternoon(DEFAULT_AFTERNOON)
            .validationDate(DEFAULT_VALIDATION_DATE)
            .validationStatus(DEFAULT_VALIDATION_STATUS);
        // Add required entity
        ActivityReport activityReport = ActivityReportResourceIntTest.createEntity(em);
        em.persist(activityReport);
        em.flush();
        standardActivity.setActivityReport(activityReport);
        return standardActivity;
    }

    @Before
    public void initTest() {
        standardActivity = createEntity(em);
    }

    @Test
    @Transactional
    public void createStandardActivity() throws Exception {
        int databaseSizeBeforeCreate = standardActivityRepository.findAll().size();

        // Create the StandardActivity
        StandardActivityDTO standardActivityDTO = standardActivityMapper.toDto(standardActivity);
        restStandardActivityMockMvc.perform(post("/api/standard-activities")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(standardActivityDTO)))
            .andExpect(status().isCreated());

        // Validate the StandardActivity in the database
        List<StandardActivity> standardActivityList = standardActivityRepository.findAll();
        assertThat(standardActivityList).hasSize(databaseSizeBeforeCreate + 1);
        StandardActivity testStandardActivity = standardActivityList.get(standardActivityList.size() - 1);
        assertThat(testStandardActivity.getDate()).isEqualTo(DEFAULT_DATE);
        assertThat(testStandardActivity.isMorning()).isEqualTo(DEFAULT_MORNING);
        assertThat(testStandardActivity.isAfternoon()).isEqualTo(DEFAULT_AFTERNOON);
        assertThat(testStandardActivity.getValidationDate()).isEqualTo(DEFAULT_VALIDATION_DATE);
        assertThat(testStandardActivity.getValidationStatus()).isEqualTo(DEFAULT_VALIDATION_STATUS);
    }

    @Test
    @Transactional
    public void createStandardActivityWithExistingId() throws Exception {
        int databaseSizeBeforeCreate = standardActivityRepository.findAll().size();

        // Create the StandardActivity with an existing ID
        standardActivity.setId(1L);
        StandardActivityDTO standardActivityDTO = standardActivityMapper.toDto(standardActivity);

        // An entity with an existing ID cannot be created, so this API call must fail
        restStandardActivityMockMvc.perform(post("/api/standard-activities")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(standardActivityDTO)))
            .andExpect(status().isBadRequest());

        // Validate the StandardActivity in the database
        List<StandardActivity> standardActivityList = standardActivityRepository.findAll();
        assertThat(standardActivityList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    public void checkDateIsRequired() throws Exception {
        int databaseSizeBeforeTest = standardActivityRepository.findAll().size();
        // set the field null
        standardActivity.setDate(null);

        // Create the StandardActivity, which fails.
        StandardActivityDTO standardActivityDTO = standardActivityMapper.toDto(standardActivity);

        restStandardActivityMockMvc.perform(post("/api/standard-activities")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(standardActivityDTO)))
            .andExpect(status().isBadRequest());

        List<StandardActivity> standardActivityList = standardActivityRepository.findAll();
        assertThat(standardActivityList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    public void getAllStandardActivities() throws Exception {
        // Initialize the database
        standardActivityRepository.saveAndFlush(standardActivity);

        // Get all the standardActivityList
        restStandardActivityMockMvc.perform(get("/api/standard-activities?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(standardActivity.getId().intValue())))
            .andExpect(jsonPath("$.[*].date").value(hasItem(DEFAULT_DATE.toString())))
            .andExpect(jsonPath("$.[*].morning").value(hasItem(DEFAULT_MORNING.booleanValue())))
            .andExpect(jsonPath("$.[*].afternoon").value(hasItem(DEFAULT_AFTERNOON.booleanValue())))
            .andExpect(jsonPath("$.[*].validationDate").value(hasItem(DEFAULT_VALIDATION_DATE.toString())))
            .andExpect(jsonPath("$.[*].validationStatus").value(hasItem(DEFAULT_VALIDATION_STATUS.toString())));
    }
    
    @Test
    @Transactional
    public void getStandardActivity() throws Exception {
        // Initialize the database
        standardActivityRepository.saveAndFlush(standardActivity);

        // Get the standardActivity
        restStandardActivityMockMvc.perform(get("/api/standard-activities/{id}", standardActivity.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.id").value(standardActivity.getId().intValue()))
            .andExpect(jsonPath("$.date").value(DEFAULT_DATE.toString()))
            .andExpect(jsonPath("$.morning").value(DEFAULT_MORNING.booleanValue()))
            .andExpect(jsonPath("$.afternoon").value(DEFAULT_AFTERNOON.booleanValue()))
            .andExpect(jsonPath("$.validationDate").value(DEFAULT_VALIDATION_DATE.toString()))
            .andExpect(jsonPath("$.validationStatus").value(DEFAULT_VALIDATION_STATUS.toString()));
    }

    @Test
    @Transactional
    public void getNonExistingStandardActivity() throws Exception {
        // Get the standardActivity
        restStandardActivityMockMvc.perform(get("/api/standard-activities/{id}", Long.MAX_VALUE))
            .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateStandardActivity() throws Exception {
        // Initialize the database
        standardActivityRepository.saveAndFlush(standardActivity);

        int databaseSizeBeforeUpdate = standardActivityRepository.findAll().size();

        // Update the standardActivity
        StandardActivity updatedStandardActivity = standardActivityRepository.findById(standardActivity.getId()).get();
        // Disconnect from session so that the updates on updatedStandardActivity are not directly saved in db
        em.detach(updatedStandardActivity);
        updatedStandardActivity
            .date(UPDATED_DATE)
            .morning(UPDATED_MORNING)
            .afternoon(UPDATED_AFTERNOON)
            .validationDate(UPDATED_VALIDATION_DATE)
            .validationStatus(UPDATED_VALIDATION_STATUS);
        StandardActivityDTO standardActivityDTO = standardActivityMapper.toDto(updatedStandardActivity);

        restStandardActivityMockMvc.perform(put("/api/standard-activities")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(standardActivityDTO)))
            .andExpect(status().isOk());

        // Validate the StandardActivity in the database
        List<StandardActivity> standardActivityList = standardActivityRepository.findAll();
        assertThat(standardActivityList).hasSize(databaseSizeBeforeUpdate);
        StandardActivity testStandardActivity = standardActivityList.get(standardActivityList.size() - 1);
        assertThat(testStandardActivity.getDate()).isEqualTo(UPDATED_DATE);
        assertThat(testStandardActivity.isMorning()).isEqualTo(UPDATED_MORNING);
        assertThat(testStandardActivity.isAfternoon()).isEqualTo(UPDATED_AFTERNOON);
        assertThat(testStandardActivity.getValidationDate()).isEqualTo(UPDATED_VALIDATION_DATE);
        assertThat(testStandardActivity.getValidationStatus()).isEqualTo(UPDATED_VALIDATION_STATUS);
    }

    @Test
    @Transactional
    public void updateNonExistingStandardActivity() throws Exception {
        int databaseSizeBeforeUpdate = standardActivityRepository.findAll().size();

        // Create the StandardActivity
        StandardActivityDTO standardActivityDTO = standardActivityMapper.toDto(standardActivity);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restStandardActivityMockMvc.perform(put("/api/standard-activities")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(standardActivityDTO)))
            .andExpect(status().isBadRequest());

        // Validate the StandardActivity in the database
        List<StandardActivity> standardActivityList = standardActivityRepository.findAll();
        assertThat(standardActivityList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    public void deleteStandardActivity() throws Exception {
        // Initialize the database
        standardActivityRepository.saveAndFlush(standardActivity);

        int databaseSizeBeforeDelete = standardActivityRepository.findAll().size();

        // Delete the standardActivity
        restStandardActivityMockMvc.perform(delete("/api/standard-activities/{id}", standardActivity.getId())
            .accept(TestUtil.APPLICATION_JSON_UTF8))
            .andExpect(status().isOk());

        // Validate the database is empty
        List<StandardActivity> standardActivityList = standardActivityRepository.findAll();
        assertThat(standardActivityList).hasSize(databaseSizeBeforeDelete - 1);
    }

    @Test
    @Transactional
    public void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(StandardActivity.class);
        StandardActivity standardActivity1 = new StandardActivity();
        standardActivity1.setId(1L);
        StandardActivity standardActivity2 = new StandardActivity();
        standardActivity2.setId(standardActivity1.getId());
        assertThat(standardActivity1).isEqualTo(standardActivity2);
        standardActivity2.setId(2L);
        assertThat(standardActivity1).isNotEqualTo(standardActivity2);
        standardActivity1.setId(null);
        assertThat(standardActivity1).isNotEqualTo(standardActivity2);
    }

    @Test
    @Transactional
    public void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(StandardActivityDTO.class);
        StandardActivityDTO standardActivityDTO1 = new StandardActivityDTO();
        standardActivityDTO1.setId(1L);
        StandardActivityDTO standardActivityDTO2 = new StandardActivityDTO();
        assertThat(standardActivityDTO1).isNotEqualTo(standardActivityDTO2);
        standardActivityDTO2.setId(standardActivityDTO1.getId());
        assertThat(standardActivityDTO1).isEqualTo(standardActivityDTO2);
        standardActivityDTO2.setId(2L);
        assertThat(standardActivityDTO1).isNotEqualTo(standardActivityDTO2);
        standardActivityDTO1.setId(null);
        assertThat(standardActivityDTO1).isNotEqualTo(standardActivityDTO2);
    }

    @Test
    @Transactional
    public void testEntityFromId() {
        assertThat(standardActivityMapper.fromId(42L).getId()).isEqualTo(42);
        assertThat(standardActivityMapper.fromId(null)).isNull();
    }
}
