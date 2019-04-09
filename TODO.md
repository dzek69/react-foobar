## Things to do to make this as compatible with react-inform as possible

Add support for these field definition properties:
- onChange()
- onValidate()
- validate
- onTouch()

Add form prop properties:
- isValid()
- forceValidate()
- values()
- onValues() - to be verified
- touch()
- untouch()
- resetTouched()

Custom form prop properties:
- resetChanged()
- reset({ values, touched, changed })

Add:
- decorator support (?)
- Higher Order Component `from` to generate component with validation from validation rules map (?)
- createValidate as a exported helper instead of above
- HOC `form` that resembles the one from react-inform for simple use cases
- ResetFormButton
- DisabledFormSubmit
- FeedbackFormSubmit
- documentation
- examples recreated from react-inform examples
