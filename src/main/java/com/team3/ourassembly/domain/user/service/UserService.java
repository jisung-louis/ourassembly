package com.team3.ourassembly.domain.user.service;

import com.team3.ourassembly.domain.community.board.dto.BoardResponseDto;
import com.team3.ourassembly.domain.community.board.entity.BoardEntity;
import com.team3.ourassembly.domain.community.board.repository.BoardRepository;
import com.team3.ourassembly.domain.community.point.repository.PointRepository;
import com.team3.ourassembly.domain.community.reply.dto.ReplyResponseDto;
import com.team3.ourassembly.domain.community.reply.entity.ReplyEntity;
import com.team3.ourassembly.domain.community.reply.repository.ReplyRepository;
import com.team3.ourassembly.domain.community.shop.dto.BarcodeResponseDto;
import com.team3.ourassembly.domain.community.shop.entity.BarcodeEntity;
import com.team3.ourassembly.domain.community.shop.repository.BarcodeRepository;
import com.team3.ourassembly.domain.congress.entity.CongressmanEntity;
import com.team3.ourassembly.domain.congress.repository.CongressmanRepository;
import com.team3.ourassembly.domain.congress.service.CongressmanService;
import com.team3.ourassembly.domain.user.Storage;
import com.team3.ourassembly.domain.user.dto.UserDto;
import com.team3.ourassembly.domain.user.entity.UserEntity;
import com.team3.ourassembly.domain.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    public  final Storage storage;
    private final CongressmanRepository congressmanRepository;
    private final CongressmanService congressmanService;
    private final BoardRepository boardRepository;
    private final ReplyRepository replyRepository;
    private final BarcodeRepository barcodeRepository;
    private final PointRepository pointRepository;


    public void sign(UserDto userDto) {

        // 1. 이미 가입된 이메일인지 확인
        if (userRepository.existsByEmail(userDto.getEmail())) {
            throw new RuntimeException("이미 사용 중인 이메일입니다.");
        }

        // 2. Redis에서 이메일 인증 완료 상태 확인
        // 이제는 email:auth:verified:{email} key의 값이 "true"인지 확인한다.
        if (!storage.isVerified(userDto.getEmail())) {
            throw new RuntimeException("이메일 인증이 완료되지 않았습니다");
        }

        // 3. DTO를 Entity로 변환
        UserEntity saveEntity = userDto.toEntity();

        // 4. 비밀번호 암호화
        String pwd = passwordEncoder.encode(saveEntity.getPassword());
        saveEntity.setPassword(pwd);

        // 5. 사용자 저장
        userRepository.save(saveEntity);

        // 6. 지역구 의원 연결
        boolean result = congressmanService.setUserToCongressman(saveEntity);

        // 7. 회원가입이 끝났으므로 Redis 인증 관련 key 전체 삭제
        storage.removeAll(userDto.getEmail());
    }


    public UserDto login(UserDto loginDto){

        UserEntity userEntity = userRepository.findByEmail(loginDto.getEmail())
                .orElseThrow(() -> new RuntimeException("존재하지 않는 사용자입니다."));

        if(!passwordEncoder.matches(loginDto.getPassword(), userEntity.getPassword())) {
            throw new RuntimeException("비밀번호가 일치하지 않습니다.");
        }

        if (loginDto.getFcmToken() != null && !loginDto.getFcmToken().isEmpty()) {
            userEntity.setFcmToken(loginDto.getFcmToken());
        }

        if("manager@gmail.com".equals(userEntity.getEmail())){
            UserDto dto = userEntity.toDto();
            dto.setRole("admin");
            return dto;
        }

        Optional<CongressmanEntity> optional = congressmanRepository.findByUser(userEntity);
        if(optional.isPresent()){
            UserDto dto = userEntity.toDto();
            dto.setRole("congress");
            dto.setCongressmanId(optional.get().getId());
            return dto;
        }
        else
        {return userEntity.toDto();}

    }

    //마이페이지
    public UserDto myInfo(Long loginId){
        Optional<UserEntity> optional = userRepository.findById(loginId);
        if(optional.isPresent()){
            return optional.get().toDto();
        }
        return null;
    }

    // 내가 쓴 게시물
    public List<BoardResponseDto> myBoard(Long userId){
        return boardRepository.myboard(userId).stream().map(BoardEntity::toDto).collect(Collectors.toList());
    }

    // 내가 쓴 댓글
    public List<ReplyResponseDto> myReply(Long userId){
        return replyRepository.myreply(userId).stream().map(ReplyEntity::toDto).collect(Collectors.toList());
    }

    // 내 기프티콘 조회
    public List<BarcodeResponseDto> myGift(Long userId) {
        return barcodeRepository.myGift(userId).stream().map(BarcodeEntity::toDto).collect(Collectors.toList());
    }


    // 내 포인트 조회
    public Integer myPoint(Long userId) {
        Integer point = pointRepository.sumPointByUserId(userId);
        return point != null ? point : 0;
    }




    //fcmToken 업데이트
    public void updateFcmToken(Long userId, String fcmToken) {
        UserEntity user = userRepository.findById(userId)
                .orElse(null);
        user.setFcmToken(fcmToken);
        // @Transactional이 붙어있으면 save를 호출하지 않아도 자동으로 변경 감지(Dirty Checking)되어 업데이트됩니다.
    }
}
