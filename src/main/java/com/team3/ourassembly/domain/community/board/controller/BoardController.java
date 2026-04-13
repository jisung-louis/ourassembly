package com.team3.ourassembly.domain.community.board.controller;

import com.team3.ourassembly.domain.community.board.dto.BoardCreateDto;
import com.team3.ourassembly.domain.community.board.dto.BoardResponseDto;
import com.team3.ourassembly.domain.community.board.dto.BoardUpdateDto;
import com.team3.ourassembly.domain.community.board.service.BoardService;
import com.team3.ourassembly.global.aop.Token;
import com.team3.ourassembly.global.jwt.dto.JwtDto;
import com.team3.ourassembly.global.jwt.service.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/board")
public class BoardController {
    private final JwtService jwtService;
    private final BoardService boardService;


    //글쓰기
    @PostMapping
    @Token
    public ResponseEntity<?> boardPost(@RequestBody BoardCreateDto boardCreateDto, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return ResponseEntity.ok(boardService.boardPost(boardCreateDto, userId));
    }

    //글 전체조회
    @GetMapping
    public ResponseEntity<?> boardGet(@RequestParam(required = false) String district,
                                      @RequestParam(defaultValue = "latest") String sort,
                                      @RequestParam(defaultValue = "1") int page,
                                      @RequestParam(defaultValue = "10") int size) {

        return ResponseEntity.ok(boardService.boardGet(district, sort, page, size));
    }

    //글 상세조회
    @GetMapping("/detail")
    public ResponseEntity<?> boardDetail(@RequestParam Long boardId, HttpServletRequest request) {
        return ResponseEntity.ok(boardService.boardDetail(boardId, request));
    }

    // 글 제목으로 검색
    @GetMapping("/search")
    public ResponseEntity<?> boardSearch(@RequestParam(required = false) String district,
                                         @RequestParam String keyword,
                                         @RequestParam(defaultValue = "1") int page,
                                         @RequestParam(defaultValue = "5") int size) {
        return ResponseEntity.ok(boardService.boardSearch(district, keyword, page, size));
    }

    // 글 수정
    @PutMapping
    public ResponseEntity<?> boardUpdate(@RequestBody BoardUpdateDto boardUpdateDto, @RequestHeader("Authorization") String token) {

        if (token == null || !token.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String inToken = token.replace("Bearer ", "");
        JwtDto jwtDto = jwtService.getClaim(inToken);

        if (jwtDto == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Long userId = jwtDto.getId();

        if (!userId.equals(boardUpdateDto.getUser().getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        BoardResponseDto result = boardService.boardUpdate(boardUpdateDto, userId);
        if (result == null) {
            return ResponseEntity.status(500).body("");
        } else {
            return ResponseEntity.ok(result);
        }
    }


    //글 삭제
    @DeleteMapping
    public ResponseEntity<?> boardDelete(@RequestParam Long boardId, @RequestHeader("Authorization") String token) {

        if (token == null || !token.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String inToken = token.replace("Bearer ", "");
        JwtDto jwtDto = jwtService.getClaim(inToken);

        if (jwtDto == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Long userId = jwtDto.getId();

        boolean result = boardService.boardDelete(boardId, userId);
        if (result == false) {
            return ResponseEntity.status(500).body("");
        } else {
            return ResponseEntity.ok(result);
        }
    }

    //좋아요 1인당 1좋아요 / 취소 가능
    @PostMapping("/like")
    public ResponseEntity<?> boardLike(@RequestParam Long boardId, @RequestHeader("Authorization") String token) {

        if (token == null || !token.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String inToken = token.replace("Bearer ", "");
        JwtDto jwtDto = jwtService.getClaim(inToken);

        if (jwtDto == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Long userId = jwtDto.getId();

        boolean result = boardService.boardLike(boardId, userId);
        return ResponseEntity.ok(result);
    }
}

