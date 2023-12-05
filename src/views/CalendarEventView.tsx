import React from "react";
import { StyleSheet, TextInput, View, ViewStyle } from "react-native";
import BottomSheet from "../components/BottomSheet";
import MyButton from "../components/MyButton";
import { SelectionContext } from "../components/SelectionProvider";
import { COLORS } from "../constants";
import { CategoryContext } from "../components/CategoryProvider";

interface IProps {
  style?: ViewStyle;
}

const CalendarEventView: React.FC<IProps> = ({ style }) => {
  const [startDate, setStartDate] = React.useState("");
  const [stopDate, setStopDate] = React.useState("");
  const { addEvent, editEvent, deleteEvent } =
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

  const canAdd = !!(selectedStartDate && selectedStopDate);
  const canEdit = !!(selectedEvent && selectedStartDate && selectedStopDate);
  const canDelete = !!selectedEvent;

  const onChangeStartDate = React.useCallback((text: string) => {
    return setStartDate((prev) => formatDate(prev, text));
  }, []);

  const onChangeStopDate = React.useCallback((text: string) => {
    return setStopDate((prev) => formatDate(prev, text));
  }, []);

  const onPressAdd = () => {
    if (canAdd) {
      addEvent(selectedStartDate, selectedStopDate);
      toggleSelectMode();
    }
  };

  const onPressEdit = () => {
    if (canEdit) {
      editEvent({
        ...selectedEvent,
        start_date: selectedStartDate,
        stop_date: selectedStopDate,
      });
      toggleSelectMode();
    }
  };

  const onPressDelete = () => {
    if (canDelete) {
      deleteEvent(selectedEvent);
      toggleSelectMode();
    }
  };

  React.useEffect(() => {
    if (selectedStartDate === undefined) {
      setStartDate("");
    } else {
      setStartDate(new Date(selectedStartDate).toISOString().slice(0, 10));
    }
  }, [selectedStartDate]);

  React.useEffect(() => {
    if (selectedStopDate === undefined) {
      setStopDate("");
    } else {
      setStopDate(new Date(selectedStopDate).toISOString().slice(0, 10));
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
    <BottomSheet
      visible={!!selectMode}
      height={300}
      closeOnSwipeDown={true}
      closeOnSwipeTrigger={toggleSelectMode}
      customStyles={{
        container: { marginBottom: -100 },
        draggableContainer: {
          backgroundColor: COLORS.tertiary,
        },
      }}
    >
      <View style={[styles.container, style]}>
        <View style={styles.row}>
          <TextInput
            style={styles.input}
            value={startDate}
            onChangeText={onChangeStartDate}
            placeholder="YYYY-MM-DD"
            inputMode="numeric"
          />
          <TextInput
            style={styles.input}
            value={stopDate}
            onChangeText={onChangeStopDate}
            placeholder="YYYY-MM-DD"
            inputMode="numeric"
          />
        </View>
        {selectMode == "edit" ? (
          <View style={styles.row}>
            <MyButton
              style={styles.button}
              title="Delete"
              onPress={onPressDelete}
              disabled={!canDelete}
            />
            <MyButton
              style={styles.button}
              title="Confirm"
              onPress={onPressEdit}
              disabled={!canEdit}
            />
          </View>
        ) : (
          <View style={styles.row}>
            <MyButton
              style={styles.button}
              title="Add"
              onPress={onPressAdd}
              disabled={!canAdd}
            />
          </View>
        )}
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.tertiary,
    paddingHorizontal: 10,
  },
  row: {
    flexDirection: "row",
    marginTop: 10,
    columnGap: 10,
  },
  button: {
    flex: 1,
  },
  input: {
    flex: 1,
    fontSize: 20,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 15,
    backgroundColor: COLORS.secondary,
    color: COLORS.text,
  },
});

function formatDate(prev: string | undefined, date: string) {
  if (prev?.endsWith("-") && date.length < prev.length) {
    return date.slice(0, date.length - 1);
  }
  date = date.replaceAll(/\D/g, "");
  if (date.length >= 6) {
    return date.slice(0, 4) + "-" + date.slice(4, 6) + "-" + date.slice(6, 8);
  }
  if (date.length >= 4) {
    return date.slice(0, 4) + "-" + date.slice(4, 6);
  }
  return date;
}

export default CalendarEventView;
