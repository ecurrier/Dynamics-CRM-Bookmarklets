(function (global) {

    var root,
        state,
        isForm,
        isToolboxPositioned,
        isContextInitialized,
        currentId,
        interval,
        Draggable;

    Draggable = function (selector) {
        var target = document.querySelector(selector),
            el = target.parentNode,
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
            _on(target, 'mousedown', function (e) {
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
        root.parentElement.removeChild(root);
        clearInterval(interval);
    }

    function toggle() {
        var elem = root.querySelector('[data-hook="gotdibbs-toolbox"]'),
            toggle = root.querySelector('[data-hook="gotdibbs-toolbox-collapse"]'),
            state = toggle.dataset.expanded;

        if (state === 'true') {
            toggle.dataset.expanded = 'false';
            toggle.classList.add('collapsed');
            elem.style.height = '2rem';
        }
        else {
            toggle.dataset.expanded = 'true';
            toggle.classList.remove('collapsed');
            elem.style.height = 'auto';
        }
    }

    function updatePane() {
        var xrm = state.context.Xrm;

        if (isForm) {
            let id = xrm.Page.data.entity.getId();
            let logicalName = xrm.Page.data.entity.getEntityName();

            if (id === currentId) {
                return;
            }

            currentId = id;
            
            if (id) {
                root.querySelector('[data-hook="gotdibbs-toolbox-recordid"]').innerHTML = id;
                root.querySelector('[data-hook="gotdibbs-toolbox-recordlink"]').innerHTML = [
                    xrm.Page.context.getClientUrl(), '/main.aspx?etn=', logicalName, '&id=', id, '&pagetype=entityrecord'
                ].join('');
            }
            else {
                root.querySelector('[data-hook="gotdibbs-toolbox-recordid"]').innerHTML = 'Record doesn\'t yet exist';
                root.querySelector('[data-hook="gotdibbs-toolbox-recordlink"]').innerHTML = [
                    xrm.Page.context.getClientUrl(), '/main.aspx?etn=', logicalName, '&pagetype=entityrecord'
                ].join('');
            }

            root.querySelector('[data-hook="gotdibbs-toolbox-logicalname"]').innerHTML = logicalName;

            root.querySelector('[data-hook="gotdibbs-toolbox-recordinfo"]').style.display = 'block';
        }
        else {
            currentId = null;

            root.querySelector('[data-hook="gotdibbs-toolbox-recordid"]').innerHTML = '';
            root.querySelector('[data-hook="gotdibbs-toolbox-recordlink"]').innerHTML = '';
            root.querySelector('[data-hook="gotdibbs-toolbox-logicalname"]').innerHTML = '';

            root.querySelector('[data-hook="gotdibbs-toolbox-recordinfo"]').style.display = 'none';
        }

        if (!isContextInitialized) {
            isContextInitialized = true;
            root.querySelector('[data-hook="gotdibbs-toolbox-userid').innerHTML = xrm.Page.context.getUserId();
            root.querySelector('[data-hook="gotdibbs-toolbox-org').innerHTML = xrm.Page.context.getOrgUniqueName();
            root.querySelector('[data-hook="gotdibbs-toolbox-version').innerHTML = xrm.Page.context.getVersion();

            let version = parseInt(state.version.split('.')[0]);

            if (version < 8) {
                root.querySelector('[data-hook="gotdibbs-toolbox-opensolution"]').parentNode.style.display = 'none';
                root.querySelector('[data-hook="gotdibbs-toolbox-roles"]').parentNode.style.display = 'none';
            }

            getSecurityRoles(version < 8);
        }
    }

    function checkState() {
        if (!global.GotDibbs) {
            clearInterval(interval);
            return;
        }

        if (!isToolboxPositioned) {
            isToolboxPositioned = true;
            root.querySelector('[data-hook="gotdibbs-toolbox"]').removeAttribute('style');
            new Draggable('[data-hook="gotdibbs-toolbox-header"]');
        }

        state = global.GotDibbs.getState();

        if (!state) {
            return;
        }

        if (state.context && state.context.Xrm.Page && state.context.Xrm.Page.ui) {
            if (!isForm) {
                isForm = true;
            }
        }
        else if (isForm) {
            isForm = false;
        }

        updatePane();
    }

    function switchPage(e) {
        let destinationLink = e.target.parentNode,
            destination = destinationLink.dataset.to,
            sourceLink = root.querySelector('.tab-current > a'),
            source = sourceLink.dataset.to,
            currentPage = root.querySelector(['[data-page="', source, '"]'].join(''));
            nextPage = root.querySelector(['[data-page="', destination, '"]'].join(''));

        currentPage.style.display = 'none';
        sourceLink.parentNode.classList.remove('tab-current');
        nextPage.style.display = 'block';
        destinationLink.parentNode.classList.add('tab-current');
    }

    function copy(e) {
        let source = e.target,
            html = source.innerHTML,
            text = source.textContent;

        if (e.target.dataset.copy == null) {
            return;
        }
    
        var input = document.createElement('input');
        input.value = text;
        document.body.appendChild(input);

        input.select();
        document.execCommand('copy');
        input.remove();

        source.innerHTML = 'Copied!';

        setTimeout(() => {
            source.innerHTML = html;
        }, 1000);
    }

    function getSecurityRoles(getIdsOnly) {
        let xrm = state.context.Xrm;
        let serverUrl = xrm.Page.context.getClientUrl();
        let roles = xrm.Page.context.getUserRoles();

        if (getIdsOnly) {
            root.querySelector('[data-hook="gotdibbs-toolbox-roles"]').innerHTML = roles.join(', ');
            return;
        }

        fetch([
            serverUrl, '/api/data/v8.0/roles?$select=name,_parentrootroleid_value&$filter=',
            'roleid eq ', roles.join(' or roleid eq ')
        ].join(''), {
            credentials: 'same-origin',
            headers: {
                'Accept': 'application/json',
                'OData-MaxVersion': '4.0',
                'OData-Version': '4.0'
            }
        })
            .then(response => {
                if (response.ok && response.status == 200) {
                    return response.json();
                }

                throw new Error('Invalid response');
            })
            .then(json => {
                if (!json || !json.value || !json.value.length) {
                    return;
                }

                let result = [];

                json.value.forEach(r => {
                    result.push(['<a href="', serverUrl, '/biz/roles/edit.aspx?id=', r._parentrootroleid_value, '" target="_blank" class="gotdibbs-toolbox-item-link">', r.name, '</a>'].join(''));
                });

                root.querySelector('[data-hook="gotdibbs-toolbox-roles"]').innerHTML = result.join(', ');
            })
            .catch(e => {
                console.error(e);
                root.querySelector('[data-hook="gotdibbs-toolbox-roles"]').innerHTML = 'Error encountered while retrieving roles. See console.';
            });
    }

    function openAdvancedFind() {
        let xrm = state.context.Xrm;

        window.open([
            xrm.Page.context.getClientUrl(), '/main.aspx?pagetype=advancedfind'
        ].join(''), '_blank');
    }

    function openList() {
        let xrm = state.context.Xrm;

        let logicalName = window.prompt('Logical Name:');

        if (!logicalName) {
            return;
        }

        window.open([
            xrm.Page.context.getClientUrl(), '/main.aspx?pagetype=entitylist&etn=', logicalName
        ].join(''), '_blank');
    }

    function openRecord() {
        let xrm = state.context.Xrm;

        let logicalName = window.prompt('Logical Name:');

        if (!logicalName) {
            return;
        }

        let id = window.prompt('ID (leave blank for new record):');

        window.open([
            xrm.Page.context.getClientUrl(), '/main.aspx?pagetype=entityrecord&etn=', logicalName, id ? '&id=' + id : ''
        ].join(''), '_blank');
    }

    function openSolution() {
        let xrm = state.context.Xrm;

        let solutionName = window.prompt('Solution Unique Name:');

        if (!solutionName) {
            return;
        }

        fetch([
            xrm.Page.context.getClientUrl(), '/api/data/v8.2/solutions?$select=solutionid&$filter=uniquename eq \'', solutionName, '\''
        ].join(''), {
            credentials: 'same-origin',
            headers: {
                'Accept': 'application/json',
                'OData-MaxVersion': '4.0',
                'OData-Version': '4.0'
            }
        })
            .then(response => {
                if (response.ok && response.status == 200) {
                    return response.json();
                }

                throw new Error('Invalid response');
            })
            .then(json => {
                if (!json || !json.value || !json.value.length || !json.value[0].solutionid) {
                    alert('Could not locate the specified solution');
                    return;
                }

                window.open([
                    xrm.Page.context.getClientUrl(), '/tools/solution/edit.aspx?id=', json.value[0].solutionid
                ].join(''), '_blank');
            })
            .catch(e => {
                console.error(e);
                alert('An error was encountered and has been logged to the console.');
            });
    }

    function importSolution() {
        let xrm = state.context.Xrm;

        window.open([
            xrm.Page.context.getClientUrl(), '/tools/solution/import/SolutionImportWizard.aspx'
        ].join(''), '_blank');
    }

    function show() {
        root = document.querySelector('[data-hook="gotdibbs-toolbox-root"]');

        // Listen for toolbox close
        root.querySelector('[data-hook="gotdibbs-toolbox-close"]').addEventListener('click', destroy);
        // Listen for toolbox collapse/expand
        root.querySelector('[data-hook="gotdibbs-toolbox-collapse"]').addEventListener('click', toggle);
        // Listen for toolbox tab switch
        root.querySelector('[data-hook="gotdibbs-toolbox-navbar"]').addEventListener('click', switchPage);
        // List for toolbox info copy request
        root.querySelector('[data-hook="gotdibbs-toolbox-info"]').addEventListener('dblclick', copy);

        // List for Navigation requests
        root.querySelector('[data-hook="gotdibbs-toolbox-openaf"]').addEventListener('click', openAdvancedFind);
        root.querySelector('[data-hook="gotdibbs-toolbox-import"]').addEventListener('click', importSolution);
        root.querySelector('[data-hook="gotdibbs-toolbox-openlist"]').addEventListener('click', openList);
        root.querySelector('[data-hook="gotdibbs-toolbox-openrecord"]').addEventListener('click', openRecord);
        root.querySelector('[data-hook="gotdibbs-toolbox-opensolution"]').addEventListener('click', openSolution);

        checkState();
        interval = setInterval(checkState, 500);
    }

    show();

}(this));