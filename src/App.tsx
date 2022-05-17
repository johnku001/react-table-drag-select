import React, { useState } from "react";

import "./App.css";
import { TableDragSelect } from "./Component";
import { CellBasic } from "./Component/TableDragSelect/TableDragSelect";

interface TextType extends CellBasic {
  text: string;
}

const test: TextType[][] = [
  [
    { selected: false, disabled: false, text: "1" },
    { selected: false, disabled: false, text: "2" },
    { selected: false, disabled: false, text: "3" },
    { selected: false, disabled: false, text: "4" },
    { selected: false, disabled: false, text: "5" },
  ],
  [
    { selected: false, disabled: true, text: "6" },
    { selected: false, disabled: false, text: "7" },
    { selected: false, disabled: false, text: "8" },
    { selected: false, disabled: false, text: "8" },
    { selected: false, disabled: false, text: "10" },
  ],
  [
    { selected: true, disabled: false, text: "11" },
    { selected: false, disabled: false, text: "12" },
    { selected: false, disabled: false, text: "13" },
    { selected: false, disabled: false, text: "14" },
    { selected: false, disabled: false, text: "15" },
  ],
  [
    { selected: false, disabled: false, text: "16" },
    { selected: false, disabled: false, text: "17" },
    { selected: false, disabled: false, text: "18" },
    { selected: false, disabled: false, text: "19" },
    { selected: false, disabled: false, text: "20" },
  ],
  [
    { selected: false, disabled: false, text: "21" },
    { selected: false, disabled: false, text: "22" },
    { selected: false, disabled: false, text: "23" },
    { selected: false, disabled: false, text: "24" },
    { selected: true, disabled: false, text: "25" },
  ],
];
function App() {
  const [values, setValues] = useState(test);
  console.log("App render");
  return (
    <div className="App">
      <TableDragSelect
        values={values}
        onChange={(values) => {
          setValues(values);
        }}
        renderCellText={(value) => value.text}
      />
      <table>
        <tbody>
          {values.map((row, i) => (
            <tr key={i}>
              {row.map((item, j) => (
                <td key={j} style={{ border: "1px solid black" }}>
                  {Object.keys(item).map((field: string, k) => (
                    <div key={k}>
                      <>
                        {field + ": "}{" "}
                        {typeof item[field as keyof TextType] === "boolean"
                          ? item[field as keyof TextType]
                            ? "true"
                            : "false"
                          : item[field as keyof TextType]}
                      </>{" "}
                      <br />
                    </div>
                  ))}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
