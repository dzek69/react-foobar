import React, { Component, createContext } from "react"; // eslint-disable-line max-lines
import PropTypes from "prop-types";
import memoizeOne from "memoize-one";
import mapValues from "bottom-line-utils/mapValues";
import get from "bottom-line-utils/get";
import coalesce from "bottom-line-utils/coalesce";

import valueConverters from "./valueConverters.util";
import defaultContext from "./defaultContext";

const FormContext = createContext(defaultContext);

const getFieldValue = (field) => {
    return field.props.value;
};

const defaultOptions = {
    validateOn: {
        blur: false,
        change: true,
        // changeOnlyTouched: false,
        mount: true,
    },
    // submitOn: {
    //     blur: false,
    // },
};

const noop = () => undefined;

const hasNoError = item => item.error == null || (Array.isArray(item.error) && !item.error.length);

class Form extends Component {
    constructor(props) { // eslint-disable-line max-lines-per-function
        super(props);
        this.state = {
            fields: this._getFieldsAfterUpdate(props.fields, {}),
            isSubmitting: false,
            isSubmitted: false,
            isFinished: false,
            isValidating: false,
        };

        this._form = {
            updateValue: this._updateFieldValue.bind(this),
            submit: async () => { // eslint-disable-line max-statements
                if (this.state.isSubmitting) {
                    throw new Error("Already submitting");
                }
                if (this.state.isValidating) {
                    throw new Error("Already validating"); // @todo future version should just break old validation
                }
                if (this.state.isFinished) {
                    throw new Error("Already finished");
                }

                // await this._setTouched(true);

                this.setState({
                    isSubmitting: true,
                    isSubmitted: true,
                });

                let validationPassed;
                try {
                    validationPassed = await this._validate("submit");

                    if (!validationPassed) { // is validation did not crash, but also not passed
                        throw new Error("Validation error");
                    }

                    return await this.props.onSubmit(this._getValues());
                }
                finally {
                    const newState = {
                        isSubmitting: false,
                    };
                    if (validationPassed) {
                        newState.isFinished = true;
                    }
                    this.setState(newState);
                }
            },
            isSubmitting: () => this.state.isSubmitting,
            isValid: () => {
                if (this.state.isValidating) {
                    return false;
                }
                const values = Object.values(this.state.fields);
                return values.every(hasNoError);
            },
            touch: this._setTouched.bind(this, true),
            untouch: this._setTouched.bind(this, false),
            values: () => this._getValues(),
            forceValidate: () => this._validate("force"),
        };
    }

    componentDidMount() {
        this._getContext = memoizeOne(this._getContext.bind(this));

        const shouldValidate = this._getOption("validateOn.mount");
        if (shouldValidate) {
            this._validate("mount").catch(noop);
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.fields !== this.props.fields) {
            this._handleFieldsUpdate();
        }
    }

    _setTouched(state, fields) {
        return new Promise(resolve => {
            this.setState(prev => {
                // @todo don't update if there would be no changes
                return {
                    fields: mapValues(prev.fields, (field, key) => {
                        if ((!fields || fields.includes(key)) && field.touched !== state) {
                            return {
                                ...field,
                                touched: state,
                            };
                        }
                        return field;
                    }),
                };
            }, resolve);
        });
    }

    _getValues() {
        return mapValues(this.state.fields, getFieldValue);
    }

    async _validate(source) {
        if (this.state.isValidating) {
            throw new Error("Already validating"); // @todo future version should just stop old validation
        }

        this.setState({
            isValidating: true,
        });

        try {
            const errors = await this.props.validate(this._getValues(), {
                source,
            });
            this._updateFieldsErrors(errors);
            return !errors || Object.keys(errors).length === 0;
        }
        catch (e) {
            this._updateFieldsErrors({});
            throw e;
        }
        finally {
            this.setState({
                isValidating: false,
            });
        }
    }

    _getOption(path, defaultValue) {
        return get(
            this.props.options, path,
            get(
                defaultOptions, path, defaultValue,
            ),
        );
    }

    _createField(currentFields, field, fieldName) {
        const prev = currentFields[fieldName];

        if (prev && prev.type === field.type && prev.value === field.value) {
            // field definition is the same
            return prev;
        }

        return {
            type: field.type,
            props: {
                value: coalesce(field.value),
                onChange: this._updateFieldValueByType.bind(this, field.type, fieldName),
                onBlur: this._handleFieldBlur.bind(this, fieldName),
            },
            error: null,
            changed: coalesce(prev && prev.changed, false),
            touched: coalesce(prev && prev.touched, false),
        };
    }

    _updateFieldTouched(name, state) {
        this.setState(prev => {
            const fields = prev.fields;
            return {
                fields: {
                    ...fields,
                    [name]: {
                        ...fields[name],
                        touched: state,
                    },
                },
            };
        });
    }

    _handleFieldBlur(name) {
        this._updateFieldTouched(name, true);
        const shouldValidate = this._getOption("validateOn.blur");
        if (shouldValidate) {
            this._validate("blur").catch(noop);
        }
    }

    _updateFieldValue(name, value) {
        return new Promise(resolve => {
            this.setState(prev => {
                const fields = prev.fields;
                return {
                    fields: {
                        ...fields,
                        [name]: {
                            ...fields[name],
                            props: {
                                ...fields[name].props,
                                value,
                            },
                            changed: true,
                        },
                    },
                };
            }, resolve);
        });
    }

    _updateFieldsErrors(errors) {
        const fields = this.state.fields;
        const newFields = mapValues(fields, (field, name) => {
            // @todo clear empty arrays from errors
            if (errors[name]) {
                return {
                    ...field,
                    error: errors[name],
                };
            }
            if (field.error) {
                return {
                    ...field,
                    error: null,
                };
            }
            return field; // don't touch a field when there is no need to
        });
        this.setState({
            fields: newFields,
        });
    }

    _convertValue(type, value) {
        if (typeof type === "function") {
            return type(value);
        }
        if (!type) {
            return valueConverters.auto(value);
        }
        const converter = valueConverters[type];
        if (!converter) {
            return value; // @todo throw on incorrect converter?
        }
        return converter(value);
    }

    async _updateFieldValueByType(type, name, value) {
        const newValue = this._convertValue(type, value);
        await this._updateFieldValue(name, newValue);
        const shouldValidate = this._getOption("validateOn.change");
        if (shouldValidate) {
            this._validate("change").catch(noop);
        }
    }

    _getFieldsAfterUpdate(fields, stateFields) {
        // @todo handle field removal
        return mapValues(fields, this._createField.bind(this, stateFields));
    }

    _handleFieldsUpdate() {
        this.setState((prev) => {
            return {
                fields: this._getFieldsAfterUpdate(this.props.fields, prev.fields),
            };
        });
    }

    _getContext(state) {
        return {
            fields: state.fields,
            form: this._form,
            isSubmitting: state.isSubmitting,
            isSubmitted: state.isSubmitted,
            isFinished: state.isFinished,
            isValidating: state.isValidating,
        };
    }

    render() {
        return (
            <FormContext.Provider value={this._getContext(this.state)}>
                {this.props.children}
            </FormContext.Provider>
        );
    }
}

Form.defaultProps = {
    options: null,
};

Form.propTypes = {
    children: PropTypes.node.isRequired,
    fields: PropTypes.object.isRequired,
    validate: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    options: PropTypes.object,
};

export default Form;

export {
    FormContext,
};
