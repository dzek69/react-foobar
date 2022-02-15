import type { FormEvent } from "react";
import React, { useCallback } from "react";

import { useField, useFields, useForm } from "..";
import { Input } from "./fields/Input";

interface Props {}

// eslint-disable-next-line max-lines-per-function
const Fields: React.FC<Props> = () => {
    const form = useForm();

    const fields = useFields();
    const fullname = useField("fullname");
    const checkbox = useField("checkbox");
    const checkboxSuper = useField("checkboxSuper");
    const cb = useField("cb");

    const handleSubmit = useCallback(async (evt: FormEvent) => {
        evt.preventDefault();
        try {
            await form.submit();
        }
        catch (e: unknown) {
            console.error("Some errors happened", e);
        }
    }, []);

    const handleMeowClick = useCallback(() => {
        form.updateValue("fullname", "meow");
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

    const handleValidation = useCallback(async () => {
        const isValid = await form.validate();
        // eslint-disable-next-line no-undef
        alert("The form is " + (isValid ? "valid" : "invalid"));
    }, [fullname.changed]);

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
