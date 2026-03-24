package com.team3.ourassembly.domain.user.service;

import com.team3.ourassembly.domain.user.Storage;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.apache.logging.log4j.message.Message;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Transactional
public class MailService {

    private final JavaMailSender mailSender;
    private final Storage storage;

    public void sendEmail(String email){
        String random = String.valueOf((int)(Math.random()*899999)+100000);

        storage.save(email,random);
        MimeMessage message = mailSender.createMimeMessage();
        try{
            MimeMessageHelper helper = new MimeMessageHelper(message , true , "UTF-8");
            helper.setTo(email);
            helper.setSubject("[OurAssembly] 회원가입 인증 번호");

            String content = "<h3>인증 번호 안내</h3>" +
                    "<p>번호: <b>" + random + "</b></p>";
            helper.setText(content, true);
            mailSender.send(message);
        }catch (MessagingException e){
            storage.remove(email);
            throw new RuntimeException("메일 발송 오류");}

    }

    public void verifyCode(String email, String inputCode) {
        String savedCode = storage.get(email);
        if (savedCode == null) {
            throw new RuntimeException("인증 번호가 만료되었거나 존재하지 않습니다.");
        }
        if (!savedCode.equals(inputCode)) {
            throw new RuntimeException("인증 번호가 일치하지 않습니다.");
        }
        storage.save(email , "verified");
    }
}




