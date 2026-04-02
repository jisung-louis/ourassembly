package com.team3.ourassembly.domain.community.board.repository;

import com.team3.ourassembly.domain.community.board.entity.BoardViewEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BoardViewRepository extends JpaRepository<BoardViewEntity , Long> {

    @Query(value = "SELECT * FROM boardview WHERE (ip = :ip OR device = :device) AND board_id = :boardId LIMIT 1", nativeQuery = true)
    Optional<BoardViewEntity> viewQuery(String ip, String device, Long boardId);
}
