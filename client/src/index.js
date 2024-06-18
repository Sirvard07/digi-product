import React from "react";
import ReactDOM from "react-dom";

import "./index.css";
import App from "./App";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ContextProvider } from "./contexts/ContextProvider";
import "react-big-calendar/lib/css/react-big-calendar.css";

ReactDOM.render(
  <React.StrictMode>
    <ContextProvider>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <App />
      </LocalizationProvider>
    </ContextProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
