package com.team3.ourassembly.domain.bill.entity;

import com.team3.ourassembly.domain.congress.entity.CongressmanEntity;
import com.team3.ourassembly.global.BaseTime;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/**
 * 의안과 국회의원 사이의 제안자 관계를 저장하는 매핑 엔티티.
 * 대표발의자와 공동발의자를 모두 같은 테이블에서 role로 구분한다.
 */
@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
@EqualsAndHashCode(callSuper = false)
@Entity
@Table(
        name = "bill_proposer",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"bill_id", "congressman_id", "role"})
        }
)
public class BillProposerEntity extends BaseTime {
    /** 내부 PK. 의안-국회의원 관계 레코드를 구분하기 위한 값이다. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 어떤 의안의 제안자 정보인지 가리킨다. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bill_id", nullable = false)
    private BillEntity bill;

    /** 어떤 국회의원이 제안자인지 가리킨다. congressman PK는 NAAS_CD를 사용한다. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "congressman_id", nullable = false)
    private CongressmanEntity congressman;

    /** 대표발의자인지 공동발의자인지 구분한다. */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private BillProposerRole role;

    /** 제안자 표기 순서. API가 준 순서를 최대한 유지하기 위한 값이다. */
    @Column
    private Integer sortOrder;
}
