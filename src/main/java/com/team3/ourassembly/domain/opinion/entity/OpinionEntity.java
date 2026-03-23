package com.team3.ourassembly.domain.opinion.entity;


import com.team3.ourassembly.domain.opinion.dto.OpinionResponseDto;
import com.team3.ourassembly.domain.user.entity.UserEntity;
import com.team3.ourassembly.global.BaseTime;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
@Entity
@Table(name = "opinion")
@EnableJpaAuditing
public class OpinionEntity extends BaseTime {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long opinion_id; //게시물번호

    @Column(name = "title")
    private String title; //글 제목

    @Column(name = "content",columnDefinition = "LONGTEXT")
    private String content; //글 내용

    @Column(name = "view_count",columnDefinition = "int default 0")
    private Integer view_count; //조회수

    @Column(name = "like_count",columnDefinition = "int default 0")
    private Integer like_count; //공감수

    @Column(name = "status", columnDefinition = "varchar(20) default 'PENDING'")
    private String status; // boolean을 String으로!



    //한 회원이 여러 게시글 작성 가능
    //게시글 하나는 한 명의 회원이 작성
    @ManyToOne(fetch = FetchType.LAZY) //회원과의 연관관계
    @JoinColumn(name = "id")
    private UserEntity userEntity;

//    //한 의원에게 여러 민원 게시글
//    @ManyToOne(fetch = FetchType.LAZY) // 국회의원과의 연관관계
//    @JoinColumn(name = "congressman_id", nullable = false) // FK 설정
////    private Congressman congressman;






} //class end
