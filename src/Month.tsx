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
import Week from "./Week";

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
          {weeks.map((week) => {
            return <Week week={week} firstDayOfMonth={firstDayOfMonth} />;
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
  dayLabelRow: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
});
