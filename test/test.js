'use strict';

var expect = require('chai').expect;
var DatastoreElementBuilder = require('../index');

describe('#datastoreElementBuilder', function() {

    it('should create a key of kind contact', function() {
        var result = new DatastoreElementBuilder()
                    .setProject("deason-garner-datastore")
                    .setNamespace("entity-component")
                    .addPathElement("root", "contacts")
                    .addPathElement("contact", "4503741361291264")
                    .buildKey();
        expect(JSON.stringify(result)).to.equal(JSON.stringify({
            "partitionId":{
                "projectId":"deason-garner-datastore",
                "namespaceId":"entity-component"
            },
            "path":[
                {"kind":"root", "name":"contacts"},
                {"kind":"contact", "id":"4503741361291264"}
            ]
        }));
    });

    it('should create an Entity with a string value', function() {
        var result = new DatastoreElementBuilder()
                    .setProject("deason-garner-datastore")
                    .setNamespace("entity-component")
                    .addPathElement("root", "contacts")
                    .addPathElement("contact", "4503741361291264")

                    .addValue("stringProp", "a String")
                    .buildEntity();

        expect(JSON.stringify(result)).to.equal(JSON.stringify({
            "key":{
                "partitionId":{
                    "projectId":"deason-garner-datastore",
                    "namespaceId":"entity-component"
                },
                "path":[
                    {"kind":"root", "name":"contacts"},
                    {"kind":"contact", "id":"4503741361291264"}
                ]
            },
            "properties":{
                "stringProp":{
                    "stringValue":"a String"
                }
            }
        }));
    });

    it('should create an Entity with an integer value', function() {
        var result = new DatastoreElementBuilder()
                    .setProject("deason-garner-datastore")
                    .setNamespace("entity-component")
                    .addPathElement("root", "contacts")
                    .addPathElement("contact", "4503741361291264")

                    .addValue("integerProp", 50)
                    .buildEntity();

        expect(JSON.stringify(result)).to.equal(JSON.stringify({
            "key":{
                "partitionId":{
                    "projectId":"deason-garner-datastore",
                    "namespaceId":"entity-component"
                },
                "path":[
                    {"kind":"root", "name":"contacts"},
                    {"kind":"contact", "id":"4503741361291264"}
                ]
            },
            "properties":{
                "integerProp":{
                    "integerValue":50
                }
            }
        }));

    });

    it('should create an Entity with a double value', function() {
        var result = new DatastoreElementBuilder()
                    .setProject("deason-garner-datastore")
                    .setNamespace("entity-component")
                    .addPathElement("root", "contacts")
                    .addPathElement("contact", "4503741361291264")

                    .addValue("doubleProp", 56.12)
                    .buildEntity();

        expect(JSON.stringify(result)).to.equal(JSON.stringify({
            "key":{
                "partitionId":{
                    "projectId":"deason-garner-datastore",
                    "namespaceId":"entity-component"
                },
                "path":[
                    {"kind":"root", "name":"contacts"},
                    {"kind":"contact", "id":"4503741361291264"}
                ]
            },
            "properties":{
                "doubleProp":{
                    "doubleValue":56.12
                }
            }
        }));

    });

    it('should create an Entity with boolean value TRUE', function() {
        var result = new DatastoreElementBuilder()
                    .setProject("deason-garner-datastore")
                    .setNamespace("entity-component")
                    .addPathElement("root", "contacts")
                    .addPathElement("contact", "4503741361291264")

                    .addValue("booleanProp", true)
                    .buildEntity();

        expect(JSON.stringify(result)).to.equal(JSON.stringify({
            "key":{
                "partitionId":{
                    "projectId":"deason-garner-datastore",
                    "namespaceId":"entity-component"
                },
                "path":[
                    {"kind":"root", "name":"contacts"},
                    {"kind":"contact", "id":"4503741361291264"}
                ]
            },
            "properties":{
                "booleanProp":{
                    "booleanValue":true
                }
            }
        }));

    });

    it('should create an Entity with boolean value FALSE', function() {
        var result = new DatastoreElementBuilder()
                    .setProject("deason-garner-datastore")
                    .setNamespace("entity-component")
                    .addPathElement("root", "contacts")
                    .addPathElement("contact", "4503741361291264")

                    .addValue("booleanProp", false)
                    .buildEntity();

        expect(JSON.stringify(result)).to.equal(JSON.stringify({
            "key":{
                "partitionId":{
                    "projectId":"deason-garner-datastore",
                    "namespaceId":"entity-component"
                },
                "path":[
                    {"kind":"root", "name":"contacts"},
                    {"kind":"contact", "id":"4503741361291264"}
                ]
            },
            "properties":{
                "booleanProp":{
                    "booleanValue":false
                }
            }
        }));

    });

    it('should create an Entity with a NULL value', function() {
        var result = new DatastoreElementBuilder()
                    .setProject("deason-garner-datastore")
                    .setNamespace("entity-component")
                    .addPathElement("root", "contacts")
                    .addPathElement("contact", "4503741361291264")

                    .addValue("nullProp", null, true, true)
                    .buildEntity();

        expect(JSON.stringify(result)).to.equal(JSON.stringify({
            "key":{
                "partitionId":{
                    "projectId":"deason-garner-datastore",
                    "namespaceId":"entity-component"
                },
                "path":[
                    {"kind":"root", "name":"contacts"},
                    {"kind":"contact", "id":"4503741361291264"}
                ]
            },
            "properties":{
                "nullProp":{
                    "nullValue":null,
                    "excludeFromIndexes":true
                },
            }
        }));

    });

    it('should create an Entity with a key value', function() {
        var result = new DatastoreElementBuilder()
                    .setProject("deason-garner-datastore")
                    .setNamespace("entity-component")
                    .addPathElement("root", "contacts")
                    .addPathElement("contact", "4503741361291264")

                    .newKeyValue("keyProp")
                        .setProject("deason-garner-datastore")
                        .setNamespace("entity-component")
                        .addPathElement("root", "addresses")
                        .addPathElement("address", "4503655461945344")
                        .buildKeyValue()

                    .buildEntity();

        expect(JSON.stringify(result)).to.equal(JSON.stringify({
            "key":{
                "partitionId":{
                    "projectId":"deason-garner-datastore",
                    "namespaceId":"entity-component"
                },
                "path":[
                    {"kind":"root", "name":"contacts"},
                    {"kind":"contact", "id":"4503741361291264"}
                ]
            },
            "properties":{
                "keyProp":{
                    "keyValue":{
                        "partitionId":{
                            "projectId":"deason-garner-datastore",
                            "namespaceId":"entity-component"
                        },
                        "path":[
                            {"kind":"root", "name":"addresses"},
                            {"kind":"address", "id":"4503655461945344"}
                        ]
                    }
                }
            }
        }));

    });
});
