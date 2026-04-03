package com.team3.ourassembly.domain.community.reply.controller;

import com.team3.ourassembly.domain.community.board.dto.ResponseDto;
import com.team3.ourassembly.domain.community.reply.dto.ReplyRequestDto;
import com.team3.ourassembly.domain.community.reply.dto.ReplyResponseDto;
import com.team3.ourassembly.domain.community.reply.service.ReplyService;
import com.team3.ourassembly.global.jwt.dto.JwtDto;
import com.team3.ourassembly.global.jwt.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tools.jackson.core.util.RecyclerPool;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ReplyController {
    private final ReplyService replyService;
    private final JwtService jwtService;

    //댓글 작성
    @PostMapping("/reply")
    public ResponseEntity<?> replyPost(@RequestBody ReplyRequestDto replyRequestDto,
                                       @RequestHeader("Authorization")String token,
                                       @RequestParam Long boardId
    ){

        if (token == null || !token.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String inToken = token.replace("Bearer ", "");
        JwtDto jwtDto = jwtService.getClaim(inToken);
        if (jwtDto == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Long userId = jwtDto.getId();

        ReplyResponseDto newReply = replyService.replyPost(replyRequestDto , userId , boardId);
        if(newReply==null){
            ResponseEntity.status(500).body("");
        }
        return ResponseEntity.ok(newReply);
    }

    @GetMapping("/reply")
    public ResponseEntity<?> replyGet(@RequestParam Long boardId){
        List<ReplyResponseDto> replyList = replyService.replyGet(boardId);
        if(replyList==null){
            ResponseEntity.status(500).body("");
        }
        return ResponseEntity.ok(replyList);
    }

    // 댓글 수정
    @PutMapping("/reply")
    public ResponseEntity<?> replyUpdate(@RequestBody ReplyRequestDto replyRequestDto,
                                         @RequestHeader("Authorization")String token
    ){
        if (token == null || !token.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String inToken = token.replace("Bearer ", "");
        JwtDto jwtDto = jwtService.getClaim(inToken);
        if (jwtDto == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Long userId = jwtDto.getId();

       ReplyResponseDto update = replyService.replyUpdate(replyRequestDto , userId );
       if(update == null){
           return ResponseEntity.status(500).body("");
       }return ResponseEntity.ok(update);
    }

    //댓글 삭제
    @DeleteMapping("/reply")
    public ResponseEntity<?> replyDelete(@RequestParam Long replyId , @RequestHeader("Authorization")String token){

        if (token == null || !token.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String inToken = token.replace("Bearer ", "");
        JwtDto jwtDto = jwtService.getClaim(inToken);
        if (jwtDto == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Long userId = jwtDto.getId();

        Boolean result = replyService.replyDelete(replyId , userId);
        if(result == false){
            return ResponseEntity.status(500).body("");
        }return ResponseEntity.ok(result);

    }


}
