package com.team3.ourassembly.domain.user.service;

import com.team3.ourassembly.domain.user.Storage;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MailService {

    private final JavaMailSender mailSender;
    private final Storage storage;


    //     * - 10분 안에 최대 5회 발송 허용
    //     * - 5회 초과 시 3분 동안 재발송 차단
    //     * - 메일 발송 성공 후에만 발송 횟수 증가
    public void sendEmail(String email) {

        // 1. 현재 인증 메일 발송이 가능한 상태인지 확인
        storage.validateCanSend(email);

        // 2. 6자리 인증번호 생성
        String random = String.valueOf((int) (Math.random() * 899999) + 100000);

        MimeMessage message = mailSender.createMimeMessage();

        try {
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(email);
            helper.setSubject("[OurAssembly] 회원가입 인증 번호");

            String content = "<h3>인증 번호 안내</h3>" +
                    "<p>번호: <b>" + random + "</b></p>";

            helper.setText(content, true);

            // 3. 메일 발송
            mailSender.send(message);

            // 4. 메일 발송 성공 후 Redis에 인증번호 저장
            storage.saveCode(email, random);

            // 5. 메일 발송 성공 후 발송 횟수 증가
            long sendCount = storage.increaseSendCount(email);

            // 6. 이번 발송으로 최대 횟수에 도달한 경우,
            // 다음 요청부터는 validateCanSend()에서 3분 차단된다.
            if (sendCount >= 5) {
                storage.blockSend(email);
            }

        } catch (MessagingException e) {

            // 메일 발송 실패 시 인증번호 저장은 하지 않는다.
            throw new RuntimeException("메일 발송 오류");
        }
    }

    /**
     * 이메일 인증번호 확인
     *
     * 정책:
     * - 인증번호 5회 실패 시 현재 인증번호 폐기
     * - 3분 동안 인증번호 확인 차단
     * - 인증 성공 시 verified key 저장
     */
    public void verifyCode(String email, String inputCode) {

        // 1. 인증번호 확인 차단 상태인지 먼저 확인
        storage.validateCanVerify(email);

        // 2. Redis에서 인증번호 조회
        String savedCode = storage.getCode(email);

        // 3. 인증번호가 없으면 만료되었거나 발급되지 않은 상태
        if (savedCode == null) {
            throw new RuntimeException("인증 번호가 만료되었거나 존재하지 않습니다.");
        }

        // 4. 인증번호가 일치하지 않는 경우
        if (!savedCode.equals(inputCode)) {

            // 실패 횟수 1 증가
            long failCount = storage.increaseFailCount(email);

            // 5회 이상 틀리면 인증번호 폐기 + 3분 차단
            if (storage.isFailCountExceeded(failCount)) {
                storage.removeCode(email);
                storage.removeFailCount(email);
                storage.blockVerify(email);

                throw new RuntimeException("인증 번호 입력 횟수를 초과했습니다. 3분 후 다시 시도해 주세요.");
            }

            throw new RuntimeException("인증 번호가 일치하지 않습니다. 남은 시도 횟수: " + (5 - failCount));
        }

        // 5. 인증 성공 상태 저장
        storage.saveVerified(email);

        // 6. 인증 성공 후 인증번호와 실패 횟수 삭제
        storage.removeCode(email);
        storage.removeFailCount(email);
    }
}