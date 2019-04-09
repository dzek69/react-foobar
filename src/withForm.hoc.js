import React, { Component } from "react";

import { FormContext } from "./Form";

const withForm = (BaseComponent) => {
    class WithForm extends Component { // eslint-disable-line react/prefer-stateless-function
        render() {
            return <BaseComponent {...this.props} {...this.context} />;
        }
    }

    WithForm.displayName = "WithForm(" + (BaseComponent.displayName || BaseComponent.name) + ")";
    WithForm.contextType = FormContext;

    return WithForm;
};

export default withForm;
