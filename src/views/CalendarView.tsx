import React from "react";
import {
  ActivityIndicator,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle,
} from "react-native";
import { EvilIcons } from "@expo/vector-icons";
import BidirectionalFlatList from "../components/BidirectionalFlatList";
import MonthView from "./MonthView";
import MonthGenerator from "../helpers/MonthGenerator";
import { COLORS, MONTH_VIEW_HEIGHT, STYLES } from "../constants";
import { SelectionContext } from "../components/SelectionProvider";
import BottomSheet from "../components/BottomSheet";
import MyButton from "../components/MyButton";
import { CategoryContext } from "../components/CategoryProvider";

interface IProps {
  style?: ViewStyle;
}

const CalendarView: React.FC<IProps> = ({ style }) => {
  const { selectedCategory, addEvent, editEvent, deleteEvent } =
    React.useContext(CategoryContext);
  const {
    selectMode,
    selectedStartDate,
    selectedStopDate,
    selectedEvent,
    toggleSelectMode,
    setSelectedStartDate,
    setSelectedStopDate,
  } = React.useContext(SelectionContext);

  const [monthGenerator] = React.useState(() => new MonthGenerator());
  const [visibleMonths, setVisibleMonths] = React.useState(() =>
    monthGenerator.init(5, 5)
  );

  const [startDate, setStartDate] = React.useState("");
  const [stopDate, setStopDate] = React.useState("");
  const [note, setNote] = React.useState("");

  const isValid = !!(selectedStartDate && selectedStopDate);

  const showPreviousMonth = React.useCallback(() => {
    setVisibleMonths((months) => [monthGenerator.prev(), ...months]);
  }, [monthGenerator]);

  const showNextMonth = React.useCallback(() => {
    setVisibleMonths((months) => [...months, monthGenerator.next()]);
  }, [monthGenerator]);

  const onChangeStartDate = React.useCallback((text: string) => {
    return setStartDate((prev) => Date.onChangeFormat(prev, text));
  }, []);

  const onChangeStopDate = React.useCallback((text: string) => {
    return setStopDate((prev) => Date.onChangeFormat(prev, text));
  }, []);

  const onClose = React.useCallback(() => {
    Keyboard.dismiss();
    toggleSelectMode();
  }, [toggleSelectMode]);

  const onPressAdd = () => {
    if (isValid && selectedCategory) {
      addEvent({
        categoryId: selectedCategory.categoryId,
        startDate: selectedStartDate,
        stopDate: selectedStopDate,
        note: note,
      });
      onClose();
    }
  };

  const onPressEdit = () => {
    if (selectedEvent && isValid) {
      editEvent({
        ...selectedEvent,
        startDate: selectedStartDate,
        stopDate: selectedStopDate,
        note: note,
      });
      onClose();
    }
  };

  const onPressDelete = () => {
    if (selectedEvent) {
      const { eventId, categoryId } = selectedEvent;
      deleteEvent(eventId, categoryId);
      onClose();
    }
  };

  React.useEffect(() => {
    if (selectedStartDate === undefined) {
      setStartDate("");
    } else {
      setStartDate(new Date(selectedStartDate).toISODateString());
    }
  }, [selectedStartDate]);

  React.useEffect(() => {
    if (selectedStopDate === undefined) {
      setStopDate("");
    } else {
      setStopDate(new Date(selectedStopDate).toISODateString());
    }
  }, [selectedStopDate]);

  React.useEffect(() => {
    if (startDate.length == 10) {
      const datetime = Date.parse(startDate);
      if (datetime) setSelectedStartDate(datetime);
    }
  }, [startDate, setSelectedStartDate]);

  React.useEffect(() => {
    if (stopDate.length == 10) {
      const datetime = Date.parse(stopDate);
      if (datetime) setSelectedStopDate(datetime);
    }
  }, [stopDate, setSelectedStopDate]);

  return (
    <View style={[styles.container, style]}>
      <BidirectionalFlatList
        style={styles.flatlist}
        data={visibleMonths}
        renderItem={({ item: { year, month } }) => (
          <MonthView year={year} month={month} />
        )}
        getItemLayout={(_, index) => ({
          length: MONTH_VIEW_HEIGHT,
          offset: MONTH_VIEW_HEIGHT * index,
          index,
        })}
        initialScrollIndex={5}
        keyExtractor={({ year, month }) => `${year}.${month}`}
        onStartReached={showPreviousMonth}
        onStartReachedThreshold={1000}
        onEndReached={showNextMonth}
        onEndReachedThreshold={1000}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <ActivityIndicator
            size="large"
            color={COLORS.text}
            style={styles.spinner}
          />
        }
        ListFooterComponent={
          <ActivityIndicator
            size="large"
            color={COLORS.text}
            style={styles.spinner}
          />
        }
      />

      <View style={STYLES.sheet.opener}>
        <Pressable onPress={toggleSelectMode}>
          <EvilIcons name="plus" size={75} color="white" />
        </Pressable>
      </View>

      <BottomSheet
        visible={!!selectMode}
        height={264}
        closeOnSwipeDown={true}
        closeOnSwipeTrigger={onClose}
        customStyles={{
          container: { backgroundColor: COLORS.tertiary },
        }}
      >
        <View style={[STYLES.sheet.container]}>
          <View style={[STYLES.sheet.row, STYLES.sheet.header]}>
            <Text style={STYLES.sheet.headerText}>
              {selectMode === "edit" ? "Edit event" : "Add event"}
            </Text>
            {selectMode === "edit" && (
              <Pressable onPress={onPressDelete}>
                <EvilIcons name="trash" size={30} color={COLORS.text} />
              </Pressable>
            )}
          </View>
          <View style={STYLES.sheet.row}>
            <TextInput
              style={STYLES.sheet.input}
              value={startDate}
              onChangeText={onChangeStartDate}
              placeholder="YYYY-MM-DD"
              inputMode="numeric"
            />
            <TextInput
              style={STYLES.sheet.input}
              value={stopDate}
              onChangeText={onChangeStopDate}
              placeholder="YYYY-MM-DD"
              inputMode="numeric"
            />
          </View>
          <View style={STYLES.sheet.row}>
            <TextInput
              style={STYLES.sheet.input}
              value={note}
              onChangeText={setNote}
              placeholder="Write a small note..."
            />
          </View>
          <View style={STYLES.sheet.row}>
            <MyButton
              style={STYLES.sheet.button}
              title="Confirm"
              onPress={selectMode === "edit" ? onPressEdit : onPressAdd}
              disabled={!isValid}
            />
          </View>
        </View>
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  flatlist: { paddingHorizontal: 5 },
  spinner: { marginVertical: 50 },
});

export default CalendarView;
