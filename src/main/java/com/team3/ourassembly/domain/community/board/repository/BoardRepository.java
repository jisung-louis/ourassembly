package com.team3.ourassembly.domain.community.board.repository;

import com.team3.ourassembly.domain.community.board.entity.BoardEntity;
import com.team3.ourassembly.domain.community.reply.entity.ReplyEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

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


    // 오늘 작성된 게시글 수 - 네이티브 쿼리 유지 (curdate() MySQL 함수라 JPQL 불가)
    @Query(value = "select count(*) from board where date(created_at) = curdate()", nativeQuery = true)
    Long countTodayBoards();

    // 지역별 게시글 수 TOP5 - 네이티브 쿼리 유지 (group by + limit 조합 JPQL 불편)
    @Query(value = "select district, count(*) as cnt from board group by district order by cnt desc limit 5", nativeQuery = true)
    List<Map<String, Object>> findTopDistricts();

    // 좋아요 많은 게시글 TOP5 - 네이티브 쿼리 유지 (join + limit)
    @Query(value = "select b.board_id, b.title, b.like_count, u.name from board b join user u on b.user_id = u.id order by b.like_count desc limit 5", nativeQuery = true)
    List<Map<String, Object>> findTopBoardsByLike();

    // 게시글 많이 쓴 유저 TOP5 - 네이티브 쿼리 유지 (group by + limit)
    @Query(value = "select u.name, count(b.board_id) as cnt from board b join user u on b.user_id = u.id group by b.user_id order by cnt desc limit 5", nativeQuery = true)
    List<Map<String, Object>> findTopBoardUsers();

    // 날짜 범위 게시글 수 - JPA 메서드명으로 변경 가능
    Long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);




}
