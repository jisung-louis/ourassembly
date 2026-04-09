package com.team3.ourassembly.domain.opinion.service;

import com.team3.ourassembly.domain.opinion.entity.OpinionEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class ClusterSummaryService {
    private final OpenAiChatModel chatModel;

    public ClusterSummary summarize(List<OpinionEntity> opinions, String fallbackTitle, String fallbackContent) {
        if (opinions.isEmpty()) {
            return new ClusterSummary(fallbackTitle, fallbackContent);
        }

        try {
            String prompt = buildPrompt(opinions);
            OpenAiChatOptions options = OpenAiChatOptions.builder()
                    .maxTokens(300)
                    .temperature(0.4)
                    .build();

            ChatResponse response = chatModel.call(new Prompt(prompt, options));
            if (response == null || response.getResult() == null || response.getResult().getOutput() == null) {
                return new ClusterSummary(fallbackTitle, fallbackContent);
            }

            String text = response.getResult().getOutput().getText();
            if (text == null || text.isBlank()) {
                return new ClusterSummary(fallbackTitle, fallbackContent);
            }

            return parseSummary(text.trim(), fallbackTitle, fallbackContent);
        } catch (Exception exception) {
            return new ClusterSummary(fallbackTitle, fallbackContent);
        }
    }

    private String buildPrompt(List<OpinionEntity> opinions) {
        StringBuilder builder = new StringBuilder("""
                아래는 같은 주제로 묶인 시민 의견 3개 이하입니다.
                이 의견 묶음을 게시판 카드로 보여주려고 합니다.

                조건:
                1. TITLE은 25자 이내의 짧은 대표 주제로 작성하세요.
                2. CONTENT는 2문장 이내로 핵심만 요약하세요.
                3. 과장하지 말고, 시민이 이해하기 쉬운 표현을 사용하세요.
                4. 응답 형식은 아래를 반드시 지키세요.

                TITLE: ...
                CONTENT: ...

                의견 목록:
                """);

        for (int i = 0; i < opinions.size(); i++) {
            OpinionEntity opinion = opinions.get(i);
            builder.append(i + 1)
                    .append(". 제목: ")
                    .append(Objects.toString(opinion.getTitle(), ""))
                    .append("\n")
                    .append("   내용: ")
                    .append(Objects.toString(opinion.getContent(), ""))
                    .append("\n");
        }

        return builder.toString();
    }

    private ClusterSummary parseSummary(String text, String fallbackTitle, String fallbackContent) {
        String[] lines = text.split("\\R");
        String title = null;
        StringBuilder contentBuilder = new StringBuilder();
        boolean readingContent = false;

        for (String line : lines) {
            if (line.startsWith("TITLE:")) {
                title = line.substring("TITLE:".length()).trim();
                readingContent = false;
            }
            if (line.startsWith("CONTENT:")) {
                String firstLine = line.substring("CONTENT:".length()).trim();
                if (!firstLine.isBlank()) {
                    contentBuilder.append(firstLine);
                }
                readingContent = true;
                continue;
            }

            if (readingContent && !line.isBlank()) {
                if (contentBuilder.length() > 0) {
                    contentBuilder.append(' ');
                }
                contentBuilder.append(line.trim());
            }
        }

        String content = contentBuilder.toString().trim();

        if (title == null || title.isBlank()) {
            title = fallbackTitle;
        }
        if (content == null || content.isBlank()) {
            content = fallbackContent;
        }

        return new ClusterSummary(title, content);
    }

    public record ClusterSummary(String title, String content) {
    }
}
