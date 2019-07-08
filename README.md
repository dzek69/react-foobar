# react-foobar

## tl;dr
Form state handler for React and React Native. Inspired (but not a 1:1 clone or fork) by abandoned `react-inform`.

## Description

Forms are not currently fun to work with in React. There are a lot of form libraries out there, but a lot of them have
issues making them a pain to work with. These issues include:

- You have to use provided input / form components rather than whatever components you want.
- The provided inputs can have bugs and inconsistencies with the built-in components.
- The forms cannot be controlled from outside of the library's components and user input.
- You are forced into using refs to call methods on components.
- Validations are not straightforward, and you cannot validate across fields (like having two different inputs that
should have the same value). Sometimes you're just forced to use specific validation library.
- Handling multi-step form data and/or separate validation for each step can be troublesome.

`react-foobar` is a form library for React that avoids all of these issues.

## Features

### Compatibility
- use with React for web or React Native
- use native input components or create/attach to custom ones

### Validation
- plug in any validation library, use provided helpers or validate manually
- sync and async validation support
- validate differently basing on what triggered validation (ie: validate user name on server only on submit)

### Multi-step form support
- unmount step 1, when going into step 2, data is preserved
- validate each step separately but have access to previous steps data

## Limitations
- React 16+ only (official/modern context support)

## Incompatibilities when moving from react-inform
- removed redundant `resetTouched()` form method, just use `untouch()` instead
- `onValues()` form method renamed to `setValues()` (@todo)

## Current status

This is production ready. However some of react-inform features are not there yet.

### Things to do to make this as compatible with react-inform as possible + planned bonus features

Add support for these field definition properties:
- onChange()
- onValidate()
- validate
- onTouch()

Add form prop properties:
- onValues() - to be renamed to setValues

Custom form prop properties:
- change()
- unchange() ?
- resetSubmitted
- resetFinished
- resetValues

Add:
- decorator support (?)
- Higher Order Component `from` to generate component with validation from validation rules map (?)
- createValidate as a exported helper instead of above
- HOC `form` that resembles the one from react-inform for simple use cases
- components for web: ResetFormButton, DisabledFormSubmit, FeedbackFormSubmit
- documentation
- examples recreated from react-inform examples
- more examples, showing all features

## License

MIT
