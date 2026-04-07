package com.team3.ourassembly.domain.bill.service;

import com.team3.ourassembly.domain.bill.entity.BillEntity;
import com.team3.ourassembly.domain.bill.entity.BillSummaryStatus;
import com.team3.ourassembly.domain.bill.repository.BillRepository;
import lombok.RequiredArgsConstructor;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

@Service
@RequiredArgsConstructor
public class BillSummaryAsyncService {

    private final BillRepository billRepository;
    private final OpenAiChatModel chatModel;
    private final WebClient webClient = WebClient.builder().build();

    @Async
    public void generateSummaryAsync(String billId) {
        BillEntity bill = billRepository.findById(billId)
                .orElse(null);

        if (bill == null) {
            return;
        }

        try {
            String sourceText = fetchSummarySourceText(billId);
            if (sourceText == null || sourceText.isBlank()) {
                markFailed(billId);
                return;
            }

            String summary = summarizeBillContent(bill.getBillName(), sourceText);

            BillEntity latestBill = billRepository.findById(billId)
                    .orElse(null);
            if (latestBill == null) {
                return;
            }

            latestBill.setSummary(summary);
            latestBill.setSummaryStatus(BillSummaryStatus.COMPLETED);
            billRepository.save(latestBill);
            System.out.println("[LOG] 의안 요약 생성이 완료되었습니다. billId=" + billId);
        } catch (Exception exception) {
            markFailed(billId);
            System.out.println("[WARNING] 의안 요약 생성에 실패했습니다. billId=" + billId + ", message=" + exception.getMessage());
        }
    }

    private void markFailed(String billId) {
        billRepository.findById(billId).ifPresent(bill -> {
            bill.setSummaryStatus(BillSummaryStatus.FAILED);
            billRepository.save(bill);
        });
    }

    private String fetchSummarySourceText(String billId) {
        MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
        formData.add("billId", billId);
        formData.add("tmprAnYn", "N");
        formData.add("stageMemo", "N");

        String html = webClient.post()
                .uri("https://likms.assembly.go.kr/bill/bi/bill/detail/billInfo.do")
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .header(HttpHeaders.USER_AGENT, "Mozilla/5.0")
                .header(HttpHeaders.ORIGIN, "https://likms.assembly.go.kr")
                .header(HttpHeaders.REFERER, "https://likms.assembly.go.kr/bill/bi/billDetailPage.do?billId=" + billId)
                .body(BodyInserters.fromFormData(formData))
                .retrieve()
                .bodyToMono(String.class)
                .block();

        if (html == null || html.isBlank()) {
            return null;
        }

        Document document = Jsoup.parse(html);
        Element summaryElement = document.selectFirst("#prntSummary");
        return summaryElement != null ? summaryElement.text().trim() : null;
    }

    private String summarizeBillContent(String billName, String sourceText) {
        String prompt = billName +
                """
                          발의안에 대한 '제안이유 및 주요내용'이야. 이걸 2문장 이내로 요약해.
                         답변은 법률을 모르는 시민들도 쉽게 이해할 수 있게 법률 용어를 최대한 지양해.
                         ~해요 체를 사용해.
                """
                + sourceText;

        OpenAiChatOptions options = OpenAiChatOptions.builder()
                .maxTokens(300)
                .temperature(0.7)
                .build();

        ChatResponse response = chatModel.call(new Prompt(prompt, options));
        System.out.println("response = " + response);
        if (response == null || response.getResult() == null || response.getResult().getOutput() == null) {
            throw new IllegalStateException("LLM 응답이 비어 있습니다.");
        }

        String summary = response.getResult().getOutput().getText();
        if (summary == null || summary.isBlank()) {
            throw new IllegalStateException("LLM 요약 결과가 비어 있습니다.");
        }

        return summary.trim();
    }
}
