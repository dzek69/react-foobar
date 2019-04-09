const fail = () => {
    throw new Error("No react-foobar form found in context.");
};

const defaultContext = {
    fields: {},
    form: {
        updateValue: fail,
        submit: fail,
        isSubmitting: fail,
    },
    __NO_FORM_PROVIDER__: true,
};

export default defaultContext;
