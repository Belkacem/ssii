package com.zsoft.service.extensions.util;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.collect.Sets;
import com.zsoft.domain.ExceptionalActivity;
import com.zsoft.domain.InvoiceItem;
import com.zsoft.domain.enumeration.ExceptionalActivityType;

import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import java.util.HashSet;
import java.util.Set;

public final class AstreinteUtil {
    public static Set<InvoiceItem> applyStrategy(String strategyScript, ExceptionalActivity exceptionalActivity, float hourlyRate) {
        Set<InvoiceItem> invoiceItems = new HashSet<>();
        try {
            float nbrHours = exceptionalActivity.getNbHours();
            float startHour = exceptionalActivity.getStart();
            int weekDay = exceptionalActivity.getDate().getDayOfWeek().getValue() - 1;
            ExceptionalActivityType type = exceptionalActivity.getType();
            String script = "function convert(NUMBER_OF_HOUR, HOURLY_RATE, DAY_OF_WEEK, START_HOUR, TYPE) {" + strategyScript + "}" +
                "var result = convert(" + nbrHours + ", " + hourlyRate + ", " + weekDay + ", " + startHour + ", \"" + type + "\");" +
                "JSON.stringify(result);";
            ScriptEngineManager mgr = new ScriptEngineManager();
            ScriptEngine engine = mgr.getEngineByName("JavaScript");
            String jsonStrResult = (String) engine.eval(script);
            ObjectMapper mapper = new ObjectMapper();
            JsonNode jsonObj = mapper.readTree(jsonStrResult);
            if (jsonObj.size() > 0) {
                jsonObj.forEach(jsonNode -> {
                    String name = jsonNode.get("name").asText();
                    double unitPrice = jsonNode.get("unit_price").asDouble();
                    double quantity = jsonNode.get("quantity").asDouble();
                    InvoiceItem invoiceItem = new InvoiceItem()
                        .name(name)
                        .date(exceptionalActivity.getDate())
                        .unitPrice((float) unitPrice)
                        .quantity((float) quantity);
                    invoiceItems.add(invoiceItem);
                });
            }
        } catch (Exception ex) {
            ex.printStackTrace();
        }
        return invoiceItems;
    }

    public static Set<InvoiceItem> applyFactorStrategy(ExceptionalActivity exceptionalActivity, float hourlyRate) {
        return Sets.newHashSet(
            new InvoiceItem()
                .name("Prestations exceptionnelles")
                .date(exceptionalActivity.getDate())
                .unitPrice(hourlyRate * 1.5F)
                .quantity(exceptionalActivity.getNbHours())
        );
    }
}
