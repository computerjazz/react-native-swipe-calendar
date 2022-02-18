import {
  addDays,
  addMonths,
  eachDayOfInterval,
  eachWeekOfInterval,
  format,
  isSameMonth,
  lastDayOfMonth,
} from "date-fns";
import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useCalendarContext } from "./context";
import { DayWrapper } from "./Day";

export const MonthPage = React.memo(({ index }: { index: number }) => {
  const {
    referenceDate,
    HeaderComponent,
    DayLabelComponent,
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
        <HeaderComponent date={firstDayOfMonth} />
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
      <View style={styles.row}>
        <View style={styles.dayLabelRow}>
          {weeks[0].map((day) => {
            const dayLabelText = format(day, theme.dayLabelDateFormat);

            return DayLabelComponent ? (
              <DayLabelComponent date={day} />
            ) : (
              <View
                key={`day-label-${day.toISOString()}`}
                style={styles.dayLabelContainer}
              >
                <Text
                  style={{
                    color: theme.dayLabelColor,
                    fontFamily: theme.dayLabelFontFamily,
                    fontSize: theme.dayLabelFontSize,
                    textTransform: theme.dayLabelTextTransform,
                  }}
                >
                  {dayLabelText}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
      <View style={styles.row}>
        <View style={styles.flex}>
          {weeks.map((daysInWeek) => {
            return (
              <View
                key={`week-${daysInWeek[0]?.toISOString()}`}
                style={styles.weekContainer}
              >
                {daysInWeek.map((day) => {
                  const sameMonth = isSameMonth(day, firstDayOfMonth);
                  const dayDateFormatted = format(day, "yyyy-MM-dd");
                  return (
                    <DayWrapper
                      key={dayDateFormatted}
                      isInDisplayedMonth={sameMonth}
                      date={day}
                      dateFormatted={dayDateFormatted}
                    />
                  );
                })}
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { flexDirection: "row" },
  dayLabelContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  weekContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dayLabelRow: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
});
