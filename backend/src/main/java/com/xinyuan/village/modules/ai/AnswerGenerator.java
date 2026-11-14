package com.xinyuan.village.modules.ai;

import com.xinyuan.village.modules.content.ContentMapper;
import com.xinyuan.village.modules.content.entity.CmsArticle;
import com.xinyuan.village.modules.gov.GovMapper;
import com.xinyuan.village.modules.gov.entity.GovItem;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * 与 cilent/mock/ai.js 完全一致的规则引擎：先结构化事项、再政策知识、查不到直说。
 */
@Component
@RequiredArgsConstructor
public class AnswerGenerator {

    private final GovMapper govMapper;
    private final ContentMapper contentMapper;

    public record Answer(String intent, String text, List<Map<String, Object>> refs, List<String> followUps) {
    }

    public Answer answerFor(String question) {
        String q = question == null ? "" : question.replaceAll("\\s", "");
        String intent = "fallback";
        if (q.matches(".*(养老|退休|缴费档次|缴满15年|15年).*")) intent = "pension";
        else if (q.matches(".*(医保|医疗|新农合|380|参保缴费|看病|报销).*")) intent = "medical";
        else if (q.matches(".*(独生|光荣证).*")) intent = "onechild";
        else if (q.matches(".*(高龄|80岁|八十|津贴).*")) intent = "elder";
        else if (q.matches(".*(出生|医学证明|新生儿).*")) intent = "birth";
        else if (q.matches(".*(就业|失业|创业|找工作|招聘).*")) intent = "job";
        else if (q.matches(".*(电话|地址|在哪|上班|办公|几点|村委会).*")) intent = "contact";
        else if (q.matches(".*(诉求|投诉|纠纷|建议|报修).*")) intent = "appeal";
        else if (q.matches(".*(你好|您好|你是谁|能做什么|介绍).*")) intent = "hello";

        return switch (intent) {
            case "medical" -> new Answer(intent,
                    "今年城乡居民医保的个人缴费标准是每人每年 380 元，集中缴费期到 2026 年 12 月 31 日。\n\n" +
                    "可以用这三种方式缴费：\n1. 微信搜索“新疆税务社保缴费”小程序，按提示填写姓名和身份证号；\n" +
                    "2. 带身份证或户口簿到农业银行、农商银行网点柜台；\n" +
                    "3. 不会用手机的老人，可以到村党群服务中心 1 号窗口，由工作人员协助代收。\n\n" +
                    "要特别注意：新参保、断保人员要先登记再缴费，逾期会有待遇等待期。低保、特困等对象按政策享受资助参保。\n\n" +
                    "你是给自己缴，还是帮家里老人缴？我可以把对应材料再说细一点。",
                    refs(
                            articleRef("a1001", "个人缴费380元/人·年，集中缴费期至12月31日。"),
                            itemRef("YB001", "承诺1个工作日；支持线上、银行、村部代收。")),
                    List.of("帮老人代缴要带什么？", "医保报销比例是多少？"));

            case "pension" -> new Answer(intent,
                    "城乡居民养老保险有 12 个缴费档次，从每年 200 元到 3000 元不等，多缴多得、长缴多得，政府会按档次给补贴。\n\n" +
                    "参保条件是：年满 16 周岁（不含在校学生）、有新源县户籍、没有参加职工养老保险。累计缴满 15 年，年满 60 周岁就可以按月领养老金，终身领取。\n\n" +
                    "首次参保要带身份证或户口簿、本人银行卡，到村党群服务中心 1 号窗口登记。缴费可以在“新疆税务社保缴费”小程序上完成，也可以签代扣协议。\n\n" +
                    "具体档次金额以县社保中心当年公布为准，咨询电话 12333。",
                    refs(
                            articleRef("a1006", "12个缴费档次200—3000元，政府按档次补贴。"),
                            itemRef("YL002", "年满16周岁、未参加职工养老保险的本村户籍居民。")),
                    List.of("缴满15年还要继续缴吗？", "60岁后每月能领多少？"));

            case "onechild" -> new Answer(intent,
                    "独生子女父母光荣证，需要满足三个条件：\n1. 夫妻双方或一方有新源县户籍；\n" +
                    "2. 2016 年 1 月 1 日之前生育一个子女，且自愿终身只生育一个子女；\n" +
                    "3. 子女未满 18 周岁，或已满 18 周岁但父母没有再生育、没有收养子女。\n\n" +
                    "需要准备：夫妻双方身份证、户口簿、结婚证、子女出生医学证明，以及双方各 2 张免冠照片。再婚家庭还要带离婚协议或判决书。\n\n" +
                    "材料齐全后到村党群服务中心 3 号窗口提交，由村里统一代办，5 个工作日办结。注意：2016 年 1 月 1 日以后生育第一个子女的，不能再办这个证。",
                    refs(
                            itemRef("DZ004", "材料齐全5个工作日办结，村部可代办。"),
                            articleRef("a1009", "2016年前生育一个子女且自愿终身只生育一个子女。")),
                    List.of("再婚家庭需要哪些额外材料？", "证件可以邮寄到家吗？"));

            case "elder" -> new Answer(intent,
                    "高龄老人生活津贴，年满 80 周岁、有新源县户籍的老人都可以申请，按月发放。\n\n" +
                    "需要准备：身份证原件和复印件 2 份、户口簿首页及本人页、本人银行卡、1 寸免冠照片 2 张。\n\n" +
                    "办理流程是：家属或本人到村党群服务中心 2 号窗口提交材料 → 村里初审 → 乡镇民政办复核并公示 5 天 → 县民政局审批后按月打到银行卡。承诺 7 个工作日办结。\n\n" +
                    "老人行动不便的话，可以联系第三网格网格员李建国（138****9072）预约上门办理。",
                    refs(
                            itemRef("GJ003", "80周岁以上、本村户籍；承诺7个工作日。"),
                            articleRef("a1008", "行动不便的老人可联系网格员上门代办。")),
                    List.of("80岁和90岁的补贴标准一样吗？", "可以补发之前的津贴吗？"));

            case "birth" -> new Answer(intent,
                    "出生医学证明由新生儿出生的医院签发，不是村委会发。需要准备：父母双方身份证、结婚证、出生医学证明首次签发登记表。\n\n" +
                    "原则上由母亲本人办理；父亲代办要带授权委托书。办理前一定要先确定宝宝姓名，因为证件一经签发，姓名不能更改。\n\n" +
                    "在新源县人民医院分娩的，直接到产科出生证明窗口办理；材料齐全一般当场签发。如果证件遗失，可以到原签发机构申请补发。",
                    refs(itemRef("CS005", "在本县助产机构分娩的新生儿，材料齐全当场签发。")),
                    List.of("出生证明丢了怎么补办？", "新生儿医保怎么参保？"));

            case "job" -> new Answer(intent,
                    "就业失业登记证主要用于申请就业培训补贴、创业担保贷款、社保补贴等扶持政策。\n\n" +
                    "办理条件：年满 16 周岁、未达到法定退休年龄，有劳动能力和就业意愿，具有本村户籍或本地居住证。需要身份证、户口簿、2 寸照片 2 张；有工作经历的再带解除劳动关系证明。\n\n" +
                    "到村党群服务中心 1 号窗口填表，村里受理、乡镇审核，3 个工作日办结，不收费。",
                    refs(itemRef("JY006", "用于申请就业扶持政策，承诺3个工作日。")),
                    List.of("创业担保贷款怎么申请？", "村里最近有招聘会吗？"));

            case "contact" -> new Answer(intent,
                    "新源村党群服务中心在村委会一楼，工作日 10:00—13:30、15:30—19:30 都有人值班，电话是 0999-5021688。\n\n" +
                    "1 号窗口办医保、养老、就业；2 号窗口办民政、高龄补贴；3 号窗口办计生、户籍和证明事项。\n\n" +
                    "周末可以提前一天电话预约。急事也可以直接联系第三网格网格员李建国：138****9072。",
                    refs(articleRef("a1008", "工作日10:00—13:30、15:30—19:30；周末预约服务。")),
                    List.of("周末可以办医保吗？", "网格员平时在哪里？"));

            case "appeal" -> new Answer(intent,
                    "如果您要反映诉求、投诉或者提建议，可以直接在首页点「诉求建议」在线提交，也可以拨打村党群服务中心电话 0999-5021688，或到村委会综合窗口登记。\n\n" +
                    "线上提交可以上传现场照片、查看办理进度、给办理结果评价，网格员受理后会在时间轴里更新进展。\n\n" +
                    "如果是紧急情况（比如安全隐患、纠纷升级），请直接拨打 110 或联系网格员，不要只在线上等。",
                    List.of(), List.of("怎么联系我的网格员？", "投诉后多久有回复？"));

            case "hello" -> new Answer(intent,
                    "您好，我是新源村的 AI 网格员“小贾”。\n\n" +
                    "我可以帮您查这些事：医保缴费、养老保险、高龄补贴、独生子女证、出生证明、就业登记，也能告诉您村委会地址、电话和办事材料。\n\n" +
                    "我的回答会尽量附上政策依据；如果本地知识库里没有，我会直接告诉您“没查到”，并建议您联系村委会，不会编造。\n\n" +
                    "您想先问哪一件？",
                    List.of(), List.of("今年医保怎么缴？", "独生子女证需要什么材料？"));

            default -> new Answer("fallback",
                    "这个问题我暂时没有查到本地政策依据，不能给您编一个答案。\n\n" +
                    "建议您：\n1. 拨打新源村党群服务中心电话 0999-5021688，工作日都有人接；\n" +
                    "2. 到村委会一楼综合窗口现场咨询；\n3. 如果是医保、社保政策，也可以拨打 12393 / 12333。\n\n" +
                    "您也可以换个说法，比如直接问“医保怎么缴”“高龄补贴要什么材料”，我再帮您查一次。",
                    List.of(), List.of("今年医保怎么缴？", "高龄补贴怎么申请？"));
        };
    }

    private List<Map<String, Object>> refs(Map<String, Object>... items) {
        List<Map<String, Object>> list = new ArrayList<>();
        for (Map<String, Object> m : items) {
            if (m != null) list.add(m);
        }
        return list.size() > 2 ? list.subList(0, 2) : list;
    }

    private Map<String, Object> itemRef(String code, String snippet) {
        GovItem item = govMapper.itemByCode(code);
        if (item == null) return null;
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("type", "item");
        m.put("id", item.getId());
        m.put("code", item.getCode());
        m.put("title", item.getName());
        m.put("source", "新源村政务服务事项库");
        m.put("snippet", snippet == null ? item.getSummary() : snippet);
        m.put("route", "/pages/gov/detail?code=" + item.getCode());
        return m;
    }

    private Map<String, Object> articleRef(String id, String snippet) {
        CmsArticle a = contentMapper.detail(id);
        if (a == null) return null;
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("type", "article");
        m.put("id", a.getId());
        m.put("articleId", a.getId());
        m.put("title", a.getTitle());
        m.put("source", a.getSource());
        m.put("snippet", snippet == null ? a.getSummary() : snippet);
        m.put("route", "/pages/article/detail?id=" + a.getId());
        return m;
    }
}
