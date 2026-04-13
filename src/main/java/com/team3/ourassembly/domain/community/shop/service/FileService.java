package com.team3.ourassembly.domain.community.shop.service;

import org.springframework.web.multipart.MultipartFile;

public interface FileService {
    // 업로드
    String upload(MultipartFile multipartFile);
}
