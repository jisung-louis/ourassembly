package com.team3.ourassembly.domain.user;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;
import java.time.Duration;

@Component
@RequiredArgsConstructor
public class Storage {

    private final StringRedisTemplate redisTemplate;
    private static final Duration CODE_TTL = Duration.ofMinutes(5);
    private static final Duration VERIFIED_TTL = Duration.ofMinutes(5);
    private static final Duration FAIL_COUNT_TTL = Duration.ofMinutes(5);
    private static final Duration SEND_COUNT_TTL = Duration.ofMinutes(10);
    private static final Duration BLOCK_TTL = Duration.ofMinutes(3);


    private static final int MAX_FAIL_COUNT = 5;
    private static final int MAX_SEND_COUNT = 5;

    private static final String CODE_KEY_PREFIX = "email:auth:code:";
    private static final String VERIFIED_KEY_PREFIX = "email:auth:verified:";
    private static final String FAIL_KEY_PREFIX = "email:auth:fail:";
    private static final String SEND_COUNT_KEY_PREFIX = "email:auth:send:";
    private static final String SEND_BLOCK_KEY_PREFIX = "email:auth:send:block:";
    private static final String VERIFY_BLOCK_KEY_PREFIX = "email:auth:verify:block:";


    public void validateCanSend(String email) {
        String sendBlockKey = createSendBlockKey(email);

        Boolean isBlocked = redisTemplate.hasKey(sendBlockKey);

        if (Boolean.TRUE.equals(isBlocked)) {
            Long ttl = redisTemplate.getExpire(sendBlockKey);
            throw new RuntimeException("인증 메일 요청 횟수를 초과했습니다. " + ttl + "초 후 다시 시도해 주세요.");
        }

        int sendCount = getSendCount(email);

        if (sendCount >= MAX_SEND_COUNT) {
            blockSend(email);
            throw new RuntimeException("인증 메일 요청 횟수를 초과했습니다. 3분 후 다시 시도해 주세요.");
        }
    }


    public long increaseSendCount(String email) {
        String sendCountKey = createSendCountKey(email);

        Long count = redisTemplate.opsForValue().increment(sendCountKey);

        if (count == null) {
            throw new RuntimeException("인증 메일 발송 횟수 증가 중 오류가 발생했습니다.");
        }

        if (count == 1L) {
            redisTemplate.expire(sendCountKey, SEND_COUNT_TTL);
        }

        return count;
    }


    public int getSendCount(String email) {
        String sendCountKey = createSendCountKey(email);
        String value = redisTemplate.opsForValue().get(sendCountKey);

        if (value == null) {
            return 0;
        }

        return Integer.parseInt(value);
    }


    public void blockSend(String email) {
        String sendBlockKey = createSendBlockKey(email);
        redisTemplate.opsForValue().set(sendBlockKey, "true", BLOCK_TTL);
    }


    public void validateCanVerify(String email) {
        String verifyBlockKey = createVerifyBlockKey(email);

        Boolean isBlocked = redisTemplate.hasKey(verifyBlockKey);

        if (Boolean.TRUE.equals(isBlocked)) {
            Long ttl = redisTemplate.getExpire(verifyBlockKey);
            throw new RuntimeException("인증 번호 입력 횟수를 초과했습니다. " + ttl + "초 후 다시 시도해 주세요.");
        }
    }


    public void saveCode(String email, String code) {
        redisTemplate.opsForValue().set(createCodeKey(email), code, CODE_TTL);
    }

    public String getCode(String email) {
        return redisTemplate.opsForValue().get(createCodeKey(email));
    }

    public long increaseFailCount(String email) {
        String failKey = createFailKey(email);

        Long count = redisTemplate.opsForValue().increment(failKey);

        if (count == null) {
            throw new RuntimeException("인증 실패 횟수 증가 중 오류가 발생했습니다.");
        }

        if (count == 1L) {
            redisTemplate.expire(failKey, FAIL_COUNT_TTL);
        }

        return count;
    }


    public boolean isFailCountExceeded(long failCount) {
        return failCount >= MAX_FAIL_COUNT;
    }


    public void blockVerify(String email) {
        redisTemplate.opsForValue().set(createVerifyBlockKey(email), "true", BLOCK_TTL);
    }


    public void saveVerified(String email) {
        redisTemplate.opsForValue().set(createVerifiedKey(email), "true", VERIFIED_TTL);
    }


    public boolean isVerified(String email) {
        String value = redisTemplate.opsForValue().get(createVerifiedKey(email));
        return "true".equals(value);
    }


    public void removeCode(String email) {
        redisTemplate.delete(createCodeKey(email));
    }


    public void removeFailCount(String email) {
        redisTemplate.delete(createFailKey(email));
    }


    public void removeAll(String email) {
        redisTemplate.delete(createCodeKey(email));
        redisTemplate.delete(createVerifiedKey(email));
        redisTemplate.delete(createFailKey(email));
        redisTemplate.delete(createSendCountKey(email));
        redisTemplate.delete(createSendBlockKey(email));
        redisTemplate.delete(createVerifyBlockKey(email));
    }

    private String createCodeKey(String email) {
        return CODE_KEY_PREFIX + email;
    }

    private String createVerifiedKey(String email) {
        return VERIFIED_KEY_PREFIX + email;
    }

    private String createFailKey(String email) {
        return FAIL_KEY_PREFIX + email;
    }

    private String createSendCountKey(String email) {
        return SEND_COUNT_KEY_PREFIX + email;
    }

    private String createSendBlockKey(String email) {
        return SEND_BLOCK_KEY_PREFIX + email;
    }

    private String createVerifyBlockKey(String email) {
        return VERIFY_BLOCK_KEY_PREFIX + email;
    }
}