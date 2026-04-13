package com.team3.ourassembly.domain.admin.service;

import com.team3.ourassembly.domain.admin.dto.*;
import com.team3.ourassembly.domain.community.board.repository.BoardRepository;
import com.team3.ourassembly.domain.community.point.repository.PointRepository;
import com.team3.ourassembly.domain.community.reply.repository.ReplyRepository;
import com.team3.ourassembly.domain.opinion.repository.OpinionRepository;
import com.team3.ourassembly.domain.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminService {

    private final UserRepository userRepository;
    private final BoardRepository boardRepository;
    private final ReplyRepository replyRepository;
    private final PointRepository pointRepository;
    private final OpinionRepository opinionRepository;

    // 통계 카드
    public StatCardDto getStats() {
        return StatCardDto.builder()
                .totalUsers(userRepository.count())
                .totalBoards(boardRepository.count())
                .totalReplies(replyRepository.count())
                .totalPointIssued(pointRepository.sumAllIssuedPoints())
                .totalPointUsed(pointRepository.sumAllUsedPoints())
                .todayBoards(boardRepository.countTodayBoards())
                .todayReplies(replyRepository.countTodayReplies())
                .build();
    }

    // 커뮤니티 현황
    public CommunityDto getCommunity() {
        return CommunityDto.builder()
                .topDistricts(boardRepository.findTopDistricts())
                .topBoards(boardRepository.findTopBoardsByLike())
                .build();
    }

    // 회원 현황
    public UserStatDto getUsers() {
        return UserStatDto.builder()
                .recentUsers(userRepository.findRecentUsers())
                .topBoardUsers(boardRepository.findTopBoardUsers())
                .build();
    }

    // 포인트 현황
    public PointStatDto getPoints() {
        return PointStatDto.builder()
                .totalPointIssued(pointRepository.sumAllIssuedPoints())
                .totalPointUsed(pointRepository.sumAllUsedPoints())
                .recentPoints(pointRepository.findRecentPoints())
                .build();
    }

    // 의견 현황
    public OpinionStatDto getOpinions() {
        return OpinionStatDto.builder()
                .totalOpinions(opinionRepository.count())
                .pendingOpinions(opinionRepository.countByStatus("답변대기"))
                .answeredOpinions(opinionRepository.countByStatus("답변완료"))
                .topCongressmanByOpinion(opinionRepository.findTopCongressmanByOpinionCount())
                .build();
    }
}
