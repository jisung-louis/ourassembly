package com.team3.ourassembly.domain.opinion.controller;

import com.team3.ourassembly.domain.opinion.dto.board.BoardResponseDto;
import com.team3.ourassembly.domain.opinion.dto.board.ClusterOpinionPageResponseDto;
import com.team3.ourassembly.domain.opinion.dto.opinion.OpinionCreateRequestDto;
import com.team3.ourassembly.domain.opinion.dto.opinion.OpinionSimilarityCheckRequestDto;
import com.team3.ourassembly.domain.opinion.dto.opinion.OpinionSimilarityCheckResponseDto;
import com.team3.ourassembly.domain.opinion.dto.opinion.OpinionResponseDto;
import com.team3.ourassembly.domain.opinion.service.ClusterAsyncService;
import com.team3.ourassembly.domain.opinion.service.OpinionService;
import com.team3.ourassembly.domain.opinion.dto.opinion.OpinionUpdateRequestDto;
import com.team3.ourassembly.global.jwt.dto.JwtDto;
import com.team3.ourassembly.global.jwt.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/opinion")
public class OpinionController {
    private final OpinionService opinionService;
    private final JwtService jwtService;
    private final ClusterAsyncService clusterAsyncService;


    //의견등록:C
    @PostMapping
    public ResponseEntity<OpinionResponseDto> createOpinion(@RequestBody OpinionCreateRequestDto requestDto
            ,@RequestHeader("Authorization") String token){
        // 1. 토큰 확인
        if (token == null || !token.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // 2. 순수 토큰 추출
        String pureToken = token.replace("Bearer ", "");

        // 3. 아이디 추출
        JwtDto jwtDto= jwtService.getClaim(pureToken);

        Long userId=jwtDto.getId();
        if (userId== null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // 4. 서비스 호출
        OpinionResponseDto response = opinionService.create(requestDto,userId);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    } //method end

    @PostMapping("/similarity-check")
    public ResponseEntity<OpinionSimilarityCheckResponseDto> checkSimilarOpinion(
            @RequestBody OpinionSimilarityCheckRequestDto requestDto,
            @RequestHeader("Authorization") String token
    ) {
        Long userId = requireUserId(token);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return ResponseEntity.ok(opinionService.checkSimilarClosedCluster(requestDto));
    }


    @GetMapping("/vectortest")
    public ResponseEntity<?> getVector(){
        return ResponseEntity.ok(opinionService.getVector());
    }

    @PostMapping("/cluster/{congressmanId}")
    public ResponseEntity<?> cluster(@PathVariable String congressmanId){
        System.out.println("[LOG] 강제 클러스터링이 시작되었습니다. 클러스터 가능한 의견이 300개 미만이거나 이미 클러스터링중일 때는 실패할 수 있습니다.");
        clusterAsyncService.triggerClustering(congressmanId);
        return ResponseEntity.ok(true);
    }

    @PutMapping
    public ResponseEntity<OpinionResponseDto> putOpinion(@RequestParam Long opinion_id,@RequestBody OpinionUpdateRequestDto requestDto
    ,@RequestHeader("Authorization") String token) {
        // 1. 토큰 확인
        if (token == null || !token.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // 2. 순수 토큰 추출
        String pureToken = token.replace("Bearer ", "");

        // 3. 아이디 추출
        JwtDto jwtDto=jwtService.getClaim(pureToken);
        Long userId=jwtDto.getId();
        if (jwtDto.getId()== null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        OpinionResponseDto responseDto=opinionService.update(opinion_id,requestDto,userId);
        return ResponseEntity.ok(responseDto);
    }


    @DeleteMapping
    public ResponseEntity<String> delete(@RequestParam Long opinion_id,@RequestHeader("Authorization") String token) {
        // 1. 토큰 확인
        if (token == null || !token.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // 2. 순수 토큰 추출
        String pureToken = token.replace("Bearer ", "");

        // 3. 아이디 추출
        JwtDto jwtDto=jwtService.getClaim(pureToken);
        Long userId=jwtDto.getId();
        if (userId== null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        boolean isDeleted = opinionService.delete(opinion_id, jwtDto.getId());

        if (isDeleted) {
            return ResponseEntity.ok("삭제 성공!");
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("삭제 실패: 게시글을 찾을 수 없습니다.");
        }
    } //method end




    //특정국회의원 의견게시판 목록 조회:R
    @GetMapping("/opinions")
    public ResponseEntity<BoardResponseDto> getOpinions(
            @RequestParam String id,
            @RequestHeader(value = "Authorization", required = false) String token
    ) {
        Long userId = extractUserId(token);

        BoardResponseDto response = opinionService.getBoard(id, userId);
        return ResponseEntity.ok(response);
    } //method end

    @GetMapping("/clusters/{clusterId}/opinions")
    public ResponseEntity<ClusterOpinionPageResponseDto> getClusterOpinions(
            @PathVariable Long clusterId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size
    ) {
        ClusterOpinionPageResponseDto response = opinionService.getClusterOpinions(clusterId, page, size);
        return ResponseEntity.ok(response);
    }

    private Long extractUserId(String token) {
        if (token == null || !token.startsWith("Bearer ")) {
            return null;
        }

        JwtDto jwtDto = jwtService.getClaim(token.replace("Bearer ", ""));
        return jwtDto != null ? jwtDto.getId() : null;
    }

    private Long requireUserId(String token) {
        return extractUserId(token);
    }

} //class end
