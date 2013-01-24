(function () {

  var jsonomatic = { type: {} },
      n, id, has, ents, attrs, label, values;


  // helpers

  n = function (key) {
    return !! (parseInt(key, 10) == key);
  };

  id = function (name, key) {
    str = name + '@' + key;
    str = str.replace(/[^a-z0-9_]/g, '-');
    str = str.toLowerCase().replace(/^-+|-+$/g, '');
    str = str.replace(/--+/g, '-');

    return str;
  };

  has = function (key, set) {
    set = set || [];

    if (typeof set === 'string') {
      set = [set];
    }

    if ( ! n(key.index) && set[key.index]) {
      return true;
    }

    for (var tmp in set) {
      if (key.value === set[tmp]) {
        return true;
      }
    }
  };

  ents = function (str) {
    if (str.length && typeof str === 'string') {
      str = str.replace(/</g, '&lt;');
      str = str.replace(/>/g, '&gt;');
      str = str.replace(/&/g, '&amp;');
      str = str.replace(/"/g, '&quot;');
    }

    return str;
  };

  attrs = function (set, name, index, prefix) {
    var out = [],
        pre = prefix ? prefix + '-' : '',
        defs = /^(?:as|set|type|invert|value|label|unique|multiple|name|id|add|rm)$/;

    for (var key in set) {
      if ( ! defs.exec(key) || prefix) {
        if (typeof set[key] === 'boolean') {
          set[key] && out.push(pre + key + '="' + key + '"');
        } else if (set[key] !== null) {
          if (typeof set[key] === 'string' || typeof set[key] === 'number') {
            out.push(pre + key + '="' + ents(set[key]) + '"');
          } else {
            out.push(attrs(set[key], null, null, pre + key).substr(1));
          }
        }
      }
    }

    if (name && index) {
      out.push('name="' + name + '[' + index + ']"');
      out.push('id="' + id(name, index) + '"');
    }

    return out.length ? ' ' + out.join(' ') : '';
  };

  label = function (content, params, name, key) {
    var html = '',
        title;

    if (params.label) {
      title = '<label for="' + id(name, key) + '">' + params.label + '</label>';
      html += params.invert ? content + title : title + content;
    } else {
      html += content;
    }

    return html;
  };

  values = function (set) {
    var obj = [];

    for (var key in set) {
      obj.push({
        index: key,
        value: set[key],
        label: n(key) ? set[key] : key
      });
    }

    return obj;
  };


  // fields

  jsonomatic.type.text = function (key, name, value, params) {
    var html = '',
        defs = { cols: 40, rows: 4 };

    params = $.extend(defs, params);
    value = value || params.value || '';
    html += '<textarea' + attrs(params, name, key) + '>' + value + '</textarea>';

    return label(html, params, name, key);
  };

  jsonomatic.type.scalar = function (key, name, value, params) {
    var type = params.type || 'text';
        value = value || '',
        html = '',

    html += '<input type="' + type + '" value="' + value + '"';
    html += attrs(params, name, key);
    html += '/>';

    return label(html, params, name, key);
  };

  jsonomatic.type.toggle = function (key, name, value, params) {
    var html = '',
        defs = { invert: true, set: [true, 'true', 'yes', 'on', 1] };

    html += '<input type="checkbox"';
    html += has(value, defs.set) || value === true ? ' checked="checked"' : '';
    html += attrs(params, name, key);
    html += '/>';

    return label(html, $.extend(defs, params), name, key);
  };

  jsonomatic.type.group = function (key, name, value, params) {
    var html = '',
        defs = $.extend({ invert: true }, params),
        set = values(params.set || []),
        value = value || {},
        field, item;

    if (params.label) {
      html += '<label>' + params.label + '</label>';
    }

    html += '<ul>';

    for (var i in set) {
      item = $.extend(defs, set[i]);

      field = '';
      field += '<input type="';
      field += params.multiple ? 'checkbox' : 'radio';
      field += '"';

      if (name && id) {
        field += ' name="' + name;
        field += params.multiple ? '[' + key + '][' + item.index +']' : '[' + key + ']';
        field += '" id="' + id(name, key + '_' + item.index) + '"';
      }

      field += has(item, value) ? ' checked="checked"' : '';
      field += ' value="' + item.value + '"';
      field += attrs(params);
      field += '/>';

      html += '<li>' + label(field, item, name, key + '_' + item.index) + '</li>';
    }

    html += '</ul>';

    return html;
  };

  jsonomatic.type.list = function (key, name, value, params) {
    var set = values(params.set || []),
        html = '',
        item;

    html += '<select';

    if (name && key) {
      html += ' name="' + name + '[' + key + ']';
      html += params.multiple ? '[]" multiple="multiple"' : '"';
      html += ' id="' + id(name, key) + '"';
    }

    html += attrs(params);
    html += '>';

    for (var i in set) {
      item = set[i];
      html += '<option value="' + item.value + '"';
      html += has(item, value) ? ' selected="selected"' : '';
      html += '>' + item.label + '</option>';
    }

    html += '</select>'

    return label(html, params, name, key);
  };

  jsonomatic.type.hash = function (key, name, value, params) {
    var html = '',
        set = [],
        top = key,
        args, row, col, field, add, rm;

    add = params.add || '&plus;';
    rm = params.rm || '&times';

    html += '<dl>';
    html += '<dt class="label">';

    if (params.label) {
      html += params.label;
    }

    html += '<a href="javascript:;" class="add">' + add +'</a>';
    html += '</dt><dd class="field mock" style="display:none">';

    for (var key in params.set) {
      args = params.set[key];
      args.disabled = true;

      html += '<div class="';
      html += args.as || 'scalar';
      html += '">';

      html += jsonomatic.field(key, name + '[' + top + '][]', '', args) + '</div>';
    }

    html += '<a href="javascript:;" class="rm">' + rm +'</a></dd>';


    for (row in value) {
      col = value[row];

      html += '<dd class="field">';

      for (field in params.set) {
        html += '<div class="';
        html += params.set[field].as || 'scalar';
        html += '">';

        field = jsonomatic.field(field, name + '[' + top + '][' + row + ']', col[field], params.set[field]);
        field = field.replace(/disabled="disabled"/g, '');

        html += field + '</div>';
      }

      html += '<a href="javascript:;" class="rm">' + rm + '</a></dd>';
    }

    html +='</dl>';

    return html;
  };

  jsonomatic.type.map = function (key, name, value, params) {
    return jsonomatic.from(name + '[' + key + ']', value, params.set || [], params);
  };


  // methods

  jsonomatic.field = function (key, name, value, params) {
    var defs = { as: 'scalar' },
        config = $.extend(defs, params);

    return jsonomatic.type[config.as](key, name, value, config);
  };

  jsonomatic.from = function (name, data, setup, params) {
    var html = '',
        params = params || {};

    html += '<dl' + attrs(params) + '>';

    if (params.label) {
      html += '<dt class="label">' + params.label + '</dt>';
    }
    for (var key in setup) {
      html += '<dd class="';
      html += setup[key] && setup[key].invert ? 'invert ' : '';
      html += setup[key] ? setup[key].as || 'scalar' : 'scalar';
      html += '">' + jsonomatic.field(key, name, data[key] || '', setup[key]) + '</dd>';
    }

    html += '</dl>';

    return html;
  }


  // plugin definition

  $.fn.jsonomatic = function (config) {
    var el = $(this),
        name = config.as || 'metadata',
        data = config.use || {},
        setup = config.set || {},
        output = jsonomatic.from(name, data, setup);

    el.data({
      name: name,
      data: data,
      setup: setup
    });

    el.append(output);
  };

  $('dd.hash a.add').live('click', function () {
    var el = $(this),
        dl = el.closest('dl'),
        dd = dl.find('dd.mock').eq(0),
        max = dl.find('dd').size() - 1,
        tmp = dd.clone().css('display', '').removeClass('mock');

      tmp.find('input,select,textarea').each(function () {
        var sub = $(this),
            id = sub.attr('id'),
            name = sub.attr('name');

        sub.attr('disabled', false);
        sub.attr('id', id + '_' + max);
        sub.attr('name', name.replace('[]', '[' + max + ']'));
      });

      tmp.find('label').each(function () {
        var sub = $(this),
            old = sub.attr('for');

        old && sub.attr('for', old + '_' + max);
      });

      tmp.appendTo(dl);
  });

  $('dd.field:not(.mock) a.rm').live('click', function () {
    $(this).closest('dd').remove();
  });

})(window.jQuery);
