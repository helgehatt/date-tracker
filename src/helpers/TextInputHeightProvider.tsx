import React from "react";
import MyTextInput from "../components/MyTextInput";
import TextInputHeightContext from "./TextInputHeightContext";

const TextInputHeightProvider: React.FC<React.PropsWithChildren> = (props) => {
  const initialHeight = React.useContext(TextInputHeightContext);
  const [height, setHeight] = React.useState(initialHeight);

  return (
    <TextInputHeightContext.Provider value={height}>
      {props.children}
      <MyTextInput
        style={{ position: "absolute", opacity: 0 }}
        onLayout={(e) => setHeight(e.nativeEvent.layout.height)}
      />
    </TextInputHeightContext.Provider>
  );
};

export default TextInputHeightProvider;
