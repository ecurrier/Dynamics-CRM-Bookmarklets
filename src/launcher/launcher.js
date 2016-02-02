(function (global) {

    var root,
        Draggable,
        template = [
            '<style>',
                '.gotdibbs-no-select {',
                    '-webkit-touch-callout: none;',
                    '-webkit-user-select: none;',
                    '-moz-user-select: none;',
                    '-ms-user-select: none;',
                    'user-select: none;',
                '}',
                '.gotdibbs-toolbox {',
                    'background: #fff;',
                    'border: 1px solid #fff;',
                    'box-shadow: 1px 1px 4px 2px rgba(0,0,0,.15);',
                    'font-family: \'Segoe UI\', Arial, sans-serif;',
                    'min-width: 15rem;',
                    'overflow: hidden;',
                    'padding: 0.5rem 1rem;',
                    'position: absolute;',
                    'transition: height 1s;',
                    'top: 1rem;',
                    'z-index: 6000;',
                '}',
                '.gotdibbs-toolbox-header {',
                    'cursor: move;',
                    'font-size: 24px;',
                    'font-weight: 300;',
                '}',
                '.gotdibbs-toolbox-close {',
                    'color: #444;',
                    'cursor: pointer;',
                    'font-size: 16px;',
                    'line-height: 16px;',
                    'position: absolute;',
                    'right: 0.25rem;',
                    'top: 0.25rem;',
                '}',
                '.gotdibbs-toolbox-item {',
                    'margin: 0.5rem 0;',
                    'padding: 0;',
                '}',
                'a.gotdibbs-toolbox-item-link {',
                    'color: #0072C6;',
                    'font-size: 14px;',
                    'font-weight: 500;',
                    'text-decoration: none;',
                    'text-transform: uppercase;',
                '}',
                '.gotdibbs-toolbox-item-link:hover {',
                    'border-bottom: 1px solid #ccc;',
                '}',
            '</style>',
            '<div class="gotdibbs-toolbox gotdibbs-no-select" data-hook="gotdibbs-toolbox">',
                '<header class="gotdibbs-toolbox-header" data-hook="gotdibbs-toolbox-collapse">GotDibbs Toolbox</header>',
                '<span data-hook="gotdibbs-toolbox-close" class="gotdibbs-toolbox-close">&#x1F5D9;</span>',
                '<ul style="font-size: 12px; list-style-type: none;">',
                    '[bookmarklet file="copy-record-id" name="Copy Record Id" description="Copies the unique identifier for the current record to your clipboard."]',
                    '[bookmarklet file="copy-record-link" name="Copy Record Link" description="Copies a link to the current record to your clipboard."]',
                    '[bookmarklet file="enable-all-fields" name="Enable All Fields" description="Enables all fields on the current form, making them editable."]',
                    '[bookmarklet file="focus-field" name="Focus Field" description="Sets focus to a specified field based on schema name."]',
                    '[bookmarklet file="open-performance-report" name="Open Performance Report" description="Displays information about load times for the current view."]',
                    '[bookmarklet file="show-all-fields" name="Show All Fields" description="Makes all fields, tabs, and sections on the form visible."]',
                    '[bookmarklet file="show-dirty-fields" name="Show Dirty Fields" description="Displays a list of all fields on the form which are currently flagged as having changed."]',
                    '[bookmarklet file="show-record-properties" name="Show Record Properties" description="Displays a summary of permissions and ownership for the current record."]',
                    '[bookmarklet file="toggle-schema-names" name="Toggle Schema Names" description="Switches between displaying the labels for all fields, and the schema names for those fields."]',
                '</ul>',
            '</div>'
        ].join('');

    Draggable = function (selector) {
        var el = document.querySelector(selector),
            isDragReady = false,
            dragoffset = {
                x: 0,
                y: 0
            };

        function _on(el, event, fn) {
            document.attachEvent ? el.attachEvent('on' + event, fn) : el.addEventListener(event, fn, !0);
        }

        this.init = function () {
            el.style.position = "absolute";
            this.initPosition();
            this.events();
        };

        this.initPosition = function () {
            el.style.top = "1rem";
            el.style.right = "1rem";
        };

        this.events = function () {
            _on(el, 'mousedown', function (e) {
                isDragReady = true;

                e.pageX = e.pageX || e.clientX + (document.documentElement.scrollLeft ?
                    document.documentElement.scrollLeft :
                    document.body.scrollLeft);
                e.pageY = e.pageY || e.clientY + (document.documentElement.scrollTop ?
                    document.documentElement.scrollTop :
                    document.body.scrollTop);

                dragoffset.x = e.pageX - el.offsetLeft;
                dragoffset.y = e.pageY - el.offsetTop;
            });

            _on(document, 'mouseup', function () {
                isDragReady = false;
            });

            _on(document, 'mousemove', function (e) {
                if (!isDragReady) {
                    return;
                }
                
                e.pageX = e.pageX || e.clientX + (document.documentElement.scrollLeft ?
                    document.documentElement.scrollLeft :
                    document.body.scrollLeft);
                e.pageY = e.pageY || e.clientY + (document.documentElement.scrollTop ?
                    document.documentElement.scrollTop :
                    document.body.scrollTop);

                el.style.top = (e.pageY - dragoffset.y) + "px";
                el.style.left = (e.pageX - dragoffset.x) + "px";
                el.style.right = null;
            });
        };

        this.init();
    }

    function destroy() {
        root.remove();
    }

    function toggle() {
        var elem = root.querySelector('[data-hook="gotdibbs-toolbox"]');

        if (elem.style.height === '') {
            elem.style.height = '2rem';
        }
        else {
            elem.style.height = null;
        }
    }

    function checkCrm() {
        if (!global.APPLICATION_VERSION) {
            alert('Could not determine the current version of CRM.');
            return false;
        }
        if (global.APPLICATION_VERSION === '5.0') {
            return true;
        }
        else if (/^[6,7,8]\.\d+$/.test(global.APPLICATION_VERSION)) {
            var $iframe = $('#crmContentPanel iframe:not([style*=\'visibility: hidden\'])');
            
            if ($iframe.length > 0 && $iframe[0].contentWindow.Xrm.Page.ui) {
                return true;
            }
            else {
                alert('[CRM 2013/2015/2016] Could not locate the entity form.');
                return false;
            }
        }
        else if (global.APPLICATION_VERSION) {
            alert('Unsupported CRM Version Detected: ' + global.APPLICATION_VERSION);
            return false;
        }
        else {
            alert('Unable to detect current CRM Version.');
            return false;
        }
    }

    function show() {
        // Prevent load outside CRM
        if (!checkCrm()) {
            return;
        }

        // Prevent multiple instances
        if (document.querySelector('[data-hook="gotdibbs-toolbox"]')) {
            return;
        }

        root = document.createElement('div');
        root.innerHTML = template;
        document.body.appendChild(root);

        new Draggable('[data-hook="gotdibbs-toolbox"]');

        root.querySelector('[data-hook="gotdibbs-toolbox-close"]').addEventListener('click', destroy);

        root.querySelector('[data-hook="gotdibbs-toolbox-collapse"]').addEventListener('dblclick', toggle);
    }

    show();

}(window));