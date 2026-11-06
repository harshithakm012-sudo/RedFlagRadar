package com.redflagradar.dto;

import java.util.List;

public record AnalysisResponse(
        Integer riskScore,
        String riskLevel,
        String summary,
        List<Evidence> evidence,
        List<MessageFinding> messageFindings,
        List<ConversationPattern> patterns,
        List<String> recommendations,
        List<ChecklistItem> verificationChecklist) {

    public record Evidence(String code, Integer messageIndex, String text, String explanation) { }

    public record MessageFinding(int messageIndex, int riskScore, String riskLevel, List<Evidence> evidence) { }

    public record ConversationPattern(String code, String message) { }

    public record ChecklistItem(String id, String title, String why, boolean completed) { }
}
