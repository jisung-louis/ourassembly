package com.team3.ourassembly.domain.user.service;

import com.team3.ourassembly.domain.user.Storage;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.apache.logging.log4j.message.Message;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MailService {

    private final JavaMailSender mailSender;
    private final Storage storage;

    public void newCertify(String email){
        String random = String.valueOf((int)(Math.random()*899999)+100000);

        MimeMessage message = mailSender.createMimeMessage();
        try{
            MimeMessageHelper helper = new MimeMessageHelper(message , true , "UTF-8");
            helper.setTo(email);
            helper.setSubject("[OurAssembly] 회원가입 인증 번호");

            String content = "<h3>인증 번호 안내</h3>" +
                    "<p>번호: <b>" + random + "</b></p>";
            helper.setText(content, true);
            mailSender.send(message);
            storage.save(email,random);
        }catch (MessagingException e){throw new RuntimeException("메일 발송 오류");}

    }

    public boolean verifyCode(String email, String inputCode) {
        String savedCode = storage.get(email);
        if (savedCode != null && savedCode.equals(inputCode)) {
            storage.remove(email); // 인증 성공 시 즉시 삭제 (보안 팩트)
            return true;
        }
        return false;
    }

}




