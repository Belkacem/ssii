package com.zsoft.domain;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.InputStreamSource;

public class Attachment {

    private InputStreamSource inputStreamSource;
    private String filename;

    public Attachment(String filename, byte[] bytes) {
        this.filename = filename;
        this.inputStreamSource = new ByteArrayResource(bytes);
    }

    public InputStreamSource getInputStreamSource() {
        return inputStreamSource;
    }

    public String getFilename() {
        return filename;
    }
}
