package com.zsoft.web.rest;

import com.zsoft.SsiiApp;

import com.zsoft.domain.InvoiceFile;
import com.zsoft.domain.Invoice;
import com.zsoft.repository.InvoiceFileRepository;
import com.zsoft.service.InvoiceFileService;
import com.zsoft.service.dto.InvoiceFileDTO;
import com.zsoft.service.mapper.InvoiceFileMapper;
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
 * Test class for the InvoiceFileResource REST controller.
 *
 * @see InvoiceFileResource
 */
@RunWith(SpringRunner.class)
@SpringBootTest(classes = SsiiApp.class)
public class InvoiceFileResourceIntTest {

    private static final byte[] DEFAULT_FILE = TestUtil.createByteArray(1, "0");
    private static final byte[] UPDATED_FILE = TestUtil.createByteArray(1, "1");
    private static final String DEFAULT_FILE_CONTENT_TYPE = "image/jpg";
    private static final String UPDATED_FILE_CONTENT_TYPE = "image/png";

    @Autowired
    private InvoiceFileRepository invoiceFileRepository;

    @Autowired
    private InvoiceFileMapper invoiceFileMapper;

    @Autowired
    private InvoiceFileService invoiceFileService;

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

    private MockMvc restInvoiceFileMockMvc;

    private InvoiceFile invoiceFile;

    @Before
    public void setup() {
        MockitoAnnotations.initMocks(this);
        final InvoiceFileResource invoiceFileResource = new InvoiceFileResource(invoiceFileService);
        this.restInvoiceFileMockMvc = MockMvcBuilders.standaloneSetup(invoiceFileResource)
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
    public static InvoiceFile createEntity(EntityManager em) {
        InvoiceFile invoiceFile = new InvoiceFile()
            .file(DEFAULT_FILE)
            .fileContentType(DEFAULT_FILE_CONTENT_TYPE);
        // Add required entity
        Invoice invoice = InvoiceResourceIntTest.createEntity(em);
        em.persist(invoice);
        em.flush();
        invoiceFile.setInvoice(invoice);
        return invoiceFile;
    }

    @Before
    public void initTest() {
        invoiceFile = createEntity(em);
    }

    @Test
    @Transactional
    public void createInvoiceFile() throws Exception {
        int databaseSizeBeforeCreate = invoiceFileRepository.findAll().size();

        // Create the InvoiceFile
        InvoiceFileDTO invoiceFileDTO = invoiceFileMapper.toDto(invoiceFile);
        restInvoiceFileMockMvc.perform(post("/api/invoice-files")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(invoiceFileDTO)))
            .andExpect(status().isCreated());

        // Validate the InvoiceFile in the database
        List<InvoiceFile> invoiceFileList = invoiceFileRepository.findAll();
        assertThat(invoiceFileList).hasSize(databaseSizeBeforeCreate + 1);
        InvoiceFile testInvoiceFile = invoiceFileList.get(invoiceFileList.size() - 1);
        assertThat(testInvoiceFile.getFile()).isEqualTo(DEFAULT_FILE);
        assertThat(testInvoiceFile.getFileContentType()).isEqualTo(DEFAULT_FILE_CONTENT_TYPE);
    }

    @Test
    @Transactional
    public void createInvoiceFileWithExistingId() throws Exception {
        int databaseSizeBeforeCreate = invoiceFileRepository.findAll().size();

        // Create the InvoiceFile with an existing ID
        invoiceFile.setId(1L);
        InvoiceFileDTO invoiceFileDTO = invoiceFileMapper.toDto(invoiceFile);

        // An entity with an existing ID cannot be created, so this API call must fail
        restInvoiceFileMockMvc.perform(post("/api/invoice-files")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(invoiceFileDTO)))
            .andExpect(status().isBadRequest());

        // Validate the InvoiceFile in the database
        List<InvoiceFile> invoiceFileList = invoiceFileRepository.findAll();
        assertThat(invoiceFileList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    public void getAllInvoiceFiles() throws Exception {
        // Initialize the database
        invoiceFileRepository.saveAndFlush(invoiceFile);

        // Get all the invoiceFileList
        restInvoiceFileMockMvc.perform(get("/api/invoice-files?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(invoiceFile.getId().intValue())))
            .andExpect(jsonPath("$.[*].fileContentType").value(hasItem(DEFAULT_FILE_CONTENT_TYPE)))
            .andExpect(jsonPath("$.[*].file").value(hasItem(Base64Utils.encodeToString(DEFAULT_FILE))));
    }
    
    @Test
    @Transactional
    public void getInvoiceFile() throws Exception {
        // Initialize the database
        invoiceFileRepository.saveAndFlush(invoiceFile);

        // Get the invoiceFile
        restInvoiceFileMockMvc.perform(get("/api/invoice-files/{id}", invoiceFile.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.id").value(invoiceFile.getId().intValue()))
            .andExpect(jsonPath("$.fileContentType").value(DEFAULT_FILE_CONTENT_TYPE))
            .andExpect(jsonPath("$.file").value(Base64Utils.encodeToString(DEFAULT_FILE)));
    }

    @Test
    @Transactional
    public void getNonExistingInvoiceFile() throws Exception {
        // Get the invoiceFile
        restInvoiceFileMockMvc.perform(get("/api/invoice-files/{id}", Long.MAX_VALUE))
            .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateInvoiceFile() throws Exception {
        // Initialize the database
        invoiceFileRepository.saveAndFlush(invoiceFile);

        int databaseSizeBeforeUpdate = invoiceFileRepository.findAll().size();

        // Update the invoiceFile
        InvoiceFile updatedInvoiceFile = invoiceFileRepository.findById(invoiceFile.getId()).get();
        // Disconnect from session so that the updates on updatedInvoiceFile are not directly saved in db
        em.detach(updatedInvoiceFile);
        updatedInvoiceFile
            .file(UPDATED_FILE)
            .fileContentType(UPDATED_FILE_CONTENT_TYPE);
        InvoiceFileDTO invoiceFileDTO = invoiceFileMapper.toDto(updatedInvoiceFile);

        restInvoiceFileMockMvc.perform(put("/api/invoice-files")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(invoiceFileDTO)))
            .andExpect(status().isOk());

        // Validate the InvoiceFile in the database
        List<InvoiceFile> invoiceFileList = invoiceFileRepository.findAll();
        assertThat(invoiceFileList).hasSize(databaseSizeBeforeUpdate);
        InvoiceFile testInvoiceFile = invoiceFileList.get(invoiceFileList.size() - 1);
        assertThat(testInvoiceFile.getFile()).isEqualTo(UPDATED_FILE);
        assertThat(testInvoiceFile.getFileContentType()).isEqualTo(UPDATED_FILE_CONTENT_TYPE);
    }

    @Test
    @Transactional
    public void updateNonExistingInvoiceFile() throws Exception {
        int databaseSizeBeforeUpdate = invoiceFileRepository.findAll().size();

        // Create the InvoiceFile
        InvoiceFileDTO invoiceFileDTO = invoiceFileMapper.toDto(invoiceFile);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restInvoiceFileMockMvc.perform(put("/api/invoice-files")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(invoiceFileDTO)))
            .andExpect(status().isBadRequest());

        // Validate the InvoiceFile in the database
        List<InvoiceFile> invoiceFileList = invoiceFileRepository.findAll();
        assertThat(invoiceFileList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    public void deleteInvoiceFile() throws Exception {
        // Initialize the database
        invoiceFileRepository.saveAndFlush(invoiceFile);

        int databaseSizeBeforeDelete = invoiceFileRepository.findAll().size();

        // Delete the invoiceFile
        restInvoiceFileMockMvc.perform(delete("/api/invoice-files/{id}", invoiceFile.getId())
            .accept(TestUtil.APPLICATION_JSON_UTF8))
            .andExpect(status().isOk());

        // Validate the database is empty
        List<InvoiceFile> invoiceFileList = invoiceFileRepository.findAll();
        assertThat(invoiceFileList).hasSize(databaseSizeBeforeDelete - 1);
    }

    @Test
    @Transactional
    public void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(InvoiceFile.class);
        InvoiceFile invoiceFile1 = new InvoiceFile();
        invoiceFile1.setId(1L);
        InvoiceFile invoiceFile2 = new InvoiceFile();
        invoiceFile2.setId(invoiceFile1.getId());
        assertThat(invoiceFile1).isEqualTo(invoiceFile2);
        invoiceFile2.setId(2L);
        assertThat(invoiceFile1).isNotEqualTo(invoiceFile2);
        invoiceFile1.setId(null);
        assertThat(invoiceFile1).isNotEqualTo(invoiceFile2);
    }

    @Test
    @Transactional
    public void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(InvoiceFileDTO.class);
        InvoiceFileDTO invoiceFileDTO1 = new InvoiceFileDTO();
        invoiceFileDTO1.setId(1L);
        InvoiceFileDTO invoiceFileDTO2 = new InvoiceFileDTO();
        assertThat(invoiceFileDTO1).isNotEqualTo(invoiceFileDTO2);
        invoiceFileDTO2.setId(invoiceFileDTO1.getId());
        assertThat(invoiceFileDTO1).isEqualTo(invoiceFileDTO2);
        invoiceFileDTO2.setId(2L);
        assertThat(invoiceFileDTO1).isNotEqualTo(invoiceFileDTO2);
        invoiceFileDTO1.setId(null);
        assertThat(invoiceFileDTO1).isNotEqualTo(invoiceFileDTO2);
    }

    @Test
    @Transactional
    public void testEntityFromId() {
        assertThat(invoiceFileMapper.fromId(42L).getId()).isEqualTo(42);
        assertThat(invoiceFileMapper.fromId(null)).isNull();
    }
}
