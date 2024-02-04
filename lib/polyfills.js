// Polyfills for ES5 browser support

if (!Object.entries) {
  Object.entries = function (obj) {
    if (obj == null) {
      throw new TypeError('Object.entries called on null or undefined');
    }

    var entries = [];
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        entries.push([key, obj[key]]);
      }
    }

    return entries;
  };
}

if (typeof Object.assign !== 'function') {
  Object.assign = function (target) {
    if (target == null) {
      throw new TypeError('Cannot convert undefined or null to object');
    }

    target = Object(target);

    for (var index = 1; index < arguments.length; index++) {
      var source = arguments[index];

      if (source != null) {
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
    }

    return target;
  };
}

if (!Array.prototype.find) {
  Object.defineProperty(Array.prototype, 'find', {
    value: function (predicate, thisArg) {
      if (this == null) {
        throw new TypeError('Array.prototype.find called on null or undefined');
      }

      if (typeof predicate !== 'function') {
        throw new TypeError('predicate must be a function');
      }

      var array = Object(this);
      var length = array.length >>> 0;

      for (var i = 0; i < length; i++) {
        var value = array[i];
        if (predicate.call(thisArg, value, i, array)) {
          return value;
        }
      }

      return undefined;
    },
    configurable: true,
    writable: true
  });
}

if (!Object.getOwnPropertyDescriptors) {
  Object.defineProperty(Object, 'getOwnPropertyDescriptors', {
    value: function(obj) {
      var descriptors = {};

      for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          descriptors[key] = Object.getOwnPropertyDescriptor(obj, key);
        }
      }

      return descriptors;
    },
    configurable: true,
    writable: true
  });
}
