package com.team3.ourassembly.domain.community.reply.service;

import com.team3.ourassembly.domain.community.board.entity.BoardEntity;
import com.team3.ourassembly.domain.community.board.repository.BoardRepository;
import com.team3.ourassembly.domain.community.reply.dto.ReplyRequestDto;
import com.team3.ourassembly.domain.community.reply.dto.ReplyResponseDto;
import com.team3.ourassembly.domain.community.reply.entity.ReplyEntity;
import com.team3.ourassembly.domain.community.reply.repository.ReplyRepository;
import com.team3.ourassembly.domain.user.entity.UserEntity;
import com.team3.ourassembly.domain.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class ReplyService {
    private final ReplyRepository replyRepository;
    private final BoardRepository boardRepository;
    private final UserRepository userRepository;

    //댓글 작성
    public ReplyResponseDto replyPost(ReplyRequestDto replyRequestDto , Long userId , Long boardID){
        Optional<BoardEntity> optional = boardRepository.findById(boardID);
        if(optional.isPresent()){
            Optional<UserEntity> user = userRepository.findById(userId);
            ReplyEntity replyEntity = replyRepository.save(ReplyEntity.builder()
                            .content(replyRequestDto.getContent())
                            .board(optional.get())
                            .user(user.get())
                            .build());
            return replyEntity.toDto();
        }
        return null;
    }

    // 댓글 전체조회
    public List<ReplyResponseDto> replyGet(Long boardId){
        List<ReplyEntity> replyEntityList = replyRepository.findByBoardId(boardId);
        return replyEntityList.stream().map(ReplyEntity::toDto).collect(Collectors.toList());

    }

    //댓글 수정
    public ReplyResponseDto replyUpdate(ReplyRequestDto replyRequestDto , Long userId){
            Optional<ReplyEntity> update = replyRepository.findById(replyRequestDto.getReplyId());
            if(update.get().getUser().getId().equals(userId)){
                update.get().setContent(replyRequestDto.getContent());
                replyRepository.save(update.get());
                return update.get().toDto();
            }
        return null;
    }

    //댓글 삭제
    public boolean replyDelete(Long replyId , Long userId){
        Optional<ReplyEntity> delete = replyRepository.findById(replyId);
        if(delete.isPresent()){
            Long replyUser = delete.get().getUser().getId();
            Long boardUser = delete.get().getBoard().getUser().getId();
            if(replyUser.equals(userId)||boardUser.equals(userId)){
                replyRepository.deleteById(replyId);
                return true;
            }
        }
        return false;
    }
}
