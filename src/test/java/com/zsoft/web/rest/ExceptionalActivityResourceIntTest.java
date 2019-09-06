package com.zsoft.web.rest;

import com.zsoft.SsiiApp;

import com.zsoft.domain.ExceptionalActivity;
import com.zsoft.domain.ActivityReport;
import com.zsoft.repository.ExceptionalActivityRepository;
import com.zsoft.service.ExceptionalActivityService;
import com.zsoft.service.dto.ExceptionalActivityDTO;
import com.zsoft.service.mapper.ExceptionalActivityMapper;
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
import com.zsoft.domain.enumeration.ExceptionalActivityType;
/**
 * Test class for the ExceptionalActivityResource REST controller.
 *
 * @see ExceptionalActivityResource
 */
@RunWith(SpringRunner.class)
@SpringBootTest(classes = SsiiApp.class)
public class ExceptionalActivityResourceIntTest {

    private static final LocalDate DEFAULT_DATE = LocalDate.ofEpochDay(0L);
    private static final LocalDate UPDATED_DATE = LocalDate.now(ZoneId.systemDefault());

    private static final Float DEFAULT_START = 0F;
    private static final Float UPDATED_START = 1F;

    private static final Float DEFAULT_NB_HOURS = 0F;
    private static final Float UPDATED_NB_HOURS = 1F;

    private static final Instant DEFAULT_VALIDATION_DATE = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_VALIDATION_DATE = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final ValidationStatus DEFAULT_VALIDATION_STATUS = ValidationStatus.APPROVED;
    private static final ValidationStatus UPDATED_VALIDATION_STATUS = ValidationStatus.REJECTED;

    private static final ExceptionalActivityType DEFAULT_TYPE = ExceptionalActivityType.ASTREINTE_ACTIVE;
    private static final ExceptionalActivityType UPDATED_TYPE = ExceptionalActivityType.ASTREINTE_ACTIVE_SITE;

    @Autowired
    private ExceptionalActivityRepository exceptionalActivityRepository;

    @Autowired
    private ExceptionalActivityMapper exceptionalActivityMapper;

    @Autowired
    private ExceptionalActivityService exceptionalActivityService;

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

    private MockMvc restExceptionalActivityMockMvc;

    private ExceptionalActivity exceptionalActivity;

    @Before
    public void setup() {
        MockitoAnnotations.initMocks(this);
        final ExceptionalActivityResource exceptionalActivityResource = new ExceptionalActivityResource(exceptionalActivityService);
        this.restExceptionalActivityMockMvc = MockMvcBuilders.standaloneSetup(exceptionalActivityResource)
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
    public static ExceptionalActivity createEntity(EntityManager em) {
        ExceptionalActivity exceptionalActivity = new ExceptionalActivity()
            .date(DEFAULT_DATE)
            .start(DEFAULT_START)
            .nbHours(DEFAULT_NB_HOURS)
            .validationDate(DEFAULT_VALIDATION_DATE)
            .validationStatus(DEFAULT_VALIDATION_STATUS)
            .type(DEFAULT_TYPE);
        // Add required entity
        ActivityReport activityReport = ActivityReportResourceIntTest.createEntity(em);
        em.persist(activityReport);
        em.flush();
        exceptionalActivity.setActivityReport(activityReport);
        return exceptionalActivity;
    }

    @Before
    public void initTest() {
        exceptionalActivity = createEntity(em);
    }

    @Test
    @Transactional
    public void createExceptionalActivity() throws Exception {
        int databaseSizeBeforeCreate = exceptionalActivityRepository.findAll().size();

        // Create the ExceptionalActivity
        ExceptionalActivityDTO exceptionalActivityDTO = exceptionalActivityMapper.toDto(exceptionalActivity);
        restExceptionalActivityMockMvc.perform(post("/api/exceptional-activities")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(exceptionalActivityDTO)))
            .andExpect(status().isCreated());

        // Validate the ExceptionalActivity in the database
        List<ExceptionalActivity> exceptionalActivityList = exceptionalActivityRepository.findAll();
        assertThat(exceptionalActivityList).hasSize(databaseSizeBeforeCreate + 1);
        ExceptionalActivity testExceptionalActivity = exceptionalActivityList.get(exceptionalActivityList.size() - 1);
        assertThat(testExceptionalActivity.getDate()).isEqualTo(DEFAULT_DATE);
        assertThat(testExceptionalActivity.getStart()).isEqualTo(DEFAULT_START);
        assertThat(testExceptionalActivity.getNbHours()).isEqualTo(DEFAULT_NB_HOURS);
        assertThat(testExceptionalActivity.getValidationDate()).isEqualTo(DEFAULT_VALIDATION_DATE);
        assertThat(testExceptionalActivity.getValidationStatus()).isEqualTo(DEFAULT_VALIDATION_STATUS);
        assertThat(testExceptionalActivity.getType()).isEqualTo(DEFAULT_TYPE);
    }

    @Test
    @Transactional
    public void createExceptionalActivityWithExistingId() throws Exception {
        int databaseSizeBeforeCreate = exceptionalActivityRepository.findAll().size();

        // Create the ExceptionalActivity with an existing ID
        exceptionalActivity.setId(1L);
        ExceptionalActivityDTO exceptionalActivityDTO = exceptionalActivityMapper.toDto(exceptionalActivity);

        // An entity with an existing ID cannot be created, so this API call must fail
        restExceptionalActivityMockMvc.perform(post("/api/exceptional-activities")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(exceptionalActivityDTO)))
            .andExpect(status().isBadRequest());

        // Validate the ExceptionalActivity in the database
        List<ExceptionalActivity> exceptionalActivityList = exceptionalActivityRepository.findAll();
        assertThat(exceptionalActivityList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    public void checkDateIsRequired() throws Exception {
        int databaseSizeBeforeTest = exceptionalActivityRepository.findAll().size();
        // set the field null
        exceptionalActivity.setDate(null);

        // Create the ExceptionalActivity, which fails.
        ExceptionalActivityDTO exceptionalActivityDTO = exceptionalActivityMapper.toDto(exceptionalActivity);

        restExceptionalActivityMockMvc.perform(post("/api/exceptional-activities")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(exceptionalActivityDTO)))
            .andExpect(status().isBadRequest());

        List<ExceptionalActivity> exceptionalActivityList = exceptionalActivityRepository.findAll();
        assertThat(exceptionalActivityList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    public void checkNbHoursIsRequired() throws Exception {
        int databaseSizeBeforeTest = exceptionalActivityRepository.findAll().size();
        // set the field null
        exceptionalActivity.setNbHours(null);

        // Create the ExceptionalActivity, which fails.
        ExceptionalActivityDTO exceptionalActivityDTO = exceptionalActivityMapper.toDto(exceptionalActivity);

        restExceptionalActivityMockMvc.perform(post("/api/exceptional-activities")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(exceptionalActivityDTO)))
            .andExpect(status().isBadRequest());

        List<ExceptionalActivity> exceptionalActivityList = exceptionalActivityRepository.findAll();
        assertThat(exceptionalActivityList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    public void getAllExceptionalActivities() throws Exception {
        // Initialize the database
        exceptionalActivityRepository.saveAndFlush(exceptionalActivity);

        // Get all the exceptionalActivityList
        restExceptionalActivityMockMvc.perform(get("/api/exceptional-activities?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(exceptionalActivity.getId().intValue())))
            .andExpect(jsonPath("$.[*].date").value(hasItem(DEFAULT_DATE.toString())))
            .andExpect(jsonPath("$.[*].start").value(hasItem(DEFAULT_START.doubleValue())))
            .andExpect(jsonPath("$.[*].nbHours").value(hasItem(DEFAULT_NB_HOURS.doubleValue())))
            .andExpect(jsonPath("$.[*].validationDate").value(hasItem(DEFAULT_VALIDATION_DATE.toString())))
            .andExpect(jsonPath("$.[*].validationStatus").value(hasItem(DEFAULT_VALIDATION_STATUS.toString())))
            .andExpect(jsonPath("$.[*].type").value(hasItem(DEFAULT_TYPE.toString())));
    }
    
    @Test
    @Transactional
    public void getExceptionalActivity() throws Exception {
        // Initialize the database
        exceptionalActivityRepository.saveAndFlush(exceptionalActivity);

        // Get the exceptionalActivity
        restExceptionalActivityMockMvc.perform(get("/api/exceptional-activities/{id}", exceptionalActivity.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.id").value(exceptionalActivity.getId().intValue()))
            .andExpect(jsonPath("$.date").value(DEFAULT_DATE.toString()))
            .andExpect(jsonPath("$.start").value(DEFAULT_START.doubleValue()))
            .andExpect(jsonPath("$.nbHours").value(DEFAULT_NB_HOURS.doubleValue()))
            .andExpect(jsonPath("$.validationDate").value(DEFAULT_VALIDATION_DATE.toString()))
            .andExpect(jsonPath("$.validationStatus").value(DEFAULT_VALIDATION_STATUS.toString()))
            .andExpect(jsonPath("$.type").value(DEFAULT_TYPE.toString()));
    }

    @Test
    @Transactional
    public void getNonExistingExceptionalActivity() throws Exception {
        // Get the exceptionalActivity
        restExceptionalActivityMockMvc.perform(get("/api/exceptional-activities/{id}", Long.MAX_VALUE))
            .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateExceptionalActivity() throws Exception {
        // Initialize the database
        exceptionalActivityRepository.saveAndFlush(exceptionalActivity);

        int databaseSizeBeforeUpdate = exceptionalActivityRepository.findAll().size();

        // Update the exceptionalActivity
        ExceptionalActivity updatedExceptionalActivity = exceptionalActivityRepository.findById(exceptionalActivity.getId()).get();
        // Disconnect from session so that the updates on updatedExceptionalActivity are not directly saved in db
        em.detach(updatedExceptionalActivity);
        updatedExceptionalActivity
            .date(UPDATED_DATE)
            .start(UPDATED_START)
            .nbHours(UPDATED_NB_HOURS)
            .validationDate(UPDATED_VALIDATION_DATE)
            .validationStatus(UPDATED_VALIDATION_STATUS)
            .type(UPDATED_TYPE);
        ExceptionalActivityDTO exceptionalActivityDTO = exceptionalActivityMapper.toDto(updatedExceptionalActivity);

        restExceptionalActivityMockMvc.perform(put("/api/exceptional-activities")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(exceptionalActivityDTO)))
            .andExpect(status().isOk());

        // Validate the ExceptionalActivity in the database
        List<ExceptionalActivity> exceptionalActivityList = exceptionalActivityRepository.findAll();
        assertThat(exceptionalActivityList).hasSize(databaseSizeBeforeUpdate);
        ExceptionalActivity testExceptionalActivity = exceptionalActivityList.get(exceptionalActivityList.size() - 1);
        assertThat(testExceptionalActivity.getDate()).isEqualTo(UPDATED_DATE);
        assertThat(testExceptionalActivity.getStart()).isEqualTo(UPDATED_START);
        assertThat(testExceptionalActivity.getNbHours()).isEqualTo(UPDATED_NB_HOURS);
        assertThat(testExceptionalActivity.getValidationDate()).isEqualTo(UPDATED_VALIDATION_DATE);
        assertThat(testExceptionalActivity.getValidationStatus()).isEqualTo(UPDATED_VALIDATION_STATUS);
        assertThat(testExceptionalActivity.getType()).isEqualTo(UPDATED_TYPE);
    }

    @Test
    @Transactional
    public void updateNonExistingExceptionalActivity() throws Exception {
        int databaseSizeBeforeUpdate = exceptionalActivityRepository.findAll().size();

        // Create the ExceptionalActivity
        ExceptionalActivityDTO exceptionalActivityDTO = exceptionalActivityMapper.toDto(exceptionalActivity);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restExceptionalActivityMockMvc.perform(put("/api/exceptional-activities")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(exceptionalActivityDTO)))
            .andExpect(status().isBadRequest());

        // Validate the ExceptionalActivity in the database
        List<ExceptionalActivity> exceptionalActivityList = exceptionalActivityRepository.findAll();
        assertThat(exceptionalActivityList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    public void deleteExceptionalActivity() throws Exception {
        // Initialize the database
        exceptionalActivityRepository.saveAndFlush(exceptionalActivity);

        int databaseSizeBeforeDelete = exceptionalActivityRepository.findAll().size();

        // Delete the exceptionalActivity
        restExceptionalActivityMockMvc.perform(delete("/api/exceptional-activities/{id}", exceptionalActivity.getId())
            .accept(TestUtil.APPLICATION_JSON_UTF8))
            .andExpect(status().isOk());

        // Validate the database is empty
        List<ExceptionalActivity> exceptionalActivityList = exceptionalActivityRepository.findAll();
        assertThat(exceptionalActivityList).hasSize(databaseSizeBeforeDelete - 1);
    }

    @Test
    @Transactional
    public void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(ExceptionalActivity.class);
        ExceptionalActivity exceptionalActivity1 = new ExceptionalActivity();
        exceptionalActivity1.setId(1L);
        ExceptionalActivity exceptionalActivity2 = new ExceptionalActivity();
        exceptionalActivity2.setId(exceptionalActivity1.getId());
        assertThat(exceptionalActivity1).isEqualTo(exceptionalActivity2);
        exceptionalActivity2.setId(2L);
        assertThat(exceptionalActivity1).isNotEqualTo(exceptionalActivity2);
        exceptionalActivity1.setId(null);
        assertThat(exceptionalActivity1).isNotEqualTo(exceptionalActivity2);
    }

    @Test
    @Transactional
    public void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(ExceptionalActivityDTO.class);
        ExceptionalActivityDTO exceptionalActivityDTO1 = new ExceptionalActivityDTO();
        exceptionalActivityDTO1.setId(1L);
        ExceptionalActivityDTO exceptionalActivityDTO2 = new ExceptionalActivityDTO();
        assertThat(exceptionalActivityDTO1).isNotEqualTo(exceptionalActivityDTO2);
        exceptionalActivityDTO2.setId(exceptionalActivityDTO1.getId());
        assertThat(exceptionalActivityDTO1).isEqualTo(exceptionalActivityDTO2);
        exceptionalActivityDTO2.setId(2L);
        assertThat(exceptionalActivityDTO1).isNotEqualTo(exceptionalActivityDTO2);
        exceptionalActivityDTO1.setId(null);
        assertThat(exceptionalActivityDTO1).isNotEqualTo(exceptionalActivityDTO2);
    }

    @Test
    @Transactional
    public void testEntityFromId() {
        assertThat(exceptionalActivityMapper.fromId(42L).getId()).isEqualTo(42);
        assertThat(exceptionalActivityMapper.fromId(null)).isNull();
    }
}
