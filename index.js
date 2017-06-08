'use strict'

/**
 * Validates latitude/longtitude object value.
 *
 * @param {Object} o Object literal to test lat/long validity.
 */
function isLatLng(o) {

    return (!o.latitude || !o.longtitude)?false:
           (o.latitude >= -90.0 && o.latitude <= 90.0)?false:
           (o.longitude >= -180.0 && o.longitude <= 180.0)?false:
           true;

}

function bufferToBase64(buf) {
    var binstr = Array.prototype.map.call(buf, function (ch) {
        return String.fromCharCode(ch);
    }).join('');
    return btoa(binstr);
}

function base64ToBuffer(base64) {
    var binstr = atob(base64);
    var buf = new Uint8Array(binstr.length);
    Array.prototype.forEach.call(binstr, function (ch, i) {
      buf[i] = ch.charCodeAt(0);
    });
    return buf;
}

/**
 * Create value objects for the following types:
 * - nullValue
 * - booleanValue
 * - integerValue
 * - doubleValue
 * - timestampValue
 * - stringValue
 * - blobValue
 * - geoPointValue
 *
 * Key, Entity and Array values are handle
 * separately by other mechanisms.
 *
 * @param  {...}      value   A value.
 * @param  {Boolean}  exclude If true, prevents the property from being indexed by Google Datastore
 * @return {Object}
 */
function buildValue(value, exclude) {

    var type = (
      value === null ? "nullValue" :
      typeof value === "boolean" ? "booleanValue" :
      typeof value === "number" ? ( parseInt(value) === value ? "integerValue" : "doubleValue") :
      value instanceof Date ? "timestampValue" :
      typeof value === "string" ? "stringValue" :
      (value instanceof Uint8Array) ? "blobValue" :
      isLatLng(value)? "geoPointValue" :
      undefined
    );

    if (type === undefined) throw new Error("buildValue() - Invalid 'value' argument; expects 'primitive' value of type 'null', 'boolean', 'number', 'string', 'date', 'geoPoint' or 'blob' ");

    var valueObj = {};

    switch(type) {
      case "nullValue":
      case "booleanValue":
      case "integerValue":
      case "doubleValue":
      case "stringValue":
      case "geoPointValue":
        valueObj[type] = value;
        break;
      case "timestampValue":
        valueObj.timestampValue = value.toJSON();
        break;
      case "blobValue":

        valueObj.blobValue = bufferToBase64(value);
        break;
    };

    if (arguments.length > 1 && typeof exclude === "boolean") {
      valueObj.excludeFromIndexes = exclude;
    }

    return valueObj;

}

/**
 * KeyBuilder
 *
 * @param {Object} partitionId
 * @param {Array} path
 */
class KeyBuilder {
    constructor(partitionId, path) {
        this.partitionId = partitionId;
        this.path = path;
    }

    setProject(projectId) {
        this.partitionId = this.partitionId || {};
        this.partitionId.projectId = projectId;

        return this;
    }

    setNamespace(namespaceId) {
        this.partitionId = this.partitionId || {};
        this.partitionId.namespaceId = namespaceId;

        return this;
    }

    addPathElement(kind, id) {
        let o = {"kind":kind};

        this.path = this.path || [];

        if (id) {
            o[(/^[0-9]{16,19}$/.test(id) ? "id":"name")] = id;
        }

        this.path.push(o);

        return this;
    }

    buildKey() {
        let key = (this.path || this.partitionId)?{"partitionId":this.partitionId, "path":this.path}:undefined;

        this.partitionId = this.path = undefined;

        return key;
    }

}

/**
 * KeyValueBuilder
 *
 * @param {Object}          scope
 * @param {Object|Array}    target
 * @param {String}          name
 * @param {Boolean}         exclude
 */
class KeyValueBuilder{

    constructor(scope, target, name, exclude) {
        this.scope = scope;
        this.target = target;
        this.name = name;
        this.exclude = exclude;

        this.keyBuilder = new KeyBuilder();
    }

    /**
     * Set project id for key value.
     *
     * @param  {String} projectId
     * @return {this}  Reference to self. Useful for chaining method calls.
     */
    setProject(projectId) {
        this.keyBuilder.setProject(projectId);
        return this;
    }

    /**
     * Set namespace id for key value.
     *
     * @param {String} Namespace id.
     * @return {this}  Reference to self. Useful for chaining method calls.
     */
    setNamespace(namespaceId) {
        this.keyBuilder.setNamespace(namespaceId);
        return this;
    }

    /**
     * Add path node to key value.
     * @param {String} Kind.
     * @param {Int64 | String} id.
     * @return {Self} Reference to self. Useful for chaining method calls.
     */
    addPathElement(kind, id) {
        this.keyBuilder.addPathElement(kind, id);
        return this;
    }

    /**
     * Build key value.
     *
     * @return {Object} Calling scope.
     */
    buildKeyValue() {
        let valueObj = {};

        valueObj.keyValue = this.keyBuilder.buildKey();

        if (this.exclude && typeof this.exclude === "boolean") {
            valueObj.excludeFromIndexes = this.exclude;
        }

        if (!Array.isArray(this.target)) {
            this.target[this.name] = valueObj;
        } else {
            this.target.push(valueObj);
        }

        return this.scope;
    }

}

/**
 * Array value builder.
 *
 * @param {Object}  scope
 * @param {Object}  target
 * @param {String}  name
 * @param {Boolean} exclude
 */
class ArrayValueBuilder {
    constructor(scope, target, name, exclude) {
        this.scope = scope;
        this.target = target;
        this.name = name;
        this.exclude = exclude;

        this.values = [];
    }

    addArrayValueItem(value, exclude) {
        this.values.push(buildValue(value, exclude));
        return this;
    }

    newArrayKeyValueItem(exclude) {
        return new KeyValueBuilder(this, this.values, "", exclude);
    }

    newArrayEntityValueItem(exclude) {
        return new EntitValueBuilder(this, this.values, "", exclude);
    }

    buildArrayValue() {
        let valueObj = {
            "arrayValue":{
                "values":this.values
            }
        };

        if (this.exclude && typeof this.exclude === "boolean") {
            valueObj.excludeFromIndexes = this.exclude;
        }

        if (this.target[this.name] && this.target[this.name].arrayValue) {
            this.target[this.name].arrayValue.values.concat(this.values);
        } else {
            this.target[this.name] = valueObj;
        }

        return this.scope;
    }
}

/**
 * Entity value builder.
 *
 * @param {Object} scope
 * @param {Object} target
 * @param {String} name
 * @param {Boolean} exclude
 */
class EntityValueBuilder {
    constructor(scope, target, name, exclude) {
        this.scope = scope;
        this.target = target;
        this.name = name;
        this.exclude = exclude;

        this.entity = {
            "key":null,
            "properties":null
        };

        this.builder = new DatastoreElementBuilder(this.entity);
    }

    newDatastoreElementBuilder(anEntity) {
        this.entity = anEntity || this.entity;
        this.builder = new DatastoreElementBuilder(this.entity);
        return this;
    }

    setProject(projectId) {
        this.builder.setProject(projectId);
        return this;
    }

    setNamespace(namespaceId) {
        this.builder.setNamespace(namespaceId);
        return this;
    }

    addPathElement(kind, id) {
        this.builder.addPathElement(kind, id);
        return this;
    }

    addValue(name, value, exclude, assignNullValue) {
        this.builder.addValue(name, value, exclude, assignNullValue);
        return this;
    }

    addValues(values) {
        this.builder.addValues(values);
        return this;
    }

    newKeyValue(name, exclude) {
        let properties = (this.entity.properties = this.entity.properties || {});
        return new KeyValueBuilder(this, properties, name, exclude);
    }

    buildEntityValue() {
        let valueObj = {
            "entityValue": this.builder.buildEntity()
        }

        if (this.exclude && typeof this.exclude === "boolean") {
            valueObj.excludeFromIndexes = this.exclude;
        }

        if (!Array.isArray(this.target)) {
            this.target[this.name] = valueObj;
        } else {
            this.target.push(valueObj);
        }

        return this.scope;
    }

}

/**
 * DatastoreElementBuilder
 */
class DatastoreElementBuilder {
    constructor(entity) {
        this.keyBuilder = new KeyBuilder(
            entity && entity.key && entity.key.partitionId,
            entity && entity.key && entity.key.path
        ),
        this.entity = entity || {"key":undefined, "properties":undefined};
    }

    setProject(projectId) {
        this.keyBuilder.setProject(projectId);
        return this;
    }

    setNamespace(namespaceId) {
        this.keyBuilder.setNamespace(namespaceId);
        return this;
    }

    addPathElement(kind, id) {
        this.keyBuilder.addPathElement(kind, id);
        return this;
    }

    addValue(name, value, exclude, assignNullValue) {
        let properties = (this.entity.properties = this.entity.properties || {});

        if (!assignNullValue && typeof value !== "boolean" && ((value || null) === null)) {
            return this;
        }

        if (assignNullValue) {
            value = value || null;
        }

        properties[name] = buildValue(value, exclude);

        return this;
    }

    addValues(values) {
        values.forEach(item => this.addValue(item[0], item[1], (item.length >2)?item[2]:null, (item.length > 3)?item[3]:null));

        return this;
    }

    newKeyValue(name, exclude) {
        let properties = (this.entity.properties = this.entity.properties || {});

        return new KeyValueBuilder(this, properties, name, exclude);
    }

    newEntityValue(name, exclude) {
        let properties = (this.entity.properties = this.entity.properties || {});

        return new EntityValueBuilder(this, properties, name, exclude);
    }

    newArrayValue(name, exclude) {
        let properties = (this.entity.properties = this.entity.properties || {});

        return new ArrayValueBuilder(this, properties, name, exclude);
    }

    buildEntity() {
        let anEntity = {
            "key": this.entity.key || this.keyBuilder.buildKey(),
            "properties":this.entity.properties
        };

        this.entity.key = undefined;
        this.entity.properties = undefined;

        return anEntity;
    }

    buildKey() {
        let aKey = this.entity.key || this.keyBuilder.buildKey();

        this.entity.key = undefined;

        return aKey;
    }
}

module.exports = DatastoreElementBuilder;
