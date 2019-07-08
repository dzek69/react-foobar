import React, { Component } from "react";

import { Form } from "../..";
import Fields from "./Fields";

const validate = (values) => {
    const errors = {};
    if (!values.checkbox) {
        errors.checkbox = "Must be checked";
    }
    if (!values.username) {
        errors.username = "Username is required";
    }
    if (!values.email || !values.email.includes("@")) {
        errors.email = "Must be a valid e-mail";
    }
    if (!values.password) {
        errors.password = "Password is required";
    }
    if (values.password !== values.confirmPassword) {
        errors.confirmPassword = "Passwords must match";
    }
    return errors;
};

const fields = {
    checkbox: {
        value: true,
    },
    username: {
        value: "test user",
    },
    email: {
        value: "badEmail",
    },
    password: {
        value: "",
    },
    confirmPassword: {
        value: "",
    },
};

const options = {
    validateOn: {
        blur: true,
        mount: true,
    },
};

const wait = time => new Promise(resolve => setTimeout(resolve, time));

const SUBMIT_WAIT_TIME = 2000;

class BasicForm extends Component {
    constructor(props, context) {
        super(props, context);

        this.state = {};
    }

    async handleSubmit() {
        await wait(SUBMIT_WAIT_TIME);
        return {
            status: Math.random() > 0.5, // eslint-disable-line no-magic-numbers
        };
    }

    render() {
        return (
            <Form validate={validate} onSubmit={this.handleSubmit} fields={fields} options={options}>
                <Fields />
            </Form>
        );
    }
}

BasicForm.propTypes = {};

export default BasicForm;
