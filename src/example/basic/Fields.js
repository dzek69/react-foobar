import React, { Component } from "react";
import PropTypes from "prop-types";

import { withForm } from "../..";

const JSON_INDENT = 4;

class Fields extends Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            error: null,
        };

        this._handleReveal = this._handleReveal.bind(this);
        this._handleHide = this._handleHide.bind(this);
        this._handleSubmit = this._handleSubmit.bind(this);
    }

    _handleReveal() {
        this.props.form.touch();
    }

    _handleHide() {
        this.props.form.untouch();
    }

    _handleSubmit(event) {
        event.preventDefault();
        this.setState({ error: null }, async () => {
            try {
                await this.props.form.submit();
            }
            catch (error) {
                this.setState({
                    error: error.message,
                });
            }
        });
    }

    render() {
        const fields = this.props.fields;
        const { checkbox, username, email, password, confirmPassword } = fields;

        const isValid = this.props.form.isValid();
        const isSubmitted = this.props.isSubmitted;

        const error = this.state.error && (
            <fieldset>
                <legend>Submit error</legend>
                <pre>{this.state.error}</pre>
            </fieldset>
        );

        return (
            <form onSubmit={this._handleSubmit}>
                <fieldset>
                    <label>
                        <input type={"checkbox"} {...checkbox.props} checked={checkbox.props.value} />
                        Checkbox just for fun
                    </label>
                    <div>{(isSubmitted || checkbox.touched) && checkbox.error}</div>

                    <div>Username</div>
                    <input {...username.props} />
                    <div>{(isSubmitted || username.touched) && username.error}</div>

                    <div>Email</div>
                    <input {...email.props} />
                    <div>{(isSubmitted || email.touched) && email.error}</div>

                    <div>Password</div>
                    <input type={"password"} {...password.props} />
                    <div>{(isSubmitted || password.touched) && password.error}</div>

                    <div>Confirm password</div>
                    <input type={"password"} {...confirmPassword.props} />
                    <div>{(isSubmitted || confirmPassword.touched) && confirmPassword.error}</div>

                    <button disabled={!isValid}>I am enabled when valid! (submit)</button>
                    <button>I am always enabled! (submit)</button>
                    <button onClick={this._handleReveal}>I will reveal errors!</button>
                    <button onClick={this._handleHide}>I will hide errors!</button>
                </fieldset>
                <fieldset>
                    <legend>Is submitting?</legend>
                    <pre>{this.props.form.isSubmitting() ? "yes" : "no"}</pre>
                </fieldset>
                {error}
                <fieldset>
                    <legend>Serialized form data</legend>
                    <pre>{JSON.stringify(fields, null, JSON_INDENT)}</pre>
                </fieldset>
            </form>
        );
    }
}

Fields.propTypes = {
    fields: PropTypes.object.isRequired,
    form: PropTypes.object.isRequired,
};

export default withForm(Fields);
