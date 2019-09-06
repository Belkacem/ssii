package com.zsoft.service.Util;

import com.google.common.collect.Sets;
import com.zsoft.domain.ExceptionalActivity;
import com.zsoft.domain.enumeration.ExceptionalActivityType;
import com.zsoft.service.extensions.util.AstreinteUtil;
import com.zsoft.service.mapper.UserMapper;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.test.context.junit4.SpringRunner;

import java.time.LocalDate;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Test class for the AstreinteUtil.
 *
 * @see UserMapper
 */
@RunWith(SpringRunner.class)
public class AstreinteUtilTest {
    private float hourlyRate;
    private Set<ExceptionalActivity> exceptionalActivities;

    @Before
    public void init() {
        float dailyRate = 200F;
        hourlyRate = dailyRate / 8;
        exceptionalActivities = Sets.newHashSet(
            new ExceptionalActivity().date(LocalDate.of(2019, 7, 28)).nbHours(4.5F).start(17F).type(ExceptionalActivityType.ASTREINTE_ACTIVE),
            new ExceptionalActivity().date(LocalDate.of(2019, 7, 29)).nbHours(3.5F).start(18F).type(ExceptionalActivityType.ASTREINTE_ACTIVE),
            new ExceptionalActivity().date(LocalDate.of(2019, 7, 30)).nbHours(7F).start(18F).type(ExceptionalActivityType.ASTREINTE_ACTIVE),
            new ExceptionalActivity().date(LocalDate.of(2019, 7, 31)).nbHours(2.5F).start(19F).type(ExceptionalActivityType.ASTREINTE_ACTIVE),
            new ExceptionalActivity().date(LocalDate.of(2019, 8, 1)).nbHours(3F).start(20F).type(ExceptionalActivityType.ASTREINTE_ACTIVE),
            new ExceptionalActivity().date(LocalDate.of(2019, 8, 2)).nbHours(8F).start(13F).type(ExceptionalActivityType.ASTREINTE_ACTIVE),
            new ExceptionalActivity().date(LocalDate.of(2019, 8, 3)).nbHours(4F).start(17F).type(ExceptionalActivityType.ASTREINTE_ACTIVE)
        );
    }

    @Test
    public void testSimpleStrategy() {
        System.out.println("Test simple strategy : price = HOURLY_RATE");
        String strategyScript = "return [{name: 'Prestations exceptionnelles', quantity: NUMBER_OF_HOUR, unit_price: HOURLY_RATE}];";
        exceptionalActivities
            .stream()
            .flatMap(exceptionalActivity -> AstreinteUtil.applyStrategy(strategyScript, exceptionalActivity, hourlyRate).stream())
            .collect(Collectors.toSet())
            .forEach(System.out::println);
    }

    @Test
    public void testFactorStrategy() {
        System.out.println("Test Factor strategy : price = HOURLY_RATE * 1.5");
        String strategyScript = "return [{name: 'Prestations exceptionnelles', quantity: NUMBER_OF_HOUR, unit_price: HOURLY_RATE * 1.5}];";
        exceptionalActivities
            .stream()
            .flatMap(exceptionalActivity -> AstreinteUtil.applyStrategy(strategyScript, exceptionalActivity, hourlyRate).stream())
            .collect(Collectors.toSet())
            .forEach(System.out::println);
    }

    @Test
    public void testDoubleWeekendStrategy() {
        System.out.println("Test double weekend strategy : workdays price = HOURLY_RATE * 1.5, weekend price = HOURLY_RATE * 3");
        String strategyScript = "if (DAY_OF_WEEK === 5 || DAY_OF_WEEK === 6)" +
            "return [{name: 'Prestations exceptionnelles (weekend)',quantity: NUMBER_OF_HOUR,unit_price: HOURLY_RATE * 3}];" +
            "return [{name: 'Prestations exceptionnelles',quantity: NUMBER_OF_HOUR,unit_price: HOURLY_RATE * 1.5}];";
        exceptionalActivities
            .stream()
            .flatMap(exceptionalActivity -> AstreinteUtil.applyStrategy(strategyScript, exceptionalActivity, hourlyRate).stream())
            .collect(Collectors.toSet())
            .forEach(System.out::println);
    }

    @Test
    public void testDoubleOutTimeStrategy() {
        System.out.println("Test double time out strategy : before 16H price = HOURLY_RATE * 1.5, after 16H price = HOURLY_RATE * 3");
        String strategyScript = "var result = [];" +
            "var before = 16 - START_HOUR;" +
            "var after = (START_HOUR + NUMBER_OF_HOUR) - Math.max(16, START_HOUR);" +
            "if (before > 0)" +
            "result.push({name: 'Prestations exceptionnelles (avant 16)',quantity: before,unit_price: HOURLY_RATE * 1.5});" +
            "if (after > 0)" +
            "result.push({name: 'Prestations exceptionnelles (aprés 16)',quantity: after,unit_price: HOURLY_RATE * 3});" +
            "return result;";
        exceptionalActivities
            .stream()
            .flatMap(exceptionalActivity -> AstreinteUtil.applyStrategy(strategyScript, exceptionalActivity, hourlyRate).stream())
            .collect(Collectors.toSet())
            .forEach(System.out::println);
    }
}
