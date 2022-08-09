import {
  addDays,
  addWeeks,
  eachDayOfInterval,
  eachWeekOfInterval,
  format,
  isSameMonth,
} from "date-fns";
import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useCalendarContext } from "./context";
import { DayWrapper } from "./Day";
import { DayLabels } from "./DayLabels";

function Week({
  days,
  firstDayOfMonth,
}: {
  days: Date[];
  firstDayOfMonth: Date;
}) {
  const { WeekComponent } = useCalendarContext();

  return WeekComponent ? (
    <WeekComponent days={days} />
  ) : (
    <View style={styles.weekContainer}>
      {days.map((day) => {
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
}

export default Week;

export const WeekPage = React.memo(({ index }: { index: number }) => {
  const { referenceDate, HeaderComponent, theme, weekStartsOn } =
    useCalendarContext();

  const weekOffset = useMemo(
    () => addWeeks(referenceDate, index),
    [referenceDate, index]
  );

  const firstDayOfMonth = useMemo(
    () => new Date(addDays(weekOffset, 3)),
    [weekOffset]
  );

  firstDayOfMonth.setDate(1);

  const weekWithStart = useMemo(
    () =>
      eachWeekOfInterval(
        {
          start: weekOffset,
          end: weekOffset,
        },
        {
          weekStartsOn,
        }
      ),
    [weekOffset, weekStartsOn]
  );

  const daysOfWeek = useMemo(
    () =>
      eachDayOfInterval({
        start: weekWithStart[0],
        end: addDays(weekWithStart[0], 6),
      }),
    [weekWithStart]
  );

  const headerText = format(firstDayOfMonth, theme.headerDateFormat);

  return (
    <>
      {HeaderComponent ? (
        <HeaderComponent
          startDate={daysOfWeek[0]}
          endDate={daysOfWeek[daysOfWeek.length - 1]}
        />
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
      <DayLabels daysOfWeek={daysOfWeek} />
      <Week days={daysOfWeek} firstDayOfMonth={firstDayOfMonth} />
    </>
  );
});

const styles = StyleSheet.create({
  weekContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  row: {
    flexDirection: "row",
  },
});
