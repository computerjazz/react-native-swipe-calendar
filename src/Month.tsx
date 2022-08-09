import {
  addDays,
  addMonths,
  eachDayOfInterval,
  eachWeekOfInterval,
  format,
  lastDayOfMonth,
} from "date-fns";
import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useCalendarContext } from "./context";
import { DayLabels } from "./DayLabels";
import Week from "./Week";

export const MonthPage = React.memo(({ index }: { index: number }) => {
  const {
    referenceDate,
    HeaderComponent,
    MonthComponent,
    theme,
    weekStartsOn,
  } = useCalendarContext();
  const firstDayOfMonth = useMemo(
    () => addMonths(referenceDate, index),
    [referenceDate, index]
  );
  firstDayOfMonth.setDate(1);
  const lastDayOfMo = useMemo(
    () => lastDayOfMonth(firstDayOfMonth),
    [firstDayOfMonth]
  );
  const headerText = format(firstDayOfMonth, theme.headerDateFormat);
  const weekStarts = useMemo(
    () =>
      eachWeekOfInterval(
        {
          start: firstDayOfMonth,
          end: lastDayOfMo,
        },
        {
          weekStartsOn,
        }
      ),
    [firstDayOfMonth, lastDayOfMo, weekStartsOn]
  );

  const weeks = useMemo(
    () =>
      weekStarts.map((week) => {
        return eachDayOfInterval({ start: week, end: addDays(week, 6) });
      }),
    [weekStarts]
  );

  return (
    <View>
      {HeaderComponent ? (
        <HeaderComponent startDate={firstDayOfMonth} endDate={lastDayOfMo} />
      ) : (
        <View style={{ alignItems: "center" }}>
          <Text
            style={{
              fontSize: theme.headerFontSize,
              fontFamily: theme.headerFontFamily,
              color: theme.headerFontColor,
              textTransform: theme.headerTextTransform,
            }}
          >
            {headerText}
          </Text>
        </View>
      )}
      <DayLabels daysOfWeek={weeks[0]} />
      {MonthComponent ? (
        <MonthComponent weeks={weeks} firstDayOfMonth={firstDayOfMonth} />
      ) : (
        <View style={styles.row}>
          <View style={styles.flex}>
            {weeks.map((week) => {
              return (
                <Week 
                  key={`week-${week[0]?.toISOString()}`}
                  days={week} 
                  firstDayOfMonth={firstDayOfMonth} 
                 />
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { flexDirection: "row" },
});
