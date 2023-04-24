import React from "react";
import { TODAY, DAY_IN_MS } from "../constants";
import CountProfile from "../helpers/CountProfile";
import ApplicationStorage, { AppEvent } from "../helpers/ApplicationStorage";

type State = {
  events: AppEvent[];
  eventsLoaded: boolean;
  eventDates: Set<number>;
  referenceDate: number;
  countProfiles: CountProfile[];
};

type Action =
  | { type: "LOAD_EVENTS"; payload: { events: AppEvent[] } }
  | {
      type: "ADD_EVENT";
      payload: { event: AppEvent };
    };

type Context = State & {
  addEvent(start: number, stop: number): void;
};

const initialState: State = {
  events: [],
  eventsLoaded: false,
  eventDates: new Set<number>(),
  referenceDate: TODAY,
  countProfiles: CountProfile.DEFAULT_METADATA.map((metadata) =>
    CountProfile.fromReferenceDate(metadata, TODAY)
  ),
};

export const EventContext = React.createContext<Context>({
  ...initialState,
  addEvent: () => undefined,
});

function* dateRange(start: number, stop: number) {
  for (let i = start; i <= stop; i += DAY_IN_MS) {
    yield i;
  }
}

function updateDates(prev: Set<number>, ...events: AppEvent[]) {
  const updated = new Set(prev);

  for (const event of events) {
    for (const date of dateRange(event.start, event.stop)) {
      updated.add(date);
    }
  }

  return updated;
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "LOAD_EVENTS":
      return {
        ...state,
        events: action.payload.events,
        eventsLoaded: true,
        eventDates: updateDates(state.eventDates, ...action.payload.events),
      };
    case "ADD_EVENT":
      return {
        ...state,
        events: [...state.events, action.payload.event],
        eventDates: updateDates(state.eventDates, action.payload.event),
      };

    default:
      return state;
  }
}

const EventProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [state, dispatch] = React.useReducer(reducer, initialState);

  React.useEffect(() => {
    if (!state.eventsLoaded) {
      ApplicationStorage.loadEvents().then((events) => {
        dispatch({ type: "LOAD_EVENTS", payload: { events } });
      });
    }
  }, [state.eventsLoaded]);

  React.useEffect(() => {
    ApplicationStorage.saveEvents([...state.events]);
  }, [state.events]);

  const addEvent = React.useCallback((start: number, stop: number) => {
    dispatch({ type: "ADD_EVENT", payload: { event: { start, stop } } });
  }, []);

  return (
    <EventContext.Provider value={{ ...state, addEvent }}>
      {children}
    </EventContext.Provider>
  );
};

export default EventProvider;
