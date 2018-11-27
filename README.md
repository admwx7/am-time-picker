# paper-time-picker
Material design time picker web component, built using lit-element

Provides a responsive time picker based on the material design spec. This
component aims to be a clone of the time picker introduced in Android Lollipop.

![wide picker screenshot][wide] ![narrow picker screenshot][narrow]

## Examples:

Default picker:

```html
<paper-time-picker></paper-time-picker>
```

Setting the initial time to 4:20pm (note that hours given as 24-hour):

```html
<paper-time-picker time="4:20pm"></paper-time-picker>
```

# Reporting Bugs

When filing a bug report, please provide an example of how to repoduce using
plunker, jsbin, jsfiddle, etc.

[wide]: http://i.imgur.com/kosRJrF.png
[narrow]: http://i.imgur.com/s3honuG.png