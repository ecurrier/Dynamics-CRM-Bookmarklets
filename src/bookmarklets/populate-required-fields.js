formContext.Xrm.Page.ui.controls.forEach(function(c, i) {
    try {
        var attribute = c.getAttribute();

        var requiredLevel = attribute.getRequiredLevel();
        if (requiredLevel !== 'required') {
            return;
        }

        var value = attribute.getValue();
        if (value != null) {
            return;
        }

        var attributeType = attribute.getAttributeType();
        switch (attributeType) {
            case 'boolean':
                attribute.setValue(generateRandomBoolean());
                attribute.fireOnChange();
                break;
            case 'datetime':
                attribute.setValue(generateRandomDate());
                attribute.fireOnChange();
                break;
            case 'decimal':
            case 'double':
                attribute.setValue(generateRandomNumber(1, 100) * 10);
                attribute.fireOnChange();
                break;
            case 'integer':
                attribute.setValue(generateRandomNumber(1, 100));
                attribute.fireOnChange();
                break;
            case 'lookup':
                setLookupField(c, attribute);
                break;
            case 'memo':
            case 'string':
                //setStringField(c);
                break;
            case 'money':
                attribute.setValue(generateRandomNumber(10, 1000) * 100);
                attribute.fireOnChange();
                break;
            case 'multioptionset':
                // Retrieve a random amount of random options from list of available options
                break;
            case 'optionset':
                setOptionsetField(attribute);
                break;
            default:
                return;
        }
    }
    catch (error) {
        console.error(error);
    }
});

function generateRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

function determineFieldName(logicalName) {
    var underscoreIndex = logicalName.indexOf('_');
    if (underscoreIndex === -1) {
        return 'name';
    }

    return [logicalName.substring(0, underscoreIndex), '_name'].join('');
}

function generateRandomBoolean() {
    return !!generateRandomNumber(0, 1);
}

function generateRandomDate() {
    var dayOffset = generateRandomNumber(-30, 30);

    var date = new Date();
    date.setDate(date.getDate() + dayOffset);

    return date;
}

function setLookupField(c, attribute) {
    var defaultViewId = c.getDefaultView();
    if (defaultViewId === null || defaultViewId === '') {
        return;
    }
    
    Xrm.WebApi.retrieveRecord('savedquery', defaultViewId, '?$select=returnedtypecode')
        .then(function(result) {
            var logicalName = result.returnedtypecode;
            var idField = [logicalName, 'id'].join('');
            var nameField = determineFieldName(logicalName);

            Xrm.WebApi.retrieveMultipleRecords(logicalName, ['?$filter=statecode eq 0&$orderby=modifiedon&$select=', idField, ',', nameField].join(''), 10)
                .then(function(result) {
                    var rand = generateRandomNumber(0, result.entities.length - 1);
                    var entity = result.entities[rand];
                    attribute.setValue(
                        [ 
                            {
                                id: entity[idField],
                                name: entity[nameField],
                                entityType: logicalName
                            }
                        ]
                    );
                    attribute.fireOnChange();
                },
                function(error) {
                    console.error(error);
                });
        },
        function(error) {
            console.error(error);
        });
}

function setStringField(c) {
    var logicalName = formContext.Xrm.Page.data.entity.getEntityName();
    var schemaName = c.getName();

    if (schemaName.indexOf('name') > -1) {
        switch (logicalName) {
            case 'account':
                httpRequest(c, 'company.companyName');
                break;
        }
    }
}

function httpRequest(c, property) {
    var request = new XMLHttpRequest();
    request.open('GET', ['//faker.hook.io?property=', property, '&locale=en_US'].join(''), false);

    request.onreadystatechange = function () {
        if (this.readyState == 4) {
            request.onreadystatechange = null;

            if (this.status == 200) {
                result = this.response
                c.getAttribute().setValue(result);
            }
            else {
                console.error(this.response);
            }
        }
    };

    request.send();
}

function setOptionsetField(attribute) {
    var options = attribute.getOptions();
    var rand = generateRandomNumber(0, options.length - 1);

    attribute.setValue(options[rand].value);
    attribute.fireOnChange();
}