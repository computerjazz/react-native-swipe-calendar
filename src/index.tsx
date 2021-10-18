import React, {
  useContext,
  useMemo,
  useRef,
  useEffect,
  useImperativeHandle,
} from "react";
import { Text, TouchableOpacity, View, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  interpolate,
} from "react-native-reanimated";
import {
  addMonths,
  format,
  eachWeekOfInterval,
  eachDayOfInterval,
  addDays,
  lastDayOfMonth,
  isSameMonth,
  isSameDay,
  differenceInCalendarMonths,
} from "date-fns";
import InfinitePager, {
  InfinitePagerImperativeApi,
} from "react-native-infinite-pager";

const DEFAULT_THEME = {
  textActiveColor: "black",
  textInactiveColor: "grey",
  todayIndicatorDotColor: "tomato",
  slectedDayBackgroundColor: "rgba(0, 0, 255, 0.25)",
  fontFamily: "sans-serif",
  dayFontSize: 12,
  dayLabelFormat: "EEEEEE",
  headerDateFormat: "MMMM yyyy",
  headerFontSize: 24,
  inactiveOpacity: 0,
};

type OnDateSelect = undefined | ((date: Date) => void);
type DayComponentType = (props: {
  date: Date;
  isInActiveMonth: boolean;
  isSelected: boolean;
  isToday: boolean;
}) => JSX.Element | null;
type TitleComponentType = (props: { date: Date }) => JSX.Element | null;
const CalendarContext = React.createContext({
  referenceDate: new Date(),
  selectedDate: null as Date | null | undefined,
  onDateSelect: (() => {}) as OnDateSelect,
  DayComponent: undefined as DayComponentType | undefined,
  TitleComponent: undefined as TitleComponentType | undefined,
  theme: DEFAULT_THEME,
});

export function CalendarProvider({
  children,
  initialDate = new Date(),
  selectedDate,
  onDateSelect,
  DayComponent,
  TitleComponent,
  theme,
}: {
  children: React.ReactNode;
  initialDate?: Date;
  selectedDate?: Date | null;
  onDateSelect?: OnDateSelect;
  DayComponent?: (props: {
    date: Date;
    isInActiveMonth: boolean;
    isSelected: boolean;
    isToday: boolean;
  }) => JSX.Element | null;
  TitleComponent?: (props: { date: Date }) => JSX.Element | null;
  theme: typeof DEFAULT_THEME;
}) {
  return (
    <CalendarContext.Provider
      value={{
        referenceDate: initialDate,
        selectedDate,
        onDateSelect,
        DayComponent,
        TitleComponent,
        theme,
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
}

export function useCalendarContext() {
  return useContext(CalendarContext);
}

export function MonthPage({
  index,
  focusAnim,
}: {
  index: number;
  focusAnim: Animated.DerivedValue<number>;
}) {
  const { referenceDate, TitleComponent, theme } = useCalendarContext();
  const firstDayOfMonth = addMonths(referenceDate, index);
  firstDayOfMonth.setDate(1);
  const lastDayOfMo = lastDayOfMonth(firstDayOfMonth);
  const title = format(firstDayOfMonth, theme.headerDateFormat);
  const weekStarts = eachWeekOfInterval({
    start: firstDayOfMonth,
    end: lastDayOfMo,
  });

  const weeks = weekStarts.map((week) => {
    return eachDayOfInterval({ start: week, end: addDays(week, 6) });
  });

  const animStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        focusAnim.value,
        [0, 1],
        [theme.inactiveOpacity, 1],
        Animated.Extrapolate.CLAMP
      ),
    };
  }, []);

  return (
    <Animated.View style={[animStyle, { alignItems: "center" }]}>
      {TitleComponent ? (
        <TitleComponent date={firstDayOfMonth} />
      ) : (
        <Text
          style={{
            fontSize: theme.headerFontSize,
            color: theme.textActiveColor,
          }}
        >
          {title}
        </Text>
      )}
      <View style={styles.row}>
        <View style={styles.weeksContainer}>
          {weeks[0].map((day) => {
            const dayLabel = format(day, theme.dayLabelFormat);
            return (
              <View style={styles.dayLabelContainer}>
                <Text style={{ color: theme.textActiveColor }}>{dayLabel}</Text>
              </View>
            );
          })}
        </View>
      </View>
      <Animated.View style={styles.row}>
        <Animated.View style={{ flex: 1 }}>
          {weeks.map((daysInWeek) => {
            return (
              <Animated.View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                {daysInWeek.map((day) => {
                  const sameMonth = isSameMonth(day, firstDayOfMonth);
                  return <DayItem sameMonth={sameMonth} date={day} />;
                })}
              </Animated.View>
            );
          })}
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}

function DayItem({ date, sameMonth }: { date: Date; sameMonth: boolean }) {
  const { selectedDate, onDateSelect, DayComponent, theme } =
    useCalendarContext();
  const dayText = format(date, "d");
  const color = sameMonth ? theme.textActiveColor : theme.textInactiveColor;
  const isSelected = !!selectedDate && isSameDay(date, selectedDate);
  const isToday = isSameDay(date, new Date());
  if (DayComponent) {
    return (
      <DayComponent
        date={date}
        isInActiveMonth={sameMonth}
        isSelected={isSelected}
        isToday={isToday}
      />
    );
  }

  return (
    <TouchableOpacity
      onPress={() => onDateSelect?.(date)}
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 5,
        backgroundColor: isSelected
          ? theme.slectedDayBackgroundColor
          : "transparent",
        borderRadius: 5,
      }}
    >
      <Text style={{ color: color }}>{dayText}</Text>
      <View
        style={{
          width: 5,
          height: 5,
          borderRadius: 5,
          backgroundColor: isToday
            ? theme.todayIndicatorDotColor
            : "transparent",
        }}
      />
    </TouchableOpacity>
  );
}

export type CalendarImperativeApi = {
  incrementMonth: () => void;
  decrementMonth: () => void;
  setMonth: (date: Date) => void;
};

type CalendarProps = {
  selectedDate?: Date | null;
  onDateSelect?: (date: Date) => void;
  onMonthChange?: (date: Date) => void;
  currentDate?: Date;
  DayComponent?: (props: {
    date: Date;
    isInActiveMonth: boolean;
    isSelected: boolean;
    isToday: boolean;
  }) => JSX.Element | null;
  TitleComponent?: (props: { date: Date }) => JSX.Element | null;
  theme?: Partial<typeof DEFAULT_THEME>;
};

function Calendar(
  {
    selectedDate,
    onDateSelect,
    onMonthChange,
    currentDate,
    DayComponent,
    TitleComponent,
    theme = {},
  }: CalendarProps,
  ref: React.ForwardedRef<CalendarImperativeApi>
) {
  const initialDate = useMemo(() => currentDate || new Date(), []);
  const pagerRef = useRef<InfinitePagerImperativeApi>(null);
  const currentDateRef = useRef(currentDate);

  const fullTheme = {
    ...DEFAULT_THEME,
    ...theme,
  };

  useImperativeHandle(ref, () => ({
    incrementMonth: () => {
      pagerRef.current?.incrementPage({ animated: true });
    },
    decrementMonth: () => {
      pagerRef.current?.decrementPage({ animated: true });
    },
    setMonth: (date: Date) => {
      const page = differenceInCalendarMonths(date, initialDate);
      pagerRef.current?.setPage(page, { animated: false });
    },
  }));

  useEffect(() => {
    if (
      currentDate &&
      currentDateRef.current &&
      !isSameMonth(currentDate, currentDateRef.current)
    ) {
      const page = differenceInCalendarMonths(currentDate, initialDate);
      pagerRef.current?.setPage(page, { animated: false });
    }

    currentDateRef.current = currentDate;
  }, [currentDate, initialDate]);

  return (
    <CalendarProvider
      initialDate={initialDate}
      selectedDate={selectedDate}
      DayComponent={DayComponent}
      TitleComponent={TitleComponent}
      theme={fullTheme}
      onDateSelect={(date) => {
        onDateSelect?.(date);
        if (date) {
          const diff = differenceInCalendarMonths(date, initialDate);
          pagerRef.current?.setPage(diff, { animated: true });
        }
      }}
    >
      <InfinitePager
        ref={pagerRef}
        PageComponent={MonthPage}
        onPageChange={(pg) => {
          const currentMonth = addMonths(initialDate, pg);
          currentMonth.setDate(1);
          onMonthChange?.(currentMonth);
        }}
      />
    </CalendarProvider>
  );
}

export default React.forwardRef(Calendar);

const styles = StyleSheet.create({
  row: { flexDirection: "row" },
  dayLabelContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  weeksContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
});
