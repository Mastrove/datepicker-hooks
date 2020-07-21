import React from "react";
import ReactDOM from "react-dom";
import DatePicker from "./Datepicker";

import "./styles.css";

function App() {
  return <DatePicker />;
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
