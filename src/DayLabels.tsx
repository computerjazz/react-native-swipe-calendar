import { format } from "date-fns";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useCalendarContext } from "./context";

export function DayLabels({ daysOfWeek }: { daysOfWeek: Date[] }) {
  const { DayLabelComponent, theme } = useCalendarContext();

  return (
    <View style={styles.row}>
      <View style={styles.dayLabelRow}>
        {daysOfWeek.map((day) => {
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
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
  },
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
