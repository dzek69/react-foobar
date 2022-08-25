import type { FormEvent } from "react";
import React, { useCallback } from "react";

import { noop, rethrow } from "bottom-line-utils";

import { useField, useFields, useForm } from "..";

import { Input } from "./fields/Input.js";

interface Props {}

// eslint-disable-next-line max-lines-per-function
const Fields: React.FC<Props> = () => {
    const form = useForm();

    const fields = useFields();
    const fullname = useField("fullname");
    const age = useField("age");
    const checkbox = useField("checkbox");
    const checkboxSuper = useField("checkboxSuper");
    const cb = useField("cb");

    const handleSubmit = useCallback((evt: FormEvent) => {
        (async () => {
            evt.preventDefault();
            try {
                await form.submit();
            }
            catch (e: unknown) {
                console.error("Some errors happened", e);
            }
        })().catch(rethrow);
    }, []);

    const handleMeowClick = useCallback(() => {
        form.updateValue("fullname", "meow").catch(noop);
    }, []);

    const handleTouchedToggle = useCallback(() => {
        if (fullname.touched) {
            form.untouch("fullname");
            return;
        }
        form.touch("fullname");
    }, [fullname.touched]);

    const handleValidCheck = useCallback(() => {
        // eslint-disable-next-line no-undef
        alert("The form is " + (form.isValid() ? "valid" : "invalid"));
    }, [fullname.changed]);

    const handleValidation = useCallback(() => {
        (async () => {
            const isValid = await form.validate();
            // eslint-disable-next-line no-undef
            alert("The form is " + (isValid ? "valid" : "invalid"));
        })().catch(rethrow);
    }, [fullname.changed]);

    const handleAgeClick = useCallback(() => {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        const newAge = Math.round(Math.random() * 100);
        form.updateValues({
            age: newAge,
            fullname: String(form.getValues().fullname) + String(newAge),
        }).catch(noop);
    }, []);

    return (
        <form onSubmit={handleSubmit}>
            <div>
                Fields:
                {/* eslint-disable-next-line @typescript-eslint/no-magic-numbers */}
                <pre>{JSON.stringify(fields, null, 2)}</pre>
            </div>

            <Input field={fullname} />

            <button type={"button"} onClick={handleMeowClick}>Set name to "meow"</button>
            <button type={"button"} onClick={handleTouchedToggle}>Toggle touched state</button>
            <button type={"button"} onClick={handleValidCheck}>
                Check if form is valid (without triggering validation)
            </button>
            <button type={"button"} onClick={handleValidation}>
                Validate form
            </button>

            <Input field={age} />
            <button type={"button"} onClick={handleAgeClick}>Randomize Age and append it to name</button>

            <Input field={checkbox} />
            <Input field={checkboxSuper} />
            <Input field={cb} />

            <div>
                Form:
                {/* eslint-disable-next-line @typescript-eslint/no-magic-numbers */}
                <pre>{JSON.stringify(form, null, 2)}</pre>
            </div>

            <button>submit kurde</button>
            <button type={"reset"}>reset</button>
        </form>
    );
};

export { Fields };
