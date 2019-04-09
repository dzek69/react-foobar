import tryFirst from "./tryFirst.util";

const tryNil = (value) => {
    if (value == null) {
        return null;
    }
    throw new Error("Not a nil");
};

const tryPrimitive = (value) => {
    if (typeof value === "string" || typeof value === "number") {
        return value;
    }
    throw new Error("Not a primitive");
};

const tryWebCheckBox = ({ target: { type, checked } }) => {
    if (type === "checkbox") {
        return checked;
    }
    throw new Error("Not a web checkbox");
};

const tryWebFile = ({ target: { type, files }, dataTransfer }) => {
    if (type === "file") {
        return files || (dataTransfer && dataTransfer.files) || null;
    }
    throw new Error("Not a web file");
};

const getSelectedValuesMultiSelect = (options) => {
    if (!options) {
        return [];
    }
    return options.reduce((result, option) => {
        if (option.selected) {
            result.push(option.value);
        }
        return result;
    }, []);
};

const tryWebSelectMultiple = ({ target: { type, options } }) => {
    if (type === "select-multiple") {
        return getSelectedValuesMultiSelect(options);
    }
    throw new Error("Not a web multi select");
};

const tryWebValue = ({ target }) => {
    if ("value" in target) {
        if (target.value == null) {
            return null;
        }
        return target.value;
    }
    throw new Error("Not a web target");
};

const tryWeb = (value) => {
    const error = new Error("Not a web event");
    if (!value.stopPropagation || !value.preventDefault) {
        throw error;
    }

    return tryFirst(value, [
        tryWebCheckBox,
        tryWebFile,
        tryWebSelectMultiple,
        tryWebValue,
    ], error);
};

const tryReactNative = (value) => {
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

const tryGenericObjectValue = (value) => {
    if ("value" in value) {
        if (value.value == null) {
            return null;
        }
        return value.value;
    }
    throw new Error("Not a generic object value");
};

const tryGenericValue = (value) => {
    return value;
};

const valueConverters = {
    "rn-text": value => value.nativeEvent.text,
    "auto": value => {
        return tryFirst(value, [
            tryNil,
            tryPrimitive,
            tryWeb,
            tryReactNative,
            tryGenericObjectValue,
            tryGenericValue,
        ]);
    },
};

export default valueConverters;
