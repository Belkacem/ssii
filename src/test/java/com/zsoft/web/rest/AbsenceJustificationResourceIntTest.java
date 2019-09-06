package com.zsoft.web.rest;

import com.zsoft.SsiiApp;

import com.zsoft.domain.AbsenceJustification;
import com.zsoft.domain.Absence;
import com.zsoft.repository.AbsenceJustificationRepository;
import com.zsoft.service.AbsenceJustificationService;
import com.zsoft.service.dto.AbsenceJustificationDTO;
import com.zsoft.service.mapper.AbsenceJustificationMapper;
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
import org.springframework.util.Base64Utils;
import org.springframework.validation.Validator;

import javax.persistence.EntityManager;
import java.util.List;


import static com.zsoft.web.rest.TestUtil.createFormattingConversionService;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Test class for the AbsenceJustificationResource REST controller.
 *
 * @see AbsenceJustificationResource
 */
@RunWith(SpringRunner.class)
@SpringBootTest(classes = SsiiApp.class)
public class AbsenceJustificationResourceIntTest {

    private static final byte[] DEFAULT_FILE = TestUtil.createByteArray(1, "0");
    private static final byte[] UPDATED_FILE = TestUtil.createByteArray(1, "1");
    private static final String DEFAULT_FILE_CONTENT_TYPE = "image/jpg";
    private static final String UPDATED_FILE_CONTENT_TYPE = "image/png";

    @Autowired
    private AbsenceJustificationRepository absenceJustificationRepository;

    @Autowired
    private AbsenceJustificationMapper absenceJustificationMapper;

    @Autowired
    private AbsenceJustificationService absenceJustificationService;

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

    private MockMvc restAbsenceJustificationMockMvc;

    private AbsenceJustification absenceJustification;

    @Before
    public void setup() {
        MockitoAnnotations.initMocks(this);
        final AbsenceJustificationResource absenceJustificationResource = new AbsenceJustificationResource(absenceJustificationService);
        this.restAbsenceJustificationMockMvc = MockMvcBuilders.standaloneSetup(absenceJustificationResource)
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
    public static AbsenceJustification createEntity(EntityManager em) {
        AbsenceJustification absenceJustification = new AbsenceJustification()
            .file(DEFAULT_FILE)
            .fileContentType(DEFAULT_FILE_CONTENT_TYPE);
        // Add required entity
        Absence absence = AbsenceResourceIntTest.createEntity(em);
        em.persist(absence);
        em.flush();
        absenceJustification.setAbsence(absence);
        return absenceJustification;
    }

    @Before
    public void initTest() {
        absenceJustification = createEntity(em);
    }

    @Test
    @Transactional
    public void createAbsenceJustification() throws Exception {
        int databaseSizeBeforeCreate = absenceJustificationRepository.findAll().size();

        // Create the AbsenceJustification
        AbsenceJustificationDTO absenceJustificationDTO = absenceJustificationMapper.toDto(absenceJustification);
        restAbsenceJustificationMockMvc.perform(post("/api/absence-justifications")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(absenceJustificationDTO)))
            .andExpect(status().isCreated());

        // Validate the AbsenceJustification in the database
        List<AbsenceJustification> absenceJustificationList = absenceJustificationRepository.findAll();
        assertThat(absenceJustificationList).hasSize(databaseSizeBeforeCreate + 1);
        AbsenceJustification testAbsenceJustification = absenceJustificationList.get(absenceJustificationList.size() - 1);
        assertThat(testAbsenceJustification.getFile()).isEqualTo(DEFAULT_FILE);
        assertThat(testAbsenceJustification.getFileContentType()).isEqualTo(DEFAULT_FILE_CONTENT_TYPE);
    }

    @Test
    @Transactional
    public void createAbsenceJustificationWithExistingId() throws Exception {
        int databaseSizeBeforeCreate = absenceJustificationRepository.findAll().size();

        // Create the AbsenceJustification with an existing ID
        absenceJustification.setId(1L);
        AbsenceJustificationDTO absenceJustificationDTO = absenceJustificationMapper.toDto(absenceJustification);

        // An entity with an existing ID cannot be created, so this API call must fail
        restAbsenceJustificationMockMvc.perform(post("/api/absence-justifications")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(absenceJustificationDTO)))
            .andExpect(status().isBadRequest());

        // Validate the AbsenceJustification in the database
        List<AbsenceJustification> absenceJustificationList = absenceJustificationRepository.findAll();
        assertThat(absenceJustificationList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    public void getAllAbsenceJustifications() throws Exception {
        // Initialize the database
        absenceJustificationRepository.saveAndFlush(absenceJustification);

        // Get all the absenceJustificationList
        restAbsenceJustificationMockMvc.perform(get("/api/absence-justifications?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(absenceJustification.getId().intValue())))
            .andExpect(jsonPath("$.[*].fileContentType").value(hasItem(DEFAULT_FILE_CONTENT_TYPE)))
            .andExpect(jsonPath("$.[*].file").value(hasItem(Base64Utils.encodeToString(DEFAULT_FILE))));
    }
    
    @Test
    @Transactional
    public void getAbsenceJustification() throws Exception {
        // Initialize the database
        absenceJustificationRepository.saveAndFlush(absenceJustification);

        // Get the absenceJustification
        restAbsenceJustificationMockMvc.perform(get("/api/absence-justifications/{id}", absenceJustification.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.id").value(absenceJustification.getId().intValue()))
            .andExpect(jsonPath("$.fileContentType").value(DEFAULT_FILE_CONTENT_TYPE))
            .andExpect(jsonPath("$.file").value(Base64Utils.encodeToString(DEFAULT_FILE)));
    }

    @Test
    @Transactional
    public void getNonExistingAbsenceJustification() throws Exception {
        // Get the absenceJustification
        restAbsenceJustificationMockMvc.perform(get("/api/absence-justifications/{id}", Long.MAX_VALUE))
            .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateAbsenceJustification() throws Exception {
        // Initialize the database
        absenceJustificationRepository.saveAndFlush(absenceJustification);

        int databaseSizeBeforeUpdate = absenceJustificationRepository.findAll().size();

        // Update the absenceJustification
        AbsenceJustification updatedAbsenceJustification = absenceJustificationRepository.findById(absenceJustification.getId()).get();
        // Disconnect from session so that the updates on updatedAbsenceJustification are not directly saved in db
        em.detach(updatedAbsenceJustification);
        updatedAbsenceJustification
            .file(UPDATED_FILE)
            .fileContentType(UPDATED_FILE_CONTENT_TYPE);
        AbsenceJustificationDTO absenceJustificationDTO = absenceJustificationMapper.toDto(updatedAbsenceJustification);

        restAbsenceJustificationMockMvc.perform(put("/api/absence-justifications")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(absenceJustificationDTO)))
            .andExpect(status().isOk());

        // Validate the AbsenceJustification in the database
        List<AbsenceJustification> absenceJustificationList = absenceJustificationRepository.findAll();
        assertThat(absenceJustificationList).hasSize(databaseSizeBeforeUpdate);
        AbsenceJustification testAbsenceJustification = absenceJustificationList.get(absenceJustificationList.size() - 1);
        assertThat(testAbsenceJustification.getFile()).isEqualTo(UPDATED_FILE);
        assertThat(testAbsenceJustification.getFileContentType()).isEqualTo(UPDATED_FILE_CONTENT_TYPE);
    }

    @Test
    @Transactional
    public void updateNonExistingAbsenceJustification() throws Exception {
        int databaseSizeBeforeUpdate = absenceJustificationRepository.findAll().size();

        // Create the AbsenceJustification
        AbsenceJustificationDTO absenceJustificationDTO = absenceJustificationMapper.toDto(absenceJustification);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restAbsenceJustificationMockMvc.perform(put("/api/absence-justifications")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(absenceJustificationDTO)))
            .andExpect(status().isBadRequest());

        // Validate the AbsenceJustification in the database
        List<AbsenceJustification> absenceJustificationList = absenceJustificationRepository.findAll();
        assertThat(absenceJustificationList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    public void deleteAbsenceJustification() throws Exception {
        // Initialize the database
        absenceJustificationRepository.saveAndFlush(absenceJustification);

        int databaseSizeBeforeDelete = absenceJustificationRepository.findAll().size();

        // Delete the absenceJustification
        restAbsenceJustificationMockMvc.perform(delete("/api/absence-justifications/{id}", absenceJustification.getId())
            .accept(TestUtil.APPLICATION_JSON_UTF8))
            .andExpect(status().isOk());

        // Validate the database is empty
        List<AbsenceJustification> absenceJustificationList = absenceJustificationRepository.findAll();
        assertThat(absenceJustificationList).hasSize(databaseSizeBeforeDelete - 1);
    }

    @Test
    @Transactional
    public void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(AbsenceJustification.class);
        AbsenceJustification absenceJustification1 = new AbsenceJustification();
        absenceJustification1.setId(1L);
        AbsenceJustification absenceJustification2 = new AbsenceJustification();
        absenceJustification2.setId(absenceJustification1.getId());
        assertThat(absenceJustification1).isEqualTo(absenceJustification2);
        absenceJustification2.setId(2L);
        assertThat(absenceJustification1).isNotEqualTo(absenceJustification2);
        absenceJustification1.setId(null);
        assertThat(absenceJustification1).isNotEqualTo(absenceJustification2);
    }

    @Test
    @Transactional
    public void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(AbsenceJustificationDTO.class);
        AbsenceJustificationDTO absenceJustificationDTO1 = new AbsenceJustificationDTO();
        absenceJustificationDTO1.setId(1L);
        AbsenceJustificationDTO absenceJustificationDTO2 = new AbsenceJustificationDTO();
        assertThat(absenceJustificationDTO1).isNotEqualTo(absenceJustificationDTO2);
        absenceJustificationDTO2.setId(absenceJustificationDTO1.getId());
        assertThat(absenceJustificationDTO1).isEqualTo(absenceJustificationDTO2);
        absenceJustificationDTO2.setId(2L);
        assertThat(absenceJustificationDTO1).isNotEqualTo(absenceJustificationDTO2);
        absenceJustificationDTO1.setId(null);
        assertThat(absenceJustificationDTO1).isNotEqualTo(absenceJustificationDTO2);
    }

    @Test
    @Transactional
    public void testEntityFromId() {
        assertThat(absenceJustificationMapper.fromId(42L).getId()).isEqualTo(42);
        assertThat(absenceJustificationMapper.fromId(null)).isNull();
    }
}
