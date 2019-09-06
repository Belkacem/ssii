package com.zsoft.web.rest;

import com.zsoft.SsiiApp;

import com.zsoft.domain.ExpenseType;
import com.zsoft.repository.ExpenseTypeRepository;
import com.zsoft.service.ExpenseTypeService;
import com.zsoft.service.dto.ExpenseTypeDTO;
import com.zsoft.service.mapper.ExpenseTypeMapper;
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

/**
 * Test class for the ExpenseTypeResource REST controller.
 *
 * @see ExpenseTypeResource
 */
@RunWith(SpringRunner.class)
@SpringBootTest(classes = SsiiApp.class)
public class ExpenseTypeResourceIntTest {

    private static final String DEFAULT_TYPE = "AAAAAAAAAA";
    private static final String UPDATED_TYPE = "BBBBBBBBBB";

    private static final Integer DEFAULT_CODE = 1;
    private static final Integer UPDATED_CODE = 2;

    @Autowired
    private ExpenseTypeRepository expenseTypeRepository;

    @Autowired
    private ExpenseTypeMapper expenseTypeMapper;

    @Autowired
    private ExpenseTypeService expenseTypeService;

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

    private MockMvc restExpenseTypeMockMvc;

    private ExpenseType expenseType;

    @Before
    public void setup() {
        MockitoAnnotations.initMocks(this);
        final ExpenseTypeResource expenseTypeResource = new ExpenseTypeResource(expenseTypeService);
        this.restExpenseTypeMockMvc = MockMvcBuilders.standaloneSetup(expenseTypeResource)
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
    public static ExpenseType createEntity(EntityManager em) {
        ExpenseType expenseType = new ExpenseType()
            .type(DEFAULT_TYPE)
            .code(DEFAULT_CODE);
        return expenseType;
    }

    @Before
    public void initTest() {
        expenseType = createEntity(em);
    }

    @Test
    @Transactional
    public void createExpenseType() throws Exception {
        int databaseSizeBeforeCreate = expenseTypeRepository.findAll().size();

        // Create the ExpenseType
        ExpenseTypeDTO expenseTypeDTO = expenseTypeMapper.toDto(expenseType);
        restExpenseTypeMockMvc.perform(post("/api/expense-types")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(expenseTypeDTO)))
            .andExpect(status().isCreated());

        // Validate the ExpenseType in the database
        List<ExpenseType> expenseTypeList = expenseTypeRepository.findAll();
        assertThat(expenseTypeList).hasSize(databaseSizeBeforeCreate + 1);
        ExpenseType testExpenseType = expenseTypeList.get(expenseTypeList.size() - 1);
        assertThat(testExpenseType.getType()).isEqualTo(DEFAULT_TYPE);
        assertThat(testExpenseType.getCode()).isEqualTo(DEFAULT_CODE);
    }

    @Test
    @Transactional
    public void createExpenseTypeWithExistingId() throws Exception {
        int databaseSizeBeforeCreate = expenseTypeRepository.findAll().size();

        // Create the ExpenseType with an existing ID
        expenseType.setId(1L);
        ExpenseTypeDTO expenseTypeDTO = expenseTypeMapper.toDto(expenseType);

        // An entity with an existing ID cannot be created, so this API call must fail
        restExpenseTypeMockMvc.perform(post("/api/expense-types")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(expenseTypeDTO)))
            .andExpect(status().isBadRequest());

        // Validate the ExpenseType in the database
        List<ExpenseType> expenseTypeList = expenseTypeRepository.findAll();
        assertThat(expenseTypeList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    public void checkTypeIsRequired() throws Exception {
        int databaseSizeBeforeTest = expenseTypeRepository.findAll().size();
        // set the field null
        expenseType.setType(null);

        // Create the ExpenseType, which fails.
        ExpenseTypeDTO expenseTypeDTO = expenseTypeMapper.toDto(expenseType);

        restExpenseTypeMockMvc.perform(post("/api/expense-types")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(expenseTypeDTO)))
            .andExpect(status().isBadRequest());

        List<ExpenseType> expenseTypeList = expenseTypeRepository.findAll();
        assertThat(expenseTypeList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    public void checkCodeIsRequired() throws Exception {
        int databaseSizeBeforeTest = expenseTypeRepository.findAll().size();
        // set the field null
        expenseType.setCode(null);

        // Create the ExpenseType, which fails.
        ExpenseTypeDTO expenseTypeDTO = expenseTypeMapper.toDto(expenseType);

        restExpenseTypeMockMvc.perform(post("/api/expense-types")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(expenseTypeDTO)))
            .andExpect(status().isBadRequest());

        List<ExpenseType> expenseTypeList = expenseTypeRepository.findAll();
        assertThat(expenseTypeList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    public void getAllExpenseTypes() throws Exception {
        // Initialize the database
        expenseTypeRepository.saveAndFlush(expenseType);

        // Get all the expenseTypeList
        restExpenseTypeMockMvc.perform(get("/api/expense-types?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(expenseType.getId().intValue())))
            .andExpect(jsonPath("$.[*].type").value(hasItem(DEFAULT_TYPE.toString())))
            .andExpect(jsonPath("$.[*].code").value(hasItem(DEFAULT_CODE)));
    }
    
    @Test
    @Transactional
    public void getExpenseType() throws Exception {
        // Initialize the database
        expenseTypeRepository.saveAndFlush(expenseType);

        // Get the expenseType
        restExpenseTypeMockMvc.perform(get("/api/expense-types/{id}", expenseType.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.id").value(expenseType.getId().intValue()))
            .andExpect(jsonPath("$.type").value(DEFAULT_TYPE.toString()))
            .andExpect(jsonPath("$.code").value(DEFAULT_CODE));
    }

    @Test
    @Transactional
    public void getNonExistingExpenseType() throws Exception {
        // Get the expenseType
        restExpenseTypeMockMvc.perform(get("/api/expense-types/{id}", Long.MAX_VALUE))
            .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateExpenseType() throws Exception {
        // Initialize the database
        expenseTypeRepository.saveAndFlush(expenseType);

        int databaseSizeBeforeUpdate = expenseTypeRepository.findAll().size();

        // Update the expenseType
        ExpenseType updatedExpenseType = expenseTypeRepository.findById(expenseType.getId()).get();
        // Disconnect from session so that the updates on updatedExpenseType are not directly saved in db
        em.detach(updatedExpenseType);
        updatedExpenseType
            .type(UPDATED_TYPE)
            .code(UPDATED_CODE);
        ExpenseTypeDTO expenseTypeDTO = expenseTypeMapper.toDto(updatedExpenseType);

        restExpenseTypeMockMvc.perform(put("/api/expense-types")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(expenseTypeDTO)))
            .andExpect(status().isOk());

        // Validate the ExpenseType in the database
        List<ExpenseType> expenseTypeList = expenseTypeRepository.findAll();
        assertThat(expenseTypeList).hasSize(databaseSizeBeforeUpdate);
        ExpenseType testExpenseType = expenseTypeList.get(expenseTypeList.size() - 1);
        assertThat(testExpenseType.getType()).isEqualTo(UPDATED_TYPE);
        assertThat(testExpenseType.getCode()).isEqualTo(UPDATED_CODE);
    }

    @Test
    @Transactional
    public void updateNonExistingExpenseType() throws Exception {
        int databaseSizeBeforeUpdate = expenseTypeRepository.findAll().size();

        // Create the ExpenseType
        ExpenseTypeDTO expenseTypeDTO = expenseTypeMapper.toDto(expenseType);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restExpenseTypeMockMvc.perform(put("/api/expense-types")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(expenseTypeDTO)))
            .andExpect(status().isBadRequest());

        // Validate the ExpenseType in the database
        List<ExpenseType> expenseTypeList = expenseTypeRepository.findAll();
        assertThat(expenseTypeList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    public void deleteExpenseType() throws Exception {
        // Initialize the database
        expenseTypeRepository.saveAndFlush(expenseType);

        int databaseSizeBeforeDelete = expenseTypeRepository.findAll().size();

        // Delete the expenseType
        restExpenseTypeMockMvc.perform(delete("/api/expense-types/{id}", expenseType.getId())
            .accept(TestUtil.APPLICATION_JSON_UTF8))
            .andExpect(status().isOk());

        // Validate the database is empty
        List<ExpenseType> expenseTypeList = expenseTypeRepository.findAll();
        assertThat(expenseTypeList).hasSize(databaseSizeBeforeDelete - 1);
    }

    @Test
    @Transactional
    public void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(ExpenseType.class);
        ExpenseType expenseType1 = new ExpenseType();
        expenseType1.setId(1L);
        ExpenseType expenseType2 = new ExpenseType();
        expenseType2.setId(expenseType1.getId());
        assertThat(expenseType1).isEqualTo(expenseType2);
        expenseType2.setId(2L);
        assertThat(expenseType1).isNotEqualTo(expenseType2);
        expenseType1.setId(null);
        assertThat(expenseType1).isNotEqualTo(expenseType2);
    }

    @Test
    @Transactional
    public void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(ExpenseTypeDTO.class);
        ExpenseTypeDTO expenseTypeDTO1 = new ExpenseTypeDTO();
        expenseTypeDTO1.setId(1L);
        ExpenseTypeDTO expenseTypeDTO2 = new ExpenseTypeDTO();
        assertThat(expenseTypeDTO1).isNotEqualTo(expenseTypeDTO2);
        expenseTypeDTO2.setId(expenseTypeDTO1.getId());
        assertThat(expenseTypeDTO1).isEqualTo(expenseTypeDTO2);
        expenseTypeDTO2.setId(2L);
        assertThat(expenseTypeDTO1).isNotEqualTo(expenseTypeDTO2);
        expenseTypeDTO1.setId(null);
        assertThat(expenseTypeDTO1).isNotEqualTo(expenseTypeDTO2);
    }

    @Test
    @Transactional
    public void testEntityFromId() {
        assertThat(expenseTypeMapper.fromId(42L).getId()).isEqualTo(42);
        assertThat(expenseTypeMapper.fromId(null)).isNull();
    }
}
