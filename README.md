# React Native Swipe Calendar

A swipeable calendar component for React Native.<br />
Fully native interactions powered by [Reanimated 2](https://github.com/kmagiera/react-native-reanimated) and [React Native Gesture Handler](https://github.com/kmagiera/react-native-gesture-handler)

![SwipeCalendar demo](https://i.imgur.com/ffYnomL.gif)

## Install

1. Follow installation instructions for [reanimated](https://github.com/kmagiera/react-native-reanimated) and [react-native-gesture-handler](https://github.com/kmagiera/react-native-gesture-handler)
2. `npm install` or `yarn add` `react-native-swipe-calendar`
3. `import InfinitePager from 'react-native-swipe-calendar'`

### Props

```typescript
type TitleComponentType = (props: { date: Date }) => JSX.Element | null;

type DayComponentType = (props: {
  date: Date;
  isInDisplayedMonth: boolean;
  isSelected: boolean;
  isToday: boolean;
}) => JSX.Element | null;

type CalendarProps = {
  selectedDate?: Date | null;
  onDateSelect?: OnDateSelect;
  onMonthChange?: (date: Date) => void;
  currentDate?: Date;
  DayComponent?: DayComponentType;
  TitleComponent?: TitleComponentType;
  theme?: Partial<typeof DEFAULT_THEME>;
};

const DEFAULT_THEME = {
  textActiveColor: "black",
  textInactiveColor: "grey",
  todayIndicatorDotColor: "tomato",
  selectedDayBackgroundColor: "rgba(0, 0, 255, 0.25)",
  fontFamily: "sans-serif",
  dayFontSize: 12,
  dayLabelFormat: "EEEEEE",
  headerDateFormat: "MMMM yyyy",
  headerFontSize: 24,
  inactiveOpacity: 1,
};
```

| Name             | Type                            |Description    |
| :--------------- | :------------------------------ | :------- |
| `selectedDate`   | `Date                           | null`                                         | Calendar date to be marked as "selected". |
| `onDateSelect`   | `(date: Date) => void`          | Callback invoked when the a date is selected. |
| `onMonthChange`  | `(date: Date) => void`          | Callback invoked when the month is changed.   |
| `currentDate`    | `Date`                          | Date to initialize the calendar with.         |
| `theme`          | `Partial<typeof DEFAULT_THEME>` | Overrides for default fonts and colors.       |
| `DayComponent`   | `DayComponentType`              | Custom replacement for Day compoent.         |
| `TitleComponent` | `TitleComponentType`            | Custom replacement for Header component.      |

### Imperative Api

```typescript
export type CalendarImperativeApi = {
  incrementMonth: () => void;
  decrementMonth: () => void;
  setMonth: (date: Date) => void;
};
```

| Name             | Type                   | Description           |
| :--------------- | :--------------------- | :-------------------- |
| `incrementMonth` | `() => void`           | Go to next month.     |
| `decrementMonth` | `() => void`           | Go to previous month. |
| `setMonth`       | `(date: Date) => void` | Go to given month.    |

### Example

https://snack.expo.dev/@computerjazz/infinite-pager

```typescript
import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
  useContext,
} from "react";
import {
  Text,
  View,
  StyleSheet,
  FlatList,
  LayoutAnimation,
  TouchableOpacity,
  Platform,
  UIManager,
} from "react-native";
import { addMonths, isSameDay } from "date-fns";

if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

import Calendar from "react-native-swipe-calendar";

export default function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const ref = useRef(null);
  return (
    <View style={{ flex: 1, backgroundColor: "white", paddingTop: 100 }}>
      <Calendar
        theme={{ todayIndicatorDotColor: "blue" }}
        ref={ref}
        currentDate={currentDate}
        onDateSelect={(date, options) => {
          if (options.isSelected) {
            setSelectedDate(null);
          } else {
            setSelectedDate(date);
          }
        }}
        selectedDate={selectedDate}
        onMonthChange={(date) => {
          setCurrentDate(date);
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        }}
      />
      <View style={{ height: 20, backgroundColor: "tomato" }} />
      <View style={styles.controlBar}>
        <TouchableOpacity
          style={styles.incDec}
          onPress={() => {
            ref.current?.decrementMonth();
          }}
        >
          <Text>{"<"}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.incDec}
          onPress={() => {
            ref.current?.incrementMonth();
          }}
        >
          <Text>{">"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  incDec: {
    paddingHorizontal: 20,
    padding: 10,
    backgroundColor: "lightgrey",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 5,
  },
  controlBar: {
    position: "absolute",
    top: 100,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
```
