;(function () {


  var n = function (key) {
    return !! (parseInt(key, 10) == key);
  };


  var id = function (name, key) {
    str = name + '@' + key;
    str = str.replace(/[^a-z0-9_]/g, '-');
    str = str.toLowerCase().replace(/^-+|-+$/g, '');
    str = str.replace(/--+/g, '-');

    return str;
  };


  var has = function (key, set) {
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


  var ents = function (str) {
    if (str.length && typeof str === 'string') {
      str = str.replace(/</g, '&lt;');
      str = str.replace(/>/g, '&gt;');
      str = str.replace(/&/g, '&amp;');
      str = str.replace(/"/g, '&quot;');
    }

    return str;
  };


  var attrs = function (set, name, index, prefix) {
    var out = [],
        pre = prefix ? prefix + '-' : '',
        defs = /^(?:as|set|type|invert|value|update|label|unique|multi(?:ple)?|name|id|add|rm)$/;

    for (var key in set) {
      if ( ! defs.exec(key) || prefix) {
        if (typeof set[key] === 'boolean') {
          out.push(set[key] ? pre + key + '="' + key + '"' : '');
        } else if (set[key] !== null) {
          if (typeof set[key] === 'string' || typeof set[key] === 'number') {
            out.push(pre + key + '="' + ents(set[key]) + '"');
          } else {
            out.push(attrs(set[key], null, null, pre + key).substr(1));
          }
        }
      }
    }

    set.update && out.push('data-metachange="' + set.update + '"');

    if (name && index) {
      out.push('name="' + name + '[' + index + ']"');
      out.push('id="' + id(name, index) + '"');
    }

    return out.length ? ' ' + out.join(' ') : '';
  };


  var label = function (content, params, name, key) {
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


  var values = function (set) {
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




  var build = {

    text: function (key, name, value, params) {
      var html = '',
          defs = { cols: 40, rows: 4 };

      params = $.extend(defs, params);
      value = value || params.value || '';
      html += '<textarea' + attrs(params, name, key) + '>' + value + '</textarea>';

      return label(html, params, name, key);
    },

    scalar: function (key, name, value, params) {
      var type = params.type || 'text';
          value = value || '',
          html = '',

      html += '<input type="' + type + '" value="' + value + '"';
      html += attrs(params, name, key);
      html += '/>';

      return label(html, params, name, key);
    },

    boolean: function (key, name, value, params) {
      var html = '',
          defs = { invert: true },
          ok = { '1': 1, 'true': 1, on: 1, yes: 1 };

      html += '<input type="checkbox"';
      html += ok[value] || value === true ? ' checked="checked"' : '';
      html += attrs(params, name, key);
      html += '/>';

      return label(html, $.extend(defs, params), name, key);
    },

    group: function (key, name, value, params) {
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
        field += params.multi ? 'checkbox' : 'radio';
        field += '"';

        if (name && id) {
          field += ' name="' + name;
          field += params.multi ? '[' + key + '][' + item.index +']' : '[' + key + ']';
          field += '" id="' + id(name, params.multi ? key + '_' + item.index : key) + '"';
        }

        field += has(item, value) ? ' checked="checked"' : '';
        field += ' value="' + item.value + '"';
        field += attrs(params);
        field += '/>';

        html += '<li>' + label(field, item, name, params.multi ? key + '_' + item.index : key) + '</li>';
      }

      html += '</ul>';

      return html;
    },

    list: function (key, name, value, params) {
      var set = values(params.set || []),
          html = '',
          item;

      html += '<select';

      if (name && key) {
        html += ' name="' + name + '[' + key + ']';
        html += params.multi ? '[]" multiple="multiple"' : '"';
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
    },

    hash: function (key, name, value, params) {
      var html = '',
          set = [],
          top = key,
          args, row, col, field, add, rm;

      add = params.add || '&plus;';
      rm = params.rm || '&times';

      html += '<dl>';
      html += '<dt><label>';

      if (params.label) {
        html += params.label;
      }

      html += '<a href="javascript:;" class="add">' + add +'</a></label>';
      html += '</dt><dd class="field mock" style="display:none">';

      for (var key in params.set) {
        args = params.set[key];
        args.disabled = true;

        html += '<div class="';
        html += args.as || 'scalar';
        html += '">';

        html += item(key, name + '[' + top + '][]', '', args) + '</div>';
      }

      html += '<a href="javascript:;" class="rm">' + rm +'</a></dd>';


      for (row in value) {
        col = value[row];

        html += '<dd class="field">';

        for (field in params.set) {
          html += '<div class="';
          html += params.set[field].as || 'scalar';
          html += '">';

          field = item(field, name + '[' + top + '][' + row + ']', col[field], params.set[field]);
          field = field.replace(/disabled="disabled"/g, '');

          html += field + '</div>';
        }

        html += '<a href="javascript:;" class="rm">' + rm + '</a></dd>';
      }

      html +='</dl>';

      return html;
    },

    map: function (key, name, value, params) {
      return parse(name + '[' + key + ']', value, params.set || [], params);
    }

  };


  var item = function (key, name, value, params) {
    var fn,
        html = [],
        defs = { as: 'scalar' },
        config = $.extend(defs, params);

    html.push(build[config.as](key, name, value, config));

    config.before = 'function' === typeof config.before ? config.before(value) : config.before;
    config.before && html.unshift('<div class="before">' + config.before + '</div>');

    config.after = 'function' === typeof config.after ? config.after(value) : config.after;
    config.after && html.push('<div class="after">' + config.after + '</div>');

    return html.join('');
  };


  var parse = function (name, data, setup, params) {
    var html = '',
        params = params || {};

    html += '<dl' + attrs(params) + '>';

    if (params.label) {
      html += '<dt><label>' + params.label + '</label></dt>';
    }
    for (var key in setup) {
      html += '<dd class="';
      html += setup[key] && setup[key].invert ? 'invert ' : '';
      html += setup[key] ? setup[key].as || 'scalar' : 'scalar';
      html += '">' + item(key, name, data[key] || '', setup[key]) + '</dd>';
    }

    html += '</dl>';

    return html;
  }




  $.fn.metadata = function (config) {
    var name = config.name || 'metadata',
        data = config.json || {},
        setup = config.fields || {};

    $(this).addClass('metadata').append(parse(name, data, setup)).data({
      name: name,
      data: data,
      setup: setup
    });
  };


  $('body').on('click', '.metadata dd.hash a.add', function () {
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
  }).on('click', '.metadata dd.field:not(.mock) a.rm', function () {
    $(this).closest('dd').remove();
  }).on('keydown change', '.metadata [data-metachange]', function (e) {
    e.t && clearTimeout(e.t);
    e.t = setTimeout(function () {
      var el = $(e.currentTarget),
          fire = 'update.' + el.data('metachange');

      el.trigger($.Event(fire));
    }, 33);
  });


})(jQuery);
