package com.xinyuan.village.modules.gov;

import com.xinyuan.village.common.enums.ErrorCode;
import com.xinyuan.village.common.exception.BizException;
import com.xinyuan.village.common.i18n.I18nService;
import com.xinyuan.village.common.util.Json;
import com.xinyuan.village.modules.gov.entity.GovCategory;
import com.xinyuan.village.modules.gov.entity.GovItem;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class GovService {

    private final GovMapper govMapper;
    private final I18nService i18n;

    public Map<String, Object> categories() {
        List<Map<String, Object>> list = new ArrayList<>();
        int total = govMapper.items(null, null).size();
        for (GovCategory c : govMapper.categories()) {
            int count = "all".equals(c.getId()) ? total : (c.getItemCount() == null ? 0 : c.getItemCount());
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", c.getId());
            m.put("code", c.getCode());
            m.put("name", c.getName());
            m.put("desc", c.getDescText());
            m.put("count", count);
            i18n.attach(m, "govCategory", c.getId(), "name", "desc");
            list.add(m);
        }
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("list", list);
        result.put("total", total);
        return result;
    }

    public Map<String, Object> items(String categoryId, String keyword) {
        List<GovItem> rows = govMapper.items(categoryId, keyword);
        List<Map<String, Object>> list = new ArrayList<>();
        for (GovItem item : rows) list.add(card(item));
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("list", list);
        result.put("total", list.size());
        result.put("categoryId", categoryId == null || categoryId.isBlank() ? "all" : categoryId);
        result.put("keyword", keyword == null ? "" : keyword);
        return result;
    }

    public Map<String, Object> detail(String code) {
        GovItem item = govMapper.itemByCode(code);
        if (item == null) throw new BizException(ErrorCode.ITEM_NOT_FOUND);
        Map<String, Object> m = card(item);
        m.put("target", item.getTarget());
        m.put("phone", item.getPhone());
        m.put("address", item.getAddress());
        m.put("updateAt", item.getUpdateAt());
        m.put("conditions", Json.parse(item.getConditionsJson()));
        m.put("materials", Json.parse(item.getMaterials()));
        m.put("steps", Json.parse(item.getSteps()));
        m.put("formFields", Json.parse(item.getFormFields()));
        m.put("basis", Json.parse(item.getBasis()));
        m.put("faqs", Json.parse(item.getFaqs()));
        return m;
    }

    public Map<String, Object> card(GovItem item) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", item.getId());
        m.put("code", item.getCode());
        m.put("categoryId", item.getCategoryId());
        m.put("categoryName", item.getCategoryName());
        m.put("name", item.getName());
        m.put("shortName", item.getShortName());
        m.put("summary", item.getSummary());
        m.put("icon", item.getIcon());
        m.put("iconTint", item.getIconTint());
        m.put("tags", Json.parse(item.getTags()));
        m.put("promiseDays", item.getPromiseDays());
        m.put("fee", item.getFee());
        i18n.attach(m, "govItem", item.getCode(), "name", "shortName", "summary");
        return m;
    }
}