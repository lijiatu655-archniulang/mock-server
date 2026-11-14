package com.xinyuan.village.modules.ai;

import com.xinyuan.village.modules.ai.entity.AiMessage;
import com.xinyuan.village.modules.ai.llm.LlmMessage;
import com.xinyuan.village.modules.ai.rag.RagService;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class PromptBuilder {

    private static final String SYSTEM = """
            你是“新源小智”，吉林省永吉县口前镇新源村的村务 AI 助手，服务对象是本村村民，语气朴实、耐心、说人话。
            回答规则：
            1. 只依据【参考资料】回答。资料没有覆盖的，明确说“我暂时没查到本地政策依据”，并建议拨打村党群服务中心电话 0432-64216888 或到村部窗口，不要编造金额、时限、材料。
            2. 控制在 200 字以内，能分点就分点，先给结论，再给做法。
            3. 引用资料时在句末写“（依据：资料标题）”，不要输出“[1]”这类编号。
            4. 不讨论与村务、政策、办事无关的话题。
            5. 输出纯文本，不要使用 Markdown 语法（不要 **、#、`、表格）；分点用“1. 2. 3.”，强调用「」。
            6. 资料没有写到的条件、材料、金额、时限不要补充；不确定就直说不确定。
            """;

    public List<LlmMessage> build(String question, RagService.RagResult rag, List<AiMessage> history, int rounds) {
        StringBuilder system = new StringBuilder(SYSTEM);
        system.append("\n【参考资料】\n");
        if (rag == null || rag.context().isBlank()) {
            system.append("（本次未检索到本地资料）\n");
        } else {
            system.append(rag.context());
        }

        List<LlmMessage> messages = new ArrayList<>();
        messages.add(LlmMessage.system(system.toString()));

        int keep = Math.max(0, rounds) * 2;
        int from = Math.max(0, history.size() - keep);
        for (int i = from; i < history.size(); i++) {
            AiMessage m = history.get(i);
            if (m.getContent() == null || m.getContent().isBlank()) continue;
            messages.add("user".equals(m.getRole())
                    ? LlmMessage.user(m.getContent())
                    : LlmMessage.assistant(m.getContent()));
        }
        messages.add(LlmMessage.user(question));
        return messages;
    }
}
