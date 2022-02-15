import React from "react";

import type { Fields as FieldsType, ValidationResult } from "..";
import { Form } from "..";
import { Fields } from "../demo/Fields";
import { wait } from "bottom-line-utils";

const fields: FieldsType = {
    fullname: {
        value: "John",
    },
    checkbox: {
        type: "checkbox",
        value: true,
    },
    checkboxSuper: {
        type: "checkbox",
        value: "yes",
        checked: true,
    },
    cb: {
        type: "checkbox",
        checked: true,
    },
};

const validate: React.ComponentProps<typeof Form>["validate"] = async (values, { fields: flds }) => {
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    await wait(2000);
    const result: ValidationResult = {};
    if (flds.cb!.props.checked) {
        result.cb = "You shouldn't agree on that one";
    }
    if (!values.fullname) {
        result.fullname = "Name is required";
    }
    return result;
};

const handleSubmit: React.ComponentProps<typeof Form>["onSubmit"] = async (values) => {
    console.info("real submitting", values);
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    await wait(2000);
    console.info("done");
};

const IndexComp = () => (
    <Form fields={fields} onSubmit={handleSubmit} validate={validate}>
        <Fields />
    </Form>
);

export default IndexComp;
