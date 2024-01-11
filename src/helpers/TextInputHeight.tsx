import React from "react";
import MyTextInput from "../components/MyTextInput";
import { TEXT_INPUT_HEIGHT } from "../constants";

const TextInputHeightContext = React.createContext(TEXT_INPUT_HEIGHT);

const TextInputHeightProvider: React.FC<React.PropsWithChildren> = (props) => {
  const [height, setHeight] = React.useState(TEXT_INPUT_HEIGHT);

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

const TextInputHeight = {
  Context: TextInputHeightContext,
  Provider: TextInputHeightProvider,
};

export default TextInputHeight;
