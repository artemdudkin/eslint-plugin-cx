# eslint-plugin-cx

(React.js) ESLint rule : all css-class-names should starts with jsx-class-name-prefix

I.e., all CSS class names (1) should start with prefix__ or (2) should be equal to prefix, where
  1. prefix = component name (camelCase, dashed or underscored)
  2. all modules should export component at 'export default' (and its name will be used as prefix)
  3. function components should be named functions
  
(tested only at ES6 classes + function components)

## Rule Options

```js
...
"cx/classnames": [<enabled>, { "prefixType": <string> }]
...
```

### `prefixType`

Can be one of 'dash', 'underscore' or else ('dash' is default).

* dash -> for MyClass prefix will be my-class
* underscore -> for MyClass prefix will be my_class
* else -> for MyClass prefix will be MyClass (no change)

## License

MIT
