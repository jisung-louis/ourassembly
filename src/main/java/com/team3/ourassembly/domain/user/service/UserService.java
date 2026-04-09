package com.team3.ourassembly.domain.user.service;

import com.team3.ourassembly.domain.community.board.dto.BoardResponseDto;
import com.team3.ourassembly.domain.community.board.entity.BoardEntity;
import com.team3.ourassembly.domain.community.board.repository.BoardRepository;
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


    public void sign(UserDto userDto){

        if(userRepository.existsByEmail(userDto.getEmail())) {
            throw new RuntimeException("이미 사용 중인 이메일입니다.");
        }

        String status = storage.get(userDto.getEmail());
        if(status==null||!status.equals("verified")){
            throw new RuntimeException("이메일 인증이 완료되지 않았습니다");
        }
        UserEntity saveEntity = userDto.toEntity();
        String pwd = passwordEncoder.encode(saveEntity.getPassword());
        saveEntity.setPassword(pwd);
        userRepository.save(saveEntity);

        boolean result = congressmanService.setUserToCongressman(saveEntity);




        storage.remove(userDto.getEmail());
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




    //fcmToken 업데이트
    public void updateFcmToken(Long userId, String fcmToken) {
        UserEntity user = userRepository.findById(userId)
                .orElse(null);
        user.setFcmToken(fcmToken);
        // @Transactional이 붙어있으면 save를 호출하지 않아도 자동으로 변경 감지(Dirty Checking)되어 업데이트됩니다.
    }
}
