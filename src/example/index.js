import React from "react";
import { render } from "react-dom";
import { create } from "dollar-dollar";

import Basic from "./basic";

const root = create("div", { id: "root" });
document.body.appendChild(root);

render(<Basic />, root);
