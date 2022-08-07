import { format, isSameMonth } from "date-fns";
import React from "react";
import { StyleSheet, View } from "react-native";
import { DayWrapper } from "./Day";

function Week({
  week,
  firstDayOfMonth,
}: {
  week: Date[];
  firstDayOfMonth: Date;
}) {
  return (
    <View key={`week-${week[0]?.toISOString()}`} style={styles.weekContainer}>
      {week.map((day) => {
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

const styles = StyleSheet.create({
  weekContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  row: {
    flexDirection: "row",
  },
  flex: {
    flex: 1,
  },
});
