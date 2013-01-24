Yet another JSON-editable solution?
===================================

Probably not because here is no validation, no schemas and no complex setup.

Thus **json-o-matic** it's a lot simpler:

```javascript
var data, fields;

data = { title: 'Hello World!' };

fields = {
  title: { as: 'scalar', label: 'Title:', size: 20 },
  status: { as: 'list', label: 'Status:', set: ['draft', 'published'] }
};

$('#form-metadata').jsonomatic({ set: fields, use: data });
```

You'll get just a field set.

![Sample field](http://i.imgur.com/sK3U7b9.png)


## Available fields and options

Each field type could have its own options, all extra parameters will be passed as html attributes.

All fields accept the **as**, **label** and **invert** parameter by default:

### text

Use textarea element for long text.

Defaults:

 - **cols**: 40
 - **rows**: 4

_Without options._

### scalar

Our usual input type.

Defaults:

 - **type**: text

_Without options._

### toggle

Checkbox for toggling states.

Defaults:

 - **invert**: `true`
 - **set**: `[true, 'true', 'yes', 'on', 1]`

Options:

 - **set**: List of values to validate the state

### group

Radios or checkboxes nor more nor less.

Defaults:

 - **invert**: `true`
 - **multiple**: `false`

The radio type will be used by default.

Options:

 - **multiple**: Use checkboxes to display multiple choices

### list

Just a select element.

Defaults:

 - **set**: `[]`

Options:

 - **set**: The dropdown options

### hash

Defaults:

 - **set**: `{}`
 - **add**: `'&plus;'`
 - **rm**: `'&times;'`

Options:

 - **set**: Dynamic subset of fields
 - **add**: Add fields text
 - **rm**: Remove field text

### map

Defaults:

 - **set**: `{}`

Options:

 - **set**: Static subset of fields


Afterwards you send the form you'll receive a normal data structure.


## Known issues

 - Unstyled and not tested cross-browser
 - Missing enough documentation

## Keep Calm & Contribute

Have issues? Missing features? Share coins?

Sure you rocks!
