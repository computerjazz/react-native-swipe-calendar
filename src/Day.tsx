import React, { useCallback, useMemo, useRef } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { addDays, format, isSameDay } from "date-fns";
import { DayProps, DayWrapperProps, OnDateSelect } from "./types";
import { useCalendarContext } from "./context";
import { DayLabel } from "./DayLabels";

// The calendar renders a lot of Days, so we wrap them in order to
// prevent context updates from re-rendering everything

export const DayWrapper = React.memo(
  ({ date, isInDisplayedMonth, dateFormatted }: DayWrapperProps) => {
    const dateRef = useRef(date);
    const memoDate = useMemo(() => {
      if (isSameDay(dateRef.current, date)) {
        return dateRef.current;
      } else {
        dateRef.current = date;
        return date;
      }
    }, [date]);

    const { selectedDate, onDateSelect, DayComponent, theme } =
      useCalendarContext();
    const isSelected = useMemo(() => {
      return !!selectedDate && isSameDay(memoDate, selectedDate);
    }, [memoDate, selectedDate]);
    const isToday = useMemo(() => isSameDay(memoDate, new Date()), [memoDate]);
    const onDateSelectRef = useRef(onDateSelect);
    onDateSelectRef.current = onDateSelect;
    const onDateSelectCb: OnDateSelect = useCallback((date, options) => {
      return onDateSelectRef.current?.(date, options);
    }, []);

    return (
      <DayItem
        date={memoDate}
        dateFormatted={dateFormatted}
        isSelected={isSelected}
        isToday={isToday}
        isInDisplayedMonth={isInDisplayedMonth}
        DayComponent={DayComponent}
        onDateSelect={onDateSelectCb}
        theme={theme}
      />
    );
  }
);

export const DayItem = React.memo(
  ({
    date,
    isInDisplayedMonth,
    isSelected,
    DayComponent,
    isToday,
    onDateSelect,
    theme,
    dateFormatted,
  }: DayProps) => {
    const dayText = format(date, "d");
    const deselectedColor = isInDisplayedMonth
      ? theme.dayFontColor
      : theme.dayInactiveFontColor;

    const color = isSelected ? theme.daySelectedFontColor : deselectedColor;

    if (DayComponent) {
      return (
        <DayComponent
          date={date}
          isInDisplayedMonth={isInDisplayedMonth}
          isSelected={isSelected}
          isToday={isToday}
        />
      );
    }

    const padding = 10;

    return (
      <TouchableOpacity
        testID={`react-native-swipe-calendar:${dateFormatted}${
          isInDisplayedMonth ? "" : ":isInDisplayedMonth:false"
        }`}
        onPress={() => onDateSelect?.(date, { isSelected })}
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "row",
          padding,
        }}
      >
        <View
          style={{
            flex: 0,
            aspectRatio: 1,
            position: "absolute",
            top: 0,
            bottom: 0,
            backgroundColor: isSelected
              ? theme.selectedDayBackgroundColor
              : "transparent",
            borderRadius: 5,
          }}
        />
        <Text
          style={{
            color,
            fontSize: theme.dayFontSize,
            fontFamily: theme.dayFontFamily,
          }}
        >
          {dayText}
        </Text>
        <View
          style={{
            position: "absolute",
            width: 5,
            height: 5,
            bottom: padding / 2,
            borderRadius: 5,
            backgroundColor: isToday
              ? theme.todayIndicatorDotColor
              : "transparent",
          }}
        />
      </TouchableOpacity>
    );
  }
);

export const DayPage = React.memo(({ index }: { index: number }) => {
  const { referenceDate, HeaderComponent, theme } = useCalendarContext();

  const dayOffset = useMemo(
    () => addDays(referenceDate, index),
    [referenceDate, index]
  );

  const firstDayOfMonth = useMemo(() => new Date(dayOffset), [dayOffset]);
  firstDayOfMonth.setDate(1);
  const dayDateFormatted = format(dayOffset, "yyyy-MM-dd");
  const headerText = format(dayOffset, theme.headerDateFormat);

  return (
    <>
      {HeaderComponent ? (
        <HeaderComponent startDate={dayOffset} endDate={dayOffset} />
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
        <DayLabel day={dayOffset} />
      </View>
      <View style={styles.row}>
        <DayWrapper
          isInDisplayedMonth
          dateFormatted={dayDateFormatted}
          date={dayOffset}
        />
      </View>
    </>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
  },
});
