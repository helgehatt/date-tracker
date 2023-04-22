import React from "react";
import { StyleSheet, TextInput, View, ViewStyle } from "react-native";
import BottomSheet from "../../components/BottomSheet";
import MyButton from "../../components/MyButton";
import { COLORS } from "../../constants";

interface IProps {
  style?: ViewStyle;
  editMode: boolean;
  setEditMode: React.Dispatch<React.SetStateAction<boolean>>;
  selectedStartDate: number | undefined;
  setSelectedStartDate: React.Dispatch<
    React.SetStateAction<number | undefined>
  >;
  selectedStopDate: number | undefined;
  setSelectedStopDate: React.Dispatch<React.SetStateAction<number | undefined>>;
}

const AddEventView: React.FC<IProps> = ({
  style,
  editMode,
  setEditMode,
  selectedStartDate,
  setSelectedStartDate,
  selectedStopDate,
  setSelectedStopDate,
}) => {
  const [startDate, setStartDate] = React.useState("");
  const [stopDate, setStopDate] = React.useState("");

  const onChangeStartDate = React.useCallback((text: string) => {
    return setStartDate((prev) => formatDate(prev, text));
  }, []);

  const onChangeStopDate = React.useCallback((text: string) => {
    return setStopDate((prev) => formatDate(prev, text));
  }, []);

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
  }, [startDate]);

  React.useEffect(() => {
    if (stopDate.length == 10) {
      const datetime = Date.parse(stopDate);
      if (datetime) setSelectedStopDate(datetime);
    }
  }, [stopDate]);

  return (
    <BottomSheet visible={editMode} height={150}>
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
        <View>
          <MyButton title="Add" />
        </View>
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.tertiary,
  },
  row: {
    flexDirection: "row",
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

export default AddEventView;
