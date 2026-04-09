package com.team3.ourassembly.domain.opinion.entity;


import com.team3.ourassembly.domain.congress.entity.CongressmanEntity;
import com.team3.ourassembly.domain.opinion.dto.opinion.OpinionResponseDto;
import com.team3.ourassembly.domain.user.entity.UserEntity;
import com.team3.ourassembly.global.BaseTime;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Cascade;
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
    private Long id; //게시물번호

    @Column(name = "title")
    private String title; //글 제목

    @Column(name = "content",columnDefinition = "LONGTEXT")
    private String content; //글 내용

    @Column(name = "view_count",columnDefinition = "int default 0")
    private Integer viewCount; //조회수

    @Column(name = "like_count",columnDefinition = "int default 0")
    private Integer likeCount; //공감수

    @Column(name = "status", columnDefinition = "varchar(20) default 'PENDING'")
    private String status; //답변상태:답변중/답변완료/답변대기등



    //한 회원이 여러 게시글 작성 가능
    @ManyToOne(fetch = FetchType.LAZY) //회원과의 연관관계
    @JoinColumn(name = "user_id")
    private UserEntity user;

    //한 의원에게 여러 민원 게시글
    @ManyToOne(fetch = FetchType.LAZY) // 국회의원과의 연관관계
    @JoinColumn(name = "congressman_id", nullable = false) // FK 설정
    private CongressmanEntity congressman;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cluster_id")
    private ClusterEntity cluster;

    private Float similarityScore;


    //첨부파일 엔티티 매핑할예정!



//entity->toDto
public OpinionResponseDto toDto() {
    return OpinionResponseDto.builder()
            .id(this.id)
            .title(this.title)
            .content(this.content)
            .likeCount(this.likeCount)
            .viewCount(this.viewCount)
            .status(this.status)
            .name(this.user != null ? this.user.getName() : "익명")
            .createdAt(this.getCreatedAt())
            .build();
}


} //class end
