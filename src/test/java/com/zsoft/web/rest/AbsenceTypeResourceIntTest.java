package com.zsoft.web.rest;

import com.zsoft.SsiiApp;

import com.zsoft.domain.AbsenceType;
import com.zsoft.repository.AbsenceTypeRepository;
import com.zsoft.service.AbsenceTypeService;
import com.zsoft.service.dto.AbsenceTypeDTO;
import com.zsoft.service.mapper.AbsenceTypeMapper;
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
import java.util.List;


import static com.zsoft.web.rest.TestUtil.createFormattingConversionService;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.zsoft.domain.enumeration.Gender;
/**
 * Test class for the AbsenceTypeResource REST controller.
 *
 * @see AbsenceTypeResource
 */
@RunWith(SpringRunner.class)
@SpringBootTest(classes = SsiiApp.class)
public class AbsenceTypeResourceIntTest {

    private static final String DEFAULT_TYPE = "AAAAAAAAAA";
    private static final String UPDATED_TYPE = "BBBBBBBBBB";

    private static final Integer DEFAULT_CODE = 1;
    private static final Integer UPDATED_CODE = 2;

    private static final Boolean DEFAULT_HAS_BALANCE = false;
    private static final Boolean UPDATED_HAS_BALANCE = true;

    private static final Gender DEFAULT_GENDER = Gender.MALE;
    private static final Gender UPDATED_GENDER = Gender.FEMALE;

    @Autowired
    private AbsenceTypeRepository absenceTypeRepository;

    @Autowired
    private AbsenceTypeMapper absenceTypeMapper;

    @Autowired
    private AbsenceTypeService absenceTypeService;

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

    private MockMvc restAbsenceTypeMockMvc;

    private AbsenceType absenceType;

    @Before
    public void setup() {
        MockitoAnnotations.initMocks(this);
        final AbsenceTypeResource absenceTypeResource = new AbsenceTypeResource(absenceTypeService);
        this.restAbsenceTypeMockMvc = MockMvcBuilders.standaloneSetup(absenceTypeResource)
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
    public static AbsenceType createEntity(EntityManager em) {
        AbsenceType absenceType = new AbsenceType()
            .type(DEFAULT_TYPE)
            .code(DEFAULT_CODE)
            .hasBalance(DEFAULT_HAS_BALANCE)
            .gender(DEFAULT_GENDER);
        return absenceType;
    }

    @Before
    public void initTest() {
        absenceType = createEntity(em);
    }

    @Test
    @Transactional
    public void createAbsenceType() throws Exception {
        int databaseSizeBeforeCreate = absenceTypeRepository.findAll().size();

        // Create the AbsenceType
        AbsenceTypeDTO absenceTypeDTO = absenceTypeMapper.toDto(absenceType);
        restAbsenceTypeMockMvc.perform(post("/api/absence-types")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(absenceTypeDTO)))
            .andExpect(status().isCreated());

        // Validate the AbsenceType in the database
        List<AbsenceType> absenceTypeList = absenceTypeRepository.findAll();
        assertThat(absenceTypeList).hasSize(databaseSizeBeforeCreate + 1);
        AbsenceType testAbsenceType = absenceTypeList.get(absenceTypeList.size() - 1);
        assertThat(testAbsenceType.getType()).isEqualTo(DEFAULT_TYPE);
        assertThat(testAbsenceType.getCode()).isEqualTo(DEFAULT_CODE);
        assertThat(testAbsenceType.isHasBalance()).isEqualTo(DEFAULT_HAS_BALANCE);
        assertThat(testAbsenceType.getGender()).isEqualTo(DEFAULT_GENDER);
    }

    @Test
    @Transactional
    public void createAbsenceTypeWithExistingId() throws Exception {
        int databaseSizeBeforeCreate = absenceTypeRepository.findAll().size();

        // Create the AbsenceType with an existing ID
        absenceType.setId(1L);
        AbsenceTypeDTO absenceTypeDTO = absenceTypeMapper.toDto(absenceType);

        // An entity with an existing ID cannot be created, so this API call must fail
        restAbsenceTypeMockMvc.perform(post("/api/absence-types")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(absenceTypeDTO)))
            .andExpect(status().isBadRequest());

        // Validate the AbsenceType in the database
        List<AbsenceType> absenceTypeList = absenceTypeRepository.findAll();
        assertThat(absenceTypeList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    public void checkTypeIsRequired() throws Exception {
        int databaseSizeBeforeTest = absenceTypeRepository.findAll().size();
        // set the field null
        absenceType.setType(null);

        // Create the AbsenceType, which fails.
        AbsenceTypeDTO absenceTypeDTO = absenceTypeMapper.toDto(absenceType);

        restAbsenceTypeMockMvc.perform(post("/api/absence-types")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(absenceTypeDTO)))
            .andExpect(status().isBadRequest());

        List<AbsenceType> absenceTypeList = absenceTypeRepository.findAll();
        assertThat(absenceTypeList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    public void checkCodeIsRequired() throws Exception {
        int databaseSizeBeforeTest = absenceTypeRepository.findAll().size();
        // set the field null
        absenceType.setCode(null);

        // Create the AbsenceType, which fails.
        AbsenceTypeDTO absenceTypeDTO = absenceTypeMapper.toDto(absenceType);

        restAbsenceTypeMockMvc.perform(post("/api/absence-types")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(absenceTypeDTO)))
            .andExpect(status().isBadRequest());

        List<AbsenceType> absenceTypeList = absenceTypeRepository.findAll();
        assertThat(absenceTypeList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    public void checkHasBalanceIsRequired() throws Exception {
        int databaseSizeBeforeTest = absenceTypeRepository.findAll().size();
        // set the field null
        absenceType.setHasBalance(null);

        // Create the AbsenceType, which fails.
        AbsenceTypeDTO absenceTypeDTO = absenceTypeMapper.toDto(absenceType);

        restAbsenceTypeMockMvc.perform(post("/api/absence-types")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(absenceTypeDTO)))
            .andExpect(status().isBadRequest());

        List<AbsenceType> absenceTypeList = absenceTypeRepository.findAll();
        assertThat(absenceTypeList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    public void getAllAbsenceTypes() throws Exception {
        // Initialize the database
        absenceTypeRepository.saveAndFlush(absenceType);

        // Get all the absenceTypeList
        restAbsenceTypeMockMvc.perform(get("/api/absence-types?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(absenceType.getId().intValue())))
            .andExpect(jsonPath("$.[*].type").value(hasItem(DEFAULT_TYPE.toString())))
            .andExpect(jsonPath("$.[*].code").value(hasItem(DEFAULT_CODE)))
            .andExpect(jsonPath("$.[*].hasBalance").value(hasItem(DEFAULT_HAS_BALANCE.booleanValue())))
            .andExpect(jsonPath("$.[*].gender").value(hasItem(DEFAULT_GENDER.toString())));
    }
    
    @Test
    @Transactional
    public void getAbsenceType() throws Exception {
        // Initialize the database
        absenceTypeRepository.saveAndFlush(absenceType);

        // Get the absenceType
        restAbsenceTypeMockMvc.perform(get("/api/absence-types/{id}", absenceType.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.id").value(absenceType.getId().intValue()))
            .andExpect(jsonPath("$.type").value(DEFAULT_TYPE.toString()))
            .andExpect(jsonPath("$.code").value(DEFAULT_CODE))
            .andExpect(jsonPath("$.hasBalance").value(DEFAULT_HAS_BALANCE.booleanValue()))
            .andExpect(jsonPath("$.gender").value(DEFAULT_GENDER.toString()));
    }

    @Test
    @Transactional
    public void getNonExistingAbsenceType() throws Exception {
        // Get the absenceType
        restAbsenceTypeMockMvc.perform(get("/api/absence-types/{id}", Long.MAX_VALUE))
            .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateAbsenceType() throws Exception {
        // Initialize the database
        absenceTypeRepository.saveAndFlush(absenceType);

        int databaseSizeBeforeUpdate = absenceTypeRepository.findAll().size();

        // Update the absenceType
        AbsenceType updatedAbsenceType = absenceTypeRepository.findById(absenceType.getId()).get();
        // Disconnect from session so that the updates on updatedAbsenceType are not directly saved in db
        em.detach(updatedAbsenceType);
        updatedAbsenceType
            .type(UPDATED_TYPE)
            .code(UPDATED_CODE)
            .hasBalance(UPDATED_HAS_BALANCE)
            .gender(UPDATED_GENDER);
        AbsenceTypeDTO absenceTypeDTO = absenceTypeMapper.toDto(updatedAbsenceType);

        restAbsenceTypeMockMvc.perform(put("/api/absence-types")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(absenceTypeDTO)))
            .andExpect(status().isOk());

        // Validate the AbsenceType in the database
        List<AbsenceType> absenceTypeList = absenceTypeRepository.findAll();
        assertThat(absenceTypeList).hasSize(databaseSizeBeforeUpdate);
        AbsenceType testAbsenceType = absenceTypeList.get(absenceTypeList.size() - 1);
        assertThat(testAbsenceType.getType()).isEqualTo(UPDATED_TYPE);
        assertThat(testAbsenceType.getCode()).isEqualTo(UPDATED_CODE);
        assertThat(testAbsenceType.isHasBalance()).isEqualTo(UPDATED_HAS_BALANCE);
        assertThat(testAbsenceType.getGender()).isEqualTo(UPDATED_GENDER);
    }

    @Test
    @Transactional
    public void updateNonExistingAbsenceType() throws Exception {
        int databaseSizeBeforeUpdate = absenceTypeRepository.findAll().size();

        // Create the AbsenceType
        AbsenceTypeDTO absenceTypeDTO = absenceTypeMapper.toDto(absenceType);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restAbsenceTypeMockMvc.perform(put("/api/absence-types")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(absenceTypeDTO)))
            .andExpect(status().isBadRequest());

        // Validate the AbsenceType in the database
        List<AbsenceType> absenceTypeList = absenceTypeRepository.findAll();
        assertThat(absenceTypeList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    public void deleteAbsenceType() throws Exception {
        // Initialize the database
        absenceTypeRepository.saveAndFlush(absenceType);

        int databaseSizeBeforeDelete = absenceTypeRepository.findAll().size();

        // Delete the absenceType
        restAbsenceTypeMockMvc.perform(delete("/api/absence-types/{id}", absenceType.getId())
            .accept(TestUtil.APPLICATION_JSON_UTF8))
            .andExpect(status().isOk());

        // Validate the database is empty
        List<AbsenceType> absenceTypeList = absenceTypeRepository.findAll();
        assertThat(absenceTypeList).hasSize(databaseSizeBeforeDelete - 1);
    }

    @Test
    @Transactional
    public void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(AbsenceType.class);
        AbsenceType absenceType1 = new AbsenceType();
        absenceType1.setId(1L);
        AbsenceType absenceType2 = new AbsenceType();
        absenceType2.setId(absenceType1.getId());
        assertThat(absenceType1).isEqualTo(absenceType2);
        absenceType2.setId(2L);
        assertThat(absenceType1).isNotEqualTo(absenceType2);
        absenceType1.setId(null);
        assertThat(absenceType1).isNotEqualTo(absenceType2);
    }

    @Test
    @Transactional
    public void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(AbsenceTypeDTO.class);
        AbsenceTypeDTO absenceTypeDTO1 = new AbsenceTypeDTO();
        absenceTypeDTO1.setId(1L);
        AbsenceTypeDTO absenceTypeDTO2 = new AbsenceTypeDTO();
        assertThat(absenceTypeDTO1).isNotEqualTo(absenceTypeDTO2);
        absenceTypeDTO2.setId(absenceTypeDTO1.getId());
        assertThat(absenceTypeDTO1).isEqualTo(absenceTypeDTO2);
        absenceTypeDTO2.setId(2L);
        assertThat(absenceTypeDTO1).isNotEqualTo(absenceTypeDTO2);
        absenceTypeDTO1.setId(null);
        assertThat(absenceTypeDTO1).isNotEqualTo(absenceTypeDTO2);
    }

    @Test
    @Transactional
    public void testEntityFromId() {
        assertThat(absenceTypeMapper.fromId(42L).getId()).isEqualTo(42);
        assertThat(absenceTypeMapper.fromId(null)).isNull();
    }
}
