package com.team3.ourassembly.domain.community.board.repository;

import com.team3.ourassembly.domain.community.board.entity.BoardLikeEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BoardLikeRepository extends JpaRepository<BoardLikeEntity , Long> {


    @Query(value = "SELECT * FROM boardlike WHERE user_id = :userId AND board_id = :boardId AND type = 2", nativeQuery = true)
    Optional<BoardLikeEntity> likeQuery(Long userId, Long boardId);

    //게시판 pk로 좋아요 기록 삭제
    @Modifying
    @Query(value = "DELETE FROM boardlike WHERE board_id = :boardId", nativeQuery = true)
    void deleteAllByBoardId(Long boardId);
}
