const tryFirst = (args, fns, error) => {
    const useArgs = !Array.isArray(args) ? [args] : args;
    for (let i = 0; i < fns.length; i++) {
        const fn = fns[i];
        try {
            return fn.call(null, ...useArgs);
        }
        catch (e) {} // eslint-disable-line no-unused-vars
    }
    throw error || new Error("Nothing had worked");
};

export default tryFirst;
