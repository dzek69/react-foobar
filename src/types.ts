interface Field {
    type?: ((value: unknown) => unknown) | "rn-text" | "checkbox" | "auto";
    value?: unknown;
    checked?: boolean;
}

interface FullField<T = string> {
    type?: Field["type"];
    props: {
        type?: HTMLInputElement["type"];
        checked?: boolean;
        name: string;
        value: T;
        onChange: (e: unknown) => void;
        onBlur: () => void;
    };
    error: string | string[] | undefined | null;
    changed: boolean;
    touched: boolean;
    originalValue: T;
    originalChecked: boolean | undefined;
}

interface Fields { [key: string]: Field | undefined }

interface FullFields<T = string> { [key: string]: FullField<T> | undefined }

interface FormCtx {
    /**
     * Updates single field value
     */
    updateValue: (name: string, value: unknown) => void;
    /**
     * Updates multiple fields values
     */
    updateValues: (values: {[ key: string ]: unknown}) => void;
    /**
     * Submits the form
     */
    submit: () => Promise<void>;
    /**
     * Determines if form is submitting
     */
    isSubmitting: boolean;
    /**
     * Determines if form was submitted at least once
     */
    isSubmitted: boolean;
    /**
     * Determines if form is finished
     */
    isFinished: boolean;
    /**
     * Determines if form is in progress of validating data
     */
    isValidating: boolean;
    /**
     * Returns if form is valid
     */
    isValid: () => boolean;
    /**
     * Sets field touched state to true
     * @param {string} name field name
     */
    touch: (name: string) => void;
    /**
     * Sets field touched state to false
     * @param {string} name field name
     */
    untouch: (name: string) => void;
    /**
     * Gets all the values
     */
    getValues: () => { [key: string]: unknown };
    /**
     * Forces validation on form
     */
    validate: () => Promise<boolean>;
}

type ValidationSource = "submit" | "mount" | "blur" | "change" | "force";

interface ValidationResultList { [key: string]: string | string[] | undefined }

type ValidationResult = ValidationResultList | null | undefined;

type MaybePromise<T> = T | Promise<T>;

type DeepPartial<T> = T extends object ? {
    [P in keyof T]?: DeepPartial<T[P]>;
} : T;

interface Options {
    validateOn: {
        blur: boolean;
        change: boolean;
        mount: boolean;
    };
}

type PropsOptions = DeepPartial<Options>;

export type {
    Field,
    FullField,
    Fields,
    FullFields,
    FormCtx,
    ValidationSource,
    ValidationResult,
    MaybePromise,
    Options,
    PropsOptions,
};
