(function ($) {
    var devBarSel   = '.dev-bar',
        contextSel  = '.context',
        dataSel     = '.data',
        jsonSel     = '.json',
        formSel     = '.json-path',
        jsonDataSel     = '.json-data',
        devBarHTML  = '<strong>Dev Bar:</strong> ' +
            'Context: <span class="context"></span> ' +
            '| Data: <span class="data"><a>{...}</a><span class="json"></span></span>',
        formHTML    = '<input class="json-path" type="text"><span class="json-data"></span>';


    $(document).ready(function () {
        var $el = $(devBarSel),
            jsonData = $.parseJSON(decodeURI($el.data('json'))),
            jsonKeys = [],
            $contextEl,
            $dataEl,
            $jsonEl,
            $jsonDataEl,
            $formEl;

        $el.append(devBarHTML);

        $contextEl = $el.find(contextSel);
        $dataEl = $el.find(dataSel);
        $jsonEl = $dataEl.find(jsonSel);

        // Style
        $('body').css('margin-top', '36px');

        $el.css({
            'background': '#000',
            'color': '#fff',
            'position': 'fixed',
            'top': '0px',
            'width': '100%',
            'height:': '30px',
            'padding': '3px'
        });

        $jsonEl.hide();

        $jsonEl.css({
            'background': '#333',
            'position': 'absolute',
            'top': '30px',
            'left': '0px',
            'width': '100%',
            'height': '300px',
            'overflow': 'scroll',
            'padding': '5px'

        });

        // More Content
        $contextEl.append('[');

        $.each(jsonData.context, function (i, context) {
            $contextEl.append(context);
            if (jsonData.context.length > i + 1) {
                $el.find(contextSel).append(', ');
            }
        });

        $contextEl.append(']');

        $jsonEl.append(formHTML);
        $jsonDataEl = $jsonEl.find(jsonDataSel);
        $jsonDataEl.JSONView(jsonData, {collapsed: true});

        // Behaviour
        $formEl = $jsonEl.find(formSel);
        // load the keys
        $.each(jsonData, function (key, item) {
            jsonKeys.push(key);
            if (['post', 'tag', 'author'].indexOf(key) !== -1) {
                $.each(item, function (subkey, obj) {
                   jsonKeys.push(key + '.' + subkey);
                });
            }
        });

        console.log('keys', jsonKeys);

        $formEl.on('keyup', function (e) {
            var jsonPath = $formEl.val();

            if (jsonPath === '') {
                $jsonDataEl.JSONView(jsonData, {collapsed: true});
            }

            if (jsonKeys.indexOf(jsonPath) !== -1) {
                $jsonDataEl.JSONView(jsonData[jsonPath]);
            }
        });

        $dataEl.find('a').on('click', function () {
            $jsonEl.toggle();
        });
    });
}(jQuery));


