package com.team3.ourassembly.domain.community.shop.service;

import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.util.UUID;

@Service
@Transactional
public class LocalFileService implements FileService {

    private String baseUri = System.getProperty("user.dir");
    private String uploadDir = baseUri + "/build/resources/main/static/upload/";

    // 업로드
    @Override
    public String upload(MultipartFile multipartFile){

        if( multipartFile == null || multipartFile.isEmpty() ) { return null; }
        File upload = new File(uploadDir);
        if( !upload.exists()) { upload.mkdir(); }
        String uuid = UUID.randomUUID().toString();
        String filename = uuid + "_" + multipartFile.getOriginalFilename().replaceAll("_" , "-");
        File uploadRealPath = new File(uploadDir+filename);
        try {
            multipartFile.transferTo(uploadRealPath);
            return filename;
        } catch (Exception e){ System.out.println(e); }
        return null;
    }

}

