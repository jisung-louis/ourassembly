package com.team3.ourassembly.domain.community.board.service;

import com.team3.ourassembly.domain.community.board.dto.BoardCreateDto;
import com.team3.ourassembly.domain.community.board.dto.BoardResponseDto;
import com.team3.ourassembly.domain.community.board.dto.BoardUpdateDto;
import com.team3.ourassembly.domain.community.board.entity.BoardEntity;
import com.team3.ourassembly.domain.community.board.entity.BoardLikeEntity;
import com.team3.ourassembly.domain.community.board.entity.BoardViewEntity;
import com.team3.ourassembly.domain.community.board.repository.BoardLikeRepository;
import com.team3.ourassembly.domain.community.board.repository.BoardRepository;
import com.team3.ourassembly.domain.community.board.repository.BoardViewRepository;
import com.team3.ourassembly.domain.community.point.entity.PointEntity;
import com.team3.ourassembly.domain.community.point.repository.PointRepository;
import com.team3.ourassembly.domain.community.reply.repository.ReplyRepository;
import com.team3.ourassembly.domain.user.entity.UserEntity;
import com.team3.ourassembly.domain.user.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class BoardService {
    private final UserRepository userRepository;
    private final BoardRepository boardRepository;
    private final BoardLikeRepository boardLikeRepository;
    private final BoardViewRepository boardViewRepository;
    private final PointRepository pointRepository;
    private final ReplyRepository replyRepository;


    //게시물 등록
    public BoardResponseDto boardPost(BoardCreateDto boardCreateDto , Long userId){

        // 존재하는 유저인지
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(()->new IllegalArgumentException("유저를 찾을 수 없습니다"));
        BoardEntity boardEntity = boardRepository.save(boardCreateDto.toEntity(user));
        pointRepository.save(PointEntity.builder()
                        .changeVal(+500)
                        .reason(1)
                        .user(user)
                        .build());
        return boardEntity.toDto();
    }


    // 게시물 전체 조회
    public Page<BoardResponseDto> boardGet(String district, String sort, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page - 1, size);

        if (district == null) {
            return sort.equals("popular")
                    ? boardRepository.findAllOrderByLikeCount(pageRequest).map(BoardEntity::toDto)
                    : boardRepository.findAllByOrderByCreatedAtDesc(pageRequest).map(BoardEntity::toDto);
        }

        Page<BoardEntity> boardEntityPage = sort.equals("popular")
                ? boardRepository.findByDistrictOrderByLikeCount(district, pageRequest)
                : boardRepository.findByDistrictOrderByCreatedAtDesc(district, pageRequest);

        return boardEntityPage.map(BoardEntity::toDto);
    }


    // 게시물 상세조회(조회하면 조회수 증가)
    public BoardResponseDto boardDetail(Long boardId, HttpServletRequest request) {
        Optional<BoardEntity> optional = boardRepository.findById(boardId);
        if (optional.isPresent()) {
            BoardEntity entity = optional.get();
            String ip = request.getRemoteAddr();
            String device = request.getSession().getId();

            Optional<BoardViewEntity> view = boardViewRepository.viewQuery(ip, device, boardId);
            if (view.isEmpty()) {
                boardViewRepository.save(BoardViewEntity.builder()
                        .ip(ip)
                        .device(device)
                        .board(entity)
                        .build());
                entity.setView_count(entity.getView_count() + 1);
                boardRepository.save(entity);
            }

            if(entity.getView_count() >= 10){
                pointRepository.save(PointEntity.builder()
                        .changeVal(+500)
                        .reason(1)
                        .user(entity.getUser())
                        .build());
            }

            return entity.toDto();
        }
        return null;
    }

    // 제목 , 내용 검색
    public Page<BoardResponseDto> boardSearch(String district ,String keyword , int page , int size){
        PageRequest pageRequest = PageRequest.of(page -1 , size);

        if (district == null) {
            return boardRepository.findByTitleContainingOrContentContaining(keyword, keyword ,pageRequest)
                    .map(BoardEntity::toDto);
        }
        return boardRepository.searchByDistrict(district, keyword, pageRequest)
                .map(BoardEntity::toDto);



    }

    //글 수정
    public BoardResponseDto boardUpdate(BoardUpdateDto boardUpdateDto , Long userId){
        BoardEntity board = boardRepository.findById(boardUpdateDto.getBoardId()).orElse( null );
            if(board.getUser().getId().equals(userId)){
                BoardEntity saved = board;
                saved.setTitle(boardUpdateDto.getTitle());
                saved.setContent(boardUpdateDto.getContent());
                if(boardUpdateDto.getDistrict() != null) {
                    board.setDistrict(boardUpdateDto.getDistrict());
                }
                boardRepository.save(saved);
                return saved.toDto();
            }
        return null;
    }

    //글 삭제
    public boolean boardDelete(Long boardId , Long userId){
        Optional<BoardEntity> optional = boardRepository.findById(boardId);
        if(optional.isPresent()){
            Long boardUser = optional.get().getUser().getId();
            if(boardUser.equals(userId)){
                boardViewRepository.deleteAllByBoardId(boardId);
                boardLikeRepository.deleteAllByBoardId(boardId);
                replyRepository.deleteAllByBoardId(boardId);
                boardRepository.deleteById(boardId);
                return true;
            }else{return false;}
        }
        return false;
    }

    // 1인당 1좋아요
    public boolean boardLike(Long boardId , Long userId){
        Optional<BoardEntity> optional = boardRepository.findById(boardId);
        if(optional.isPresent()){
            Optional<BoardLikeEntity> like = boardLikeRepository.likeQuery(userId , boardId);
            if(like.isPresent()){
                boardLikeRepository.delete(like.get());
                optional.get().setLike_count(optional.get().getLike_count() - 1);
                boardRepository.save(optional.get());
                return false;
            } else{
                Optional<UserEntity> likeUser = userRepository.findById(userId);
                if (likeUser.isEmpty()) return false;
                optional.get().setLike_count(optional.get().getLike_count() + 1);
                boardRepository.save(optional.get());
                BoardLikeEntity newLike = BoardLikeEntity.builder()
                        .user(likeUser.get())
                        .board(optional.get())
                        .type(2)
                        .build();
                boardLikeRepository.save(newLike);
                return true;
            }
        }
        return false;
    }




}
