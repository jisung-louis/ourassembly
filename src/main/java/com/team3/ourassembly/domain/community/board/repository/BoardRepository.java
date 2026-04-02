package com.team3.ourassembly.domain.community.board.repository;

import com.team3.ourassembly.domain.community.board.entity.BoardEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface BoardRepository extends JpaRepository<BoardEntity , Long> {

    Page<BoardEntity> findByDistrictOrderByCreatedAtDesc(String district, PageRequest pageRequest);

    @Query(value = "SELECT * FROM board WHERE district = :district ORDER BY like_count DESC",
            countQuery = "SELECT count(*) FROM board WHERE district = :district",
            nativeQuery = true)
    Page<BoardEntity> findByDistrictOrderByLikeCount(String district, PageRequest pageRequest);

    Page<BoardEntity> findByTitleContainingOrContentContaining(String title , String content , PageRequest pageRequest);


}
