(function ($) {
    var devBarSel   = '.dev-bar',
        contextSel  = '.context',
        dataSel     = '.data',
        jsonSel     = '.json',
        formSel     = '.json-path',
        jsonDataSel     = '.json-data',
        devBarHTML  = '<strong>Dev Bar:</strong> ' +
            '| Context: <span class="context"></span> ' +
            '| Data: <span class="data"><a>{...}</a><span class="json"></span></span>',
        formHTML    = '<input class="json-path" type="text"><span class="json-data"></span>';


    $(document).ready(function () {
        var $el = $(devBarSel),
            jsonData = $.parseJSON(decodeURIComponent($el.data('json'))),
            $contextEl,
            $dataEl,
            $jsonEl;


        $el.append(devBarHTML);

        $contextEl = $el.find(contextSel);
        $dataEl = $el.find(dataSel);
        $jsonEl = $dataEl.find(jsonSel);

        // Style
        $('body').css('margin-top', '36px');

        $el.css({
            'background': '#000',
            'color': '#fff',
            'position': 'absolute',
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
            'width': '100%'

        });

        // More Content
        $contextEl.append('[');

        $.each(jsonData._locals.context, function (i, context) {
            $contextEl.append(context);
            if (jsonData._locals.context.length > i + 1) {
                $el.find(contextSel).append(', ');
            }
        });

        $contextEl.append(']');

        $jsonEl.append(formHTML);
        $jsonEl.find(jsonDataSel).append(JSON.stringify(jsonData));

        // Behaviour
        $jsonEl.find(formSel).on('keypress', function () {

        });

        $dataEl.find('a').on('click', function () {
            $jsonEl.toggle();
        });
    });
}(jQuery));


