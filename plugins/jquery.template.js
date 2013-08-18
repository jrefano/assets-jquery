/**
 * Based on these scripts (but modified slightly):
 * http://weblogs.asp.net/dwahlin/archive/2009/05/03/using-jquery-with-client-side-data-binding-templates.aspx
 * http://ejohn.org/blog/javascript-micro-templating
 */
(function($){

  $.fn.template = function(data) {

    var tpl    = this.html(),
        _cache = {},
        func,
        tplFunc;

    try {

      func = _cache[tpl];

      if ( !func ) {

        tplFunc =
        "var p=[],print=function(){p.push.apply(p,arguments);};" +
                    "with(obj){p.push('" +
        tpl.replace(/[\r\t\n]/g, " ")
           .replace(/\s*<!\[CDATA\[|\]\]>\s*/g, '')
           .replace(/'(?=[^%]*%>)/g, "\t")
           .split("'").join("\\'")
           .split("\t").join("'")
           .replace(/<%=(.+?)%>/g, "',$1,'")
           .split("<%").join("');")
           .split("%>").join("p.push('") +
        "');}return p.join('');";

        // console.log(tplFunc);
        func = new Function('obj', tplFunc);

        _cache[tpl] = func;

      }

      // Return a jQuery object to enable chaining.
      return $(func(data));

    }
    catch (e) {

      var err = e.message + '.';
      console.log('Template "'+this['selector']+'", Error:', err, data);
      throw e;

    }

  };

})(jQuery);
