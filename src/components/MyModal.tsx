import {
  Modal,
  ModalProps,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS } from "../constants";

interface IProps extends ModalProps {}

const MyModal: React.FC<React.PropsWithChildren<IProps>> = ({
  style,
  children,
  ...props
}) => {
  return (
    <Modal {...props}>
      <TouchableOpacity style={styles.overlay} onPress={props.onRequestClose} />
      <View style={styles.modalWrapper}>
        <View style={[styles.modalContainer, style]}>{children}</View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    ...{ top: 0, bottom: 0, right: 0, left: 0 },
    backgroundColor: "black",
    opacity: 0.5,
  },
  modalWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: COLORS.light,
    borderRadius: 20,
    padding: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});

export default MyModal;
