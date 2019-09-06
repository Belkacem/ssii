package com.zsoft.web.rest;

import com.zsoft.SsiiApp;

import com.zsoft.domain.ExpenseJustification;
import com.zsoft.domain.Expense;
import com.zsoft.repository.ExpenseJustificationRepository;
import com.zsoft.service.ExpenseJustificationService;
import com.zsoft.service.dto.ExpenseJustificationDTO;
import com.zsoft.service.mapper.ExpenseJustificationMapper;
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
 * Test class for the ExpenseJustificationResource REST controller.
 *
 * @see ExpenseJustificationResource
 */
@RunWith(SpringRunner.class)
@SpringBootTest(classes = SsiiApp.class)
public class ExpenseJustificationResourceIntTest {

    private static final byte[] DEFAULT_FILE = TestUtil.createByteArray(1, "0");
    private static final byte[] UPDATED_FILE = TestUtil.createByteArray(1, "1");
    private static final String DEFAULT_FILE_CONTENT_TYPE = "image/jpg";
    private static final String UPDATED_FILE_CONTENT_TYPE = "image/png";

    @Autowired
    private ExpenseJustificationRepository expenseJustificationRepository;

    @Autowired
    private ExpenseJustificationMapper expenseJustificationMapper;

    @Autowired
    private ExpenseJustificationService expenseJustificationService;

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

    private MockMvc restExpenseJustificationMockMvc;

    private ExpenseJustification expenseJustification;

    @Before
    public void setup() {
        MockitoAnnotations.initMocks(this);
        final ExpenseJustificationResource expenseJustificationResource = new ExpenseJustificationResource(expenseJustificationService);
        this.restExpenseJustificationMockMvc = MockMvcBuilders.standaloneSetup(expenseJustificationResource)
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
    public static ExpenseJustification createEntity(EntityManager em) {
        ExpenseJustification expenseJustification = new ExpenseJustification()
            .file(DEFAULT_FILE)
            .fileContentType(DEFAULT_FILE_CONTENT_TYPE);
        // Add required entity
        Expense expense = ExpenseResourceIntTest.createEntity(em);
        em.persist(expense);
        em.flush();
        expenseJustification.setExpense(expense);
        return expenseJustification;
    }

    @Before
    public void initTest() {
        expenseJustification = createEntity(em);
    }

    @Test
    @Transactional
    public void createExpenseJustification() throws Exception {
        int databaseSizeBeforeCreate = expenseJustificationRepository.findAll().size();

        // Create the ExpenseJustification
        ExpenseJustificationDTO expenseJustificationDTO = expenseJustificationMapper.toDto(expenseJustification);
        restExpenseJustificationMockMvc.perform(post("/api/expense-justifications")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(expenseJustificationDTO)))
            .andExpect(status().isCreated());

        // Validate the ExpenseJustification in the database
        List<ExpenseJustification> expenseJustificationList = expenseJustificationRepository.findAll();
        assertThat(expenseJustificationList).hasSize(databaseSizeBeforeCreate + 1);
        ExpenseJustification testExpenseJustification = expenseJustificationList.get(expenseJustificationList.size() - 1);
        assertThat(testExpenseJustification.getFile()).isEqualTo(DEFAULT_FILE);
        assertThat(testExpenseJustification.getFileContentType()).isEqualTo(DEFAULT_FILE_CONTENT_TYPE);
    }

    @Test
    @Transactional
    public void createExpenseJustificationWithExistingId() throws Exception {
        int databaseSizeBeforeCreate = expenseJustificationRepository.findAll().size();

        // Create the ExpenseJustification with an existing ID
        expenseJustification.setId(1L);
        ExpenseJustificationDTO expenseJustificationDTO = expenseJustificationMapper.toDto(expenseJustification);

        // An entity with an existing ID cannot be created, so this API call must fail
        restExpenseJustificationMockMvc.perform(post("/api/expense-justifications")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(expenseJustificationDTO)))
            .andExpect(status().isBadRequest());

        // Validate the ExpenseJustification in the database
        List<ExpenseJustification> expenseJustificationList = expenseJustificationRepository.findAll();
        assertThat(expenseJustificationList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    public void getAllExpenseJustifications() throws Exception {
        // Initialize the database
        expenseJustificationRepository.saveAndFlush(expenseJustification);

        // Get all the expenseJustificationList
        restExpenseJustificationMockMvc.perform(get("/api/expense-justifications?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(expenseJustification.getId().intValue())))
            .andExpect(jsonPath("$.[*].fileContentType").value(hasItem(DEFAULT_FILE_CONTENT_TYPE)))
            .andExpect(jsonPath("$.[*].file").value(hasItem(Base64Utils.encodeToString(DEFAULT_FILE))));
    }
    
    @Test
    @Transactional
    public void getExpenseJustification() throws Exception {
        // Initialize the database
        expenseJustificationRepository.saveAndFlush(expenseJustification);

        // Get the expenseJustification
        restExpenseJustificationMockMvc.perform(get("/api/expense-justifications/{id}", expenseJustification.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.id").value(expenseJustification.getId().intValue()))
            .andExpect(jsonPath("$.fileContentType").value(DEFAULT_FILE_CONTENT_TYPE))
            .andExpect(jsonPath("$.file").value(Base64Utils.encodeToString(DEFAULT_FILE)));
    }

    @Test
    @Transactional
    public void getNonExistingExpenseJustification() throws Exception {
        // Get the expenseJustification
        restExpenseJustificationMockMvc.perform(get("/api/expense-justifications/{id}", Long.MAX_VALUE))
            .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateExpenseJustification() throws Exception {
        // Initialize the database
        expenseJustificationRepository.saveAndFlush(expenseJustification);

        int databaseSizeBeforeUpdate = expenseJustificationRepository.findAll().size();

        // Update the expenseJustification
        ExpenseJustification updatedExpenseJustification = expenseJustificationRepository.findById(expenseJustification.getId()).get();
        // Disconnect from session so that the updates on updatedExpenseJustification are not directly saved in db
        em.detach(updatedExpenseJustification);
        updatedExpenseJustification
            .file(UPDATED_FILE)
            .fileContentType(UPDATED_FILE_CONTENT_TYPE);
        ExpenseJustificationDTO expenseJustificationDTO = expenseJustificationMapper.toDto(updatedExpenseJustification);

        restExpenseJustificationMockMvc.perform(put("/api/expense-justifications")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(expenseJustificationDTO)))
            .andExpect(status().isOk());

        // Validate the ExpenseJustification in the database
        List<ExpenseJustification> expenseJustificationList = expenseJustificationRepository.findAll();
        assertThat(expenseJustificationList).hasSize(databaseSizeBeforeUpdate);
        ExpenseJustification testExpenseJustification = expenseJustificationList.get(expenseJustificationList.size() - 1);
        assertThat(testExpenseJustification.getFile()).isEqualTo(UPDATED_FILE);
        assertThat(testExpenseJustification.getFileContentType()).isEqualTo(UPDATED_FILE_CONTENT_TYPE);
    }

    @Test
    @Transactional
    public void updateNonExistingExpenseJustification() throws Exception {
        int databaseSizeBeforeUpdate = expenseJustificationRepository.findAll().size();

        // Create the ExpenseJustification
        ExpenseJustificationDTO expenseJustificationDTO = expenseJustificationMapper.toDto(expenseJustification);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restExpenseJustificationMockMvc.perform(put("/api/expense-justifications")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(expenseJustificationDTO)))
            .andExpect(status().isBadRequest());

        // Validate the ExpenseJustification in the database
        List<ExpenseJustification> expenseJustificationList = expenseJustificationRepository.findAll();
        assertThat(expenseJustificationList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    public void deleteExpenseJustification() throws Exception {
        // Initialize the database
        expenseJustificationRepository.saveAndFlush(expenseJustification);

        int databaseSizeBeforeDelete = expenseJustificationRepository.findAll().size();

        // Delete the expenseJustification
        restExpenseJustificationMockMvc.perform(delete("/api/expense-justifications/{id}", expenseJustification.getId())
            .accept(TestUtil.APPLICATION_JSON_UTF8))
            .andExpect(status().isOk());

        // Validate the database is empty
        List<ExpenseJustification> expenseJustificationList = expenseJustificationRepository.findAll();
        assertThat(expenseJustificationList).hasSize(databaseSizeBeforeDelete - 1);
    }

    @Test
    @Transactional
    public void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(ExpenseJustification.class);
        ExpenseJustification expenseJustification1 = new ExpenseJustification();
        expenseJustification1.setId(1L);
        ExpenseJustification expenseJustification2 = new ExpenseJustification();
        expenseJustification2.setId(expenseJustification1.getId());
        assertThat(expenseJustification1).isEqualTo(expenseJustification2);
        expenseJustification2.setId(2L);
        assertThat(expenseJustification1).isNotEqualTo(expenseJustification2);
        expenseJustification1.setId(null);
        assertThat(expenseJustification1).isNotEqualTo(expenseJustification2);
    }

    @Test
    @Transactional
    public void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(ExpenseJustificationDTO.class);
        ExpenseJustificationDTO expenseJustificationDTO1 = new ExpenseJustificationDTO();
        expenseJustificationDTO1.setId(1L);
        ExpenseJustificationDTO expenseJustificationDTO2 = new ExpenseJustificationDTO();
        assertThat(expenseJustificationDTO1).isNotEqualTo(expenseJustificationDTO2);
        expenseJustificationDTO2.setId(expenseJustificationDTO1.getId());
        assertThat(expenseJustificationDTO1).isEqualTo(expenseJustificationDTO2);
        expenseJustificationDTO2.setId(2L);
        assertThat(expenseJustificationDTO1).isNotEqualTo(expenseJustificationDTO2);
        expenseJustificationDTO1.setId(null);
        assertThat(expenseJustificationDTO1).isNotEqualTo(expenseJustificationDTO2);
    }

    @Test
    @Transactional
    public void testEntityFromId() {
        assertThat(expenseJustificationMapper.fromId(42L).getId()).isEqualTo(42);
        assertThat(expenseJustificationMapper.fromId(null)).isNull();
    }
}
