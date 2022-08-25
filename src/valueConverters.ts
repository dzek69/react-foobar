import type { ChangeEvent } from "react";

import { tryFirst } from "./utils.js";

interface ObjectDataTransfer { dataTransfer?: DataTransfer }

const tryNil = (value: unknown) => {
    if (value == null) {
        return null;
    }
    throw new Error("Not a nil");
};

const tryPrimitive = (value: unknown) => {
    if (typeof value === "string" || typeof value === "number") {
        return value;
    }
    throw new Error("Not a primitive");
};

const tryWebCheckBox = ({ target: { type, checked } }: ChangeEvent<HTMLInputElement>) => {
    if (type === "checkbox") {
        return checked;
    }
    throw new Error("Not a web checkbox");
};

const tryWebFile = ({ target: { type, files }, dataTransfer }: ChangeEvent<HTMLInputElement> & ObjectDataTransfer) => {
    if (type === "file") {
        return files || (dataTransfer?.files) || null;
    }
    throw new Error("Not a web file");
};

const getSelectedValuesMultiSelect = (options?: HTMLOptionsCollection) => {
    if (!options) {
        return [];
    }
    return Array.from(options).reduce<unknown[]>((result, option) => {
        if (option.selected) {
            result.push(option.value);
        }
        return result;
    }, []);
};

const tryWebSelectMultiple = ({ target: { type, options } }: ChangeEvent<HTMLSelectElement>) => {
    if (type === "select-multiple") {
        return getSelectedValuesMultiSelect(options);
    }
    throw new Error("Not a web multi select");
};

const tryWebValue = ({ target }: ChangeEvent<HTMLInputElement>) => {
    if ("value" in target) {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        return target.value ?? null;
    }
    throw new Error("Not a web target");
};

const tryWeb = (value: Event) => {
    const error = new Error("Not a web event");
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!value.stopPropagation || !value.preventDefault) {
        throw error;
    }

    return tryFirst(value, [
        // @ts-expect-error It's written to support very dynamic values, type crashes don't matter here as well
        // and adding runtime checks aren't really that necessary (but would satisfy types)
        tryWebCheckBox,
        // @ts-expect-error It's written to support very dynamic values, type crashes don't matter here as well
        tryWebFile,
        // @ts-expect-error It's written to support very dynamic values, type crashes don't matter here as well
        tryWebSelectMultiple,
        // @ts-expect-error It's written to support very dynamic values, type crashes don't matter here as well
        tryWebValue,
    ], error);
};

const tryReactNative = (value: { nativeEvent?: { text?: string | null } }) => {
    if (!value.nativeEvent) {
        throw new Error("Not a React Native event");
    }
    if (!("text" in value.nativeEvent)) {
        throw new Error("Unknown React Native event");
    }
    if (value.nativeEvent.text == null) {
        return null;
    }
    return value.nativeEvent.text;
};

const tryGenericObjectValue = (value: { value?: unknown }) => {
    if ("value" in value) {
        if (value.value == null) {
            return null;
        }
        return value.value;
    }
    throw new Error("Not a generic object value");
};

const tryGenericValue = (value: unknown) => {
    return value;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface VC { [key: string]: ((v: any) => unknown) | undefined }

const valueConverters: VC = {
    "rn-text": (value: { nativeEvent: { text: string } }) => value.nativeEvent.text,
    "checkbox": (value: ChangeEvent<HTMLInputElement>) => value.target.checked,
    "auto": (value: unknown) => {
        return tryFirst(value, [
            tryNil,
            tryPrimitive,
            // @ts-expect-error It's written to support very dynamic values, type crashes don't matter here as well
            // and adding runtime checks aren't really that necessary (but would satisfy types)
            tryWeb,
            // @ts-expect-error It's written to support very dynamic values, type crashes don't matter here as well
            tryReactNative,
            // @ts-expect-error It's written to support very dynamic values, type crashes don't matter here as well
            tryGenericObjectValue,
            tryGenericValue,
        ]);
    },
};

export { valueConverters };
