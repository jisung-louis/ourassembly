package com.team3.ourassembly.domain.alarm.service;

import com.team3.ourassembly.domain.alarm.dto.NotificationResponseDto;
import com.team3.ourassembly.domain.alarm.entity.FollowEntity;
import com.team3.ourassembly.domain.alarm.entity.NotificationEntity;
import com.team3.ourassembly.domain.alarm.repository.FollowRepository;
import com.team3.ourassembly.domain.alarm.repository.NotificationRepository;
import com.team3.ourassembly.domain.alarm.service.FcmService;
import com.team3.ourassembly.domain.congress.entity.CongressmanEntity;
import com.team3.ourassembly.domain.news.entity.NewsEntity;
import com.team3.ourassembly.domain.user.entity.UserEntity;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final FcmService fcmService;
    private final FollowRepository followRepository;

    public void sendAndSave(UserEntity user, CongressmanEntity congressman, String title, String message, String url) {
        notificationRepository.save(NotificationEntity.builder()
                .user(user)
                .congressman(congressman)
                .title(title)
                .message(message)
                .url(url)
                .build());

        if (user.getFcmToken() != null && !user.getFcmToken().isEmpty()) {
            try {
                // FcmService에 정의한 순서대로: title, body, token, url
                fcmService.sendMessage(title, message, user.getFcmToken(), url);
            } catch (Exception e) {
                // 발송 실패하더라도 DB 저장은 이미 성공했으므로 로그만 남김
                System.err.println("[FCM 발송 에러] 유저ID: " + user.getId() + " - " + e.getMessage());
            }
        }
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    public List<NotificationResponseDto> getNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(NotificationEntity::toDto)
                .collect(Collectors.toList());
    }

    public void markAllAsRead(Long userId) {
        notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .forEach(n -> n.setRead(true));
    }

    public void deleteOne(Long notificationId, Long userId) {
        NotificationEntity notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("알림이 존재하지 않습니다."));

        if (!notification.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("본인 알림만 삭제할 수 있습니다.");
        }

        notificationRepository.delete(notification);
    }

    public void deleteAll(Long userId) {
        notificationRepository.deleteAllByUserId(userId);
    }

    public void sendNewsNotifyToFollowers(CongressmanEntity congressman, List<NewsEntity> newNewsList) {
        if (newNewsList == null || newNewsList.isEmpty()) return;

        List<FollowEntity> followers = followRepository.findByCongressman(congressman);
        if (followers.isEmpty()) return;

        NewsEntity latestNews = newNewsList.get(0);
        String title = "새 뉴스 알림";
        String content = String.format("[%s] 의원의 새 뉴스: %s", congressman.getName(), latestNews.getTitle());
        String newsUrl = "/news/detail/" + latestNews.getId();

        for (FollowEntity follow : followers) {
            try {
                this.sendAndSave(follow.getUser(), congressman, title, content, newsUrl);
            } catch (Exception e) {
                System.err.println("[Notification Error] " + follow.getUser().getId() + " : " + e.getMessage());
            }
        }
    }
}