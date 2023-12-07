import React from "react";
import {
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle,
} from "react-native";
import { EvilIcons } from "@expo/vector-icons";
import BottomSheet from "../components/BottomSheet";
import MyButton from "../components/MyButton";
import { SelectionContext } from "../components/SelectionProvider";
import { COLORS, STYLES } from "../constants";
import { CategoryContext } from "../components/CategoryProvider";

interface IProps {
  style?: ViewStyle;
}

const CalendarEventView: React.FC<IProps> = ({ style }) => {
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

  const [startDate, setStartDate] = React.useState("");
  const [stopDate, setStopDate] = React.useState("");

  const isValid = !!(selectedStartDate && selectedStopDate);

  const onChangeStartDate = React.useCallback((text: string) => {
    return setStartDate((prev) => formatDate(prev, text));
  }, []);

  const onChangeStopDate = React.useCallback((text: string) => {
    return setStopDate((prev) => formatDate(prev, text));
  }, []);

  const onClose = React.useCallback(() => {
    Keyboard.dismiss();
    toggleSelectMode();
  }, [toggleSelectMode]);

  const onPressAdd = () => {
    if (isValid) {
      addEvent(selectedStartDate, selectedStopDate);
      onClose();
    }
  };

  const onPressEdit = () => {
    if (selectedEvent && isValid) {
      editEvent({
        ...selectedEvent,
        start_date: selectedStartDate,
        stop_date: selectedStopDate,
      });
      onClose();
    }
  };

  const onPressDelete = () => {
    if (selectedEvent) {
      deleteEvent(selectedEvent);
      onClose();
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
      closeOnSwipeTrigger={onClose}
      customStyles={{
        container: { marginBottom: -100, backgroundColor: COLORS.tertiary },
      }}
    >
      <View style={[STYLES.sheet.container, styles.container, style]}>
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
          <MyButton
            style={STYLES.sheet.button}
            title="Confirm"
            onPress={selectMode === "edit" ? onPressEdit : onPressAdd}
            disabled={!isValid}
          />
        </View>
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  container: {},
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
