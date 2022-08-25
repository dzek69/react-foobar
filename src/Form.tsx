/* eslint-disable max-lines */
import React, { createContext, useContext } from "react";

import { ensureError, mapValues, noop, rethrow } from "bottom-line-utils";

import type {
    Field,
    Fields,
    FormCtx,
    FullField,
    FullFields,
    MaybePromise,
    PropsOptions,
    ValidationResult,
    ValidationSource,
} from "./types";

import { defaultFormContext, defaultOptions } from "./utils.js";
import { valueConverters } from "./valueConverters.js";

const FormContext = createContext<FormCtx>(defaultFormContext);
const FieldsContext = createContext<FullFields<unknown>>({});

interface Props {
    fields: Fields;
    onSubmit: (values: { [key: string]: unknown }) => (void | Promise<void>);
    onForm?: (form: FormCtx | null) => void;
    validate: (
        values: { [key: string]: unknown },
        extra: {
            source: ValidationSource;
            fields: FullFields<unknown>;
        }
    ) => (MaybePromise<ValidationResult>);
    options?: PropsOptions;
}

interface State {
    formCtx: FormCtx;
    fields: FullFields<unknown>;
}

// @TODO react on fields prop update!
// @TODO add option to set changed state
// @TODO support for reset form/field
// @TODO get values of only touched fields

class Form extends React.Component<Props, State> {
    public constructor(props: Props) {
        super(props);

        this.state = {
            formCtx: {
                updateValue: (name, value) => this._updateFieldValue(name, value),
                updateValues: (values) => this._updateFieldValues(values),
                submit: () => this._submit(),
                touch: (name) => { this._updateFieldTouched(name, true); },
                untouch: (name) => { this._updateFieldTouched(name, false); },
                isValid: () => this._isFormValid(),
                isSubmitting: false,
                isSubmitted: false,
                isFinished: false,
                isValidating: false,
                validate: () => this._validate("force"),
                getValues: () => this._getValues(),
                resetFinished: () => { this._resetFinished(); },
            },
            fields: mapValues(props.fields, (field, name) => {
                if (!field) {
                    return field;
                }
                return this._createField(field, name as string);
            }),
        };
    }

    public override componentDidMount() {
        if (this.props.options?.validateOn?.mount ?? defaultOptions.validateOn.mount) {
            this._validate("mount").catch(noop);
        }

        this.props.onForm?.(this.state.formCtx);
    }

    public override componentDidUpdate(prevProps: Props, prevState: State) {
        if (prevState.formCtx !== this.state.formCtx) {
            this.props.onForm?.(this.state.formCtx);
        }
    }

    public override componentWillUnmount() {
        this.props.onForm?.(null);
    }

    private _isFormValid() {
        return Object.values(this.state.fields).every(f => !f?.error);
    }

    private readonly _getChecked = (f: Field) => {
        if ("checked" in f) {
            return Boolean(f.checked);
        }
        return Boolean(f.value);
    };

    private readonly _createField = (f: Field, name: string): FullField<unknown> => {
        const maybeChecked = f.type === "checkbox"
            ? {
                checked: this._getChecked(f),
                type: "checkbox",
                value: f.value ?? "1",
            }
            : {
                value: f.value,
            };

        const maybeType: Pick<FullField, "type"> = {};
        if (f.type) {
            maybeType.type = f.type;
        }

        return {
            ...maybeType,
            changed: false,
            touched: false,
            error: null,
            originalValue: maybeChecked.value,
            originalChecked: f.checked,
            props: {
                name: name,
                onChange: (e: unknown) => { this._updateFieldValueByType(f.type, name, e); },
                onBlur: () => { this._handleFieldBlur(name); },
                ...maybeChecked,
            },
        };
    };

    private _updateFieldValues(values: { [key: string]: unknown }) {
        return new Promise<void>(resolve => {
            this.setState(prev => {
                const fields = prev.fields;

                const newFields = { ...fields };

                let anythingUpdated = false;
                Object.entries(values).forEach(([name, value]) => {
                    const oldField = fields[name];
                    if (!oldField) {
                        console.warn(
                            "Trying to update field", name, "but it's not in the fields list. New value:", value,
                        );
                        return;
                    }

                    anythingUpdated = true;

                    const updatedValues = oldField.type === "checkbox"
                        ? {
                            checked: Boolean(value),
                            type: "checkbox",
                            value: !oldField.originalChecked ? value : oldField.originalValue,
                        }
                        : { value };

                    newFields[name] = {
                        ...oldField,
                        props: {
                            ...oldField.props,
                            ...updatedValues,
                        },
                        changed: true,
                        touched: true,
                    };
                });

                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                if (!anythingUpdated) {
                    return null;
                }

                return {
                    ...prev,
                    fields: newFields,
                };
            }, () => { resolve(); });
        });
    }

    private _updateFieldValue(name: string, value: unknown) {
        return this._updateFieldValues({ [name]: value });
    }

    private _convertValue(type: Field["type"], value: unknown) {
        if (typeof type === "function") {
            return type(value);
        }
        if (!type) {
            return valueConverters.auto!(value);
        }
        const converter = valueConverters[type];
        if (!converter) {
            throw new TypeError("react-foobar: Incorrect type: " + type);
        }
        return converter(value);
    }

    private readonly _updateFieldValueByType = (type: Field["type"], name: string, value: unknown) => {
        const newValue = this._convertValue(type, value);

        (async () => {
            await this._updateFieldValue(name, newValue);
        })().catch(rethrow);

        if (this.props.options?.validateOn?.change ?? defaultOptions.validateOn.change) {
            this._validate("change").catch(noop);
        }
    };

    private _updateFieldTouched(name: string, state: boolean) {
        this.setState(prev => {
            const fields = prev.fields;

            const oldField = fields[name];
            if (!oldField) {
                console.warn(
                    "Trying to set touched state on a field", name,
                    "but it's not in the fields list. New state:", state,
                );
                return null;
            }

            return {
                fields: {
                    ...fields,
                    [name]: {
                        ...oldField,
                        touched: state,
                    },
                },
            };
        });
    }

    private readonly _handleFieldBlur = (name: string) => {
        this._updateFieldTouched(name, true);

        if (this.props.options?.validateOn?.blur ?? defaultOptions.validateOn.blur) {
            this._validate("blur").catch(noop);
        }
    };

    private async _submit() {
        if (this.state.formCtx.isSubmitting) {
            throw new Error("Already submitting");
        }
        if (this.state.formCtx.isValidating) {
            throw new Error("Already validating"); // @todo future version should just break old validation
        }
        if (this.state.formCtx.isFinished) {
            throw new Error("Already finished");
        }

        this.setState(prev => {
            return {
                ...prev,
                formCtx: {
                    ...prev.formCtx,
                    isSubmitting: true,
                    isSubmitted: true,
                },
            };
        });

        let validationPassed: boolean = false;
        try {
            validationPassed = await this._validate("submit");

            if (!validationPassed) { // is validation did not crash, but also not passed
                throw new Error("Validation error");
            }

            await this.props.onSubmit(this._getValues());
            return;
        }
        finally {
            this.setState(prev => {
                return {
                    ...prev,
                    formCtx: {
                        ...prev.formCtx,
                        isSubmitting: false,
                        isFinished: validationPassed,
                    },
                };
            });
        }
    }

    private _resetFinished() {
        this.setState(prev => {
            return {
                ...prev,
                formCtx: {
                    ...prev.formCtx,
                    isFinished: false,
                },
            };
        });
    }

    private async _validate(source: ValidationSource) {
        if (this.state.formCtx.isValidating) {
            throw new Error("Already validating"); // @todo future version should just stop old validation
        }

        this.setState(prev => {
            return {
                ...prev,
                formCtx: {
                    ...prev.formCtx,
                    isValidating: true,
                },
            };
        });

        try {
            const errors = await this.props.validate(this._getValues(), {
                source: source,
                fields: this.state.fields,
            });
            this._updateFieldsErrors(errors);
            return !errors || Object.keys(errors).length === 0;
        }
        catch (e: unknown) {
            this._updateFieldsErrors({});
            throw ensureError(e);
        }
        finally {
            this.setState(prev => {
                return {
                    ...prev,
                    formCtx: {
                        ...prev.formCtx,
                        isValidating: false,
                    },
                };
            });
        }
    }

    private _getValues() {
        return mapValues(this.state.fields, (field) => {
            return field!.props.value;
        });
    }

    private _updateFieldsErrors(errors: ValidationResult) {
        const fields = this.state.fields;
        const newFields = mapValues(fields, (field, name) => {
            // @todo clear empty arrays from errors
            if (errors?.[name]) {
                return {
                    ...field!,
                    error: errors[name],
                };
            }

            if (field!.error) {
                return {
                    ...field!,
                    error: null, // reset error if it was there
                };
            }
            return field!; // don't touch a field when there is no need to
        });

        this.setState({ fields: newFields });
    }

    public override render() {
        return (
            <FormContext.Provider value={this.state.formCtx}>
                <FieldsContext.Provider value={this.state.fields}>
                    {this.props.children}
                </FieldsContext.Provider>
            </FormContext.Provider>
        );
    }
}

const useForm = () => {
    return useContext(FormContext);
};

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint
const useFields = <T extends unknown = string>() => {
    return useContext(FieldsContext) as FullFields<T>;
};

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint
const useField = <T extends unknown = string>(name: string) => {
    return useFields()[name] as FullField<T>;
};

export {
    Form,
    useForm, useFields, useField,
};
