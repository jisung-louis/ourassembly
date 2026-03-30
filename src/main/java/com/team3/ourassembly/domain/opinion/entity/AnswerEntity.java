package com.team3.ourassembly.domain.opinion.entity;

import com.team3.ourassembly.domain.congress.entity.CongressmanEntity;
import com.team3.ourassembly.domain.opinion.dto.answer.AnswerResponseDto;
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
public class AnswerEntity extends BaseTime {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long answer_id; //답변번호

    @Column(name = "content",columnDefinition = "longtext")
    private String content; //답변내용

    @Column(name = "is_direct")
    private boolean isDirect; //답변 여부 ex)국회의원이 직접 답변했는지 여부


    //의견하나의 답변하나
    @JoinColumn(name = "opinion_id")
    @OneToOne(fetch = FetchType.LAZY)
    private OpinionEntity opinion;



    @JoinColumn(name="id")
    @ManyToOne(fetch = FetchType.LAZY)
    private CongressmanEntity congressman;

    //entity->dto로 변환
    public AnswerResponseDto toDto() {
        return AnswerResponseDto.builder()
                .id(answer_id)
                .content(content)
                .createdAt(getCreatedAt())
                .build();
    }

}
