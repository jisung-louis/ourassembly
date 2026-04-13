package com.team3.ourassembly.domain.community.reply.repository;

import com.team3.ourassembly.domain.community.reply.entity.ReplyEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.querydsl.QPageRequest;

import java.time.LocalDateTime;
import java.util.List;

public interface ReplyRepository extends JpaRepository<ReplyEntity , Long> {


    @Query(value = "SELECT * FROM reply WHERE board_id = :boardId", nativeQuery = true)
    List<ReplyEntity> findByBoardId(Long boardId);


    //내가쓴댓글
    @Query(value = "select * from reply where user_id= :userId", nativeQuery = true)
    List<ReplyEntity> myreply(Long userId);

    //게시판pk로 댓글 삭제
    @Modifying
    @Query(value = "DELETE FROM reply WHERE board_id = :boardId", nativeQuery = true)
    void deleteAllByBoardId(Long boardId);


    // 오늘 작성된 댓글 수
    @Query(value = "select count(*) from reply where date(created_at) = curdate()", nativeQuery = true)
    Long countTodayReplies();

    // 날짜 범위 댓글 수
    Long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

}