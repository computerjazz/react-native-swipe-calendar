# React Native Swipe Calendar

A swipeable calendar component for React Native.<br />
Fully native interactions powered by [Reanimated 2](https://github.com/kmagiera/react-native-reanimated) and [React Native Gesture Handler](https://github.com/kmagiera/react-native-gesture-handler)

![SwipeCalendar demo](https://i.imgur.com/5dsYg9M.gif)

## Install

1. Follow installation instructions for [reanimated](https://github.com/kmagiera/react-native-reanimated) and [react-native-gesture-handler](https://github.com/kmagiera/react-native-gesture-handler)
2. `npm install` or `yarn add` `react-native-swipe-calendar`
3. `import Calendar from 'react-native-swipe-calendar'`

### Props

```typescript
type HeaderComponent = (props: { date: Date }) => JSX.Element | null;

type DayLabelComponentType = (props: { date: Date }) => JSX.Element | null;

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
  HeaderComponent?: HeaderComponentType;
  DayLabelComponent?: DayLabelComponentType;
  DayComponent?: DayComponentType;
  theme?: Partial<typeof DEFAULT_THEME>;
  monthBuffer?: number;
  minDate?: Date;
  maxDate?: Date;
  pageInterpolator?: typeof defaultPageInterpolator;
  simultaneousHandlers?: React.Ref<unknown> | React.Ref<unknown>[];
};

```

| Name             | Type                            |Description    |
| :--------------- | :------------------------------ | :------- |
| `selectedDate`   | `Date                           | null`                                         | Calendar date to be marked as "selected". |
| `onDateSelect`   | `(date: Date) => void`          | Callback invoked when the a date is selected. |
| `onMonthChange`  | `(date: Date) => void`          | Callback invoked when the month is changed.   |
| `currentDate`    | `Date`                          | Date to initialize the calendar with.         |
| `theme`          | `Partial<typeof DEFAULT_THEME>` | Overrides for default fonts and colors.       |
| `HeaderComponent` | `HeaderComponentType`            | Custom replacement for Header component.      |
| `DayComponent`   | `DayComponentType`              | Custom replacement for Day compoent.         |
| `DayLabelComponent` | `DayLabelComponentType`            | Custom replacement for Day Label component ("Su", "Mo", etc).      |
|`minDate`|`Date`|The minimum date the calendar will display|
|`maxDate`|`Date`|The maximum date the calendar will display|
|`pageInterpolator`|`typeof defaultPageInterpolator`| A worklet to customize page animations. Returns an animated style|
|`simultaneousHandlers`|`React.Ref<unknown> | React.Ref<unknown>[]`| Any RNGH handler refs that wrap the calendar.|


### Hooks

If you render your own components via `DayComponent`, you may need access to more internal state than is available on props. This state may be accessed via the exported `useCalendarContext()` hook. 

>NOTE: Be careful about performance! Lots of instances of `DayComponent` are rendered at any given time. You may need to wrap memoized inner wrappers around your custom components.

```typescript
type CalendarContextValue = {
  referenceDate: Date,
  selectedDate: Date | null | undefined,
  onDateSelect: (() => {}) as OnDateSelect,
  DayComponent: DayComponentType | undefined,
  TitleComponent: TitleComponentType | undefined,
  theme: typeof DEFAULT_THEME,
});
```


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

https://snack.expo.dev/@computerjazz/react-native-swipe-calendar

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
