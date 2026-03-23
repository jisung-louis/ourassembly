package com.team3.ourassembly.domain.opinion.entity;

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
@Table(name = "answer")
@EnableJpaAuditing
public class AnswerEntity extends BaseTime {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer answer_id; //답변번호

    @Column(name = "content",columnDefinition = "longtext")
    private String content; //답변내용

    @Column(name = "is_direct")
    private boolean is_direct; //답변 여부 ex)국회의원이 직접 답변했는지 여부


    //의견하나의 답변하나
    @JoinColumn(name = "opinion_id")
    @OneToOne(fetch = FetchType.LAZY)
    private OpinionEntity opinionEntity;

}
