package com.team3.ourassembly.domain.community.board.repository;

import com.team3.ourassembly.domain.community.board.entity.BoardEntity;
import com.team3.ourassembly.domain.community.reply.entity.ReplyEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BoardRepository extends JpaRepository<BoardEntity , Long> {

    Page<BoardEntity> findByDistrictOrderByCreatedAtDesc(String district, PageRequest pageRequest);

    @Query(value = "SELECT * FROM board WHERE district = :district ORDER BY like_count DESC",
            countQuery = "SELECT count(*) FROM board WHERE district = :district",
            nativeQuery = true)
    Page<BoardEntity> findByDistrictOrderByLikeCount(String district, PageRequest pageRequest);

    Page<BoardEntity> findByTitleContainingOrContentContaining(String title , String content , PageRequest pageRequest);

    Page<BoardEntity> findAllByOrderByCreatedAtDesc(PageRequest pageRequest);

    @Query(value = "SELECT * FROM board ORDER BY like_count DESC",
            countQuery = "SELECT count(*) FROM board",
            nativeQuery = true)
    Page<BoardEntity> findAllOrderByLikeCount(PageRequest pageRequest);

    @Query("SELECT board FROM BoardEntity board WHERE board.district = :district AND (board.title LIKE %:keyword% OR board.content LIKE %:keyword%)")
    Page<BoardEntity> searchByDistrict(String district, String keyword, PageRequest pageRequest);


    //내가 쓴 게시물 조회
    @Query(value = "select * from board where user_id = :userId", nativeQuery = true)
    List<BoardEntity> myboard(Long userId);



}
