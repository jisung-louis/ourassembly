package com.team3.ourassembly.domain.opinion.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FileEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long file_id;

    private String originFileName; //실제 파일명
    private String storedFilePath; // 서버 저장 경로 (예: /upload/uuid_민원사진.jpg)
    private String fileType; //파일확장자(jpg,pdf 등)

    @ManyToOne(fetch = FetchType.LAZY) //하나의 게시글의 여러개의 첨부파일을 첨부할수있다!
    @JoinColumn(name="opinion_id")
    private OpinionEntity opinionEntity;


}
