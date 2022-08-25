import type { FormCtx, Options } from "./types";

const fail = () => {
    throw new Error("No react-foobar form found in context.");
};

const defaultFormContext: FormCtx = {
    updateValue: fail,
    updateValues: fail,
    updateErrors: fail,
    submit: fail,
    isSubmitting: false,
    isSubmitted: false,
    isFinished: false,
    isValidating: false,
    validate: fail,
    isValid: fail,
    touch: fail,
    untouch: fail,
    getValues: fail,
    resetFinished: fail,
};

const defaultOptions: Options = {
    validateOn: {
        blur: true,
        change: false,
        mount: true,
    },
};

type MakeArray<T> = T extends [] ? T : T[];

const tryFirst = <T, R>(args: T | T[], fns: ((...a: MakeArray<T>) => R)[], error?: Error) => {
    const useArgs = !Array.isArray(args) ? [args] : args;
    for (let i = 0; i < fns.length; i++) {
        const fn = fns[i];
        try {
            // @ts-expect-error Am I stupid or TS?
            return fn.call(null, ...useArgs);
        }
        catch {}
    }
    throw error || new Error("Nothing had worked");
};

export {
    defaultFormContext,
    defaultOptions,
    tryFirst,
};
