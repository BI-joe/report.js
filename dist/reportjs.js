(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canMutationObserver = typeof window !== 'undefined'
    && window.MutationObserver;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    var queue = [];

    if (canMutationObserver) {
        var hiddenDiv = document.createElement("div");
        var observer = new MutationObserver(function () {
            var queueList = queue.slice();
            queue.length = 0;
            queueList.forEach(function (fn) {
                fn();
            });
        });

        observer.observe(hiddenDiv, { attributes: true });

        return function nextTick(fn) {
            if (!queue.length) {
                hiddenDiv.setAttribute('yes', 'no');
            }
            queue.push(fn);
        };
    }

    if (canPost) {
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],2:[function(require,module,exports){
(function (process,global){
(function(global) {
  'use strict';
  if (global.$traceurRuntime) {
    return;
  }
  var $Object = Object;
  var $TypeError = TypeError;
  var $create = $Object.create;
  var $defineProperties = $Object.defineProperties;
  var $defineProperty = $Object.defineProperty;
  var $freeze = $Object.freeze;
  var $getOwnPropertyDescriptor = $Object.getOwnPropertyDescriptor;
  var $getOwnPropertyNames = $Object.getOwnPropertyNames;
  var $keys = $Object.keys;
  var $hasOwnProperty = $Object.prototype.hasOwnProperty;
  var $toString = $Object.prototype.toString;
  var $preventExtensions = Object.preventExtensions;
  var $seal = Object.seal;
  var $isExtensible = Object.isExtensible;
  function nonEnum(value) {
    return {
      configurable: true,
      enumerable: false,
      value: value,
      writable: true
    };
  }
  var types = {
    void: function voidType() {},
    any: function any() {},
    string: function string() {},
    number: function number() {},
    boolean: function boolean() {}
  };
  var method = nonEnum;
  var counter = 0;
  function newUniqueString() {
    return '__$' + Math.floor(Math.random() * 1e9) + '$' + ++counter + '$__';
  }
  var symbolInternalProperty = newUniqueString();
  var symbolDescriptionProperty = newUniqueString();
  var symbolDataProperty = newUniqueString();
  var symbolValues = $create(null);
  var privateNames = $create(null);
  function isPrivateName(s) {
    return privateNames[s];
  }
  function createPrivateName() {
    var s = newUniqueString();
    privateNames[s] = true;
    return s;
  }
  function isShimSymbol(symbol) {
    return typeof symbol === 'object' && symbol instanceof SymbolValue;
  }
  function typeOf(v) {
    if (isShimSymbol(v))
      return 'symbol';
    return typeof v;
  }
  function Symbol(description) {
    var value = new SymbolValue(description);
    if (!(this instanceof Symbol))
      return value;
    throw new TypeError('Symbol cannot be new\'ed');
  }
  $defineProperty(Symbol.prototype, 'constructor', nonEnum(Symbol));
  $defineProperty(Symbol.prototype, 'toString', method(function() {
    var symbolValue = this[symbolDataProperty];
    if (!getOption('symbols'))
      return symbolValue[symbolInternalProperty];
    if (!symbolValue)
      throw TypeError('Conversion from symbol to string');
    var desc = symbolValue[symbolDescriptionProperty];
    if (desc === undefined)
      desc = '';
    return 'Symbol(' + desc + ')';
  }));
  $defineProperty(Symbol.prototype, 'valueOf', method(function() {
    var symbolValue = this[symbolDataProperty];
    if (!symbolValue)
      throw TypeError('Conversion from symbol to string');
    if (!getOption('symbols'))
      return symbolValue[symbolInternalProperty];
    return symbolValue;
  }));
  function SymbolValue(description) {
    var key = newUniqueString();
    $defineProperty(this, symbolDataProperty, {value: this});
    $defineProperty(this, symbolInternalProperty, {value: key});
    $defineProperty(this, symbolDescriptionProperty, {value: description});
    freeze(this);
    symbolValues[key] = this;
  }
  $defineProperty(SymbolValue.prototype, 'constructor', nonEnum(Symbol));
  $defineProperty(SymbolValue.prototype, 'toString', {
    value: Symbol.prototype.toString,
    enumerable: false
  });
  $defineProperty(SymbolValue.prototype, 'valueOf', {
    value: Symbol.prototype.valueOf,
    enumerable: false
  });
  var hashProperty = createPrivateName();
  var hashPropertyDescriptor = {value: undefined};
  var hashObjectProperties = {
    hash: {value: undefined},
    self: {value: undefined}
  };
  var hashCounter = 0;
  function getOwnHashObject(object) {
    var hashObject = object[hashProperty];
    if (hashObject && hashObject.self === object)
      return hashObject;
    if ($isExtensible(object)) {
      hashObjectProperties.hash.value = hashCounter++;
      hashObjectProperties.self.value = object;
      hashPropertyDescriptor.value = $create(null, hashObjectProperties);
      $defineProperty(object, hashProperty, hashPropertyDescriptor);
      return hashPropertyDescriptor.value;
    }
    return undefined;
  }
  function freeze(object) {
    getOwnHashObject(object);
    return $freeze.apply(this, arguments);
  }
  function preventExtensions(object) {
    getOwnHashObject(object);
    return $preventExtensions.apply(this, arguments);
  }
  function seal(object) {
    getOwnHashObject(object);
    return $seal.apply(this, arguments);
  }
  freeze(SymbolValue.prototype);
  function isSymbolString(s) {
    return symbolValues[s] || privateNames[s];
  }
  function toProperty(name) {
    if (isShimSymbol(name))
      return name[symbolInternalProperty];
    return name;
  }
  function removeSymbolKeys(array) {
    var rv = [];
    for (var i = 0; i < array.length; i++) {
      if (!isSymbolString(array[i])) {
        rv.push(array[i]);
      }
    }
    return rv;
  }
  function getOwnPropertyNames(object) {
    return removeSymbolKeys($getOwnPropertyNames(object));
  }
  function keys(object) {
    return removeSymbolKeys($keys(object));
  }
  function getOwnPropertySymbols(object) {
    var rv = [];
    var names = $getOwnPropertyNames(object);
    for (var i = 0; i < names.length; i++) {
      var symbol = symbolValues[names[i]];
      if (symbol) {
        rv.push(symbol);
      }
    }
    return rv;
  }
  function getOwnPropertyDescriptor(object, name) {
    return $getOwnPropertyDescriptor(object, toProperty(name));
  }
  function hasOwnProperty(name) {
    return $hasOwnProperty.call(this, toProperty(name));
  }
  function getOption(name) {
    return global.traceur && global.traceur.options[name];
  }
  function defineProperty(object, name, descriptor) {
    if (isShimSymbol(name)) {
      name = name[symbolInternalProperty];
    }
    $defineProperty(object, name, descriptor);
    return object;
  }
  function polyfillObject(Object) {
    $defineProperty(Object, 'defineProperty', {value: defineProperty});
    $defineProperty(Object, 'getOwnPropertyNames', {value: getOwnPropertyNames});
    $defineProperty(Object, 'getOwnPropertyDescriptor', {value: getOwnPropertyDescriptor});
    $defineProperty(Object.prototype, 'hasOwnProperty', {value: hasOwnProperty});
    $defineProperty(Object, 'freeze', {value: freeze});
    $defineProperty(Object, 'preventExtensions', {value: preventExtensions});
    $defineProperty(Object, 'seal', {value: seal});
    $defineProperty(Object, 'keys', {value: keys});
  }
  function exportStar(object) {
    for (var i = 1; i < arguments.length; i++) {
      var names = $getOwnPropertyNames(arguments[i]);
      for (var j = 0; j < names.length; j++) {
        var name = names[j];
        if (isSymbolString(name))
          continue;
        (function(mod, name) {
          $defineProperty(object, name, {
            get: function() {
              return mod[name];
            },
            enumerable: true
          });
        })(arguments[i], names[j]);
      }
    }
    return object;
  }
  function isObject(x) {
    return x != null && (typeof x === 'object' || typeof x === 'function');
  }
  function toObject(x) {
    if (x == null)
      throw $TypeError();
    return $Object(x);
  }
  function checkObjectCoercible(argument) {
    if (argument == null) {
      throw new TypeError('Value cannot be converted to an Object');
    }
    return argument;
  }
  function polyfillSymbol(global, Symbol) {
    if (!global.Symbol) {
      global.Symbol = Symbol;
      Object.getOwnPropertySymbols = getOwnPropertySymbols;
    }
    if (!global.Symbol.iterator) {
      global.Symbol.iterator = Symbol('Symbol.iterator');
    }
  }
  function setupGlobals(global) {
    polyfillSymbol(global, Symbol);
    global.Reflect = global.Reflect || {};
    global.Reflect.global = global.Reflect.global || global;
    polyfillObject(global.Object);
  }
  setupGlobals(global);
  global.$traceurRuntime = {
    checkObjectCoercible: checkObjectCoercible,
    createPrivateName: createPrivateName,
    defineProperties: $defineProperties,
    defineProperty: $defineProperty,
    exportStar: exportStar,
    getOwnHashObject: getOwnHashObject,
    getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
    getOwnPropertyNames: $getOwnPropertyNames,
    isObject: isObject,
    isPrivateName: isPrivateName,
    isSymbolString: isSymbolString,
    keys: $keys,
    setupGlobals: setupGlobals,
    toObject: toObject,
    toProperty: toProperty,
    type: types,
    typeof: typeOf
  };
})(typeof global !== 'undefined' ? global : this);
(function() {
  'use strict';
  function spread() {
    var rv = [],
        j = 0,
        iterResult;
    for (var i = 0; i < arguments.length; i++) {
      var valueToSpread = $traceurRuntime.checkObjectCoercible(arguments[i]);
      if (typeof valueToSpread[$traceurRuntime.toProperty(Symbol.iterator)] !== 'function') {
        throw new TypeError('Cannot spread non-iterable object.');
      }
      var iter = valueToSpread[$traceurRuntime.toProperty(Symbol.iterator)]();
      while (!(iterResult = iter.next()).done) {
        rv[j++] = iterResult.value;
      }
    }
    return rv;
  }
  $traceurRuntime.spread = spread;
})();
(function() {
  'use strict';
  var $Object = Object;
  var $TypeError = TypeError;
  var $create = $Object.create;
  var $defineProperties = $traceurRuntime.defineProperties;
  var $defineProperty = $traceurRuntime.defineProperty;
  var $getOwnPropertyDescriptor = $traceurRuntime.getOwnPropertyDescriptor;
  var $getOwnPropertyNames = $traceurRuntime.getOwnPropertyNames;
  var $getPrototypeOf = Object.getPrototypeOf;
  var $__0 = Object,
      getOwnPropertyNames = $__0.getOwnPropertyNames,
      getOwnPropertySymbols = $__0.getOwnPropertySymbols;
  function superDescriptor(homeObject, name) {
    var proto = $getPrototypeOf(homeObject);
    do {
      var result = $getOwnPropertyDescriptor(proto, name);
      if (result)
        return result;
      proto = $getPrototypeOf(proto);
    } while (proto);
    return undefined;
  }
  function superCall(self, homeObject, name, args) {
    return superGet(self, homeObject, name).apply(self, args);
  }
  function superGet(self, homeObject, name) {
    var descriptor = superDescriptor(homeObject, name);
    if (descriptor) {
      if (!descriptor.get)
        return descriptor.value;
      return descriptor.get.call(self);
    }
    return undefined;
  }
  function superSet(self, homeObject, name, value) {
    var descriptor = superDescriptor(homeObject, name);
    if (descriptor && descriptor.set) {
      descriptor.set.call(self, value);
      return value;
    }
    throw $TypeError(("super has no setter '" + name + "'."));
  }
  function getDescriptors(object) {
    var descriptors = {};
    var names = getOwnPropertyNames(object);
    for (var i = 0; i < names.length; i++) {
      var name = names[i];
      descriptors[name] = $getOwnPropertyDescriptor(object, name);
    }
    var symbols = getOwnPropertySymbols(object);
    for (var i = 0; i < symbols.length; i++) {
      var symbol = symbols[i];
      descriptors[$traceurRuntime.toProperty(symbol)] = $getOwnPropertyDescriptor(object, $traceurRuntime.toProperty(symbol));
    }
    return descriptors;
  }
  function createClass(ctor, object, staticObject, superClass) {
    $defineProperty(object, 'constructor', {
      value: ctor,
      configurable: true,
      enumerable: false,
      writable: true
    });
    if (arguments.length > 3) {
      if (typeof superClass === 'function')
        ctor.__proto__ = superClass;
      ctor.prototype = $create(getProtoParent(superClass), getDescriptors(object));
    } else {
      ctor.prototype = object;
    }
    $defineProperty(ctor, 'prototype', {
      configurable: false,
      writable: false
    });
    return $defineProperties(ctor, getDescriptors(staticObject));
  }
  function getProtoParent(superClass) {
    if (typeof superClass === 'function') {
      var prototype = superClass.prototype;
      if ($Object(prototype) === prototype || prototype === null)
        return superClass.prototype;
      throw new $TypeError('super prototype must be an Object or null');
    }
    if (superClass === null)
      return null;
    throw new $TypeError(("Super expression must either be null or a function, not " + typeof superClass + "."));
  }
  function defaultSuperCall(self, homeObject, args) {
    if ($getPrototypeOf(homeObject) !== null)
      superCall(self, homeObject, 'constructor', args);
  }
  $traceurRuntime.createClass = createClass;
  $traceurRuntime.defaultSuperCall = defaultSuperCall;
  $traceurRuntime.superCall = superCall;
  $traceurRuntime.superGet = superGet;
  $traceurRuntime.superSet = superSet;
})();
(function() {
  'use strict';
  var createPrivateName = $traceurRuntime.createPrivateName;
  var $defineProperties = $traceurRuntime.defineProperties;
  var $defineProperty = $traceurRuntime.defineProperty;
  var $create = Object.create;
  var $TypeError = TypeError;
  function nonEnum(value) {
    return {
      configurable: true,
      enumerable: false,
      value: value,
      writable: true
    };
  }
  var ST_NEWBORN = 0;
  var ST_EXECUTING = 1;
  var ST_SUSPENDED = 2;
  var ST_CLOSED = 3;
  var END_STATE = -2;
  var RETHROW_STATE = -3;
  function getInternalError(state) {
    return new Error('Traceur compiler bug: invalid state in state machine: ' + state);
  }
  function GeneratorContext() {
    this.state = 0;
    this.GState = ST_NEWBORN;
    this.storedException = undefined;
    this.finallyFallThrough = undefined;
    this.sent_ = undefined;
    this.returnValue = undefined;
    this.tryStack_ = [];
  }
  GeneratorContext.prototype = {
    pushTry: function(catchState, finallyState) {
      if (finallyState !== null) {
        var finallyFallThrough = null;
        for (var i = this.tryStack_.length - 1; i >= 0; i--) {
          if (this.tryStack_[i].catch !== undefined) {
            finallyFallThrough = this.tryStack_[i].catch;
            break;
          }
        }
        if (finallyFallThrough === null)
          finallyFallThrough = RETHROW_STATE;
        this.tryStack_.push({
          finally: finallyState,
          finallyFallThrough: finallyFallThrough
        });
      }
      if (catchState !== null) {
        this.tryStack_.push({catch: catchState});
      }
    },
    popTry: function() {
      this.tryStack_.pop();
    },
    get sent() {
      this.maybeThrow();
      return this.sent_;
    },
    set sent(v) {
      this.sent_ = v;
    },
    get sentIgnoreThrow() {
      return this.sent_;
    },
    maybeThrow: function() {
      if (this.action === 'throw') {
        this.action = 'next';
        throw this.sent_;
      }
    },
    end: function() {
      switch (this.state) {
        case END_STATE:
          return this;
        case RETHROW_STATE:
          throw this.storedException;
        default:
          throw getInternalError(this.state);
      }
    },
    handleException: function(ex) {
      this.GState = ST_CLOSED;
      this.state = END_STATE;
      throw ex;
    }
  };
  function nextOrThrow(ctx, moveNext, action, x) {
    switch (ctx.GState) {
      case ST_EXECUTING:
        throw new Error(("\"" + action + "\" on executing generator"));
      case ST_CLOSED:
        if (action == 'next') {
          return {
            value: undefined,
            done: true
          };
        }
        throw x;
      case ST_NEWBORN:
        if (action === 'throw') {
          ctx.GState = ST_CLOSED;
          throw x;
        }
        if (x !== undefined)
          throw $TypeError('Sent value to newborn generator');
      case ST_SUSPENDED:
        ctx.GState = ST_EXECUTING;
        ctx.action = action;
        ctx.sent = x;
        var value = moveNext(ctx);
        var done = value === ctx;
        if (done)
          value = ctx.returnValue;
        ctx.GState = done ? ST_CLOSED : ST_SUSPENDED;
        return {
          value: value,
          done: done
        };
    }
  }
  var ctxName = createPrivateName();
  var moveNextName = createPrivateName();
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}
  GeneratorFunction.prototype = GeneratorFunctionPrototype;
  $defineProperty(GeneratorFunctionPrototype, 'constructor', nonEnum(GeneratorFunction));
  GeneratorFunctionPrototype.prototype = {
    constructor: GeneratorFunctionPrototype,
    next: function(v) {
      return nextOrThrow(this[ctxName], this[moveNextName], 'next', v);
    },
    throw: function(v) {
      return nextOrThrow(this[ctxName], this[moveNextName], 'throw', v);
    }
  };
  $defineProperties(GeneratorFunctionPrototype.prototype, {
    constructor: {enumerable: false},
    next: {enumerable: false},
    throw: {enumerable: false}
  });
  Object.defineProperty(GeneratorFunctionPrototype.prototype, Symbol.iterator, nonEnum(function() {
    return this;
  }));
  function createGeneratorInstance(innerFunction, functionObject, self) {
    var moveNext = getMoveNext(innerFunction, self);
    var ctx = new GeneratorContext();
    var object = $create(functionObject.prototype);
    object[ctxName] = ctx;
    object[moveNextName] = moveNext;
    return object;
  }
  function initGeneratorFunction(functionObject) {
    functionObject.prototype = $create(GeneratorFunctionPrototype.prototype);
    functionObject.__proto__ = GeneratorFunctionPrototype;
    return functionObject;
  }
  function AsyncFunctionContext() {
    GeneratorContext.call(this);
    this.err = undefined;
    var ctx = this;
    ctx.result = new Promise(function(resolve, reject) {
      ctx.resolve = resolve;
      ctx.reject = reject;
    });
  }
  AsyncFunctionContext.prototype = $create(GeneratorContext.prototype);
  AsyncFunctionContext.prototype.end = function() {
    switch (this.state) {
      case END_STATE:
        this.resolve(this.returnValue);
        break;
      case RETHROW_STATE:
        this.reject(this.storedException);
        break;
      default:
        this.reject(getInternalError(this.state));
    }
  };
  AsyncFunctionContext.prototype.handleException = function() {
    this.state = RETHROW_STATE;
  };
  function asyncWrap(innerFunction, self) {
    var moveNext = getMoveNext(innerFunction, self);
    var ctx = new AsyncFunctionContext();
    ctx.createCallback = function(newState) {
      return function(value) {
        ctx.state = newState;
        ctx.value = value;
        moveNext(ctx);
      };
    };
    ctx.errback = function(err) {
      handleCatch(ctx, err);
      moveNext(ctx);
    };
    moveNext(ctx);
    return ctx.result;
  }
  function getMoveNext(innerFunction, self) {
    return function(ctx) {
      while (true) {
        try {
          return innerFunction.call(self, ctx);
        } catch (ex) {
          handleCatch(ctx, ex);
        }
      }
    };
  }
  function handleCatch(ctx, ex) {
    ctx.storedException = ex;
    var last = ctx.tryStack_[ctx.tryStack_.length - 1];
    if (!last) {
      ctx.handleException(ex);
      return;
    }
    ctx.state = last.catch !== undefined ? last.catch : last.finally;
    if (last.finallyFallThrough !== undefined)
      ctx.finallyFallThrough = last.finallyFallThrough;
  }
  $traceurRuntime.asyncWrap = asyncWrap;
  $traceurRuntime.initGeneratorFunction = initGeneratorFunction;
  $traceurRuntime.createGeneratorInstance = createGeneratorInstance;
})();
(function() {
  function buildFromEncodedParts(opt_scheme, opt_userInfo, opt_domain, opt_port, opt_path, opt_queryData, opt_fragment) {
    var out = [];
    if (opt_scheme) {
      out.push(opt_scheme, ':');
    }
    if (opt_domain) {
      out.push('//');
      if (opt_userInfo) {
        out.push(opt_userInfo, '@');
      }
      out.push(opt_domain);
      if (opt_port) {
        out.push(':', opt_port);
      }
    }
    if (opt_path) {
      out.push(opt_path);
    }
    if (opt_queryData) {
      out.push('?', opt_queryData);
    }
    if (opt_fragment) {
      out.push('#', opt_fragment);
    }
    return out.join('');
  }
  ;
  var splitRe = new RegExp('^' + '(?:' + '([^:/?#.]+)' + ':)?' + '(?://' + '(?:([^/?#]*)@)?' + '([\\w\\d\\-\\u0100-\\uffff.%]*)' + '(?::([0-9]+))?' + ')?' + '([^?#]+)?' + '(?:\\?([^#]*))?' + '(?:#(.*))?' + '$');
  var ComponentIndex = {
    SCHEME: 1,
    USER_INFO: 2,
    DOMAIN: 3,
    PORT: 4,
    PATH: 5,
    QUERY_DATA: 6,
    FRAGMENT: 7
  };
  function split(uri) {
    return (uri.match(splitRe));
  }
  function removeDotSegments(path) {
    if (path === '/')
      return '/';
    var leadingSlash = path[0] === '/' ? '/' : '';
    var trailingSlash = path.slice(-1) === '/' ? '/' : '';
    var segments = path.split('/');
    var out = [];
    var up = 0;
    for (var pos = 0; pos < segments.length; pos++) {
      var segment = segments[pos];
      switch (segment) {
        case '':
        case '.':
          break;
        case '..':
          if (out.length)
            out.pop();
          else
            up++;
          break;
        default:
          out.push(segment);
      }
    }
    if (!leadingSlash) {
      while (up-- > 0) {
        out.unshift('..');
      }
      if (out.length === 0)
        out.push('.');
    }
    return leadingSlash + out.join('/') + trailingSlash;
  }
  function joinAndCanonicalizePath(parts) {
    var path = parts[ComponentIndex.PATH] || '';
    path = removeDotSegments(path);
    parts[ComponentIndex.PATH] = path;
    return buildFromEncodedParts(parts[ComponentIndex.SCHEME], parts[ComponentIndex.USER_INFO], parts[ComponentIndex.DOMAIN], parts[ComponentIndex.PORT], parts[ComponentIndex.PATH], parts[ComponentIndex.QUERY_DATA], parts[ComponentIndex.FRAGMENT]);
  }
  function canonicalizeUrl(url) {
    var parts = split(url);
    return joinAndCanonicalizePath(parts);
  }
  function resolveUrl(base, url) {
    var parts = split(url);
    var baseParts = split(base);
    if (parts[ComponentIndex.SCHEME]) {
      return joinAndCanonicalizePath(parts);
    } else {
      parts[ComponentIndex.SCHEME] = baseParts[ComponentIndex.SCHEME];
    }
    for (var i = ComponentIndex.SCHEME; i <= ComponentIndex.PORT; i++) {
      if (!parts[i]) {
        parts[i] = baseParts[i];
      }
    }
    if (parts[ComponentIndex.PATH][0] == '/') {
      return joinAndCanonicalizePath(parts);
    }
    var path = baseParts[ComponentIndex.PATH];
    var index = path.lastIndexOf('/');
    path = path.slice(0, index + 1) + parts[ComponentIndex.PATH];
    parts[ComponentIndex.PATH] = path;
    return joinAndCanonicalizePath(parts);
  }
  function isAbsolute(name) {
    if (!name)
      return false;
    if (name[0] === '/')
      return true;
    var parts = split(name);
    if (parts[ComponentIndex.SCHEME])
      return true;
    return false;
  }
  $traceurRuntime.canonicalizeUrl = canonicalizeUrl;
  $traceurRuntime.isAbsolute = isAbsolute;
  $traceurRuntime.removeDotSegments = removeDotSegments;
  $traceurRuntime.resolveUrl = resolveUrl;
})();
(function(global) {
  'use strict';
  var $__2 = $traceurRuntime,
      canonicalizeUrl = $__2.canonicalizeUrl,
      resolveUrl = $__2.resolveUrl,
      isAbsolute = $__2.isAbsolute;
  var moduleInstantiators = Object.create(null);
  var baseURL;
  if (global.location && global.location.href)
    baseURL = resolveUrl(global.location.href, './');
  else
    baseURL = '';
  var UncoatedModuleEntry = function UncoatedModuleEntry(url, uncoatedModule) {
    this.url = url;
    this.value_ = uncoatedModule;
  };
  ($traceurRuntime.createClass)(UncoatedModuleEntry, {}, {});
  var ModuleEvaluationError = function ModuleEvaluationError(erroneousModuleName, cause) {
    this.message = this.constructor.name + ': ' + this.stripCause(cause) + ' in ' + erroneousModuleName;
    if (!(cause instanceof $ModuleEvaluationError) && cause.stack)
      this.stack = this.stripStack(cause.stack);
    else
      this.stack = '';
  };
  var $ModuleEvaluationError = ModuleEvaluationError;
  ($traceurRuntime.createClass)(ModuleEvaluationError, {
    stripError: function(message) {
      return message.replace(/.*Error:/, this.constructor.name + ':');
    },
    stripCause: function(cause) {
      if (!cause)
        return '';
      if (!cause.message)
        return cause + '';
      return this.stripError(cause.message);
    },
    loadedBy: function(moduleName) {
      this.stack += '\n loaded by ' + moduleName;
    },
    stripStack: function(causeStack) {
      var stack = [];
      causeStack.split('\n').some((function(frame) {
        if (/UncoatedModuleInstantiator/.test(frame))
          return true;
        stack.push(frame);
      }));
      stack[0] = this.stripError(stack[0]);
      return stack.join('\n');
    }
  }, {}, Error);
  var UncoatedModuleInstantiator = function UncoatedModuleInstantiator(url, func) {
    $traceurRuntime.superCall(this, $UncoatedModuleInstantiator.prototype, "constructor", [url, null]);
    this.func = func;
  };
  var $UncoatedModuleInstantiator = UncoatedModuleInstantiator;
  ($traceurRuntime.createClass)(UncoatedModuleInstantiator, {getUncoatedModule: function() {
      if (this.value_)
        return this.value_;
      try {
        return this.value_ = this.func.call(global);
      } catch (ex) {
        if (ex instanceof ModuleEvaluationError) {
          ex.loadedBy(this.url);
          throw ex;
        }
        throw new ModuleEvaluationError(this.url, ex);
      }
    }}, {}, UncoatedModuleEntry);
  function getUncoatedModuleInstantiator(name) {
    if (!name)
      return;
    var url = ModuleStore.normalize(name);
    return moduleInstantiators[url];
  }
  ;
  var moduleInstances = Object.create(null);
  var liveModuleSentinel = {};
  function Module(uncoatedModule) {
    var isLive = arguments[1];
    var coatedModule = Object.create(null);
    Object.getOwnPropertyNames(uncoatedModule).forEach((function(name) {
      var getter,
          value;
      if (isLive === liveModuleSentinel) {
        var descr = Object.getOwnPropertyDescriptor(uncoatedModule, name);
        if (descr.get)
          getter = descr.get;
      }
      if (!getter) {
        value = uncoatedModule[name];
        getter = function() {
          return value;
        };
      }
      Object.defineProperty(coatedModule, name, {
        get: getter,
        enumerable: true
      });
    }));
    Object.preventExtensions(coatedModule);
    return coatedModule;
  }
  var ModuleStore = {
    normalize: function(name, refererName, refererAddress) {
      if (typeof name !== "string")
        throw new TypeError("module name must be a string, not " + typeof name);
      if (isAbsolute(name))
        return canonicalizeUrl(name);
      if (/[^\.]\/\.\.\//.test(name)) {
        throw new Error('module name embeds /../: ' + name);
      }
      if (name[0] === '.' && refererName)
        return resolveUrl(refererName, name);
      return canonicalizeUrl(name);
    },
    get: function(normalizedName) {
      var m = getUncoatedModuleInstantiator(normalizedName);
      if (!m)
        return undefined;
      var moduleInstance = moduleInstances[m.url];
      if (moduleInstance)
        return moduleInstance;
      moduleInstance = Module(m.getUncoatedModule(), liveModuleSentinel);
      return moduleInstances[m.url] = moduleInstance;
    },
    set: function(normalizedName, module) {
      normalizedName = String(normalizedName);
      moduleInstantiators[normalizedName] = new UncoatedModuleInstantiator(normalizedName, (function() {
        return module;
      }));
      moduleInstances[normalizedName] = module;
    },
    get baseURL() {
      return baseURL;
    },
    set baseURL(v) {
      baseURL = String(v);
    },
    registerModule: function(name, func) {
      var normalizedName = ModuleStore.normalize(name);
      if (moduleInstantiators[normalizedName])
        throw new Error('duplicate module named ' + normalizedName);
      moduleInstantiators[normalizedName] = new UncoatedModuleInstantiator(normalizedName, func);
    },
    bundleStore: Object.create(null),
    register: function(name, deps, func) {
      if (!deps || !deps.length && !func.length) {
        this.registerModule(name, func);
      } else {
        this.bundleStore[name] = {
          deps: deps,
          execute: function() {
            var $__0 = arguments;
            var depMap = {};
            deps.forEach((function(dep, index) {
              return depMap[dep] = $__0[index];
            }));
            var registryEntry = func.call(this, depMap);
            registryEntry.execute.call(this);
            return registryEntry.exports;
          }
        };
      }
    },
    getAnonymousModule: function(func) {
      return new Module(func.call(global), liveModuleSentinel);
    },
    getForTesting: function(name) {
      var $__0 = this;
      if (!this.testingPrefix_) {
        Object.keys(moduleInstances).some((function(key) {
          var m = /(traceur@[^\/]*\/)/.exec(key);
          if (m) {
            $__0.testingPrefix_ = m[1];
            return true;
          }
        }));
      }
      return this.get(this.testingPrefix_ + name);
    }
  };
  ModuleStore.set('@traceur/src/runtime/ModuleStore', new Module({ModuleStore: ModuleStore}));
  var setupGlobals = $traceurRuntime.setupGlobals;
  $traceurRuntime.setupGlobals = function(global) {
    setupGlobals(global);
  };
  $traceurRuntime.ModuleStore = ModuleStore;
  global.System = {
    register: ModuleStore.register.bind(ModuleStore),
    get: ModuleStore.get,
    set: ModuleStore.set,
    normalize: ModuleStore.normalize
  };
  $traceurRuntime.getModuleImpl = function(name) {
    var instantiator = getUncoatedModuleInstantiator(name);
    return instantiator && instantiator.getUncoatedModule();
  };
})(typeof global !== 'undefined' ? global : this);
System.register("traceur-runtime@0.0.72/src/runtime/polyfills/utils", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.72/src/runtime/polyfills/utils";
  var $ceil = Math.ceil;
  var $floor = Math.floor;
  var $isFinite = isFinite;
  var $isNaN = isNaN;
  var $pow = Math.pow;
  var $min = Math.min;
  var toObject = $traceurRuntime.toObject;
  function toUint32(x) {
    return x >>> 0;
  }
  function isObject(x) {
    return x && (typeof x === 'object' || typeof x === 'function');
  }
  function isCallable(x) {
    return typeof x === 'function';
  }
  function isNumber(x) {
    return typeof x === 'number';
  }
  function toInteger(x) {
    x = +x;
    if ($isNaN(x))
      return 0;
    if (x === 0 || !$isFinite(x))
      return x;
    return x > 0 ? $floor(x) : $ceil(x);
  }
  var MAX_SAFE_LENGTH = $pow(2, 53) - 1;
  function toLength(x) {
    var len = toInteger(x);
    return len < 0 ? 0 : $min(len, MAX_SAFE_LENGTH);
  }
  function checkIterable(x) {
    return !isObject(x) ? undefined : x[Symbol.iterator];
  }
  function isConstructor(x) {
    return isCallable(x);
  }
  function createIteratorResultObject(value, done) {
    return {
      value: value,
      done: done
    };
  }
  function maybeDefine(object, name, descr) {
    if (!(name in object)) {
      Object.defineProperty(object, name, descr);
    }
  }
  function maybeDefineMethod(object, name, value) {
    maybeDefine(object, name, {
      value: value,
      configurable: true,
      enumerable: false,
      writable: true
    });
  }
  function maybeDefineConst(object, name, value) {
    maybeDefine(object, name, {
      value: value,
      configurable: false,
      enumerable: false,
      writable: false
    });
  }
  function maybeAddFunctions(object, functions) {
    for (var i = 0; i < functions.length; i += 2) {
      var name = functions[i];
      var value = functions[i + 1];
      maybeDefineMethod(object, name, value);
    }
  }
  function maybeAddConsts(object, consts) {
    for (var i = 0; i < consts.length; i += 2) {
      var name = consts[i];
      var value = consts[i + 1];
      maybeDefineConst(object, name, value);
    }
  }
  function maybeAddIterator(object, func, Symbol) {
    if (!Symbol || !Symbol.iterator || object[Symbol.iterator])
      return;
    if (object['@@iterator'])
      func = object['@@iterator'];
    Object.defineProperty(object, Symbol.iterator, {
      value: func,
      configurable: true,
      enumerable: false,
      writable: true
    });
  }
  var polyfills = [];
  function registerPolyfill(func) {
    polyfills.push(func);
  }
  function polyfillAll(global) {
    polyfills.forEach((function(f) {
      return f(global);
    }));
  }
  return {
    get toObject() {
      return toObject;
    },
    get toUint32() {
      return toUint32;
    },
    get isObject() {
      return isObject;
    },
    get isCallable() {
      return isCallable;
    },
    get isNumber() {
      return isNumber;
    },
    get toInteger() {
      return toInteger;
    },
    get toLength() {
      return toLength;
    },
    get checkIterable() {
      return checkIterable;
    },
    get isConstructor() {
      return isConstructor;
    },
    get createIteratorResultObject() {
      return createIteratorResultObject;
    },
    get maybeDefine() {
      return maybeDefine;
    },
    get maybeDefineMethod() {
      return maybeDefineMethod;
    },
    get maybeDefineConst() {
      return maybeDefineConst;
    },
    get maybeAddFunctions() {
      return maybeAddFunctions;
    },
    get maybeAddConsts() {
      return maybeAddConsts;
    },
    get maybeAddIterator() {
      return maybeAddIterator;
    },
    get registerPolyfill() {
      return registerPolyfill;
    },
    get polyfillAll() {
      return polyfillAll;
    }
  };
});
System.register("traceur-runtime@0.0.72/src/runtime/polyfills/Map", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.72/src/runtime/polyfills/Map";
  var $__0 = System.get("traceur-runtime@0.0.72/src/runtime/polyfills/utils"),
      isObject = $__0.isObject,
      maybeAddIterator = $__0.maybeAddIterator,
      registerPolyfill = $__0.registerPolyfill;
  var getOwnHashObject = $traceurRuntime.getOwnHashObject;
  var $hasOwnProperty = Object.prototype.hasOwnProperty;
  var deletedSentinel = {};
  function lookupIndex(map, key) {
    if (isObject(key)) {
      var hashObject = getOwnHashObject(key);
      return hashObject && map.objectIndex_[hashObject.hash];
    }
    if (typeof key === 'string')
      return map.stringIndex_[key];
    return map.primitiveIndex_[key];
  }
  function initMap(map) {
    map.entries_ = [];
    map.objectIndex_ = Object.create(null);
    map.stringIndex_ = Object.create(null);
    map.primitiveIndex_ = Object.create(null);
    map.deletedCount_ = 0;
  }
  var Map = function Map() {
    var iterable = arguments[0];
    if (!isObject(this))
      throw new TypeError('Map called on incompatible type');
    if ($hasOwnProperty.call(this, 'entries_')) {
      throw new TypeError('Map can not be reentrantly initialised');
    }
    initMap(this);
    if (iterable !== null && iterable !== undefined) {
      for (var $__2 = iterable[Symbol.iterator](),
          $__3; !($__3 = $__2.next()).done; ) {
        var $__4 = $__3.value,
            key = $__4[0],
            value = $__4[1];
        {
          this.set(key, value);
        }
      }
    }
  };
  ($traceurRuntime.createClass)(Map, {
    get size() {
      return this.entries_.length / 2 - this.deletedCount_;
    },
    get: function(key) {
      var index = lookupIndex(this, key);
      if (index !== undefined)
        return this.entries_[index + 1];
    },
    set: function(key, value) {
      var objectMode = isObject(key);
      var stringMode = typeof key === 'string';
      var index = lookupIndex(this, key);
      if (index !== undefined) {
        this.entries_[index + 1] = value;
      } else {
        index = this.entries_.length;
        this.entries_[index] = key;
        this.entries_[index + 1] = value;
        if (objectMode) {
          var hashObject = getOwnHashObject(key);
          var hash = hashObject.hash;
          this.objectIndex_[hash] = index;
        } else if (stringMode) {
          this.stringIndex_[key] = index;
        } else {
          this.primitiveIndex_[key] = index;
        }
      }
      return this;
    },
    has: function(key) {
      return lookupIndex(this, key) !== undefined;
    },
    delete: function(key) {
      var objectMode = isObject(key);
      var stringMode = typeof key === 'string';
      var index;
      var hash;
      if (objectMode) {
        var hashObject = getOwnHashObject(key);
        if (hashObject) {
          index = this.objectIndex_[hash = hashObject.hash];
          delete this.objectIndex_[hash];
        }
      } else if (stringMode) {
        index = this.stringIndex_[key];
        delete this.stringIndex_[key];
      } else {
        index = this.primitiveIndex_[key];
        delete this.primitiveIndex_[key];
      }
      if (index !== undefined) {
        this.entries_[index] = deletedSentinel;
        this.entries_[index + 1] = undefined;
        this.deletedCount_++;
        return true;
      }
      return false;
    },
    clear: function() {
      initMap(this);
    },
    forEach: function(callbackFn) {
      var thisArg = arguments[1];
      for (var i = 0; i < this.entries_.length; i += 2) {
        var key = this.entries_[i];
        var value = this.entries_[i + 1];
        if (key === deletedSentinel)
          continue;
        callbackFn.call(thisArg, value, key, this);
      }
    },
    entries: $traceurRuntime.initGeneratorFunction(function $__5() {
      var i,
          key,
          value;
      return $traceurRuntime.createGeneratorInstance(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              i = 0;
              $ctx.state = 12;
              break;
            case 12:
              $ctx.state = (i < this.entries_.length) ? 8 : -2;
              break;
            case 4:
              i += 2;
              $ctx.state = 12;
              break;
            case 8:
              key = this.entries_[i];
              value = this.entries_[i + 1];
              $ctx.state = 9;
              break;
            case 9:
              $ctx.state = (key === deletedSentinel) ? 4 : 6;
              break;
            case 6:
              $ctx.state = 2;
              return [key, value];
            case 2:
              $ctx.maybeThrow();
              $ctx.state = 4;
              break;
            default:
              return $ctx.end();
          }
      }, $__5, this);
    }),
    keys: $traceurRuntime.initGeneratorFunction(function $__6() {
      var i,
          key,
          value;
      return $traceurRuntime.createGeneratorInstance(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              i = 0;
              $ctx.state = 12;
              break;
            case 12:
              $ctx.state = (i < this.entries_.length) ? 8 : -2;
              break;
            case 4:
              i += 2;
              $ctx.state = 12;
              break;
            case 8:
              key = this.entries_[i];
              value = this.entries_[i + 1];
              $ctx.state = 9;
              break;
            case 9:
              $ctx.state = (key === deletedSentinel) ? 4 : 6;
              break;
            case 6:
              $ctx.state = 2;
              return key;
            case 2:
              $ctx.maybeThrow();
              $ctx.state = 4;
              break;
            default:
              return $ctx.end();
          }
      }, $__6, this);
    }),
    values: $traceurRuntime.initGeneratorFunction(function $__7() {
      var i,
          key,
          value;
      return $traceurRuntime.createGeneratorInstance(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              i = 0;
              $ctx.state = 12;
              break;
            case 12:
              $ctx.state = (i < this.entries_.length) ? 8 : -2;
              break;
            case 4:
              i += 2;
              $ctx.state = 12;
              break;
            case 8:
              key = this.entries_[i];
              value = this.entries_[i + 1];
              $ctx.state = 9;
              break;
            case 9:
              $ctx.state = (key === deletedSentinel) ? 4 : 6;
              break;
            case 6:
              $ctx.state = 2;
              return value;
            case 2:
              $ctx.maybeThrow();
              $ctx.state = 4;
              break;
            default:
              return $ctx.end();
          }
      }, $__7, this);
    })
  }, {});
  Object.defineProperty(Map.prototype, Symbol.iterator, {
    configurable: true,
    writable: true,
    value: Map.prototype.entries
  });
  function polyfillMap(global) {
    var $__4 = global,
        Object = $__4.Object,
        Symbol = $__4.Symbol;
    if (!global.Map)
      global.Map = Map;
    var mapPrototype = global.Map.prototype;
    if (mapPrototype.entries === undefined)
      global.Map = Map;
    if (mapPrototype.entries) {
      maybeAddIterator(mapPrototype, mapPrototype.entries, Symbol);
      maybeAddIterator(Object.getPrototypeOf(new global.Map().entries()), function() {
        return this;
      }, Symbol);
    }
  }
  registerPolyfill(polyfillMap);
  return {
    get Map() {
      return Map;
    },
    get polyfillMap() {
      return polyfillMap;
    }
  };
});
System.get("traceur-runtime@0.0.72/src/runtime/polyfills/Map" + '');
System.register("traceur-runtime@0.0.72/src/runtime/polyfills/Set", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.72/src/runtime/polyfills/Set";
  var $__0 = System.get("traceur-runtime@0.0.72/src/runtime/polyfills/utils"),
      isObject = $__0.isObject,
      maybeAddIterator = $__0.maybeAddIterator,
      registerPolyfill = $__0.registerPolyfill;
  var Map = System.get("traceur-runtime@0.0.72/src/runtime/polyfills/Map").Map;
  var getOwnHashObject = $traceurRuntime.getOwnHashObject;
  var $hasOwnProperty = Object.prototype.hasOwnProperty;
  function initSet(set) {
    set.map_ = new Map();
  }
  var Set = function Set() {
    var iterable = arguments[0];
    if (!isObject(this))
      throw new TypeError('Set called on incompatible type');
    if ($hasOwnProperty.call(this, 'map_')) {
      throw new TypeError('Set can not be reentrantly initialised');
    }
    initSet(this);
    if (iterable !== null && iterable !== undefined) {
      for (var $__4 = iterable[Symbol.iterator](),
          $__5; !($__5 = $__4.next()).done; ) {
        var item = $__5.value;
        {
          this.add(item);
        }
      }
    }
  };
  ($traceurRuntime.createClass)(Set, {
    get size() {
      return this.map_.size;
    },
    has: function(key) {
      return this.map_.has(key);
    },
    add: function(key) {
      this.map_.set(key, key);
      return this;
    },
    delete: function(key) {
      return this.map_.delete(key);
    },
    clear: function() {
      return this.map_.clear();
    },
    forEach: function(callbackFn) {
      var thisArg = arguments[1];
      var $__2 = this;
      return this.map_.forEach((function(value, key) {
        callbackFn.call(thisArg, key, key, $__2);
      }));
    },
    values: $traceurRuntime.initGeneratorFunction(function $__7() {
      var $__8,
          $__9;
      return $traceurRuntime.createGeneratorInstance(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              $__8 = this.map_.keys()[Symbol.iterator]();
              $ctx.sent = void 0;
              $ctx.action = 'next';
              $ctx.state = 12;
              break;
            case 12:
              $__9 = $__8[$ctx.action]($ctx.sentIgnoreThrow);
              $ctx.state = 9;
              break;
            case 9:
              $ctx.state = ($__9.done) ? 3 : 2;
              break;
            case 3:
              $ctx.sent = $__9.value;
              $ctx.state = -2;
              break;
            case 2:
              $ctx.state = 12;
              return $__9.value;
            default:
              return $ctx.end();
          }
      }, $__7, this);
    }),
    entries: $traceurRuntime.initGeneratorFunction(function $__10() {
      var $__11,
          $__12;
      return $traceurRuntime.createGeneratorInstance(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              $__11 = this.map_.entries()[Symbol.iterator]();
              $ctx.sent = void 0;
              $ctx.action = 'next';
              $ctx.state = 12;
              break;
            case 12:
              $__12 = $__11[$ctx.action]($ctx.sentIgnoreThrow);
              $ctx.state = 9;
              break;
            case 9:
              $ctx.state = ($__12.done) ? 3 : 2;
              break;
            case 3:
              $ctx.sent = $__12.value;
              $ctx.state = -2;
              break;
            case 2:
              $ctx.state = 12;
              return $__12.value;
            default:
              return $ctx.end();
          }
      }, $__10, this);
    })
  }, {});
  Object.defineProperty(Set.prototype, Symbol.iterator, {
    configurable: true,
    writable: true,
    value: Set.prototype.values
  });
  Object.defineProperty(Set.prototype, 'keys', {
    configurable: true,
    writable: true,
    value: Set.prototype.values
  });
  function polyfillSet(global) {
    var $__6 = global,
        Object = $__6.Object,
        Symbol = $__6.Symbol;
    if (!global.Set)
      global.Set = Set;
    var setPrototype = global.Set.prototype;
    if (setPrototype.values) {
      maybeAddIterator(setPrototype, setPrototype.values, Symbol);
      maybeAddIterator(Object.getPrototypeOf(new global.Set().values()), function() {
        return this;
      }, Symbol);
    }
  }
  registerPolyfill(polyfillSet);
  return {
    get Set() {
      return Set;
    },
    get polyfillSet() {
      return polyfillSet;
    }
  };
});
System.get("traceur-runtime@0.0.72/src/runtime/polyfills/Set" + '');
System.register("traceur-runtime@0.0.72/node_modules/rsvp/lib/rsvp/asap", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.72/node_modules/rsvp/lib/rsvp/asap";
  var len = 0;
  function asap(callback, arg) {
    queue[len] = callback;
    queue[len + 1] = arg;
    len += 2;
    if (len === 2) {
      scheduleFlush();
    }
  }
  var $__default = asap;
  var browserGlobal = (typeof window !== 'undefined') ? window : {};
  var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
  var isWorker = typeof Uint8ClampedArray !== 'undefined' && typeof importScripts !== 'undefined' && typeof MessageChannel !== 'undefined';
  function useNextTick() {
    return function() {
      process.nextTick(flush);
    };
  }
  function useMutationObserver() {
    var iterations = 0;
    var observer = new BrowserMutationObserver(flush);
    var node = document.createTextNode('');
    observer.observe(node, {characterData: true});
    return function() {
      node.data = (iterations = ++iterations % 2);
    };
  }
  function useMessageChannel() {
    var channel = new MessageChannel();
    channel.port1.onmessage = flush;
    return function() {
      channel.port2.postMessage(0);
    };
  }
  function useSetTimeout() {
    return function() {
      setTimeout(flush, 1);
    };
  }
  var queue = new Array(1000);
  function flush() {
    for (var i = 0; i < len; i += 2) {
      var callback = queue[i];
      var arg = queue[i + 1];
      callback(arg);
      queue[i] = undefined;
      queue[i + 1] = undefined;
    }
    len = 0;
  }
  var scheduleFlush;
  if (typeof process !== 'undefined' && {}.toString.call(process) === '[object process]') {
    scheduleFlush = useNextTick();
  } else if (BrowserMutationObserver) {
    scheduleFlush = useMutationObserver();
  } else if (isWorker) {
    scheduleFlush = useMessageChannel();
  } else {
    scheduleFlush = useSetTimeout();
  }
  return {get default() {
      return $__default;
    }};
});
System.register("traceur-runtime@0.0.72/src/runtime/polyfills/Promise", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.72/src/runtime/polyfills/Promise";
  var async = System.get("traceur-runtime@0.0.72/node_modules/rsvp/lib/rsvp/asap").default;
  var registerPolyfill = System.get("traceur-runtime@0.0.72/src/runtime/polyfills/utils").registerPolyfill;
  var promiseRaw = {};
  function isPromise(x) {
    return x && typeof x === 'object' && x.status_ !== undefined;
  }
  function idResolveHandler(x) {
    return x;
  }
  function idRejectHandler(x) {
    throw x;
  }
  function chain(promise) {
    var onResolve = arguments[1] !== (void 0) ? arguments[1] : idResolveHandler;
    var onReject = arguments[2] !== (void 0) ? arguments[2] : idRejectHandler;
    var deferred = getDeferred(promise.constructor);
    switch (promise.status_) {
      case undefined:
        throw TypeError;
      case 0:
        promise.onResolve_.push(onResolve, deferred);
        promise.onReject_.push(onReject, deferred);
        break;
      case +1:
        promiseEnqueue(promise.value_, [onResolve, deferred]);
        break;
      case -1:
        promiseEnqueue(promise.value_, [onReject, deferred]);
        break;
    }
    return deferred.promise;
  }
  function getDeferred(C) {
    if (this === $Promise) {
      var promise = promiseInit(new $Promise(promiseRaw));
      return {
        promise: promise,
        resolve: (function(x) {
          promiseResolve(promise, x);
        }),
        reject: (function(r) {
          promiseReject(promise, r);
        })
      };
    } else {
      var result = {};
      result.promise = new C((function(resolve, reject) {
        result.resolve = resolve;
        result.reject = reject;
      }));
      return result;
    }
  }
  function promiseSet(promise, status, value, onResolve, onReject) {
    promise.status_ = status;
    promise.value_ = value;
    promise.onResolve_ = onResolve;
    promise.onReject_ = onReject;
    return promise;
  }
  function promiseInit(promise) {
    return promiseSet(promise, 0, undefined, [], []);
  }
  var Promise = function Promise(resolver) {
    if (resolver === promiseRaw)
      return;
    if (typeof resolver !== 'function')
      throw new TypeError;
    var promise = promiseInit(this);
    try {
      resolver((function(x) {
        promiseResolve(promise, x);
      }), (function(r) {
        promiseReject(promise, r);
      }));
    } catch (e) {
      promiseReject(promise, e);
    }
  };
  ($traceurRuntime.createClass)(Promise, {
    catch: function(onReject) {
      return this.then(undefined, onReject);
    },
    then: function(onResolve, onReject) {
      if (typeof onResolve !== 'function')
        onResolve = idResolveHandler;
      if (typeof onReject !== 'function')
        onReject = idRejectHandler;
      var that = this;
      var constructor = this.constructor;
      return chain(this, function(x) {
        x = promiseCoerce(constructor, x);
        return x === that ? onReject(new TypeError) : isPromise(x) ? x.then(onResolve, onReject) : onResolve(x);
      }, onReject);
    }
  }, {
    resolve: function(x) {
      if (this === $Promise) {
        if (isPromise(x)) {
          return x;
        }
        return promiseSet(new $Promise(promiseRaw), +1, x);
      } else {
        return new this(function(resolve, reject) {
          resolve(x);
        });
      }
    },
    reject: function(r) {
      if (this === $Promise) {
        return promiseSet(new $Promise(promiseRaw), -1, r);
      } else {
        return new this((function(resolve, reject) {
          reject(r);
        }));
      }
    },
    all: function(values) {
      var deferred = getDeferred(this);
      var resolutions = [];
      try {
        var count = values.length;
        if (count === 0) {
          deferred.resolve(resolutions);
        } else {
          for (var i = 0; i < values.length; i++) {
            this.resolve(values[i]).then(function(i, x) {
              resolutions[i] = x;
              if (--count === 0)
                deferred.resolve(resolutions);
            }.bind(undefined, i), (function(r) {
              deferred.reject(r);
            }));
          }
        }
      } catch (e) {
        deferred.reject(e);
      }
      return deferred.promise;
    },
    race: function(values) {
      var deferred = getDeferred(this);
      try {
        for (var i = 0; i < values.length; i++) {
          this.resolve(values[i]).then((function(x) {
            deferred.resolve(x);
          }), (function(r) {
            deferred.reject(r);
          }));
        }
      } catch (e) {
        deferred.reject(e);
      }
      return deferred.promise;
    }
  });
  var $Promise = Promise;
  var $PromiseReject = $Promise.reject;
  function promiseResolve(promise, x) {
    promiseDone(promise, +1, x, promise.onResolve_);
  }
  function promiseReject(promise, r) {
    promiseDone(promise, -1, r, promise.onReject_);
  }
  function promiseDone(promise, status, value, reactions) {
    if (promise.status_ !== 0)
      return;
    promiseEnqueue(value, reactions);
    promiseSet(promise, status, value);
  }
  function promiseEnqueue(value, tasks) {
    async((function() {
      for (var i = 0; i < tasks.length; i += 2) {
        promiseHandle(value, tasks[i], tasks[i + 1]);
      }
    }));
  }
  function promiseHandle(value, handler, deferred) {
    try {
      var result = handler(value);
      if (result === deferred.promise)
        throw new TypeError;
      else if (isPromise(result))
        chain(result, deferred.resolve, deferred.reject);
      else
        deferred.resolve(result);
    } catch (e) {
      try {
        deferred.reject(e);
      } catch (e) {}
    }
  }
  var thenableSymbol = '@@thenable';
  function isObject(x) {
    return x && (typeof x === 'object' || typeof x === 'function');
  }
  function promiseCoerce(constructor, x) {
    if (!isPromise(x) && isObject(x)) {
      var then;
      try {
        then = x.then;
      } catch (r) {
        var promise = $PromiseReject.call(constructor, r);
        x[thenableSymbol] = promise;
        return promise;
      }
      if (typeof then === 'function') {
        var p = x[thenableSymbol];
        if (p) {
          return p;
        } else {
          var deferred = getDeferred(constructor);
          x[thenableSymbol] = deferred.promise;
          try {
            then.call(x, deferred.resolve, deferred.reject);
          } catch (r) {
            deferred.reject(r);
          }
          return deferred.promise;
        }
      }
    }
    return x;
  }
  function polyfillPromise(global) {
    if (!global.Promise)
      global.Promise = Promise;
  }
  registerPolyfill(polyfillPromise);
  return {
    get Promise() {
      return Promise;
    },
    get polyfillPromise() {
      return polyfillPromise;
    }
  };
});
System.get("traceur-runtime@0.0.72/src/runtime/polyfills/Promise" + '');
System.register("traceur-runtime@0.0.72/src/runtime/polyfills/StringIterator", [], function() {
  "use strict";
  var $__2;
  var __moduleName = "traceur-runtime@0.0.72/src/runtime/polyfills/StringIterator";
  var $__0 = System.get("traceur-runtime@0.0.72/src/runtime/polyfills/utils"),
      createIteratorResultObject = $__0.createIteratorResultObject,
      isObject = $__0.isObject;
  var toProperty = $traceurRuntime.toProperty;
  var hasOwnProperty = Object.prototype.hasOwnProperty;
  var iteratedString = Symbol('iteratedString');
  var stringIteratorNextIndex = Symbol('stringIteratorNextIndex');
  var StringIterator = function StringIterator() {};
  ($traceurRuntime.createClass)(StringIterator, ($__2 = {}, Object.defineProperty($__2, "next", {
    value: function() {
      var o = this;
      if (!isObject(o) || !hasOwnProperty.call(o, iteratedString)) {
        throw new TypeError('this must be a StringIterator object');
      }
      var s = o[toProperty(iteratedString)];
      if (s === undefined) {
        return createIteratorResultObject(undefined, true);
      }
      var position = o[toProperty(stringIteratorNextIndex)];
      var len = s.length;
      if (position >= len) {
        o[toProperty(iteratedString)] = undefined;
        return createIteratorResultObject(undefined, true);
      }
      var first = s.charCodeAt(position);
      var resultString;
      if (first < 0xD800 || first > 0xDBFF || position + 1 === len) {
        resultString = String.fromCharCode(first);
      } else {
        var second = s.charCodeAt(position + 1);
        if (second < 0xDC00 || second > 0xDFFF) {
          resultString = String.fromCharCode(first);
        } else {
          resultString = String.fromCharCode(first) + String.fromCharCode(second);
        }
      }
      o[toProperty(stringIteratorNextIndex)] = position + resultString.length;
      return createIteratorResultObject(resultString, false);
    },
    configurable: true,
    enumerable: true,
    writable: true
  }), Object.defineProperty($__2, Symbol.iterator, {
    value: function() {
      return this;
    },
    configurable: true,
    enumerable: true,
    writable: true
  }), $__2), {});
  function createStringIterator(string) {
    var s = String(string);
    var iterator = Object.create(StringIterator.prototype);
    iterator[toProperty(iteratedString)] = s;
    iterator[toProperty(stringIteratorNextIndex)] = 0;
    return iterator;
  }
  return {get createStringIterator() {
      return createStringIterator;
    }};
});
System.register("traceur-runtime@0.0.72/src/runtime/polyfills/String", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.72/src/runtime/polyfills/String";
  var createStringIterator = System.get("traceur-runtime@0.0.72/src/runtime/polyfills/StringIterator").createStringIterator;
  var $__1 = System.get("traceur-runtime@0.0.72/src/runtime/polyfills/utils"),
      maybeAddFunctions = $__1.maybeAddFunctions,
      maybeAddIterator = $__1.maybeAddIterator,
      registerPolyfill = $__1.registerPolyfill;
  var $toString = Object.prototype.toString;
  var $indexOf = String.prototype.indexOf;
  var $lastIndexOf = String.prototype.lastIndexOf;
  function startsWith(search) {
    var string = String(this);
    if (this == null || $toString.call(search) == '[object RegExp]') {
      throw TypeError();
    }
    var stringLength = string.length;
    var searchString = String(search);
    var searchLength = searchString.length;
    var position = arguments.length > 1 ? arguments[1] : undefined;
    var pos = position ? Number(position) : 0;
    if (isNaN(pos)) {
      pos = 0;
    }
    var start = Math.min(Math.max(pos, 0), stringLength);
    return $indexOf.call(string, searchString, pos) == start;
  }
  function endsWith(search) {
    var string = String(this);
    if (this == null || $toString.call(search) == '[object RegExp]') {
      throw TypeError();
    }
    var stringLength = string.length;
    var searchString = String(search);
    var searchLength = searchString.length;
    var pos = stringLength;
    if (arguments.length > 1) {
      var position = arguments[1];
      if (position !== undefined) {
        pos = position ? Number(position) : 0;
        if (isNaN(pos)) {
          pos = 0;
        }
      }
    }
    var end = Math.min(Math.max(pos, 0), stringLength);
    var start = end - searchLength;
    if (start < 0) {
      return false;
    }
    return $lastIndexOf.call(string, searchString, start) == start;
  }
  function contains(search) {
    if (this == null) {
      throw TypeError();
    }
    var string = String(this);
    var stringLength = string.length;
    var searchString = String(search);
    var searchLength = searchString.length;
    var position = arguments.length > 1 ? arguments[1] : undefined;
    var pos = position ? Number(position) : 0;
    if (isNaN(pos)) {
      pos = 0;
    }
    var start = Math.min(Math.max(pos, 0), stringLength);
    return $indexOf.call(string, searchString, pos) != -1;
  }
  function repeat(count) {
    if (this == null) {
      throw TypeError();
    }
    var string = String(this);
    var n = count ? Number(count) : 0;
    if (isNaN(n)) {
      n = 0;
    }
    if (n < 0 || n == Infinity) {
      throw RangeError();
    }
    if (n == 0) {
      return '';
    }
    var result = '';
    while (n--) {
      result += string;
    }
    return result;
  }
  function codePointAt(position) {
    if (this == null) {
      throw TypeError();
    }
    var string = String(this);
    var size = string.length;
    var index = position ? Number(position) : 0;
    if (isNaN(index)) {
      index = 0;
    }
    if (index < 0 || index >= size) {
      return undefined;
    }
    var first = string.charCodeAt(index);
    var second;
    if (first >= 0xD800 && first <= 0xDBFF && size > index + 1) {
      second = string.charCodeAt(index + 1);
      if (second >= 0xDC00 && second <= 0xDFFF) {
        return (first - 0xD800) * 0x400 + second - 0xDC00 + 0x10000;
      }
    }
    return first;
  }
  function raw(callsite) {
    var raw = callsite.raw;
    var len = raw.length >>> 0;
    if (len === 0)
      return '';
    var s = '';
    var i = 0;
    while (true) {
      s += raw[i];
      if (i + 1 === len)
        return s;
      s += arguments[++i];
    }
  }
  function fromCodePoint() {
    var codeUnits = [];
    var floor = Math.floor;
    var highSurrogate;
    var lowSurrogate;
    var index = -1;
    var length = arguments.length;
    if (!length) {
      return '';
    }
    while (++index < length) {
      var codePoint = Number(arguments[index]);
      if (!isFinite(codePoint) || codePoint < 0 || codePoint > 0x10FFFF || floor(codePoint) != codePoint) {
        throw RangeError('Invalid code point: ' + codePoint);
      }
      if (codePoint <= 0xFFFF) {
        codeUnits.push(codePoint);
      } else {
        codePoint -= 0x10000;
        highSurrogate = (codePoint >> 10) + 0xD800;
        lowSurrogate = (codePoint % 0x400) + 0xDC00;
        codeUnits.push(highSurrogate, lowSurrogate);
      }
    }
    return String.fromCharCode.apply(null, codeUnits);
  }
  function stringPrototypeIterator() {
    var o = $traceurRuntime.checkObjectCoercible(this);
    var s = String(o);
    return createStringIterator(s);
  }
  function polyfillString(global) {
    var String = global.String;
    maybeAddFunctions(String.prototype, ['codePointAt', codePointAt, 'contains', contains, 'endsWith', endsWith, 'startsWith', startsWith, 'repeat', repeat]);
    maybeAddFunctions(String, ['fromCodePoint', fromCodePoint, 'raw', raw]);
    maybeAddIterator(String.prototype, stringPrototypeIterator, Symbol);
  }
  registerPolyfill(polyfillString);
  return {
    get startsWith() {
      return startsWith;
    },
    get endsWith() {
      return endsWith;
    },
    get contains() {
      return contains;
    },
    get repeat() {
      return repeat;
    },
    get codePointAt() {
      return codePointAt;
    },
    get raw() {
      return raw;
    },
    get fromCodePoint() {
      return fromCodePoint;
    },
    get stringPrototypeIterator() {
      return stringPrototypeIterator;
    },
    get polyfillString() {
      return polyfillString;
    }
  };
});
System.get("traceur-runtime@0.0.72/src/runtime/polyfills/String" + '');
System.register("traceur-runtime@0.0.72/src/runtime/polyfills/ArrayIterator", [], function() {
  "use strict";
  var $__2;
  var __moduleName = "traceur-runtime@0.0.72/src/runtime/polyfills/ArrayIterator";
  var $__0 = System.get("traceur-runtime@0.0.72/src/runtime/polyfills/utils"),
      toObject = $__0.toObject,
      toUint32 = $__0.toUint32,
      createIteratorResultObject = $__0.createIteratorResultObject;
  var ARRAY_ITERATOR_KIND_KEYS = 1;
  var ARRAY_ITERATOR_KIND_VALUES = 2;
  var ARRAY_ITERATOR_KIND_ENTRIES = 3;
  var ArrayIterator = function ArrayIterator() {};
  ($traceurRuntime.createClass)(ArrayIterator, ($__2 = {}, Object.defineProperty($__2, "next", {
    value: function() {
      var iterator = toObject(this);
      var array = iterator.iteratorObject_;
      if (!array) {
        throw new TypeError('Object is not an ArrayIterator');
      }
      var index = iterator.arrayIteratorNextIndex_;
      var itemKind = iterator.arrayIterationKind_;
      var length = toUint32(array.length);
      if (index >= length) {
        iterator.arrayIteratorNextIndex_ = Infinity;
        return createIteratorResultObject(undefined, true);
      }
      iterator.arrayIteratorNextIndex_ = index + 1;
      if (itemKind == ARRAY_ITERATOR_KIND_VALUES)
        return createIteratorResultObject(array[index], false);
      if (itemKind == ARRAY_ITERATOR_KIND_ENTRIES)
        return createIteratorResultObject([index, array[index]], false);
      return createIteratorResultObject(index, false);
    },
    configurable: true,
    enumerable: true,
    writable: true
  }), Object.defineProperty($__2, Symbol.iterator, {
    value: function() {
      return this;
    },
    configurable: true,
    enumerable: true,
    writable: true
  }), $__2), {});
  function createArrayIterator(array, kind) {
    var object = toObject(array);
    var iterator = new ArrayIterator;
    iterator.iteratorObject_ = object;
    iterator.arrayIteratorNextIndex_ = 0;
    iterator.arrayIterationKind_ = kind;
    return iterator;
  }
  function entries() {
    return createArrayIterator(this, ARRAY_ITERATOR_KIND_ENTRIES);
  }
  function keys() {
    return createArrayIterator(this, ARRAY_ITERATOR_KIND_KEYS);
  }
  function values() {
    return createArrayIterator(this, ARRAY_ITERATOR_KIND_VALUES);
  }
  return {
    get entries() {
      return entries;
    },
    get keys() {
      return keys;
    },
    get values() {
      return values;
    }
  };
});
System.register("traceur-runtime@0.0.72/src/runtime/polyfills/Array", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.72/src/runtime/polyfills/Array";
  var $__0 = System.get("traceur-runtime@0.0.72/src/runtime/polyfills/ArrayIterator"),
      entries = $__0.entries,
      keys = $__0.keys,
      values = $__0.values;
  var $__1 = System.get("traceur-runtime@0.0.72/src/runtime/polyfills/utils"),
      checkIterable = $__1.checkIterable,
      isCallable = $__1.isCallable,
      isConstructor = $__1.isConstructor,
      maybeAddFunctions = $__1.maybeAddFunctions,
      maybeAddIterator = $__1.maybeAddIterator,
      registerPolyfill = $__1.registerPolyfill,
      toInteger = $__1.toInteger,
      toLength = $__1.toLength,
      toObject = $__1.toObject;
  function from(arrLike) {
    var mapFn = arguments[1];
    var thisArg = arguments[2];
    var C = this;
    var items = toObject(arrLike);
    var mapping = mapFn !== undefined;
    var k = 0;
    var arr,
        len;
    if (mapping && !isCallable(mapFn)) {
      throw TypeError();
    }
    if (checkIterable(items)) {
      arr = isConstructor(C) ? new C() : [];
      for (var $__2 = items[Symbol.iterator](),
          $__3; !($__3 = $__2.next()).done; ) {
        var item = $__3.value;
        {
          if (mapping) {
            arr[k] = mapFn.call(thisArg, item, k);
          } else {
            arr[k] = item;
          }
          k++;
        }
      }
      arr.length = k;
      return arr;
    }
    len = toLength(items.length);
    arr = isConstructor(C) ? new C(len) : new Array(len);
    for (; k < len; k++) {
      if (mapping) {
        arr[k] = typeof thisArg === 'undefined' ? mapFn(items[k], k) : mapFn.call(thisArg, items[k], k);
      } else {
        arr[k] = items[k];
      }
    }
    arr.length = len;
    return arr;
  }
  function of() {
    for (var items = [],
        $__4 = 0; $__4 < arguments.length; $__4++)
      items[$__4] = arguments[$__4];
    var C = this;
    var len = items.length;
    var arr = isConstructor(C) ? new C(len) : new Array(len);
    for (var k = 0; k < len; k++) {
      arr[k] = items[k];
    }
    arr.length = len;
    return arr;
  }
  function fill(value) {
    var start = arguments[1] !== (void 0) ? arguments[1] : 0;
    var end = arguments[2];
    var object = toObject(this);
    var len = toLength(object.length);
    var fillStart = toInteger(start);
    var fillEnd = end !== undefined ? toInteger(end) : len;
    fillStart = fillStart < 0 ? Math.max(len + fillStart, 0) : Math.min(fillStart, len);
    fillEnd = fillEnd < 0 ? Math.max(len + fillEnd, 0) : Math.min(fillEnd, len);
    while (fillStart < fillEnd) {
      object[fillStart] = value;
      fillStart++;
    }
    return object;
  }
  function find(predicate) {
    var thisArg = arguments[1];
    return findHelper(this, predicate, thisArg);
  }
  function findIndex(predicate) {
    var thisArg = arguments[1];
    return findHelper(this, predicate, thisArg, true);
  }
  function findHelper(self, predicate) {
    var thisArg = arguments[2];
    var returnIndex = arguments[3] !== (void 0) ? arguments[3] : false;
    var object = toObject(self);
    var len = toLength(object.length);
    if (!isCallable(predicate)) {
      throw TypeError();
    }
    for (var i = 0; i < len; i++) {
      var value = object[i];
      if (predicate.call(thisArg, value, i, object)) {
        return returnIndex ? i : value;
      }
    }
    return returnIndex ? -1 : undefined;
  }
  function polyfillArray(global) {
    var $__5 = global,
        Array = $__5.Array,
        Object = $__5.Object,
        Symbol = $__5.Symbol;
    maybeAddFunctions(Array.prototype, ['entries', entries, 'keys', keys, 'values', values, 'fill', fill, 'find', find, 'findIndex', findIndex]);
    maybeAddFunctions(Array, ['from', from, 'of', of]);
    maybeAddIterator(Array.prototype, values, Symbol);
    maybeAddIterator(Object.getPrototypeOf([].values()), function() {
      return this;
    }, Symbol);
  }
  registerPolyfill(polyfillArray);
  return {
    get from() {
      return from;
    },
    get of() {
      return of;
    },
    get fill() {
      return fill;
    },
    get find() {
      return find;
    },
    get findIndex() {
      return findIndex;
    },
    get polyfillArray() {
      return polyfillArray;
    }
  };
});
System.get("traceur-runtime@0.0.72/src/runtime/polyfills/Array" + '');
System.register("traceur-runtime@0.0.72/src/runtime/polyfills/Object", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.72/src/runtime/polyfills/Object";
  var $__0 = System.get("traceur-runtime@0.0.72/src/runtime/polyfills/utils"),
      maybeAddFunctions = $__0.maybeAddFunctions,
      registerPolyfill = $__0.registerPolyfill;
  var $__1 = $traceurRuntime,
      defineProperty = $__1.defineProperty,
      getOwnPropertyDescriptor = $__1.getOwnPropertyDescriptor,
      getOwnPropertyNames = $__1.getOwnPropertyNames,
      isPrivateName = $__1.isPrivateName,
      keys = $__1.keys;
  function is(left, right) {
    if (left === right)
      return left !== 0 || 1 / left === 1 / right;
    return left !== left && right !== right;
  }
  function assign(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      var props = keys(source);
      var p,
          length = props.length;
      for (p = 0; p < length; p++) {
        var name = props[p];
        if (isPrivateName(name))
          continue;
        target[name] = source[name];
      }
    }
    return target;
  }
  function mixin(target, source) {
    var props = getOwnPropertyNames(source);
    var p,
        descriptor,
        length = props.length;
    for (p = 0; p < length; p++) {
      var name = props[p];
      if (isPrivateName(name))
        continue;
      descriptor = getOwnPropertyDescriptor(source, props[p]);
      defineProperty(target, props[p], descriptor);
    }
    return target;
  }
  function polyfillObject(global) {
    var Object = global.Object;
    maybeAddFunctions(Object, ['assign', assign, 'is', is, 'mixin', mixin]);
  }
  registerPolyfill(polyfillObject);
  return {
    get is() {
      return is;
    },
    get assign() {
      return assign;
    },
    get mixin() {
      return mixin;
    },
    get polyfillObject() {
      return polyfillObject;
    }
  };
});
System.get("traceur-runtime@0.0.72/src/runtime/polyfills/Object" + '');
System.register("traceur-runtime@0.0.72/src/runtime/polyfills/Number", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.72/src/runtime/polyfills/Number";
  var $__0 = System.get("traceur-runtime@0.0.72/src/runtime/polyfills/utils"),
      isNumber = $__0.isNumber,
      maybeAddConsts = $__0.maybeAddConsts,
      maybeAddFunctions = $__0.maybeAddFunctions,
      registerPolyfill = $__0.registerPolyfill,
      toInteger = $__0.toInteger;
  var $abs = Math.abs;
  var $isFinite = isFinite;
  var $isNaN = isNaN;
  var MAX_SAFE_INTEGER = Math.pow(2, 53) - 1;
  var MIN_SAFE_INTEGER = -Math.pow(2, 53) + 1;
  var EPSILON = Math.pow(2, -52);
  function NumberIsFinite(number) {
    return isNumber(number) && $isFinite(number);
  }
  ;
  function isInteger(number) {
    return NumberIsFinite(number) && toInteger(number) === number;
  }
  function NumberIsNaN(number) {
    return isNumber(number) && $isNaN(number);
  }
  ;
  function isSafeInteger(number) {
    if (NumberIsFinite(number)) {
      var integral = toInteger(number);
      if (integral === number)
        return $abs(integral) <= MAX_SAFE_INTEGER;
    }
    return false;
  }
  function polyfillNumber(global) {
    var Number = global.Number;
    maybeAddConsts(Number, ['MAX_SAFE_INTEGER', MAX_SAFE_INTEGER, 'MIN_SAFE_INTEGER', MIN_SAFE_INTEGER, 'EPSILON', EPSILON]);
    maybeAddFunctions(Number, ['isFinite', NumberIsFinite, 'isInteger', isInteger, 'isNaN', NumberIsNaN, 'isSafeInteger', isSafeInteger]);
  }
  registerPolyfill(polyfillNumber);
  return {
    get MAX_SAFE_INTEGER() {
      return MAX_SAFE_INTEGER;
    },
    get MIN_SAFE_INTEGER() {
      return MIN_SAFE_INTEGER;
    },
    get EPSILON() {
      return EPSILON;
    },
    get isFinite() {
      return NumberIsFinite;
    },
    get isInteger() {
      return isInteger;
    },
    get isNaN() {
      return NumberIsNaN;
    },
    get isSafeInteger() {
      return isSafeInteger;
    },
    get polyfillNumber() {
      return polyfillNumber;
    }
  };
});
System.get("traceur-runtime@0.0.72/src/runtime/polyfills/Number" + '');
System.register("traceur-runtime@0.0.72/src/runtime/polyfills/polyfills", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.72/src/runtime/polyfills/polyfills";
  var polyfillAll = System.get("traceur-runtime@0.0.72/src/runtime/polyfills/utils").polyfillAll;
  polyfillAll(this);
  var setupGlobals = $traceurRuntime.setupGlobals;
  $traceurRuntime.setupGlobals = function(global) {
    setupGlobals(global);
    polyfillAll(global);
  };
  return {};
});
System.get("traceur-runtime@0.0.72/src/runtime/polyfills/polyfills" + '');

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"_process":1}],3:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  ChartjsAdapter: {get: function() {
      return ChartjsAdapter;
    }},
  __esModule: {value: true}
});
var $___46__46__47_utils_47_colors__;
var Colors = ($___46__46__47_utils_47_colors__ = require("../utils/colors"), $___46__46__47_utils_47_colors__ && $___46__46__47_utils_47_colors__.__esModule && $___46__46__47_utils_47_colors__ || {default: $___46__46__47_utils_47_colors__}).Colors;
function getHeight(element) {
  var height = arguments[1] !== (void 0) ? arguments[1] : 'auto';
  if (height === 'auto') {
    return element.height() > 140 ? element.height() - 50 : 300;
  } else {
    return height;
  }
}
function getWidth(element) {
  var width = arguments[1] !== (void 0) ? arguments[1] : 'auto';
  if (width === 'auto') {
    return element.width() > 90 ? element.width() - 50 : 300;
  } else {
    return width;
  }
}
var ChartjsAdapter = function ChartjsAdapter() {};
($traceurRuntime.createClass)(ChartjsAdapter, {
  renderGraphTo: function(element, graph) {
    var getChartData = function(graph) {
      var index = 0,
          colors = new Colors(),
          colorScheme = colors.defaultScheme();
      return {
        labels: graph.labels,
        datasets: graph.datasets.map((function(dataset) {
          var colorIndex = index % colorScheme.length,
              rgbColor = colors.hexToRgb(colorScheme[colorIndex]);
          dataset.fillColor = colors.rgbToString(rgbColor, 0.2);
          dataset.strokeColor = colors.rgbToString(rgbColor, 1);
          dataset.pointColor = colors.rgbToString(rgbColor, 1);
          dataset.pointStrokeColor = colors.rgbToString(rgbColor, 0.1);
          dataset.pointHighlightFill = colors.rgbToString(rgbColor, 0.1);
          dataset.pointHighlightStroke = colors.rgbToString(rgbColor, 1);
          index++;
          return dataset;
        }))
      };
    };
    element.prepend('<canvas width="' + getWidth(element, graph.width) + '" height="' + getHeight(element, graph.height) + '"></canvas>');
    var context = element.find('canvas:first').get(0).getContext('2d'),
        chart = new Chart(context),
        chartOptions = {legendTemplate: '<ul class="chartjs-legend <%=name.toLowerCase()%>-legend"><% for (var i=0; i<datasets.length; i++){%><li><span class="pill" style="background-color:<%=datasets[i].strokeColor%>"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>'};
    switch (graph.graphType) {
      case 'line':
        chart = chart.Line(getChartData(graph), chartOptions);
        element.append(chart.generateLegend());
        break;
      case 'bar':
        chart = chart.Bar(getChartData(graph), chartOptions);
        element.append(chart.generateLegend());
        break;
      case 'radar':
        chart = chart.Radar(getChartData(graph), chartOptions);
        element.append(chart.generateLegend());
        break;
      default:
        throw Error('Unknown graph type "' + graph.graphType + '"');
    }
  },
  renderSegmentGraphTo: function(element, graph) {
    var getChartData = function(graph) {
      var index = 0,
          colors = new Colors(),
          colorScheme = colors.defaultScheme();
      return graph.labels.map((function(label) {
        var colorIndex = index % colorScheme.length,
            rgbColor = colors.hexToRgb(colorScheme[colorIndex]);
        label.color = colors.rgbToString(rgbColor, 0.8);
        label.highlight = colors.rgbToString(rgbColor, 1);
        index++;
        return label;
      }));
    };
    element.prepend('<canvas width="' + getWidth(element, graph.width) + '" height="' + getHeight(element, graph.height) + '"></canvas>');
    var context = element.find('canvas:first').get(0).getContext('2d'),
        chart = new Chart(context),
        chartOptions = {legendTemplate: '<ul class="chartjs-legend <%=name.toLowerCase()%>-legend"><% for (var i=0; i<segments.length; i++){%><li><span class="pill" style="background-color:<%=segments[i].fillColor%>"></span><%if(segments[i].label){%><%=segments[i].label%><%}%></li><%}%></ul>'};
    switch (graph.graphType) {
      case 'pie':
        chart = chart.Pie(getChartData(graph), chartOptions);
        element.append(chart.generateLegend());
        break;
      case 'polarArea':
        chart = chart.PolarArea(getChartData(graph), chartOptions);
        element.append(chart.generateLegend());
        break;
      case 'doughnut':
        chart = chart.Doughnut(getChartData(graph), chartOptions);
        element.append(chart.generateLegend());
        break;
      default:
        throw Error('Unknown segment graph type "' + graph.graphType + '"');
    }
  }
}, {});

//# sourceMappingURL=<compileOutput>


},{"../utils/colors":20}],4:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  Cell: {get: function() {
      return Cell;
    }},
  __esModule: {value: true}
});
var Cell = function Cell(dimensionValues, value) {
  this.dimensionValues = dimensionValues;
  this.value = value;
};
($traceurRuntime.createClass)(Cell, {getDimensionValue: function(dimension) {
    if (!this.dimensionValues.has(dimension.id)) {
      throw Error('The cell has no dimension value for the dimension "' + dimension.id + '"');
    }
    return this.dimensionValues.get(dimension.id);
  }}, {});

//# sourceMappingURL=<compileOutput>


},{}],5:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  Dimension: {get: function() {
      return Dimension;
    }},
  __esModule: {value: true}
});
var Dimension = function Dimension(id, caption) {
  this.id = id;
  this.caption = caption === undefined ? id : caption;
};
($traceurRuntime.createClass)(Dimension, {}, {});

//# sourceMappingURL=<compileOutput>


},{}],6:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  DimensionValue: {get: function() {
      return DimensionValue;
    }},
  __esModule: {value: true}
});
var DimensionValue = function DimensionValue(id, caption) {
  this.id = id;
  this.caption = caption === undefined ? id : caption;
};
($traceurRuntime.createClass)(DimensionValue, {}, {});

//# sourceMappingURL=<compileOutput>


},{}],7:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  Grid: {get: function() {
      return Grid;
    }},
  __esModule: {value: true}
});
var $___46__46__47_utils_47_maps__,
    $___46__46__47_data_47_dimension__,
    $___46__46__47_data_47_dimensionValue__,
    $___46__46__47_data_47_cell__;
var Maps = ($___46__46__47_utils_47_maps__ = require("../utils/maps"), $___46__46__47_utils_47_maps__ && $___46__46__47_utils_47_maps__.__esModule && $___46__46__47_utils_47_maps__ || {default: $___46__46__47_utils_47_maps__}).Maps;
var Dimension = ($___46__46__47_data_47_dimension__ = require("../data/dimension"), $___46__46__47_data_47_dimension__ && $___46__46__47_data_47_dimension__.__esModule && $___46__46__47_data_47_dimension__ || {default: $___46__46__47_data_47_dimension__}).Dimension;
var DimensionValue = ($___46__46__47_data_47_dimensionValue__ = require("../data/dimensionValue"), $___46__46__47_data_47_dimensionValue__ && $___46__46__47_data_47_dimensionValue__.__esModule && $___46__46__47_data_47_dimensionValue__ || {default: $___46__46__47_data_47_dimensionValue__}).DimensionValue;
var Cell = ($___46__46__47_data_47_cell__ = require("../data/cell"), $___46__46__47_data_47_cell__ && $___46__46__47_data_47_cell__.__esModule && $___46__46__47_data_47_cell__ || {default: $___46__46__47_data_47_cell__}).Cell;
var Grid = function Grid(dimensions, dimensionValues, cells) {
  this.cells = cells;
  this.dimensions = dimensions;
  this.dimensionValues = dimensionValues;
};
var $Grid = Grid;
($traceurRuntime.createClass)(Grid, {
  getDimension: function(dimensionId) {
    if (!this.dimensions.has(dimensionId)) {
      throw Error('The grid has no dimension "' + dimensionId + '"');
    }
    return this.dimensions.get(dimensionId);
  },
  getDimensionValues: function(dimension) {
    if (!this.dimensionValues.has(dimension.id)) {
      throw Error('The grid has no dimension values for the dimension "' + dimension.id + '"');
    }
    return this.dimensionValues.get(dimension.id);
  },
  getDimenionValuesSets: function(dimensions) {
    var mapUtils = new Maps(),
        getSets = function(sets, dimensions, cells) {
          var set = arguments[3] !== (void 0) ? arguments[3] : new Map();
          var $__4 = this;
          if (dimensions.length === 0) {
            sets.push(set);
            return;
          }
          var currentDimension = dimensions[0],
              remainingDimensions = dimensions.slice(1);
          this.getDimensionValues(currentDimension).forEach((function(dimensionValue) {
            var subCells = cells.filter((function(cell) {
              return cell.getDimensionValue(currentDimension) === dimensionValue;
            }));
            if (subCells.length) {
              var currentSet = mapUtils.clone(set);
              currentSet.set(currentDimension.id, dimensionValue);
              getSets.call($__4, sets, remainingDimensions, subCells, currentSet);
            }
          }), this);
        };
    var sets = [];
    getSets.call(this, sets, dimensions, this.cells);
    return sets;
  },
  getCell: function(dimensionValues) {
    var $__4 = this;
    return this.cells.find((function(cell) {
      var found = true;
      dimensionValues.forEach((function(dimensionValue, dimensionId) {
        if (dimensionValue.id !== cell.getDimensionValue($__4.getDimension(dimensionId)).id) {
          found = false;
        }
      }), $__4);
      return found;
    }), this);
  },
  mergeDimensions: function(dimensions, newDimensionId) {
    var newDimension = new Dimension(newDimensionId, dimensions.map((function(dimension) {
      return dimension.caption;
    })).join(' - ')),
        newDimensions = new Map();
    this.dimensions.forEach((function(dimension) {
      if (dimensions.indexOf(dimension) === -1) {
        newDimensions.set(dimension.id, dimension);
      }
    }));
    newDimensions.set(newDimensionId, newDimension);
    var newDimensionValues = new Map();
    this.dimensionValues.forEach((function(dimensionValues, dimensionId) {
      if (dimensions.find((function(dim) {
        return dim.id === dimensionId;
      })) === undefined) {
        newDimensionValues.set(dimensionId, dimensionValues);
      }
    }));
    newDimensionValues.set(newDimensionId, new Map());
    var newCells = [];
    this.cells.forEach((function(cell) {
      var newCellDimensionValues = new Map(),
          dimensionValuesToMerge = [];
      cell.dimensionValues.forEach((function(dimensionValue, dimensionId) {
        if (dimensions.find((function(dim) {
          return dim.id === dimensionId;
        })) === undefined) {
          newCellDimensionValues.set(dimensionId, dimensionValue);
        } else {
          dimensionValuesToMerge.push(dimensionValue);
        }
      }));
      var newCellDimensionValue = new DimensionValue(dimensionValuesToMerge.map((function(dimensionValue) {
        return dimensionValue.id;
      })).join('-'), dimensionValuesToMerge.map((function(dimensionValue) {
        return dimensionValue.caption;
      })).join(' - '));
      newCellDimensionValues.set(newDimensionId, newCellDimensionValue);
      newDimensionValues.get(newDimensionId).set(newCellDimensionValue.id, newCellDimensionValue);
      newCells.push(new Cell(newCellDimensionValues, cell.value));
    }));
    return new $Grid(newDimensions, newDimensionValues, newCells);
  }
}, {});

//# sourceMappingURL=<compileOutput>


},{"../data/cell":4,"../data/dimension":5,"../data/dimensionValue":6,"../utils/maps":21}],8:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  GridFactory: {get: function() {
      return GridFactory;
    }},
  __esModule: {value: true}
});
var $___46__46__47_data_47_dimension__,
    $___46__46__47_data_47_dimensionValue__,
    $___46__46__47_data_47_cell__,
    $___46__46__47_data_47_grid__;
var Dimension = ($___46__46__47_data_47_dimension__ = require("../data/dimension"), $___46__46__47_data_47_dimension__ && $___46__46__47_data_47_dimension__.__esModule && $___46__46__47_data_47_dimension__ || {default: $___46__46__47_data_47_dimension__}).Dimension;
var DimensionValue = ($___46__46__47_data_47_dimensionValue__ = require("../data/dimensionValue"), $___46__46__47_data_47_dimensionValue__ && $___46__46__47_data_47_dimensionValue__.__esModule && $___46__46__47_data_47_dimensionValue__ || {default: $___46__46__47_data_47_dimensionValue__}).DimensionValue;
var Cell = ($___46__46__47_data_47_cell__ = require("../data/cell"), $___46__46__47_data_47_cell__ && $___46__46__47_data_47_cell__.__esModule && $___46__46__47_data_47_cell__ || {default: $___46__46__47_data_47_cell__}).Cell;
var Grid = ($___46__46__47_data_47_grid__ = require("../data/grid"), $___46__46__47_data_47_grid__ && $___46__46__47_data_47_grid__.__esModule && $___46__46__47_data_47_grid__ || {default: $___46__46__47_data_47_grid__}).Grid;
var GridFactory = function GridFactory() {};
($traceurRuntime.createClass)(GridFactory, {buildFromJson: function(gridData) {
    var dimensions = new Map(),
        dimensionValuesByDimensions = new Map(),
        cells = [],
        dimensionPositions = new Map(),
        dimensionValuePositions = new Map();
    ;
    gridData.dimensions.forEach((function(dimension, index) {
      dimensions.set(dimension.id, new Dimension(dimension.id, dimension.caption));
      dimensionPositions.set(dimension.id, index);
      dimensionValuesByDimensions.set(dimension.id, new Map());
      dimensionValuePositions.set(dimension.id, new Map());
    }));
    dimensionPositions.forEach((function(index, dimensionId) {
      gridData.dimensionValues[index].forEach((function(dimensionValue, dimensionValueIndex) {
        dimensionValuesByDimensions.get(dimensionId).set(dimensionValue.id, new DimensionValue(dimensionValue.id, dimensionValue.caption));
        dimensionValuePositions.get(dimensionId).set(dimensionValueIndex, dimensionValue.id);
      }));
    }));
    gridData.cells.forEach((function(cell) {
      var cellDimensionValues = new Map();
      dimensionPositions.forEach((function(index, dimensionId) {
        var dimensionValue = dimensionValuesByDimensions.get(dimensionId).get(dimensionValuePositions.get(dimensionId).get(cell.dimensionValues[index]));
        cellDimensionValues.set(dimensionId, dimensionValue);
      }));
      cells.push(new Cell(cellDimensionValues, cell.value));
    }));
    return new Grid(dimensions, dimensionValuesByDimensions, cells);
  }}, {});

//# sourceMappingURL=<compileOutput>


},{"../data/cell":4,"../data/dimension":5,"../data/dimensionValue":6,"../data/grid":7}],9:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  Renderer: {get: function() {
      return Renderer;
    }},
  __esModule: {value: true}
});
var $__data_47_gridFactory__,
    $__renderer_47_table_47_tableRenderer__,
    $__renderer_47_graph_47_graphRenderer__,
    $__renderer_47_graph_47_segmentGraphRenderer__,
    $__adapter_47_chartjsAdapter__;
var GridFactory = ($__data_47_gridFactory__ = require("./data/gridFactory"), $__data_47_gridFactory__ && $__data_47_gridFactory__.__esModule && $__data_47_gridFactory__ || {default: $__data_47_gridFactory__}).GridFactory;
var TableRenderer = ($__renderer_47_table_47_tableRenderer__ = require("./renderer/table/tableRenderer"), $__renderer_47_table_47_tableRenderer__ && $__renderer_47_table_47_tableRenderer__.__esModule && $__renderer_47_table_47_tableRenderer__ || {default: $__renderer_47_table_47_tableRenderer__}).TableRenderer;
var GraphRenderer = ($__renderer_47_graph_47_graphRenderer__ = require("./renderer/graph/graphRenderer"), $__renderer_47_graph_47_graphRenderer__ && $__renderer_47_graph_47_graphRenderer__.__esModule && $__renderer_47_graph_47_graphRenderer__ || {default: $__renderer_47_graph_47_graphRenderer__}).GraphRenderer;
var SegmentGraphRenderer = ($__renderer_47_graph_47_segmentGraphRenderer__ = require("./renderer/graph/segmentGraphRenderer"), $__renderer_47_graph_47_segmentGraphRenderer__ && $__renderer_47_graph_47_segmentGraphRenderer__.__esModule && $__renderer_47_graph_47_segmentGraphRenderer__ || {default: $__renderer_47_graph_47_segmentGraphRenderer__}).SegmentGraphRenderer;
var ChartjsAdapter = ($__adapter_47_chartjsAdapter__ = require("./adapter/chartjsAdapter"), $__adapter_47_chartjsAdapter__ && $__adapter_47_chartjsAdapter__.__esModule && $__adapter_47_chartjsAdapter__ || {default: $__adapter_47_chartjsAdapter__}).ChartjsAdapter;
var Renderer = function Renderer() {};
($traceurRuntime.createClass)(Renderer, {renderTo: function(element, options) {
    var gridFactory = new GridFactory(),
        grid = gridFactory.buildFromJson(options.data);
    if (options.layout.type === 'table') {
      var tableRenderer = new TableRenderer(options.layout.rows, options.layout.columns, options.layout.options),
          table = tableRenderer.render(grid);
      element.html(table.getHtml());
    } else if (options.layout.type === 'graph') {
      var graphRenderer = new GraphRenderer(options.layout.datasets, options.layout.labels, options.layout.graphType, options.layout.height, options.layout.width),
          graph = graphRenderer.render(grid),
          adapter = new ChartjsAdapter();
      adapter.renderGraphTo(element, graph);
    } else if (options.layout.type === 'segmentGraph') {
      var graphRenderer$__6 = new SegmentGraphRenderer(options.layout.graphType, options.layout.height, options.layout.width),
          graph$__7 = graphRenderer$__6.render(grid),
          adapter$__8 = new ChartjsAdapter();
      adapter$__8.renderSegmentGraphTo(element, graph$__7);
    }
  }}, {});

//# sourceMappingURL=<compileOutput>


},{"./adapter/chartjsAdapter":3,"./data/gridFactory":8,"./renderer/graph/graphRenderer":10,"./renderer/graph/segmentGraphRenderer":11,"./renderer/table/tableRenderer":14}],10:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  GraphRenderer: {get: function() {
      return GraphRenderer;
    }},
  __esModule: {value: true}
});
var $___46__46__47__46__46__47_result_47_graph_47_graph__;
var Graph = ($___46__46__47__46__46__47_result_47_graph_47_graph__ = require("../../result/graph/graph"), $___46__46__47__46__46__47_result_47_graph_47_graph__ && $___46__46__47__46__46__47_result_47_graph_47_graph__.__esModule && $___46__46__47__46__46__47_result_47_graph_47_graph__ || {default: $___46__46__47__46__46__47_result_47_graph_47_graph__}).Graph;
var GraphRenderer = function GraphRenderer(datasetsDimensions, labelsDimensions) {
  var graphType = arguments[2] !== (void 0) ? arguments[2] : 'line';
  var height = arguments[3] !== (void 0) ? arguments[3] : 'auto';
  var width = arguments[4] !== (void 0) ? arguments[4] : 'auto';
  this.datasetsDimensions = datasetsDimensions;
  this.labelsDimensions = labelsDimensions;
  this.graphType = graphType;
  this.height = height;
  this.width = width;
};
($traceurRuntime.createClass)(GraphRenderer, {render: function(grid) {
    var datasetsDimensionId = 'dataset',
        labelsDimensionId = 'label',
        mergedGrid = grid.mergeDimensions(this.datasetsDimensions.map((function(dimension) {
          return grid.getDimension(dimension);
        })), datasetsDimensionId);
    mergedGrid = mergedGrid.mergeDimensions(this.labelsDimensions.map((function(dimension) {
      return grid.getDimension(dimension);
    })), labelsDimensionId);
    var labels = [];
    mergedGrid.getDimensionValues(mergedGrid.getDimension(labelsDimensionId)).forEach((function(labelDV) {
      labels.push(labelDV.caption);
    }));
    var datasets = [];
    mergedGrid.getDimensionValues(mergedGrid.getDimension(datasetsDimensionId)).forEach((function(datasetDV) {
      var dataset = {
        label: datasetDV.caption,
        data: []
      };
      mergedGrid.getDimensionValues(mergedGrid.getDimension(labelsDimensionId)).forEach((function(labelDV) {
        var cellDimensionValues = new Map();
        cellDimensionValues.set(datasetsDimensionId, datasetDV);
        cellDimensionValues.set(labelsDimensionId, labelDV);
        var cell = mergedGrid.getCell(cellDimensionValues);
        if (cell) {
          dataset.data.push(cell.value);
        } else {
          dataset.data.push(null);
        }
      }));
      datasets.push(dataset);
    }));
    return new Graph(this.graphType, labels, datasets, this.height, this.width);
  }}, {});

//# sourceMappingURL=<compileOutput>


},{"../../result/graph/graph":15}],11:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  SegmentGraphRenderer: {get: function() {
      return SegmentGraphRenderer;
    }},
  __esModule: {value: true}
});
var $___46__46__47__46__46__47_result_47_graph_47_segmentGraph__;
var SegmentGraph = ($___46__46__47__46__46__47_result_47_graph_47_segmentGraph__ = require("../../result/graph/segmentGraph"), $___46__46__47__46__46__47_result_47_graph_47_segmentGraph__ && $___46__46__47__46__46__47_result_47_graph_47_segmentGraph__.__esModule && $___46__46__47__46__46__47_result_47_graph_47_segmentGraph__ || {default: $___46__46__47__46__46__47_result_47_graph_47_segmentGraph__}).SegmentGraph;
var SegmentGraphRenderer = function SegmentGraphRenderer() {
  var graphType = arguments[0] !== (void 0) ? arguments[0] : 'pie';
  var height = arguments[1] !== (void 0) ? arguments[1] : 'auto';
  var width = arguments[2] !== (void 0) ? arguments[2] : 'auto';
  this.graphType = graphType;
  this.height = height;
  this.width = width;
};
($traceurRuntime.createClass)(SegmentGraphRenderer, {render: function(grid) {
    var dimensions = [];
    grid.dimensions.forEach((function(dim) {
      dimensions.push(dim);
    }));
    var labelsDimensionId = 'label',
        mergedGrid = grid.mergeDimensions(dimensions, labelsDimensionId);
    var labels = [];
    mergedGrid.getDimensionValues(mergedGrid.getDimension(labelsDimensionId)).forEach((function(labelDV) {
      var cellDimensionValues = new Map();
      cellDimensionValues.set(labelsDimensionId, labelDV);
      var cell = mergedGrid.getCell(cellDimensionValues);
      labels.push({
        label: labelDV.caption,
        value: cell.value
      });
    }));
    return new SegmentGraph(this.graphType, labels, this.height, this.width);
  }}, {});

//# sourceMappingURL=<compileOutput>


},{"../../result/graph/segmentGraph":16}],12:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  TableBodyRenderer: {get: function() {
      return TableBodyRenderer;
    }},
  __esModule: {value: true}
});
var $___46__46__47__46__46__47_result_47_table_47_tableRow__,
    $___46__46__47__46__46__47_result_47_table_47_tableCell__,
    $___46__46__47__46__46__47_utils_47_maps__;
var TableRow = ($___46__46__47__46__46__47_result_47_table_47_tableRow__ = require("../../result/table/tableRow"), $___46__46__47__46__46__47_result_47_table_47_tableRow__ && $___46__46__47__46__46__47_result_47_table_47_tableRow__.__esModule && $___46__46__47__46__46__47_result_47_table_47_tableRow__ || {default: $___46__46__47__46__46__47_result_47_table_47_tableRow__}).TableRow;
var TableCell = ($___46__46__47__46__46__47_result_47_table_47_tableCell__ = require("../../result/table/tableCell"), $___46__46__47__46__46__47_result_47_table_47_tableCell__ && $___46__46__47__46__46__47_result_47_table_47_tableCell__.__esModule && $___46__46__47__46__46__47_result_47_table_47_tableCell__ || {default: $___46__46__47__46__46__47_result_47_table_47_tableCell__}).TableCell;
var Maps = ($___46__46__47__46__46__47_utils_47_maps__ = require("../../utils/maps"), $___46__46__47__46__46__47_utils_47_maps__ && $___46__46__47__46__46__47_utils_47_maps__.__esModule && $___46__46__47__46__46__47_utils_47_maps__ || {default: $___46__46__47__46__46__47_utils_47_maps__}).Maps;
var TableBodyRenderer = function TableBodyRenderer(rowDimensions, columnDimensions) {
  var options = arguments[2] !== (void 0) ? arguments[2] : {};
  this.rowDimensions = rowDimensions;
  this.columnDimensions = columnDimensions;
  this.options = options;
};
($traceurRuntime.createClass)(TableBodyRenderer, {
  render: function(grid) {
    var mapUtils = new Maps(),
        getBodyCells = function(currentRow, columnDimensions, cells, dimensionValues) {
          var colSets = grid.getDimenionValuesSets(columnDimensions.map((function(dimension) {
            return grid.getDimension(dimension);
          })));
          colSets.forEach((function(set) {
            var cellSet = mapUtils.sum(dimensionValues, set);
            var cell = grid.getCell(cellSet);
            if (cell) {
              currentRow.addCell(new TableCell(cell.value));
            } else {
              currentRow.addCell(new TableCell(''));
            }
          }));
        },
        getRows = function(rows, rowDimensions, columnDimensions, cells) {
          var dimensionValues = arguments[4] !== (void 0) ? arguments[4] : new Map();
          var row = arguments[5] !== (void 0) ? arguments[5] : null;
          var $__3 = this;
          if (rowDimensions.length === 0) {
            getBodyCells(row, columnDimensions, cells, dimensionValues);
            return 1;
          }
          var currentDimensionId = rowDimensions[0],
              currentDimension = grid.getDimension(currentDimensionId),
              remainingDimensions = rowDimensions.slice(1),
              countCells = 0,
              first = true;
          grid.getDimensionValues(currentDimension).forEach((function(dimensionValue) {
            var subCells = cells.filter((function(cell) {
              return cell.getDimensionValue(currentDimension) === dimensionValue;
            }));
            if (subCells.length) {
              var currentRow = row;
              if (row === null || !first) {
                currentRow = new TableRow();
                rows.push(currentRow);
              }
              first = false;
              var currentDimensionValues = mapUtils.clone(dimensionValues);
              currentDimensionValues.set(currentDimensionId, dimensionValue);
              var tableCell;
              if (!$__3.options.hideHeaders) {
                tableCell = new TableCell(dimensionValue.caption, {header: true});
                currentRow.addCell(tableCell);
              }
              var childCellsCount = getRows.call($__3, rows, remainingDimensions, columnDimensions, subCells, currentDimensionValues, currentRow);
              if (!$__3.options.hideHeaders) {
                tableCell.setOption('rowspan', childCellsCount);
              }
              countCells += childCellsCount;
            }
          }), this);
          return countCells;
        };
    var rows = [];
    getRows.call(this, rows, this.rowDimensions, this.columnDimensions, grid.cells);
    return rows;
  },
  getHeaderCells: function() {
    if (this.options.hideHeaders) {
      return [];
    }
    return [new TableCell('', {
      colspan: this.rowDimensions.length,
      header: true
    })];
  }
}, {});

//# sourceMappingURL=<compileOutput>


},{"../../result/table/tableCell":18,"../../result/table/tableRow":19,"../../utils/maps":21}],13:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  TableHeaderRenderer: {get: function() {
      return TableHeaderRenderer;
    }},
  __esModule: {value: true}
});
var $___46__46__47__46__46__47_result_47_table_47_tableRow__,
    $___46__46__47__46__46__47_result_47_table_47_tableCell__,
    $___46__46__47__46__46__47_utils_47_maps__;
var TableRow = ($___46__46__47__46__46__47_result_47_table_47_tableRow__ = require("../../result/table/tableRow"), $___46__46__47__46__46__47_result_47_table_47_tableRow__ && $___46__46__47__46__46__47_result_47_table_47_tableRow__.__esModule && $___46__46__47__46__46__47_result_47_table_47_tableRow__ || {default: $___46__46__47__46__46__47_result_47_table_47_tableRow__}).TableRow;
var TableCell = ($___46__46__47__46__46__47_result_47_table_47_tableCell__ = require("../../result/table/tableCell"), $___46__46__47__46__46__47_result_47_table_47_tableCell__ && $___46__46__47__46__46__47_result_47_table_47_tableCell__.__esModule && $___46__46__47__46__46__47_result_47_table_47_tableCell__ || {default: $___46__46__47__46__46__47_result_47_table_47_tableCell__}).TableCell;
var Maps = ($___46__46__47__46__46__47_utils_47_maps__ = require("../../utils/maps"), $___46__46__47__46__46__47_utils_47_maps__ && $___46__46__47__46__46__47_utils_47_maps__.__esModule && $___46__46__47__46__46__47_utils_47_maps__ || {default: $___46__46__47__46__46__47_utils_47_maps__}).Maps;
var TableHeaderRenderer = function TableHeaderRenderer(columnDimensions) {
  var options = arguments[1] !== (void 0) ? arguments[1] : {};
  this.columnDimensions = columnDimensions;
  this.options = options;
};
($traceurRuntime.createClass)(TableHeaderRenderer, {render: function(grid) {
    var headerCells = arguments[1] !== (void 0) ? arguments[1] : [];
    if (this.options.hideHeaders) {
      return [];
    }
    var mapUtils = new Maps(),
        getHeaderRows = function(rows, dimensions, cells) {
          var dimensionValues = arguments[3] !== (void 0) ? arguments[3] : new Map();
          if (dimensions.length === 0) {
            return 1;
          }
          var currentDimensionId = dimensions[0],
              currentDimension = grid.getDimension(currentDimensionId),
              remainingDimensions = dimensions.slice(1),
              countCells = 0,
              currentRow;
          if (rows.has(currentDimensionId)) {
            currentRow = rows.get(currentDimensionId);
          } else {
            currentRow = new TableRow();
            rows.set(currentDimensionId, currentRow);
          }
          grid.getDimensionValues(currentDimension).forEach((function(dimensionValue) {
            var subCells = cells.filter((function(cell) {
              return cell.getDimensionValue(currentDimension) === dimensionValue;
            }));
            if (subCells.length) {
              var currentDimensionValues = mapUtils.clone(dimensionValues);
              currentDimensionValues.set(currentDimensionId, dimensionValue);
              var childCellsCount = getHeaderRows(rows, remainingDimensions, subCells, currentDimensionValues);
              currentRow.addCell(new TableCell(dimensionValue.caption, {
                colspan: childCellsCount,
                header: true
              }));
              countCells += childCellsCount;
            }
          }));
          return countCells;
        };
    var rowsMap = new Map();
    if (this.columnDimensions.length === 0) {
      return headerCells.concat([new TableRow([new TableCell('', {header: true})])]);
    } else {
      getHeaderRows(rowsMap, this.columnDimensions, grid.cells);
      var rows = [];
      rowsMap.forEach((function(row) {
        row.cells = headerCells.concat(row.cells);
        rows.push(row);
      }));
      return rows;
    }
  }}, {});

//# sourceMappingURL=<compileOutput>


},{"../../result/table/tableCell":18,"../../result/table/tableRow":19,"../../utils/maps":21}],14:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  TableRenderer: {get: function() {
      return TableRenderer;
    }},
  __esModule: {value: true}
});
var $___46__46__47__46__46__47_result_47_table_47_table__,
    $___46__46__47__46__46__47_renderer_47_table_47_tableHeaderRenderer__,
    $___46__46__47__46__46__47_renderer_47_table_47_tableBodyRenderer__;
var Table = ($___46__46__47__46__46__47_result_47_table_47_table__ = require("../../result/table/table"), $___46__46__47__46__46__47_result_47_table_47_table__ && $___46__46__47__46__46__47_result_47_table_47_table__.__esModule && $___46__46__47__46__46__47_result_47_table_47_table__ || {default: $___46__46__47__46__46__47_result_47_table_47_table__}).Table;
var TableHeaderRenderer = ($___46__46__47__46__46__47_renderer_47_table_47_tableHeaderRenderer__ = require("../../renderer/table/tableHeaderRenderer"), $___46__46__47__46__46__47_renderer_47_table_47_tableHeaderRenderer__ && $___46__46__47__46__46__47_renderer_47_table_47_tableHeaderRenderer__.__esModule && $___46__46__47__46__46__47_renderer_47_table_47_tableHeaderRenderer__ || {default: $___46__46__47__46__46__47_renderer_47_table_47_tableHeaderRenderer__}).TableHeaderRenderer;
var TableBodyRenderer = ($___46__46__47__46__46__47_renderer_47_table_47_tableBodyRenderer__ = require("../../renderer/table/tableBodyRenderer"), $___46__46__47__46__46__47_renderer_47_table_47_tableBodyRenderer__ && $___46__46__47__46__46__47_renderer_47_table_47_tableBodyRenderer__.__esModule && $___46__46__47__46__46__47_renderer_47_table_47_tableBodyRenderer__ || {default: $___46__46__47__46__46__47_renderer_47_table_47_tableBodyRenderer__}).TableBodyRenderer;
var TableRenderer = function TableRenderer(rowDimensions, columnDimensions) {
  var options = arguments[2] !== (void 0) ? arguments[2] : {};
  this.rowDimensions = rowDimensions;
  this.columnDimensions = columnDimensions;
  this.options = options;
};
($traceurRuntime.createClass)(TableRenderer, {render: function(grid) {
    var table = new Table(),
        tableHeaderRenderer = new TableHeaderRenderer(this.columnDimensions, {hideHeaders: this.options.hideColumnHeaders}),
        tableBodyRenderer = new TableBodyRenderer(this.rowDimensions, this.columnDimensions, {hideHeaders: this.options.hideRowHeaders}),
        headerRows = tableHeaderRenderer.render(grid, tableBodyRenderer.getHeaderCells()),
        bodyRows = tableBodyRenderer.render(grid);
    headerRows.forEach((function(row) {
      table.addRow(row);
    }));
    bodyRows.forEach((function(row) {
      table.addRow(row);
    }));
    return table;
  }}, {});

//# sourceMappingURL=<compileOutput>


},{"../../renderer/table/tableBodyRenderer":12,"../../renderer/table/tableHeaderRenderer":13,"../../result/table/table":17}],15:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  Graph: {get: function() {
      return Graph;
    }},
  __esModule: {value: true}
});
var Graph = function Graph(graphType) {
  var labels = arguments[1] !== (void 0) ? arguments[1] : [];
  var datasets = arguments[2] !== (void 0) ? arguments[2] : [];
  var height = arguments[3] !== (void 0) ? arguments[3] : 'auto';
  var width = arguments[4] !== (void 0) ? arguments[4] : 'auto';
  this.graphType = graphType;
  this.labels = labels;
  this.datasets = datasets;
  this.height = height;
  this.width = width;
};
($traceurRuntime.createClass)(Graph, {addDataset: function(dataset) {
    this.datasets.push(dataset);
  }}, {});

//# sourceMappingURL=<compileOutput>


},{}],16:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  SegmentGraph: {get: function() {
      return SegmentGraph;
    }},
  __esModule: {value: true}
});
var SegmentGraph = function SegmentGraph(graphType) {
  var labels = arguments[1] !== (void 0) ? arguments[1] : [];
  var height = arguments[2] !== (void 0) ? arguments[2] : 'auto';
  var width = arguments[3] !== (void 0) ? arguments[3] : 'auto';
  this.graphType = graphType;
  this.labels = labels;
  this.height = height;
  this.width = width;
};
($traceurRuntime.createClass)(SegmentGraph, {}, {});

//# sourceMappingURL=<compileOutput>


},{}],17:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  Table: {get: function() {
      return Table;
    }},
  __esModule: {value: true}
});
var Table = function Table() {
  var rows = arguments[0] !== (void 0) ? arguments[0] : [];
  this.rows = rows;
};
($traceurRuntime.createClass)(Table, {
  addRow: function(row) {
    this.rows.push(row);
  },
  getHtml: function() {
    var html = '';
    this.rows.forEach((function(row) {
      var rowHtml = '';
      row.cells.forEach((function(cell) {
        var cellAttributes = [];
        if (cell.options.rowspan !== undefined && cell.options.rowspan > 1) {
          cellAttributes.push('rowspan="' + cell.options.rowspan + '"');
        }
        if (cell.options.colspan !== undefined && cell.options.colspan > 1) {
          cellAttributes.push('colspan="' + cell.options.colspan + '"');
        }
        var tag = cell.options.header === undefined || !cell.options.header ? 'td' : 'th';
        rowHtml += '<' + tag + (cellAttributes.length ? ' ' + cellAttributes.join(' ') : '') + '>' + cell.value + '</' + tag + '>';
      }));
      rowHtml = '<tr>' + rowHtml + '</tr>';
      html += rowHtml;
    }));
    return '<table>' + html + '</table>';
  }
}, {});

//# sourceMappingURL=<compileOutput>


},{}],18:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  TableCell: {get: function() {
      return TableCell;
    }},
  __esModule: {value: true}
});
var TableCell = function TableCell(value) {
  var options = arguments[1] !== (void 0) ? arguments[1] : {};
  this.value = value;
  this.options = options;
};
($traceurRuntime.createClass)(TableCell, {setOption: function(key, value) {
    this.options[key] = value;
  }}, {});

//# sourceMappingURL=<compileOutput>


},{}],19:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  TableRow: {get: function() {
      return TableRow;
    }},
  __esModule: {value: true}
});
var TableRow = function TableRow() {
  var cells = arguments[0] !== (void 0) ? arguments[0] : [];
  this.cells = cells;
};
($traceurRuntime.createClass)(TableRow, {addCell: function(cell) {
    this.cells.push(cell);
  }}, {});

//# sourceMappingURL=<compileOutput>


},{}],20:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  Colors: {get: function() {
      return Colors;
    }},
  __esModule: {value: true}
});
var Colors = function Colors() {};
($traceurRuntime.createClass)(Colors, {
  hexToRgb: function(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) {
      throw Error('"' + hex + '" is not a valid hex color');
    }
    return {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    };
  },
  rgbToString: function(rgb) {
    var alpha = arguments[1] !== (void 0) ? arguments[1] : 1;
    return 'rgba(' + ([rgb.r, rgb.g, rgb.b, alpha].join(',')) + ')';
  },
  defaultScheme: function() {
    return ['#97bbcd', '#dcdcdc', '#F7464A', '#46BFBD', '#949FB1', '#FDB45C', '#4D5360', '#7cb5ec', '#90ed7d', '#f7a35c', '#8085e9', '#f15c80', '#e4d354', '#8085e8', '#8d4653', '#91e8e1'];
  }
}, {});

//# sourceMappingURL=<compileOutput>


},{}],21:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  Maps: {get: function() {
      return Maps;
    }},
  __esModule: {value: true}
});
var Maps = function Maps() {};
($traceurRuntime.createClass)(Maps, {
  clone: function(map) {
    var newMap = new Map();
    map.forEach((function(value, key) {
      newMap.set(key, value);
    }));
    return newMap;
  },
  sum: function(map1, map2) {
    var newMap = new Map();
    map1.forEach((function(value, key) {
      newMap.set(key, value);
    }));
    map2.forEach((function(value, key) {
      newMap.set(key, value);
    }));
    return newMap;
  }
}, {});

//# sourceMappingURL=<compileOutput>


},{}],22:[function(require,module,exports){
"use strict";
window.reportjs = require('../src/index.js');

//# sourceMappingURL=<compileOutput>


},{"../src/index.js":9}]},{},[2,22])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL2VzNmlmeS9ub2RlX21vZHVsZXMvdHJhY2V1ci9iaW4vdHJhY2V1ci1ydW50aW1lLmpzIiwiL2hvbWUvQUJDLU9CSkVDVElGL3JpYWQuYmVuZ3VlbGxhL1dvcmtzcGFjZS9wZXJzby9yZXBvcnQuanMvc3JjL2FkYXB0ZXIvY2hhcnRqc0FkYXB0ZXIuanMiLCIvaG9tZS9BQkMtT0JKRUNUSUYvcmlhZC5iZW5ndWVsbGEvV29ya3NwYWNlL3BlcnNvL3JlcG9ydC5qcy9zcmMvZGF0YS9jZWxsLmpzIiwiL2hvbWUvQUJDLU9CSkVDVElGL3JpYWQuYmVuZ3VlbGxhL1dvcmtzcGFjZS9wZXJzby9yZXBvcnQuanMvc3JjL2RhdGEvZGltZW5zaW9uLmpzIiwiL2hvbWUvQUJDLU9CSkVDVElGL3JpYWQuYmVuZ3VlbGxhL1dvcmtzcGFjZS9wZXJzby9yZXBvcnQuanMvc3JjL2RhdGEvZGltZW5zaW9uVmFsdWUuanMiLCIvaG9tZS9BQkMtT0JKRUNUSUYvcmlhZC5iZW5ndWVsbGEvV29ya3NwYWNlL3BlcnNvL3JlcG9ydC5qcy9zcmMvZGF0YS9ncmlkLmpzIiwiL2hvbWUvQUJDLU9CSkVDVElGL3JpYWQuYmVuZ3VlbGxhL1dvcmtzcGFjZS9wZXJzby9yZXBvcnQuanMvc3JjL2RhdGEvZ3JpZEZhY3RvcnkuanMiLCIvaG9tZS9BQkMtT0JKRUNUSUYvcmlhZC5iZW5ndWVsbGEvV29ya3NwYWNlL3BlcnNvL3JlcG9ydC5qcy9zcmMvaW5kZXguanMiLCIvaG9tZS9BQkMtT0JKRUNUSUYvcmlhZC5iZW5ndWVsbGEvV29ya3NwYWNlL3BlcnNvL3JlcG9ydC5qcy9zcmMvcmVuZGVyZXIvZ3JhcGgvZ3JhcGhSZW5kZXJlci5qcyIsIi9ob21lL0FCQy1PQkpFQ1RJRi9yaWFkLmJlbmd1ZWxsYS9Xb3Jrc3BhY2UvcGVyc28vcmVwb3J0LmpzL3NyYy9yZW5kZXJlci9ncmFwaC9zZWdtZW50R3JhcGhSZW5kZXJlci5qcyIsIi9ob21lL0FCQy1PQkpFQ1RJRi9yaWFkLmJlbmd1ZWxsYS9Xb3Jrc3BhY2UvcGVyc28vcmVwb3J0LmpzL3NyYy9yZW5kZXJlci90YWJsZS90YWJsZUJvZHlSZW5kZXJlci5qcyIsIi9ob21lL0FCQy1PQkpFQ1RJRi9yaWFkLmJlbmd1ZWxsYS9Xb3Jrc3BhY2UvcGVyc28vcmVwb3J0LmpzL3NyYy9yZW5kZXJlci90YWJsZS90YWJsZUhlYWRlclJlbmRlcmVyLmpzIiwiL2hvbWUvQUJDLU9CSkVDVElGL3JpYWQuYmVuZ3VlbGxhL1dvcmtzcGFjZS9wZXJzby9yZXBvcnQuanMvc3JjL3JlbmRlcmVyL3RhYmxlL3RhYmxlUmVuZGVyZXIuanMiLCIvaG9tZS9BQkMtT0JKRUNUSUYvcmlhZC5iZW5ndWVsbGEvV29ya3NwYWNlL3BlcnNvL3JlcG9ydC5qcy9zcmMvcmVzdWx0L2dyYXBoL2dyYXBoLmpzIiwiL2hvbWUvQUJDLU9CSkVDVElGL3JpYWQuYmVuZ3VlbGxhL1dvcmtzcGFjZS9wZXJzby9yZXBvcnQuanMvc3JjL3Jlc3VsdC9ncmFwaC9zZWdtZW50R3JhcGguanMiLCIvaG9tZS9BQkMtT0JKRUNUSUYvcmlhZC5iZW5ndWVsbGEvV29ya3NwYWNlL3BlcnNvL3JlcG9ydC5qcy9zcmMvcmVzdWx0L3RhYmxlL3RhYmxlLmpzIiwiL2hvbWUvQUJDLU9CSkVDVElGL3JpYWQuYmVuZ3VlbGxhL1dvcmtzcGFjZS9wZXJzby9yZXBvcnQuanMvc3JjL3Jlc3VsdC90YWJsZS90YWJsZUNlbGwuanMiLCIvaG9tZS9BQkMtT0JKRUNUSUYvcmlhZC5iZW5ndWVsbGEvV29ya3NwYWNlL3BlcnNvL3JlcG9ydC5qcy9zcmMvcmVzdWx0L3RhYmxlL3RhYmxlUm93LmpzIiwiL2hvbWUvQUJDLU9CSkVDVElGL3JpYWQuYmVuZ3VlbGxhL1dvcmtzcGFjZS9wZXJzby9yZXBvcnQuanMvc3JjL3V0aWxzL2NvbG9ycy5qcyIsIi9ob21lL0FCQy1PQkpFQ1RJRi9yaWFkLmJlbmd1ZWxsYS9Xb3Jrc3BhY2UvcGVyc28vcmVwb3J0LmpzL3NyYy91dGlscy9tYXBzLmpzIiwiL2hvbWUvQUJDLU9CSkVDVElGL3JpYWQuYmVuZ3VlbGxhL1dvcmtzcGFjZS9wZXJzby9yZXBvcnQuanMvdmVuZG9yL2xvYWRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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RUFBSSxJQUFJLElBQUUsQUFBQyxFQUFDLENBQUM7QUFDdEIsTUFBRSxRQUFRLEFBQUMsRUFBQyxTQUFDLEtBQUksQ0FBRyxDQUFBLEdBQUUsQ0FBTTtBQUN4QixXQUFLLElBQUksQUFBQyxDQUFDLEdBQUUsQ0FBRyxNQUFJLENBQUMsQ0FBQztJQUMxQixFQUFDLENBQUM7QUFFRixTQUFPLE9BQUssQ0FBQztFQUNqQjtBQUVBLElBQUUsQ0FBRixVQUFJLElBQUcsQ0FBRyxDQUFBLElBQUc7QUFDVCxBQUFJLE1BQUEsQ0FBQSxNQUFLLEVBQUksSUFBSSxJQUFFLEFBQUMsRUFBQyxDQUFDO0FBQ3RCLE9BQUcsUUFBUSxBQUFDLEVBQUMsU0FBQyxLQUFJLENBQUcsQ0FBQSxHQUFFLENBQU07QUFDekIsV0FBSyxJQUFJLEFBQUMsQ0FBQyxHQUFFLENBQUcsTUFBSSxDQUFDLENBQUM7SUFDMUIsRUFBQyxDQUFDO0FBQ0YsT0FBRyxRQUFRLEFBQUMsRUFBQyxTQUFDLEtBQUksQ0FBRyxDQUFBLEdBQUUsQ0FBTTtBQUN6QixXQUFLLElBQUksQUFBQyxDQUFDLEdBQUUsQ0FBRyxNQUFJLENBQUMsQ0FBQztJQUMxQixFQUFDLENBQUM7QUFFRixTQUFPLE9BQUssQ0FBQztFQUNqQjs7QUFFSjs7Ozs7QUN2QkE7QUFBQSxLQUFLLFNBQVMsRUFBSSxDQUFBLE9BQU0sQUFBQyxDQUFDLGlCQUFnQixDQUFDLENBQUM7QUFDNUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG5cbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxucHJvY2Vzcy5uZXh0VGljayA9IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNhblNldEltbWVkaWF0ZSA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnNldEltbWVkaWF0ZTtcbiAgICB2YXIgY2FuTXV0YXRpb25PYnNlcnZlciA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93Lk11dGF0aW9uT2JzZXJ2ZXI7XG4gICAgdmFyIGNhblBvc3QgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5wb3N0TWVzc2FnZSAmJiB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lclxuICAgIDtcblxuICAgIGlmIChjYW5TZXRJbW1lZGlhdGUpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChmKSB7IHJldHVybiB3aW5kb3cuc2V0SW1tZWRpYXRlKGYpIH07XG4gICAgfVxuXG4gICAgdmFyIHF1ZXVlID0gW107XG5cbiAgICBpZiAoY2FuTXV0YXRpb25PYnNlcnZlcikge1xuICAgICAgICB2YXIgaGlkZGVuRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgdmFyIG9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHF1ZXVlTGlzdCA9IHF1ZXVlLnNsaWNlKCk7XG4gICAgICAgICAgICBxdWV1ZS5sZW5ndGggPSAwO1xuICAgICAgICAgICAgcXVldWVMaXN0LmZvckVhY2goZnVuY3Rpb24gKGZuKSB7XG4gICAgICAgICAgICAgICAgZm4oKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICBvYnNlcnZlci5vYnNlcnZlKGhpZGRlbkRpdiwgeyBhdHRyaWJ1dGVzOiB0cnVlIH0pO1xuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBuZXh0VGljayhmbikge1xuICAgICAgICAgICAgaWYgKCFxdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBoaWRkZW5EaXYuc2V0QXR0cmlidXRlKCd5ZXMnLCAnbm8nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHF1ZXVlLnB1c2goZm4pO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIGlmIChjYW5Qb3N0KSB7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgZnVuY3Rpb24gKGV2KSB7XG4gICAgICAgICAgICB2YXIgc291cmNlID0gZXYuc291cmNlO1xuICAgICAgICAgICAgaWYgKChzb3VyY2UgPT09IHdpbmRvdyB8fCBzb3VyY2UgPT09IG51bGwpICYmIGV2LmRhdGEgPT09ICdwcm9jZXNzLXRpY2snKSB7XG4gICAgICAgICAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgaWYgKHF1ZXVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZuID0gcXVldWUuc2hpZnQoKTtcbiAgICAgICAgICAgICAgICAgICAgZm4oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHRydWUpO1xuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBuZXh0VGljayhmbikge1xuICAgICAgICAgICAgcXVldWUucHVzaChmbik7XG4gICAgICAgICAgICB3aW5kb3cucG9zdE1lc3NhZ2UoJ3Byb2Nlc3MtdGljaycsICcqJyk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZm4sIDApO1xuICAgIH07XG59KSgpO1xuXG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5cbi8vIFRPRE8oc2h0eWxtYW4pXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbiIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwpe1xuKGZ1bmN0aW9uKGdsb2JhbCkge1xuICAndXNlIHN0cmljdCc7XG4gIGlmIChnbG9iYWwuJHRyYWNldXJSdW50aW1lKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHZhciAkT2JqZWN0ID0gT2JqZWN0O1xuICB2YXIgJFR5cGVFcnJvciA9IFR5cGVFcnJvcjtcbiAgdmFyICRjcmVhdGUgPSAkT2JqZWN0LmNyZWF0ZTtcbiAgdmFyICRkZWZpbmVQcm9wZXJ0aWVzID0gJE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzO1xuICB2YXIgJGRlZmluZVByb3BlcnR5ID0gJE9iamVjdC5kZWZpbmVQcm9wZXJ0eTtcbiAgdmFyICRmcmVlemUgPSAkT2JqZWN0LmZyZWV6ZTtcbiAgdmFyICRnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IgPSAkT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcjtcbiAgdmFyICRnZXRPd25Qcm9wZXJ0eU5hbWVzID0gJE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzO1xuICB2YXIgJGtleXMgPSAkT2JqZWN0LmtleXM7XG4gIHZhciAkaGFzT3duUHJvcGVydHkgPSAkT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcbiAgdmFyICR0b1N0cmluZyA9ICRPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuICB2YXIgJHByZXZlbnRFeHRlbnNpb25zID0gT2JqZWN0LnByZXZlbnRFeHRlbnNpb25zO1xuICB2YXIgJHNlYWwgPSBPYmplY3Quc2VhbDtcbiAgdmFyICRpc0V4dGVuc2libGUgPSBPYmplY3QuaXNFeHRlbnNpYmxlO1xuICBmdW5jdGlvbiBub25FbnVtKHZhbHVlKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgd3JpdGFibGU6IHRydWVcbiAgICB9O1xuICB9XG4gIHZhciB0eXBlcyA9IHtcbiAgICB2b2lkOiBmdW5jdGlvbiB2b2lkVHlwZSgpIHt9LFxuICAgIGFueTogZnVuY3Rpb24gYW55KCkge30sXG4gICAgc3RyaW5nOiBmdW5jdGlvbiBzdHJpbmcoKSB7fSxcbiAgICBudW1iZXI6IGZ1bmN0aW9uIG51bWJlcigpIHt9LFxuICAgIGJvb2xlYW46IGZ1bmN0aW9uIGJvb2xlYW4oKSB7fVxuICB9O1xuICB2YXIgbWV0aG9kID0gbm9uRW51bTtcbiAgdmFyIGNvdW50ZXIgPSAwO1xuICBmdW5jdGlvbiBuZXdVbmlxdWVTdHJpbmcoKSB7XG4gICAgcmV0dXJuICdfXyQnICsgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMWU5KSArICckJyArICsrY291bnRlciArICckX18nO1xuICB9XG4gIHZhciBzeW1ib2xJbnRlcm5hbFByb3BlcnR5ID0gbmV3VW5pcXVlU3RyaW5nKCk7XG4gIHZhciBzeW1ib2xEZXNjcmlwdGlvblByb3BlcnR5ID0gbmV3VW5pcXVlU3RyaW5nKCk7XG4gIHZhciBzeW1ib2xEYXRhUHJvcGVydHkgPSBuZXdVbmlxdWVTdHJpbmcoKTtcbiAgdmFyIHN5bWJvbFZhbHVlcyA9ICRjcmVhdGUobnVsbCk7XG4gIHZhciBwcml2YXRlTmFtZXMgPSAkY3JlYXRlKG51bGwpO1xuICBmdW5jdGlvbiBpc1ByaXZhdGVOYW1lKHMpIHtcbiAgICByZXR1cm4gcHJpdmF0ZU5hbWVzW3NdO1xuICB9XG4gIGZ1bmN0aW9uIGNyZWF0ZVByaXZhdGVOYW1lKCkge1xuICAgIHZhciBzID0gbmV3VW5pcXVlU3RyaW5nKCk7XG4gICAgcHJpdmF0ZU5hbWVzW3NdID0gdHJ1ZTtcbiAgICByZXR1cm4gcztcbiAgfVxuICBmdW5jdGlvbiBpc1NoaW1TeW1ib2woc3ltYm9sKSB7XG4gICAgcmV0dXJuIHR5cGVvZiBzeW1ib2wgPT09ICdvYmplY3QnICYmIHN5bWJvbCBpbnN0YW5jZW9mIFN5bWJvbFZhbHVlO1xuICB9XG4gIGZ1bmN0aW9uIHR5cGVPZih2KSB7XG4gICAgaWYgKGlzU2hpbVN5bWJvbCh2KSlcbiAgICAgIHJldHVybiAnc3ltYm9sJztcbiAgICByZXR1cm4gdHlwZW9mIHY7XG4gIH1cbiAgZnVuY3Rpb24gU3ltYm9sKGRlc2NyaXB0aW9uKSB7XG4gICAgdmFyIHZhbHVlID0gbmV3IFN5bWJvbFZhbHVlKGRlc2NyaXB0aW9uKTtcbiAgICBpZiAoISh0aGlzIGluc3RhbmNlb2YgU3ltYm9sKSlcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdTeW1ib2wgY2Fubm90IGJlIG5ld1xcJ2VkJyk7XG4gIH1cbiAgJGRlZmluZVByb3BlcnR5KFN5bWJvbC5wcm90b3R5cGUsICdjb25zdHJ1Y3RvcicsIG5vbkVudW0oU3ltYm9sKSk7XG4gICRkZWZpbmVQcm9wZXJ0eShTeW1ib2wucHJvdG90eXBlLCAndG9TdHJpbmcnLCBtZXRob2QoZnVuY3Rpb24oKSB7XG4gICAgdmFyIHN5bWJvbFZhbHVlID0gdGhpc1tzeW1ib2xEYXRhUHJvcGVydHldO1xuICAgIGlmICghZ2V0T3B0aW9uKCdzeW1ib2xzJykpXG4gICAgICByZXR1cm4gc3ltYm9sVmFsdWVbc3ltYm9sSW50ZXJuYWxQcm9wZXJ0eV07XG4gICAgaWYgKCFzeW1ib2xWYWx1ZSlcbiAgICAgIHRocm93IFR5cGVFcnJvcignQ29udmVyc2lvbiBmcm9tIHN5bWJvbCB0byBzdHJpbmcnKTtcbiAgICB2YXIgZGVzYyA9IHN5bWJvbFZhbHVlW3N5bWJvbERlc2NyaXB0aW9uUHJvcGVydHldO1xuICAgIGlmIChkZXNjID09PSB1bmRlZmluZWQpXG4gICAgICBkZXNjID0gJyc7XG4gICAgcmV0dXJuICdTeW1ib2woJyArIGRlc2MgKyAnKSc7XG4gIH0pKTtcbiAgJGRlZmluZVByb3BlcnR5KFN5bWJvbC5wcm90b3R5cGUsICd2YWx1ZU9mJywgbWV0aG9kKGZ1bmN0aW9uKCkge1xuICAgIHZhciBzeW1ib2xWYWx1ZSA9IHRoaXNbc3ltYm9sRGF0YVByb3BlcnR5XTtcbiAgICBpZiAoIXN5bWJvbFZhbHVlKVxuICAgICAgdGhyb3cgVHlwZUVycm9yKCdDb252ZXJzaW9uIGZyb20gc3ltYm9sIHRvIHN0cmluZycpO1xuICAgIGlmICghZ2V0T3B0aW9uKCdzeW1ib2xzJykpXG4gICAgICByZXR1cm4gc3ltYm9sVmFsdWVbc3ltYm9sSW50ZXJuYWxQcm9wZXJ0eV07XG4gICAgcmV0dXJuIHN5bWJvbFZhbHVlO1xuICB9KSk7XG4gIGZ1bmN0aW9uIFN5bWJvbFZhbHVlKGRlc2NyaXB0aW9uKSB7XG4gICAgdmFyIGtleSA9IG5ld1VuaXF1ZVN0cmluZygpO1xuICAgICRkZWZpbmVQcm9wZXJ0eSh0aGlzLCBzeW1ib2xEYXRhUHJvcGVydHksIHt2YWx1ZTogdGhpc30pO1xuICAgICRkZWZpbmVQcm9wZXJ0eSh0aGlzLCBzeW1ib2xJbnRlcm5hbFByb3BlcnR5LCB7dmFsdWU6IGtleX0pO1xuICAgICRkZWZpbmVQcm9wZXJ0eSh0aGlzLCBzeW1ib2xEZXNjcmlwdGlvblByb3BlcnR5LCB7dmFsdWU6IGRlc2NyaXB0aW9ufSk7XG4gICAgZnJlZXplKHRoaXMpO1xuICAgIHN5bWJvbFZhbHVlc1trZXldID0gdGhpcztcbiAgfVxuICAkZGVmaW5lUHJvcGVydHkoU3ltYm9sVmFsdWUucHJvdG90eXBlLCAnY29uc3RydWN0b3InLCBub25FbnVtKFN5bWJvbCkpO1xuICAkZGVmaW5lUHJvcGVydHkoU3ltYm9sVmFsdWUucHJvdG90eXBlLCAndG9TdHJpbmcnLCB7XG4gICAgdmFsdWU6IFN5bWJvbC5wcm90b3R5cGUudG9TdHJpbmcsXG4gICAgZW51bWVyYWJsZTogZmFsc2VcbiAgfSk7XG4gICRkZWZpbmVQcm9wZXJ0eShTeW1ib2xWYWx1ZS5wcm90b3R5cGUsICd2YWx1ZU9mJywge1xuICAgIHZhbHVlOiBTeW1ib2wucHJvdG90eXBlLnZhbHVlT2YsXG4gICAgZW51bWVyYWJsZTogZmFsc2VcbiAgfSk7XG4gIHZhciBoYXNoUHJvcGVydHkgPSBjcmVhdGVQcml2YXRlTmFtZSgpO1xuICB2YXIgaGFzaFByb3BlcnR5RGVzY3JpcHRvciA9IHt2YWx1ZTogdW5kZWZpbmVkfTtcbiAgdmFyIGhhc2hPYmplY3RQcm9wZXJ0aWVzID0ge1xuICAgIGhhc2g6IHt2YWx1ZTogdW5kZWZpbmVkfSxcbiAgICBzZWxmOiB7dmFsdWU6IHVuZGVmaW5lZH1cbiAgfTtcbiAgdmFyIGhhc2hDb3VudGVyID0gMDtcbiAgZnVuY3Rpb24gZ2V0T3duSGFzaE9iamVjdChvYmplY3QpIHtcbiAgICB2YXIgaGFzaE9iamVjdCA9IG9iamVjdFtoYXNoUHJvcGVydHldO1xuICAgIGlmIChoYXNoT2JqZWN0ICYmIGhhc2hPYmplY3Quc2VsZiA9PT0gb2JqZWN0KVxuICAgICAgcmV0dXJuIGhhc2hPYmplY3Q7XG4gICAgaWYgKCRpc0V4dGVuc2libGUob2JqZWN0KSkge1xuICAgICAgaGFzaE9iamVjdFByb3BlcnRpZXMuaGFzaC52YWx1ZSA9IGhhc2hDb3VudGVyKys7XG4gICAgICBoYXNoT2JqZWN0UHJvcGVydGllcy5zZWxmLnZhbHVlID0gb2JqZWN0O1xuICAgICAgaGFzaFByb3BlcnR5RGVzY3JpcHRvci52YWx1ZSA9ICRjcmVhdGUobnVsbCwgaGFzaE9iamVjdFByb3BlcnRpZXMpO1xuICAgICAgJGRlZmluZVByb3BlcnR5KG9iamVjdCwgaGFzaFByb3BlcnR5LCBoYXNoUHJvcGVydHlEZXNjcmlwdG9yKTtcbiAgICAgIHJldHVybiBoYXNoUHJvcGVydHlEZXNjcmlwdG9yLnZhbHVlO1xuICAgIH1cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG4gIGZ1bmN0aW9uIGZyZWV6ZShvYmplY3QpIHtcbiAgICBnZXRPd25IYXNoT2JqZWN0KG9iamVjdCk7XG4gICAgcmV0dXJuICRmcmVlemUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfVxuICBmdW5jdGlvbiBwcmV2ZW50RXh0ZW5zaW9ucyhvYmplY3QpIHtcbiAgICBnZXRPd25IYXNoT2JqZWN0KG9iamVjdCk7XG4gICAgcmV0dXJuICRwcmV2ZW50RXh0ZW5zaW9ucy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9XG4gIGZ1bmN0aW9uIHNlYWwob2JqZWN0KSB7XG4gICAgZ2V0T3duSGFzaE9iamVjdChvYmplY3QpO1xuICAgIHJldHVybiAkc2VhbC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9XG4gIGZyZWV6ZShTeW1ib2xWYWx1ZS5wcm90b3R5cGUpO1xuICBmdW5jdGlvbiBpc1N5bWJvbFN0cmluZyhzKSB7XG4gICAgcmV0dXJuIHN5bWJvbFZhbHVlc1tzXSB8fCBwcml2YXRlTmFtZXNbc107XG4gIH1cbiAgZnVuY3Rpb24gdG9Qcm9wZXJ0eShuYW1lKSB7XG4gICAgaWYgKGlzU2hpbVN5bWJvbChuYW1lKSlcbiAgICAgIHJldHVybiBuYW1lW3N5bWJvbEludGVybmFsUHJvcGVydHldO1xuICAgIHJldHVybiBuYW1lO1xuICB9XG4gIGZ1bmN0aW9uIHJlbW92ZVN5bWJvbEtleXMoYXJyYXkpIHtcbiAgICB2YXIgcnYgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFycmF5Lmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoIWlzU3ltYm9sU3RyaW5nKGFycmF5W2ldKSkge1xuICAgICAgICBydi5wdXNoKGFycmF5W2ldKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJ2O1xuICB9XG4gIGZ1bmN0aW9uIGdldE93blByb3BlcnR5TmFtZXMob2JqZWN0KSB7XG4gICAgcmV0dXJuIHJlbW92ZVN5bWJvbEtleXMoJGdldE93blByb3BlcnR5TmFtZXMob2JqZWN0KSk7XG4gIH1cbiAgZnVuY3Rpb24ga2V5cyhvYmplY3QpIHtcbiAgICByZXR1cm4gcmVtb3ZlU3ltYm9sS2V5cygka2V5cyhvYmplY3QpKTtcbiAgfVxuICBmdW5jdGlvbiBnZXRPd25Qcm9wZXJ0eVN5bWJvbHMob2JqZWN0KSB7XG4gICAgdmFyIHJ2ID0gW107XG4gICAgdmFyIG5hbWVzID0gJGdldE93blByb3BlcnR5TmFtZXMob2JqZWN0KTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG5hbWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgc3ltYm9sID0gc3ltYm9sVmFsdWVzW25hbWVzW2ldXTtcbiAgICAgIGlmIChzeW1ib2wpIHtcbiAgICAgICAgcnYucHVzaChzeW1ib2wpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcnY7XG4gIH1cbiAgZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iamVjdCwgbmFtZSkge1xuICAgIHJldHVybiAkZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iamVjdCwgdG9Qcm9wZXJ0eShuYW1lKSk7XG4gIH1cbiAgZnVuY3Rpb24gaGFzT3duUHJvcGVydHkobmFtZSkge1xuICAgIHJldHVybiAkaGFzT3duUHJvcGVydHkuY2FsbCh0aGlzLCB0b1Byb3BlcnR5KG5hbWUpKTtcbiAgfVxuICBmdW5jdGlvbiBnZXRPcHRpb24obmFtZSkge1xuICAgIHJldHVybiBnbG9iYWwudHJhY2V1ciAmJiBnbG9iYWwudHJhY2V1ci5vcHRpb25zW25hbWVdO1xuICB9XG4gIGZ1bmN0aW9uIGRlZmluZVByb3BlcnR5KG9iamVjdCwgbmFtZSwgZGVzY3JpcHRvcikge1xuICAgIGlmIChpc1NoaW1TeW1ib2wobmFtZSkpIHtcbiAgICAgIG5hbWUgPSBuYW1lW3N5bWJvbEludGVybmFsUHJvcGVydHldO1xuICAgIH1cbiAgICAkZGVmaW5lUHJvcGVydHkob2JqZWN0LCBuYW1lLCBkZXNjcmlwdG9yKTtcbiAgICByZXR1cm4gb2JqZWN0O1xuICB9XG4gIGZ1bmN0aW9uIHBvbHlmaWxsT2JqZWN0KE9iamVjdCkge1xuICAgICRkZWZpbmVQcm9wZXJ0eShPYmplY3QsICdkZWZpbmVQcm9wZXJ0eScsIHt2YWx1ZTogZGVmaW5lUHJvcGVydHl9KTtcbiAgICAkZGVmaW5lUHJvcGVydHkoT2JqZWN0LCAnZ2V0T3duUHJvcGVydHlOYW1lcycsIHt2YWx1ZTogZ2V0T3duUHJvcGVydHlOYW1lc30pO1xuICAgICRkZWZpbmVQcm9wZXJ0eShPYmplY3QsICdnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3InLCB7dmFsdWU6IGdldE93blByb3BlcnR5RGVzY3JpcHRvcn0pO1xuICAgICRkZWZpbmVQcm9wZXJ0eShPYmplY3QucHJvdG90eXBlLCAnaGFzT3duUHJvcGVydHknLCB7dmFsdWU6IGhhc093blByb3BlcnR5fSk7XG4gICAgJGRlZmluZVByb3BlcnR5KE9iamVjdCwgJ2ZyZWV6ZScsIHt2YWx1ZTogZnJlZXplfSk7XG4gICAgJGRlZmluZVByb3BlcnR5KE9iamVjdCwgJ3ByZXZlbnRFeHRlbnNpb25zJywge3ZhbHVlOiBwcmV2ZW50RXh0ZW5zaW9uc30pO1xuICAgICRkZWZpbmVQcm9wZXJ0eShPYmplY3QsICdzZWFsJywge3ZhbHVlOiBzZWFsfSk7XG4gICAgJGRlZmluZVByb3BlcnR5KE9iamVjdCwgJ2tleXMnLCB7dmFsdWU6IGtleXN9KTtcbiAgfVxuICBmdW5jdGlvbiBleHBvcnRTdGFyKG9iamVjdCkge1xuICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgbmFtZXMgPSAkZ2V0T3duUHJvcGVydHlOYW1lcyhhcmd1bWVudHNbaV0pO1xuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBuYW1lcy5sZW5ndGg7IGorKykge1xuICAgICAgICB2YXIgbmFtZSA9IG5hbWVzW2pdO1xuICAgICAgICBpZiAoaXNTeW1ib2xTdHJpbmcobmFtZSkpXG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIChmdW5jdGlvbihtb2QsIG5hbWUpIHtcbiAgICAgICAgICAkZGVmaW5lUHJvcGVydHkob2JqZWN0LCBuYW1lLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICByZXR1cm4gbW9kW25hbWVdO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWVcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSkoYXJndW1lbnRzW2ldLCBuYW1lc1tqXSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvYmplY3Q7XG4gIH1cbiAgZnVuY3Rpb24gaXNPYmplY3QoeCkge1xuICAgIHJldHVybiB4ICE9IG51bGwgJiYgKHR5cGVvZiB4ID09PSAnb2JqZWN0JyB8fCB0eXBlb2YgeCA9PT0gJ2Z1bmN0aW9uJyk7XG4gIH1cbiAgZnVuY3Rpb24gdG9PYmplY3QoeCkge1xuICAgIGlmICh4ID09IG51bGwpXG4gICAgICB0aHJvdyAkVHlwZUVycm9yKCk7XG4gICAgcmV0dXJuICRPYmplY3QoeCk7XG4gIH1cbiAgZnVuY3Rpb24gY2hlY2tPYmplY3RDb2VyY2libGUoYXJndW1lbnQpIHtcbiAgICBpZiAoYXJndW1lbnQgPT0gbnVsbCkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignVmFsdWUgY2Fubm90IGJlIGNvbnZlcnRlZCB0byBhbiBPYmplY3QnKTtcbiAgICB9XG4gICAgcmV0dXJuIGFyZ3VtZW50O1xuICB9XG4gIGZ1bmN0aW9uIHBvbHlmaWxsU3ltYm9sKGdsb2JhbCwgU3ltYm9sKSB7XG4gICAgaWYgKCFnbG9iYWwuU3ltYm9sKSB7XG4gICAgICBnbG9iYWwuU3ltYm9sID0gU3ltYm9sO1xuICAgICAgT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyA9IGdldE93blByb3BlcnR5U3ltYm9scztcbiAgICB9XG4gICAgaWYgKCFnbG9iYWwuU3ltYm9sLml0ZXJhdG9yKSB7XG4gICAgICBnbG9iYWwuU3ltYm9sLml0ZXJhdG9yID0gU3ltYm9sKCdTeW1ib2wuaXRlcmF0b3InKTtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gc2V0dXBHbG9iYWxzKGdsb2JhbCkge1xuICAgIHBvbHlmaWxsU3ltYm9sKGdsb2JhbCwgU3ltYm9sKTtcbiAgICBnbG9iYWwuUmVmbGVjdCA9IGdsb2JhbC5SZWZsZWN0IHx8IHt9O1xuICAgIGdsb2JhbC5SZWZsZWN0Lmdsb2JhbCA9IGdsb2JhbC5SZWZsZWN0Lmdsb2JhbCB8fCBnbG9iYWw7XG4gICAgcG9seWZpbGxPYmplY3QoZ2xvYmFsLk9iamVjdCk7XG4gIH1cbiAgc2V0dXBHbG9iYWxzKGdsb2JhbCk7XG4gIGdsb2JhbC4kdHJhY2V1clJ1bnRpbWUgPSB7XG4gICAgY2hlY2tPYmplY3RDb2VyY2libGU6IGNoZWNrT2JqZWN0Q29lcmNpYmxlLFxuICAgIGNyZWF0ZVByaXZhdGVOYW1lOiBjcmVhdGVQcml2YXRlTmFtZSxcbiAgICBkZWZpbmVQcm9wZXJ0aWVzOiAkZGVmaW5lUHJvcGVydGllcyxcbiAgICBkZWZpbmVQcm9wZXJ0eTogJGRlZmluZVByb3BlcnR5LFxuICAgIGV4cG9ydFN0YXI6IGV4cG9ydFN0YXIsXG4gICAgZ2V0T3duSGFzaE9iamVjdDogZ2V0T3duSGFzaE9iamVjdCxcbiAgICBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3I6ICRnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IsXG4gICAgZ2V0T3duUHJvcGVydHlOYW1lczogJGdldE93blByb3BlcnR5TmFtZXMsXG4gICAgaXNPYmplY3Q6IGlzT2JqZWN0LFxuICAgIGlzUHJpdmF0ZU5hbWU6IGlzUHJpdmF0ZU5hbWUsXG4gICAgaXNTeW1ib2xTdHJpbmc6IGlzU3ltYm9sU3RyaW5nLFxuICAgIGtleXM6ICRrZXlzLFxuICAgIHNldHVwR2xvYmFsczogc2V0dXBHbG9iYWxzLFxuICAgIHRvT2JqZWN0OiB0b09iamVjdCxcbiAgICB0b1Byb3BlcnR5OiB0b1Byb3BlcnR5LFxuICAgIHR5cGU6IHR5cGVzLFxuICAgIHR5cGVvZjogdHlwZU9mXG4gIH07XG59KSh0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJyA/IGdsb2JhbCA6IHRoaXMpO1xuKGZ1bmN0aW9uKCkge1xuICAndXNlIHN0cmljdCc7XG4gIGZ1bmN0aW9uIHNwcmVhZCgpIHtcbiAgICB2YXIgcnYgPSBbXSxcbiAgICAgICAgaiA9IDAsXG4gICAgICAgIGl0ZXJSZXN1bHQ7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciB2YWx1ZVRvU3ByZWFkID0gJHRyYWNldXJSdW50aW1lLmNoZWNrT2JqZWN0Q29lcmNpYmxlKGFyZ3VtZW50c1tpXSk7XG4gICAgICBpZiAodHlwZW9mIHZhbHVlVG9TcHJlYWRbJHRyYWNldXJSdW50aW1lLnRvUHJvcGVydHkoU3ltYm9sLml0ZXJhdG9yKV0gIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IHNwcmVhZCBub24taXRlcmFibGUgb2JqZWN0LicpO1xuICAgICAgfVxuICAgICAgdmFyIGl0ZXIgPSB2YWx1ZVRvU3ByZWFkWyR0cmFjZXVyUnVudGltZS50b1Byb3BlcnR5KFN5bWJvbC5pdGVyYXRvcildKCk7XG4gICAgICB3aGlsZSAoIShpdGVyUmVzdWx0ID0gaXRlci5uZXh0KCkpLmRvbmUpIHtcbiAgICAgICAgcnZbaisrXSA9IGl0ZXJSZXN1bHQudmFsdWU7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBydjtcbiAgfVxuICAkdHJhY2V1clJ1bnRpbWUuc3ByZWFkID0gc3ByZWFkO1xufSkoKTtcbihmdW5jdGlvbigpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuICB2YXIgJE9iamVjdCA9IE9iamVjdDtcbiAgdmFyICRUeXBlRXJyb3IgPSBUeXBlRXJyb3I7XG4gIHZhciAkY3JlYXRlID0gJE9iamVjdC5jcmVhdGU7XG4gIHZhciAkZGVmaW5lUHJvcGVydGllcyA9ICR0cmFjZXVyUnVudGltZS5kZWZpbmVQcm9wZXJ0aWVzO1xuICB2YXIgJGRlZmluZVByb3BlcnR5ID0gJHRyYWNldXJSdW50aW1lLmRlZmluZVByb3BlcnR5O1xuICB2YXIgJGdldE93blByb3BlcnR5RGVzY3JpcHRvciA9ICR0cmFjZXVyUnVudGltZS5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3I7XG4gIHZhciAkZ2V0T3duUHJvcGVydHlOYW1lcyA9ICR0cmFjZXVyUnVudGltZS5nZXRPd25Qcm9wZXJ0eU5hbWVzO1xuICB2YXIgJGdldFByb3RvdHlwZU9mID0gT2JqZWN0LmdldFByb3RvdHlwZU9mO1xuICB2YXIgJF9fMCA9IE9iamVjdCxcbiAgICAgIGdldE93blByb3BlcnR5TmFtZXMgPSAkX18wLmdldE93blByb3BlcnR5TmFtZXMsXG4gICAgICBnZXRPd25Qcm9wZXJ0eVN5bWJvbHMgPSAkX18wLmdldE93blByb3BlcnR5U3ltYm9scztcbiAgZnVuY3Rpb24gc3VwZXJEZXNjcmlwdG9yKGhvbWVPYmplY3QsIG5hbWUpIHtcbiAgICB2YXIgcHJvdG8gPSAkZ2V0UHJvdG90eXBlT2YoaG9tZU9iamVjdCk7XG4gICAgZG8ge1xuICAgICAgdmFyIHJlc3VsdCA9ICRnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IocHJvdG8sIG5hbWUpO1xuICAgICAgaWYgKHJlc3VsdClcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIHByb3RvID0gJGdldFByb3RvdHlwZU9mKHByb3RvKTtcbiAgICB9IHdoaWxlIChwcm90byk7XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuICBmdW5jdGlvbiBzdXBlckNhbGwoc2VsZiwgaG9tZU9iamVjdCwgbmFtZSwgYXJncykge1xuICAgIHJldHVybiBzdXBlckdldChzZWxmLCBob21lT2JqZWN0LCBuYW1lKS5hcHBseShzZWxmLCBhcmdzKTtcbiAgfVxuICBmdW5jdGlvbiBzdXBlckdldChzZWxmLCBob21lT2JqZWN0LCBuYW1lKSB7XG4gICAgdmFyIGRlc2NyaXB0b3IgPSBzdXBlckRlc2NyaXB0b3IoaG9tZU9iamVjdCwgbmFtZSk7XG4gICAgaWYgKGRlc2NyaXB0b3IpIHtcbiAgICAgIGlmICghZGVzY3JpcHRvci5nZXQpXG4gICAgICAgIHJldHVybiBkZXNjcmlwdG9yLnZhbHVlO1xuICAgICAgcmV0dXJuIGRlc2NyaXB0b3IuZ2V0LmNhbGwoc2VsZik7XG4gICAgfVxuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cbiAgZnVuY3Rpb24gc3VwZXJTZXQoc2VsZiwgaG9tZU9iamVjdCwgbmFtZSwgdmFsdWUpIHtcbiAgICB2YXIgZGVzY3JpcHRvciA9IHN1cGVyRGVzY3JpcHRvcihob21lT2JqZWN0LCBuYW1lKTtcbiAgICBpZiAoZGVzY3JpcHRvciAmJiBkZXNjcmlwdG9yLnNldCkge1xuICAgICAgZGVzY3JpcHRvci5zZXQuY2FsbChzZWxmLCB2YWx1ZSk7XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuICAgIHRocm93ICRUeXBlRXJyb3IoKFwic3VwZXIgaGFzIG5vIHNldHRlciAnXCIgKyBuYW1lICsgXCInLlwiKSk7XG4gIH1cbiAgZnVuY3Rpb24gZ2V0RGVzY3JpcHRvcnMob2JqZWN0KSB7XG4gICAgdmFyIGRlc2NyaXB0b3JzID0ge307XG4gICAgdmFyIG5hbWVzID0gZ2V0T3duUHJvcGVydHlOYW1lcyhvYmplY3QpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbmFtZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBuYW1lID0gbmFtZXNbaV07XG4gICAgICBkZXNjcmlwdG9yc1tuYW1lXSA9ICRnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBuYW1lKTtcbiAgICB9XG4gICAgdmFyIHN5bWJvbHMgPSBnZXRPd25Qcm9wZXJ0eVN5bWJvbHMob2JqZWN0KTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHN5bWJvbHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBzeW1ib2wgPSBzeW1ib2xzW2ldO1xuICAgICAgZGVzY3JpcHRvcnNbJHRyYWNldXJSdW50aW1lLnRvUHJvcGVydHkoc3ltYm9sKV0gPSAkZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iamVjdCwgJHRyYWNldXJSdW50aW1lLnRvUHJvcGVydHkoc3ltYm9sKSk7XG4gICAgfVxuICAgIHJldHVybiBkZXNjcmlwdG9ycztcbiAgfVxuICBmdW5jdGlvbiBjcmVhdGVDbGFzcyhjdG9yLCBvYmplY3QsIHN0YXRpY09iamVjdCwgc3VwZXJDbGFzcykge1xuICAgICRkZWZpbmVQcm9wZXJ0eShvYmplY3QsICdjb25zdHJ1Y3RvcicsIHtcbiAgICAgIHZhbHVlOiBjdG9yLFxuICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICB3cml0YWJsZTogdHJ1ZVxuICAgIH0pO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMykge1xuICAgICAgaWYgKHR5cGVvZiBzdXBlckNsYXNzID09PSAnZnVuY3Rpb24nKVxuICAgICAgICBjdG9yLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7XG4gICAgICBjdG9yLnByb3RvdHlwZSA9ICRjcmVhdGUoZ2V0UHJvdG9QYXJlbnQoc3VwZXJDbGFzcyksIGdldERlc2NyaXB0b3JzKG9iamVjdCkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjdG9yLnByb3RvdHlwZSA9IG9iamVjdDtcbiAgICB9XG4gICAgJGRlZmluZVByb3BlcnR5KGN0b3IsICdwcm90b3R5cGUnLCB7XG4gICAgICBjb25maWd1cmFibGU6IGZhbHNlLFxuICAgICAgd3JpdGFibGU6IGZhbHNlXG4gICAgfSk7XG4gICAgcmV0dXJuICRkZWZpbmVQcm9wZXJ0aWVzKGN0b3IsIGdldERlc2NyaXB0b3JzKHN0YXRpY09iamVjdCkpO1xuICB9XG4gIGZ1bmN0aW9uIGdldFByb3RvUGFyZW50KHN1cGVyQ2xhc3MpIHtcbiAgICBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHZhciBwcm90b3R5cGUgPSBzdXBlckNsYXNzLnByb3RvdHlwZTtcbiAgICAgIGlmICgkT2JqZWN0KHByb3RvdHlwZSkgPT09IHByb3RvdHlwZSB8fCBwcm90b3R5cGUgPT09IG51bGwpXG4gICAgICAgIHJldHVybiBzdXBlckNsYXNzLnByb3RvdHlwZTtcbiAgICAgIHRocm93IG5ldyAkVHlwZUVycm9yKCdzdXBlciBwcm90b3R5cGUgbXVzdCBiZSBhbiBPYmplY3Qgb3IgbnVsbCcpO1xuICAgIH1cbiAgICBpZiAoc3VwZXJDbGFzcyA9PT0gbnVsbClcbiAgICAgIHJldHVybiBudWxsO1xuICAgIHRocm93IG5ldyAkVHlwZUVycm9yKChcIlN1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgXCIgKyB0eXBlb2Ygc3VwZXJDbGFzcyArIFwiLlwiKSk7XG4gIH1cbiAgZnVuY3Rpb24gZGVmYXVsdFN1cGVyQ2FsbChzZWxmLCBob21lT2JqZWN0LCBhcmdzKSB7XG4gICAgaWYgKCRnZXRQcm90b3R5cGVPZihob21lT2JqZWN0KSAhPT0gbnVsbClcbiAgICAgIHN1cGVyQ2FsbChzZWxmLCBob21lT2JqZWN0LCAnY29uc3RydWN0b3InLCBhcmdzKTtcbiAgfVxuICAkdHJhY2V1clJ1bnRpbWUuY3JlYXRlQ2xhc3MgPSBjcmVhdGVDbGFzcztcbiAgJHRyYWNldXJSdW50aW1lLmRlZmF1bHRTdXBlckNhbGwgPSBkZWZhdWx0U3VwZXJDYWxsO1xuICAkdHJhY2V1clJ1bnRpbWUuc3VwZXJDYWxsID0gc3VwZXJDYWxsO1xuICAkdHJhY2V1clJ1bnRpbWUuc3VwZXJHZXQgPSBzdXBlckdldDtcbiAgJHRyYWNldXJSdW50aW1lLnN1cGVyU2V0ID0gc3VwZXJTZXQ7XG59KSgpO1xuKGZ1bmN0aW9uKCkge1xuICAndXNlIHN0cmljdCc7XG4gIHZhciBjcmVhdGVQcml2YXRlTmFtZSA9ICR0cmFjZXVyUnVudGltZS5jcmVhdGVQcml2YXRlTmFtZTtcbiAgdmFyICRkZWZpbmVQcm9wZXJ0aWVzID0gJHRyYWNldXJSdW50aW1lLmRlZmluZVByb3BlcnRpZXM7XG4gIHZhciAkZGVmaW5lUHJvcGVydHkgPSAkdHJhY2V1clJ1bnRpbWUuZGVmaW5lUHJvcGVydHk7XG4gIHZhciAkY3JlYXRlID0gT2JqZWN0LmNyZWF0ZTtcbiAgdmFyICRUeXBlRXJyb3IgPSBUeXBlRXJyb3I7XG4gIGZ1bmN0aW9uIG5vbkVudW0odmFsdWUpIHtcbiAgICByZXR1cm4ge1xuICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICB3cml0YWJsZTogdHJ1ZVxuICAgIH07XG4gIH1cbiAgdmFyIFNUX05FV0JPUk4gPSAwO1xuICB2YXIgU1RfRVhFQ1VUSU5HID0gMTtcbiAgdmFyIFNUX1NVU1BFTkRFRCA9IDI7XG4gIHZhciBTVF9DTE9TRUQgPSAzO1xuICB2YXIgRU5EX1NUQVRFID0gLTI7XG4gIHZhciBSRVRIUk9XX1NUQVRFID0gLTM7XG4gIGZ1bmN0aW9uIGdldEludGVybmFsRXJyb3Ioc3RhdGUpIHtcbiAgICByZXR1cm4gbmV3IEVycm9yKCdUcmFjZXVyIGNvbXBpbGVyIGJ1ZzogaW52YWxpZCBzdGF0ZSBpbiBzdGF0ZSBtYWNoaW5lOiAnICsgc3RhdGUpO1xuICB9XG4gIGZ1bmN0aW9uIEdlbmVyYXRvckNvbnRleHQoKSB7XG4gICAgdGhpcy5zdGF0ZSA9IDA7XG4gICAgdGhpcy5HU3RhdGUgPSBTVF9ORVdCT1JOO1xuICAgIHRoaXMuc3RvcmVkRXhjZXB0aW9uID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuZmluYWxseUZhbGxUaHJvdWdoID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuc2VudF8gPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5yZXR1cm5WYWx1ZSA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLnRyeVN0YWNrXyA9IFtdO1xuICB9XG4gIEdlbmVyYXRvckNvbnRleHQucHJvdG90eXBlID0ge1xuICAgIHB1c2hUcnk6IGZ1bmN0aW9uKGNhdGNoU3RhdGUsIGZpbmFsbHlTdGF0ZSkge1xuICAgICAgaWYgKGZpbmFsbHlTdGF0ZSAhPT0gbnVsbCkge1xuICAgICAgICB2YXIgZmluYWxseUZhbGxUaHJvdWdoID0gbnVsbDtcbiAgICAgICAgZm9yICh2YXIgaSA9IHRoaXMudHJ5U3RhY2tfLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgaWYgKHRoaXMudHJ5U3RhY2tfW2ldLmNhdGNoICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGZpbmFsbHlGYWxsVGhyb3VnaCA9IHRoaXMudHJ5U3RhY2tfW2ldLmNhdGNoO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChmaW5hbGx5RmFsbFRocm91Z2ggPT09IG51bGwpXG4gICAgICAgICAgZmluYWxseUZhbGxUaHJvdWdoID0gUkVUSFJPV19TVEFURTtcbiAgICAgICAgdGhpcy50cnlTdGFja18ucHVzaCh7XG4gICAgICAgICAgZmluYWxseTogZmluYWxseVN0YXRlLFxuICAgICAgICAgIGZpbmFsbHlGYWxsVGhyb3VnaDogZmluYWxseUZhbGxUaHJvdWdoXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgaWYgKGNhdGNoU3RhdGUgIT09IG51bGwpIHtcbiAgICAgICAgdGhpcy50cnlTdGFja18ucHVzaCh7Y2F0Y2g6IGNhdGNoU3RhdGV9KTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHBvcFRyeTogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnRyeVN0YWNrXy5wb3AoKTtcbiAgICB9LFxuICAgIGdldCBzZW50KCkge1xuICAgICAgdGhpcy5tYXliZVRocm93KCk7XG4gICAgICByZXR1cm4gdGhpcy5zZW50XztcbiAgICB9LFxuICAgIHNldCBzZW50KHYpIHtcbiAgICAgIHRoaXMuc2VudF8gPSB2O1xuICAgIH0sXG4gICAgZ2V0IHNlbnRJZ25vcmVUaHJvdygpIHtcbiAgICAgIHJldHVybiB0aGlzLnNlbnRfO1xuICAgIH0sXG4gICAgbWF5YmVUaHJvdzogZnVuY3Rpb24oKSB7XG4gICAgICBpZiAodGhpcy5hY3Rpb24gPT09ICd0aHJvdycpIHtcbiAgICAgICAgdGhpcy5hY3Rpb24gPSAnbmV4dCc7XG4gICAgICAgIHRocm93IHRoaXMuc2VudF87XG4gICAgICB9XG4gICAgfSxcbiAgICBlbmQ6IGZ1bmN0aW9uKCkge1xuICAgICAgc3dpdGNoICh0aGlzLnN0YXRlKSB7XG4gICAgICAgIGNhc2UgRU5EX1NUQVRFOlxuICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICBjYXNlIFJFVEhST1dfU1RBVEU6XG4gICAgICAgICAgdGhyb3cgdGhpcy5zdG9yZWRFeGNlcHRpb247XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgdGhyb3cgZ2V0SW50ZXJuYWxFcnJvcih0aGlzLnN0YXRlKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGhhbmRsZUV4Y2VwdGlvbjogZnVuY3Rpb24oZXgpIHtcbiAgICAgIHRoaXMuR1N0YXRlID0gU1RfQ0xPU0VEO1xuICAgICAgdGhpcy5zdGF0ZSA9IEVORF9TVEFURTtcbiAgICAgIHRocm93IGV4O1xuICAgIH1cbiAgfTtcbiAgZnVuY3Rpb24gbmV4dE9yVGhyb3coY3R4LCBtb3ZlTmV4dCwgYWN0aW9uLCB4KSB7XG4gICAgc3dpdGNoIChjdHguR1N0YXRlKSB7XG4gICAgICBjYXNlIFNUX0VYRUNVVElORzpcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKChcIlxcXCJcIiArIGFjdGlvbiArIFwiXFxcIiBvbiBleGVjdXRpbmcgZ2VuZXJhdG9yXCIpKTtcbiAgICAgIGNhc2UgU1RfQ0xPU0VEOlxuICAgICAgICBpZiAoYWN0aW9uID09ICduZXh0Jykge1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB2YWx1ZTogdW5kZWZpbmVkLFxuICAgICAgICAgICAgZG9uZTogdHJ1ZVxuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgdGhyb3cgeDtcbiAgICAgIGNhc2UgU1RfTkVXQk9STjpcbiAgICAgICAgaWYgKGFjdGlvbiA9PT0gJ3Rocm93Jykge1xuICAgICAgICAgIGN0eC5HU3RhdGUgPSBTVF9DTE9TRUQ7XG4gICAgICAgICAgdGhyb3cgeDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoeCAhPT0gdW5kZWZpbmVkKVxuICAgICAgICAgIHRocm93ICRUeXBlRXJyb3IoJ1NlbnQgdmFsdWUgdG8gbmV3Ym9ybiBnZW5lcmF0b3InKTtcbiAgICAgIGNhc2UgU1RfU1VTUEVOREVEOlxuICAgICAgICBjdHguR1N0YXRlID0gU1RfRVhFQ1VUSU5HO1xuICAgICAgICBjdHguYWN0aW9uID0gYWN0aW9uO1xuICAgICAgICBjdHguc2VudCA9IHg7XG4gICAgICAgIHZhciB2YWx1ZSA9IG1vdmVOZXh0KGN0eCk7XG4gICAgICAgIHZhciBkb25lID0gdmFsdWUgPT09IGN0eDtcbiAgICAgICAgaWYgKGRvbmUpXG4gICAgICAgICAgdmFsdWUgPSBjdHgucmV0dXJuVmFsdWU7XG4gICAgICAgIGN0eC5HU3RhdGUgPSBkb25lID8gU1RfQ0xPU0VEIDogU1RfU1VTUEVOREVEO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgICAgICBkb25lOiBkb25lXG4gICAgICAgIH07XG4gICAgfVxuICB9XG4gIHZhciBjdHhOYW1lID0gY3JlYXRlUHJpdmF0ZU5hbWUoKTtcbiAgdmFyIG1vdmVOZXh0TmFtZSA9IGNyZWF0ZVByaXZhdGVOYW1lKCk7XG4gIGZ1bmN0aW9uIEdlbmVyYXRvckZ1bmN0aW9uKCkge31cbiAgZnVuY3Rpb24gR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGUoKSB7fVxuICBHZW5lcmF0b3JGdW5jdGlvbi5wcm90b3R5cGUgPSBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZTtcbiAgJGRlZmluZVByb3BlcnR5KEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlLCAnY29uc3RydWN0b3InLCBub25FbnVtKEdlbmVyYXRvckZ1bmN0aW9uKSk7XG4gIEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlLnByb3RvdHlwZSA9IHtcbiAgICBjb25zdHJ1Y3RvcjogR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGUsXG4gICAgbmV4dDogZnVuY3Rpb24odikge1xuICAgICAgcmV0dXJuIG5leHRPclRocm93KHRoaXNbY3R4TmFtZV0sIHRoaXNbbW92ZU5leHROYW1lXSwgJ25leHQnLCB2KTtcbiAgICB9LFxuICAgIHRocm93OiBmdW5jdGlvbih2KSB7XG4gICAgICByZXR1cm4gbmV4dE9yVGhyb3codGhpc1tjdHhOYW1lXSwgdGhpc1ttb3ZlTmV4dE5hbWVdLCAndGhyb3cnLCB2KTtcbiAgICB9XG4gIH07XG4gICRkZWZpbmVQcm9wZXJ0aWVzKEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlLnByb3RvdHlwZSwge1xuICAgIGNvbnN0cnVjdG9yOiB7ZW51bWVyYWJsZTogZmFsc2V9LFxuICAgIG5leHQ6IHtlbnVtZXJhYmxlOiBmYWxzZX0sXG4gICAgdGhyb3c6IHtlbnVtZXJhYmxlOiBmYWxzZX1cbiAgfSk7XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZS5wcm90b3R5cGUsIFN5bWJvbC5pdGVyYXRvciwgbm9uRW51bShmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfSkpO1xuICBmdW5jdGlvbiBjcmVhdGVHZW5lcmF0b3JJbnN0YW5jZShpbm5lckZ1bmN0aW9uLCBmdW5jdGlvbk9iamVjdCwgc2VsZikge1xuICAgIHZhciBtb3ZlTmV4dCA9IGdldE1vdmVOZXh0KGlubmVyRnVuY3Rpb24sIHNlbGYpO1xuICAgIHZhciBjdHggPSBuZXcgR2VuZXJhdG9yQ29udGV4dCgpO1xuICAgIHZhciBvYmplY3QgPSAkY3JlYXRlKGZ1bmN0aW9uT2JqZWN0LnByb3RvdHlwZSk7XG4gICAgb2JqZWN0W2N0eE5hbWVdID0gY3R4O1xuICAgIG9iamVjdFttb3ZlTmV4dE5hbWVdID0gbW92ZU5leHQ7XG4gICAgcmV0dXJuIG9iamVjdDtcbiAgfVxuICBmdW5jdGlvbiBpbml0R2VuZXJhdG9yRnVuY3Rpb24oZnVuY3Rpb25PYmplY3QpIHtcbiAgICBmdW5jdGlvbk9iamVjdC5wcm90b3R5cGUgPSAkY3JlYXRlKEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlLnByb3RvdHlwZSk7XG4gICAgZnVuY3Rpb25PYmplY3QuX19wcm90b19fID0gR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGU7XG4gICAgcmV0dXJuIGZ1bmN0aW9uT2JqZWN0O1xuICB9XG4gIGZ1bmN0aW9uIEFzeW5jRnVuY3Rpb25Db250ZXh0KCkge1xuICAgIEdlbmVyYXRvckNvbnRleHQuY2FsbCh0aGlzKTtcbiAgICB0aGlzLmVyciA9IHVuZGVmaW5lZDtcbiAgICB2YXIgY3R4ID0gdGhpcztcbiAgICBjdHgucmVzdWx0ID0gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICBjdHgucmVzb2x2ZSA9IHJlc29sdmU7XG4gICAgICBjdHgucmVqZWN0ID0gcmVqZWN0O1xuICAgIH0pO1xuICB9XG4gIEFzeW5jRnVuY3Rpb25Db250ZXh0LnByb3RvdHlwZSA9ICRjcmVhdGUoR2VuZXJhdG9yQ29udGV4dC5wcm90b3R5cGUpO1xuICBBc3luY0Z1bmN0aW9uQ29udGV4dC5wcm90b3R5cGUuZW5kID0gZnVuY3Rpb24oKSB7XG4gICAgc3dpdGNoICh0aGlzLnN0YXRlKSB7XG4gICAgICBjYXNlIEVORF9TVEFURTpcbiAgICAgICAgdGhpcy5yZXNvbHZlKHRoaXMucmV0dXJuVmFsdWUpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgUkVUSFJPV19TVEFURTpcbiAgICAgICAgdGhpcy5yZWplY3QodGhpcy5zdG9yZWRFeGNlcHRpb24pO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRoaXMucmVqZWN0KGdldEludGVybmFsRXJyb3IodGhpcy5zdGF0ZSkpO1xuICAgIH1cbiAgfTtcbiAgQXN5bmNGdW5jdGlvbkNvbnRleHQucHJvdG90eXBlLmhhbmRsZUV4Y2VwdGlvbiA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc3RhdGUgPSBSRVRIUk9XX1NUQVRFO1xuICB9O1xuICBmdW5jdGlvbiBhc3luY1dyYXAoaW5uZXJGdW5jdGlvbiwgc2VsZikge1xuICAgIHZhciBtb3ZlTmV4dCA9IGdldE1vdmVOZXh0KGlubmVyRnVuY3Rpb24sIHNlbGYpO1xuICAgIHZhciBjdHggPSBuZXcgQXN5bmNGdW5jdGlvbkNvbnRleHQoKTtcbiAgICBjdHguY3JlYXRlQ2FsbGJhY2sgPSBmdW5jdGlvbihuZXdTdGF0ZSkge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIGN0eC5zdGF0ZSA9IG5ld1N0YXRlO1xuICAgICAgICBjdHgudmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgbW92ZU5leHQoY3R4KTtcbiAgICAgIH07XG4gICAgfTtcbiAgICBjdHguZXJyYmFjayA9IGZ1bmN0aW9uKGVycikge1xuICAgICAgaGFuZGxlQ2F0Y2goY3R4LCBlcnIpO1xuICAgICAgbW92ZU5leHQoY3R4KTtcbiAgICB9O1xuICAgIG1vdmVOZXh0KGN0eCk7XG4gICAgcmV0dXJuIGN0eC5yZXN1bHQ7XG4gIH1cbiAgZnVuY3Rpb24gZ2V0TW92ZU5leHQoaW5uZXJGdW5jdGlvbiwgc2VsZikge1xuICAgIHJldHVybiBmdW5jdGlvbihjdHgpIHtcbiAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgcmV0dXJuIGlubmVyRnVuY3Rpb24uY2FsbChzZWxmLCBjdHgpO1xuICAgICAgICB9IGNhdGNoIChleCkge1xuICAgICAgICAgIGhhbmRsZUNhdGNoKGN0eCwgZXgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcbiAgfVxuICBmdW5jdGlvbiBoYW5kbGVDYXRjaChjdHgsIGV4KSB7XG4gICAgY3R4LnN0b3JlZEV4Y2VwdGlvbiA9IGV4O1xuICAgIHZhciBsYXN0ID0gY3R4LnRyeVN0YWNrX1tjdHgudHJ5U3RhY2tfLmxlbmd0aCAtIDFdO1xuICAgIGlmICghbGFzdCkge1xuICAgICAgY3R4LmhhbmRsZUV4Y2VwdGlvbihleCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGN0eC5zdGF0ZSA9IGxhc3QuY2F0Y2ggIT09IHVuZGVmaW5lZCA/IGxhc3QuY2F0Y2ggOiBsYXN0LmZpbmFsbHk7XG4gICAgaWYgKGxhc3QuZmluYWxseUZhbGxUaHJvdWdoICE9PSB1bmRlZmluZWQpXG4gICAgICBjdHguZmluYWxseUZhbGxUaHJvdWdoID0gbGFzdC5maW5hbGx5RmFsbFRocm91Z2g7XG4gIH1cbiAgJHRyYWNldXJSdW50aW1lLmFzeW5jV3JhcCA9IGFzeW5jV3JhcDtcbiAgJHRyYWNldXJSdW50aW1lLmluaXRHZW5lcmF0b3JGdW5jdGlvbiA9IGluaXRHZW5lcmF0b3JGdW5jdGlvbjtcbiAgJHRyYWNldXJSdW50aW1lLmNyZWF0ZUdlbmVyYXRvckluc3RhbmNlID0gY3JlYXRlR2VuZXJhdG9ySW5zdGFuY2U7XG59KSgpO1xuKGZ1bmN0aW9uKCkge1xuICBmdW5jdGlvbiBidWlsZEZyb21FbmNvZGVkUGFydHMob3B0X3NjaGVtZSwgb3B0X3VzZXJJbmZvLCBvcHRfZG9tYWluLCBvcHRfcG9ydCwgb3B0X3BhdGgsIG9wdF9xdWVyeURhdGEsIG9wdF9mcmFnbWVudCkge1xuICAgIHZhciBvdXQgPSBbXTtcbiAgICBpZiAob3B0X3NjaGVtZSkge1xuICAgICAgb3V0LnB1c2gob3B0X3NjaGVtZSwgJzonKTtcbiAgICB9XG4gICAgaWYgKG9wdF9kb21haW4pIHtcbiAgICAgIG91dC5wdXNoKCcvLycpO1xuICAgICAgaWYgKG9wdF91c2VySW5mbykge1xuICAgICAgICBvdXQucHVzaChvcHRfdXNlckluZm8sICdAJyk7XG4gICAgICB9XG4gICAgICBvdXQucHVzaChvcHRfZG9tYWluKTtcbiAgICAgIGlmIChvcHRfcG9ydCkge1xuICAgICAgICBvdXQucHVzaCgnOicsIG9wdF9wb3J0KTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKG9wdF9wYXRoKSB7XG4gICAgICBvdXQucHVzaChvcHRfcGF0aCk7XG4gICAgfVxuICAgIGlmIChvcHRfcXVlcnlEYXRhKSB7XG4gICAgICBvdXQucHVzaCgnPycsIG9wdF9xdWVyeURhdGEpO1xuICAgIH1cbiAgICBpZiAob3B0X2ZyYWdtZW50KSB7XG4gICAgICBvdXQucHVzaCgnIycsIG9wdF9mcmFnbWVudCk7XG4gICAgfVxuICAgIHJldHVybiBvdXQuam9pbignJyk7XG4gIH1cbiAgO1xuICB2YXIgc3BsaXRSZSA9IG5ldyBSZWdFeHAoJ14nICsgJyg/OicgKyAnKFteOi8/Iy5dKyknICsgJzopPycgKyAnKD86Ly8nICsgJyg/OihbXi8/I10qKUApPycgKyAnKFtcXFxcd1xcXFxkXFxcXC1cXFxcdTAxMDAtXFxcXHVmZmZmLiVdKiknICsgJyg/OjooWzAtOV0rKSk/JyArICcpPycgKyAnKFtePyNdKyk/JyArICcoPzpcXFxcPyhbXiNdKikpPycgKyAnKD86IyguKikpPycgKyAnJCcpO1xuICB2YXIgQ29tcG9uZW50SW5kZXggPSB7XG4gICAgU0NIRU1FOiAxLFxuICAgIFVTRVJfSU5GTzogMixcbiAgICBET01BSU46IDMsXG4gICAgUE9SVDogNCxcbiAgICBQQVRIOiA1LFxuICAgIFFVRVJZX0RBVEE6IDYsXG4gICAgRlJBR01FTlQ6IDdcbiAgfTtcbiAgZnVuY3Rpb24gc3BsaXQodXJpKSB7XG4gICAgcmV0dXJuICh1cmkubWF0Y2goc3BsaXRSZSkpO1xuICB9XG4gIGZ1bmN0aW9uIHJlbW92ZURvdFNlZ21lbnRzKHBhdGgpIHtcbiAgICBpZiAocGF0aCA9PT0gJy8nKVxuICAgICAgcmV0dXJuICcvJztcbiAgICB2YXIgbGVhZGluZ1NsYXNoID0gcGF0aFswXSA9PT0gJy8nID8gJy8nIDogJyc7XG4gICAgdmFyIHRyYWlsaW5nU2xhc2ggPSBwYXRoLnNsaWNlKC0xKSA9PT0gJy8nID8gJy8nIDogJyc7XG4gICAgdmFyIHNlZ21lbnRzID0gcGF0aC5zcGxpdCgnLycpO1xuICAgIHZhciBvdXQgPSBbXTtcbiAgICB2YXIgdXAgPSAwO1xuICAgIGZvciAodmFyIHBvcyA9IDA7IHBvcyA8IHNlZ21lbnRzLmxlbmd0aDsgcG9zKyspIHtcbiAgICAgIHZhciBzZWdtZW50ID0gc2VnbWVudHNbcG9zXTtcbiAgICAgIHN3aXRjaCAoc2VnbWVudCkge1xuICAgICAgICBjYXNlICcnOlxuICAgICAgICBjYXNlICcuJzpcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnLi4nOlxuICAgICAgICAgIGlmIChvdXQubGVuZ3RoKVxuICAgICAgICAgICAgb3V0LnBvcCgpO1xuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIHVwKys7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgb3V0LnB1c2goc2VnbWVudCk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmICghbGVhZGluZ1NsYXNoKSB7XG4gICAgICB3aGlsZSAodXAtLSA+IDApIHtcbiAgICAgICAgb3V0LnVuc2hpZnQoJy4uJyk7XG4gICAgICB9XG4gICAgICBpZiAob3V0Lmxlbmd0aCA9PT0gMClcbiAgICAgICAgb3V0LnB1c2goJy4nKTtcbiAgICB9XG4gICAgcmV0dXJuIGxlYWRpbmdTbGFzaCArIG91dC5qb2luKCcvJykgKyB0cmFpbGluZ1NsYXNoO1xuICB9XG4gIGZ1bmN0aW9uIGpvaW5BbmRDYW5vbmljYWxpemVQYXRoKHBhcnRzKSB7XG4gICAgdmFyIHBhdGggPSBwYXJ0c1tDb21wb25lbnRJbmRleC5QQVRIXSB8fCAnJztcbiAgICBwYXRoID0gcmVtb3ZlRG90U2VnbWVudHMocGF0aCk7XG4gICAgcGFydHNbQ29tcG9uZW50SW5kZXguUEFUSF0gPSBwYXRoO1xuICAgIHJldHVybiBidWlsZEZyb21FbmNvZGVkUGFydHMocGFydHNbQ29tcG9uZW50SW5kZXguU0NIRU1FXSwgcGFydHNbQ29tcG9uZW50SW5kZXguVVNFUl9JTkZPXSwgcGFydHNbQ29tcG9uZW50SW5kZXguRE9NQUlOXSwgcGFydHNbQ29tcG9uZW50SW5kZXguUE9SVF0sIHBhcnRzW0NvbXBvbmVudEluZGV4LlBBVEhdLCBwYXJ0c1tDb21wb25lbnRJbmRleC5RVUVSWV9EQVRBXSwgcGFydHNbQ29tcG9uZW50SW5kZXguRlJBR01FTlRdKTtcbiAgfVxuICBmdW5jdGlvbiBjYW5vbmljYWxpemVVcmwodXJsKSB7XG4gICAgdmFyIHBhcnRzID0gc3BsaXQodXJsKTtcbiAgICByZXR1cm4gam9pbkFuZENhbm9uaWNhbGl6ZVBhdGgocGFydHMpO1xuICB9XG4gIGZ1bmN0aW9uIHJlc29sdmVVcmwoYmFzZSwgdXJsKSB7XG4gICAgdmFyIHBhcnRzID0gc3BsaXQodXJsKTtcbiAgICB2YXIgYmFzZVBhcnRzID0gc3BsaXQoYmFzZSk7XG4gICAgaWYgKHBhcnRzW0NvbXBvbmVudEluZGV4LlNDSEVNRV0pIHtcbiAgICAgIHJldHVybiBqb2luQW5kQ2Fub25pY2FsaXplUGF0aChwYXJ0cyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHBhcnRzW0NvbXBvbmVudEluZGV4LlNDSEVNRV0gPSBiYXNlUGFydHNbQ29tcG9uZW50SW5kZXguU0NIRU1FXTtcbiAgICB9XG4gICAgZm9yICh2YXIgaSA9IENvbXBvbmVudEluZGV4LlNDSEVNRTsgaSA8PSBDb21wb25lbnRJbmRleC5QT1JUOyBpKyspIHtcbiAgICAgIGlmICghcGFydHNbaV0pIHtcbiAgICAgICAgcGFydHNbaV0gPSBiYXNlUGFydHNbaV07XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChwYXJ0c1tDb21wb25lbnRJbmRleC5QQVRIXVswXSA9PSAnLycpIHtcbiAgICAgIHJldHVybiBqb2luQW5kQ2Fub25pY2FsaXplUGF0aChwYXJ0cyk7XG4gICAgfVxuICAgIHZhciBwYXRoID0gYmFzZVBhcnRzW0NvbXBvbmVudEluZGV4LlBBVEhdO1xuICAgIHZhciBpbmRleCA9IHBhdGgubGFzdEluZGV4T2YoJy8nKTtcbiAgICBwYXRoID0gcGF0aC5zbGljZSgwLCBpbmRleCArIDEpICsgcGFydHNbQ29tcG9uZW50SW5kZXguUEFUSF07XG4gICAgcGFydHNbQ29tcG9uZW50SW5kZXguUEFUSF0gPSBwYXRoO1xuICAgIHJldHVybiBqb2luQW5kQ2Fub25pY2FsaXplUGF0aChwYXJ0cyk7XG4gIH1cbiAgZnVuY3Rpb24gaXNBYnNvbHV0ZShuYW1lKSB7XG4gICAgaWYgKCFuYW1lKVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIGlmIChuYW1lWzBdID09PSAnLycpXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB2YXIgcGFydHMgPSBzcGxpdChuYW1lKTtcbiAgICBpZiAocGFydHNbQ29tcG9uZW50SW5kZXguU0NIRU1FXSlcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICAkdHJhY2V1clJ1bnRpbWUuY2Fub25pY2FsaXplVXJsID0gY2Fub25pY2FsaXplVXJsO1xuICAkdHJhY2V1clJ1bnRpbWUuaXNBYnNvbHV0ZSA9IGlzQWJzb2x1dGU7XG4gICR0cmFjZXVyUnVudGltZS5yZW1vdmVEb3RTZWdtZW50cyA9IHJlbW92ZURvdFNlZ21lbnRzO1xuICAkdHJhY2V1clJ1bnRpbWUucmVzb2x2ZVVybCA9IHJlc29sdmVVcmw7XG59KSgpO1xuKGZ1bmN0aW9uKGdsb2JhbCkge1xuICAndXNlIHN0cmljdCc7XG4gIHZhciAkX18yID0gJHRyYWNldXJSdW50aW1lLFxuICAgICAgY2Fub25pY2FsaXplVXJsID0gJF9fMi5jYW5vbmljYWxpemVVcmwsXG4gICAgICByZXNvbHZlVXJsID0gJF9fMi5yZXNvbHZlVXJsLFxuICAgICAgaXNBYnNvbHV0ZSA9ICRfXzIuaXNBYnNvbHV0ZTtcbiAgdmFyIG1vZHVsZUluc3RhbnRpYXRvcnMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICB2YXIgYmFzZVVSTDtcbiAgaWYgKGdsb2JhbC5sb2NhdGlvbiAmJiBnbG9iYWwubG9jYXRpb24uaHJlZilcbiAgICBiYXNlVVJMID0gcmVzb2x2ZVVybChnbG9iYWwubG9jYXRpb24uaHJlZiwgJy4vJyk7XG4gIGVsc2VcbiAgICBiYXNlVVJMID0gJyc7XG4gIHZhciBVbmNvYXRlZE1vZHVsZUVudHJ5ID0gZnVuY3Rpb24gVW5jb2F0ZWRNb2R1bGVFbnRyeSh1cmwsIHVuY29hdGVkTW9kdWxlKSB7XG4gICAgdGhpcy51cmwgPSB1cmw7XG4gICAgdGhpcy52YWx1ZV8gPSB1bmNvYXRlZE1vZHVsZTtcbiAgfTtcbiAgKCR0cmFjZXVyUnVudGltZS5jcmVhdGVDbGFzcykoVW5jb2F0ZWRNb2R1bGVFbnRyeSwge30sIHt9KTtcbiAgdmFyIE1vZHVsZUV2YWx1YXRpb25FcnJvciA9IGZ1bmN0aW9uIE1vZHVsZUV2YWx1YXRpb25FcnJvcihlcnJvbmVvdXNNb2R1bGVOYW1lLCBjYXVzZSkge1xuICAgIHRoaXMubWVzc2FnZSA9IHRoaXMuY29uc3RydWN0b3IubmFtZSArICc6ICcgKyB0aGlzLnN0cmlwQ2F1c2UoY2F1c2UpICsgJyBpbiAnICsgZXJyb25lb3VzTW9kdWxlTmFtZTtcbiAgICBpZiAoIShjYXVzZSBpbnN0YW5jZW9mICRNb2R1bGVFdmFsdWF0aW9uRXJyb3IpICYmIGNhdXNlLnN0YWNrKVxuICAgICAgdGhpcy5zdGFjayA9IHRoaXMuc3RyaXBTdGFjayhjYXVzZS5zdGFjayk7XG4gICAgZWxzZVxuICAgICAgdGhpcy5zdGFjayA9ICcnO1xuICB9O1xuICB2YXIgJE1vZHVsZUV2YWx1YXRpb25FcnJvciA9IE1vZHVsZUV2YWx1YXRpb25FcnJvcjtcbiAgKCR0cmFjZXVyUnVudGltZS5jcmVhdGVDbGFzcykoTW9kdWxlRXZhbHVhdGlvbkVycm9yLCB7XG4gICAgc3RyaXBFcnJvcjogZnVuY3Rpb24obWVzc2FnZSkge1xuICAgICAgcmV0dXJuIG1lc3NhZ2UucmVwbGFjZSgvLipFcnJvcjovLCB0aGlzLmNvbnN0cnVjdG9yLm5hbWUgKyAnOicpO1xuICAgIH0sXG4gICAgc3RyaXBDYXVzZTogZnVuY3Rpb24oY2F1c2UpIHtcbiAgICAgIGlmICghY2F1c2UpXG4gICAgICAgIHJldHVybiAnJztcbiAgICAgIGlmICghY2F1c2UubWVzc2FnZSlcbiAgICAgICAgcmV0dXJuIGNhdXNlICsgJyc7XG4gICAgICByZXR1cm4gdGhpcy5zdHJpcEVycm9yKGNhdXNlLm1lc3NhZ2UpO1xuICAgIH0sXG4gICAgbG9hZGVkQnk6IGZ1bmN0aW9uKG1vZHVsZU5hbWUpIHtcbiAgICAgIHRoaXMuc3RhY2sgKz0gJ1xcbiBsb2FkZWQgYnkgJyArIG1vZHVsZU5hbWU7XG4gICAgfSxcbiAgICBzdHJpcFN0YWNrOiBmdW5jdGlvbihjYXVzZVN0YWNrKSB7XG4gICAgICB2YXIgc3RhY2sgPSBbXTtcbiAgICAgIGNhdXNlU3RhY2suc3BsaXQoJ1xcbicpLnNvbWUoKGZ1bmN0aW9uKGZyYW1lKSB7XG4gICAgICAgIGlmICgvVW5jb2F0ZWRNb2R1bGVJbnN0YW50aWF0b3IvLnRlc3QoZnJhbWUpKVxuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICBzdGFjay5wdXNoKGZyYW1lKTtcbiAgICAgIH0pKTtcbiAgICAgIHN0YWNrWzBdID0gdGhpcy5zdHJpcEVycm9yKHN0YWNrWzBdKTtcbiAgICAgIHJldHVybiBzdGFjay5qb2luKCdcXG4nKTtcbiAgICB9XG4gIH0sIHt9LCBFcnJvcik7XG4gIHZhciBVbmNvYXRlZE1vZHVsZUluc3RhbnRpYXRvciA9IGZ1bmN0aW9uIFVuY29hdGVkTW9kdWxlSW5zdGFudGlhdG9yKHVybCwgZnVuYykge1xuICAgICR0cmFjZXVyUnVudGltZS5zdXBlckNhbGwodGhpcywgJFVuY29hdGVkTW9kdWxlSW5zdGFudGlhdG9yLnByb3RvdHlwZSwgXCJjb25zdHJ1Y3RvclwiLCBbdXJsLCBudWxsXSk7XG4gICAgdGhpcy5mdW5jID0gZnVuYztcbiAgfTtcbiAgdmFyICRVbmNvYXRlZE1vZHVsZUluc3RhbnRpYXRvciA9IFVuY29hdGVkTW9kdWxlSW5zdGFudGlhdG9yO1xuICAoJHRyYWNldXJSdW50aW1lLmNyZWF0ZUNsYXNzKShVbmNvYXRlZE1vZHVsZUluc3RhbnRpYXRvciwge2dldFVuY29hdGVkTW9kdWxlOiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICh0aGlzLnZhbHVlXylcbiAgICAgICAgcmV0dXJuIHRoaXMudmFsdWVfO1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIHRoaXMudmFsdWVfID0gdGhpcy5mdW5jLmNhbGwoZ2xvYmFsKTtcbiAgICAgIH0gY2F0Y2ggKGV4KSB7XG4gICAgICAgIGlmIChleCBpbnN0YW5jZW9mIE1vZHVsZUV2YWx1YXRpb25FcnJvcikge1xuICAgICAgICAgIGV4LmxvYWRlZEJ5KHRoaXMudXJsKTtcbiAgICAgICAgICB0aHJvdyBleDtcbiAgICAgICAgfVxuICAgICAgICB0aHJvdyBuZXcgTW9kdWxlRXZhbHVhdGlvbkVycm9yKHRoaXMudXJsLCBleCk7XG4gICAgICB9XG4gICAgfX0sIHt9LCBVbmNvYXRlZE1vZHVsZUVudHJ5KTtcbiAgZnVuY3Rpb24gZ2V0VW5jb2F0ZWRNb2R1bGVJbnN0YW50aWF0b3IobmFtZSkge1xuICAgIGlmICghbmFtZSlcbiAgICAgIHJldHVybjtcbiAgICB2YXIgdXJsID0gTW9kdWxlU3RvcmUubm9ybWFsaXplKG5hbWUpO1xuICAgIHJldHVybiBtb2R1bGVJbnN0YW50aWF0b3JzW3VybF07XG4gIH1cbiAgO1xuICB2YXIgbW9kdWxlSW5zdGFuY2VzID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgdmFyIGxpdmVNb2R1bGVTZW50aW5lbCA9IHt9O1xuICBmdW5jdGlvbiBNb2R1bGUodW5jb2F0ZWRNb2R1bGUpIHtcbiAgICB2YXIgaXNMaXZlID0gYXJndW1lbnRzWzFdO1xuICAgIHZhciBjb2F0ZWRNb2R1bGUgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHVuY29hdGVkTW9kdWxlKS5mb3JFYWNoKChmdW5jdGlvbihuYW1lKSB7XG4gICAgICB2YXIgZ2V0dGVyLFxuICAgICAgICAgIHZhbHVlO1xuICAgICAgaWYgKGlzTGl2ZSA9PT0gbGl2ZU1vZHVsZVNlbnRpbmVsKSB7XG4gICAgICAgIHZhciBkZXNjciA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodW5jb2F0ZWRNb2R1bGUsIG5hbWUpO1xuICAgICAgICBpZiAoZGVzY3IuZ2V0KVxuICAgICAgICAgIGdldHRlciA9IGRlc2NyLmdldDtcbiAgICAgIH1cbiAgICAgIGlmICghZ2V0dGVyKSB7XG4gICAgICAgIHZhbHVlID0gdW5jb2F0ZWRNb2R1bGVbbmFtZV07XG4gICAgICAgIGdldHRlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShjb2F0ZWRNb2R1bGUsIG5hbWUsIHtcbiAgICAgICAgZ2V0OiBnZXR0ZXIsXG4gICAgICAgIGVudW1lcmFibGU6IHRydWVcbiAgICAgIH0pO1xuICAgIH0pKTtcbiAgICBPYmplY3QucHJldmVudEV4dGVuc2lvbnMoY29hdGVkTW9kdWxlKTtcbiAgICByZXR1cm4gY29hdGVkTW9kdWxlO1xuICB9XG4gIHZhciBNb2R1bGVTdG9yZSA9IHtcbiAgICBub3JtYWxpemU6IGZ1bmN0aW9uKG5hbWUsIHJlZmVyZXJOYW1lLCByZWZlcmVyQWRkcmVzcykge1xuICAgICAgaWYgKHR5cGVvZiBuYW1lICE9PSBcInN0cmluZ1wiKVxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwibW9kdWxlIG5hbWUgbXVzdCBiZSBhIHN0cmluZywgbm90IFwiICsgdHlwZW9mIG5hbWUpO1xuICAgICAgaWYgKGlzQWJzb2x1dGUobmFtZSkpXG4gICAgICAgIHJldHVybiBjYW5vbmljYWxpemVVcmwobmFtZSk7XG4gICAgICBpZiAoL1teXFwuXVxcL1xcLlxcLlxcLy8udGVzdChuYW1lKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ21vZHVsZSBuYW1lIGVtYmVkcyAvLi4vOiAnICsgbmFtZSk7XG4gICAgICB9XG4gICAgICBpZiAobmFtZVswXSA9PT0gJy4nICYmIHJlZmVyZXJOYW1lKVxuICAgICAgICByZXR1cm4gcmVzb2x2ZVVybChyZWZlcmVyTmFtZSwgbmFtZSk7XG4gICAgICByZXR1cm4gY2Fub25pY2FsaXplVXJsKG5hbWUpO1xuICAgIH0sXG4gICAgZ2V0OiBmdW5jdGlvbihub3JtYWxpemVkTmFtZSkge1xuICAgICAgdmFyIG0gPSBnZXRVbmNvYXRlZE1vZHVsZUluc3RhbnRpYXRvcihub3JtYWxpemVkTmFtZSk7XG4gICAgICBpZiAoIW0pXG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICB2YXIgbW9kdWxlSW5zdGFuY2UgPSBtb2R1bGVJbnN0YW5jZXNbbS51cmxdO1xuICAgICAgaWYgKG1vZHVsZUluc3RhbmNlKVxuICAgICAgICByZXR1cm4gbW9kdWxlSW5zdGFuY2U7XG4gICAgICBtb2R1bGVJbnN0YW5jZSA9IE1vZHVsZShtLmdldFVuY29hdGVkTW9kdWxlKCksIGxpdmVNb2R1bGVTZW50aW5lbCk7XG4gICAgICByZXR1cm4gbW9kdWxlSW5zdGFuY2VzW20udXJsXSA9IG1vZHVsZUluc3RhbmNlO1xuICAgIH0sXG4gICAgc2V0OiBmdW5jdGlvbihub3JtYWxpemVkTmFtZSwgbW9kdWxlKSB7XG4gICAgICBub3JtYWxpemVkTmFtZSA9IFN0cmluZyhub3JtYWxpemVkTmFtZSk7XG4gICAgICBtb2R1bGVJbnN0YW50aWF0b3JzW25vcm1hbGl6ZWROYW1lXSA9IG5ldyBVbmNvYXRlZE1vZHVsZUluc3RhbnRpYXRvcihub3JtYWxpemVkTmFtZSwgKGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gbW9kdWxlO1xuICAgICAgfSkpO1xuICAgICAgbW9kdWxlSW5zdGFuY2VzW25vcm1hbGl6ZWROYW1lXSA9IG1vZHVsZTtcbiAgICB9LFxuICAgIGdldCBiYXNlVVJMKCkge1xuICAgICAgcmV0dXJuIGJhc2VVUkw7XG4gICAgfSxcbiAgICBzZXQgYmFzZVVSTCh2KSB7XG4gICAgICBiYXNlVVJMID0gU3RyaW5nKHYpO1xuICAgIH0sXG4gICAgcmVnaXN0ZXJNb2R1bGU6IGZ1bmN0aW9uKG5hbWUsIGZ1bmMpIHtcbiAgICAgIHZhciBub3JtYWxpemVkTmFtZSA9IE1vZHVsZVN0b3JlLm5vcm1hbGl6ZShuYW1lKTtcbiAgICAgIGlmIChtb2R1bGVJbnN0YW50aWF0b3JzW25vcm1hbGl6ZWROYW1lXSlcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdkdXBsaWNhdGUgbW9kdWxlIG5hbWVkICcgKyBub3JtYWxpemVkTmFtZSk7XG4gICAgICBtb2R1bGVJbnN0YW50aWF0b3JzW25vcm1hbGl6ZWROYW1lXSA9IG5ldyBVbmNvYXRlZE1vZHVsZUluc3RhbnRpYXRvcihub3JtYWxpemVkTmFtZSwgZnVuYyk7XG4gICAgfSxcbiAgICBidW5kbGVTdG9yZTogT2JqZWN0LmNyZWF0ZShudWxsKSxcbiAgICByZWdpc3RlcjogZnVuY3Rpb24obmFtZSwgZGVwcywgZnVuYykge1xuICAgICAgaWYgKCFkZXBzIHx8ICFkZXBzLmxlbmd0aCAmJiAhZnVuYy5sZW5ndGgpIHtcbiAgICAgICAgdGhpcy5yZWdpc3Rlck1vZHVsZShuYW1lLCBmdW5jKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuYnVuZGxlU3RvcmVbbmFtZV0gPSB7XG4gICAgICAgICAgZGVwczogZGVwcyxcbiAgICAgICAgICBleGVjdXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciAkX18wID0gYXJndW1lbnRzO1xuICAgICAgICAgICAgdmFyIGRlcE1hcCA9IHt9O1xuICAgICAgICAgICAgZGVwcy5mb3JFYWNoKChmdW5jdGlvbihkZXAsIGluZGV4KSB7XG4gICAgICAgICAgICAgIHJldHVybiBkZXBNYXBbZGVwXSA9ICRfXzBbaW5kZXhdO1xuICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgdmFyIHJlZ2lzdHJ5RW50cnkgPSBmdW5jLmNhbGwodGhpcywgZGVwTWFwKTtcbiAgICAgICAgICAgIHJlZ2lzdHJ5RW50cnkuZXhlY3V0ZS5jYWxsKHRoaXMpO1xuICAgICAgICAgICAgcmV0dXJuIHJlZ2lzdHJ5RW50cnkuZXhwb3J0cztcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfSxcbiAgICBnZXRBbm9ueW1vdXNNb2R1bGU6IGZ1bmN0aW9uKGZ1bmMpIHtcbiAgICAgIHJldHVybiBuZXcgTW9kdWxlKGZ1bmMuY2FsbChnbG9iYWwpLCBsaXZlTW9kdWxlU2VudGluZWwpO1xuICAgIH0sXG4gICAgZ2V0Rm9yVGVzdGluZzogZnVuY3Rpb24obmFtZSkge1xuICAgICAgdmFyICRfXzAgPSB0aGlzO1xuICAgICAgaWYgKCF0aGlzLnRlc3RpbmdQcmVmaXhfKSB7XG4gICAgICAgIE9iamVjdC5rZXlzKG1vZHVsZUluc3RhbmNlcykuc29tZSgoZnVuY3Rpb24oa2V5KSB7XG4gICAgICAgICAgdmFyIG0gPSAvKHRyYWNldXJAW15cXC9dKlxcLykvLmV4ZWMoa2V5KTtcbiAgICAgICAgICBpZiAobSkge1xuICAgICAgICAgICAgJF9fMC50ZXN0aW5nUHJlZml4XyA9IG1bMV07XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLmdldCh0aGlzLnRlc3RpbmdQcmVmaXhfICsgbmFtZSk7XG4gICAgfVxuICB9O1xuICBNb2R1bGVTdG9yZS5zZXQoJ0B0cmFjZXVyL3NyYy9ydW50aW1lL01vZHVsZVN0b3JlJywgbmV3IE1vZHVsZSh7TW9kdWxlU3RvcmU6IE1vZHVsZVN0b3JlfSkpO1xuICB2YXIgc2V0dXBHbG9iYWxzID0gJHRyYWNldXJSdW50aW1lLnNldHVwR2xvYmFscztcbiAgJHRyYWNldXJSdW50aW1lLnNldHVwR2xvYmFscyA9IGZ1bmN0aW9uKGdsb2JhbCkge1xuICAgIHNldHVwR2xvYmFscyhnbG9iYWwpO1xuICB9O1xuICAkdHJhY2V1clJ1bnRpbWUuTW9kdWxlU3RvcmUgPSBNb2R1bGVTdG9yZTtcbiAgZ2xvYmFsLlN5c3RlbSA9IHtcbiAgICByZWdpc3RlcjogTW9kdWxlU3RvcmUucmVnaXN0ZXIuYmluZChNb2R1bGVTdG9yZSksXG4gICAgZ2V0OiBNb2R1bGVTdG9yZS5nZXQsXG4gICAgc2V0OiBNb2R1bGVTdG9yZS5zZXQsXG4gICAgbm9ybWFsaXplOiBNb2R1bGVTdG9yZS5ub3JtYWxpemVcbiAgfTtcbiAgJHRyYWNldXJSdW50aW1lLmdldE1vZHVsZUltcGwgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgdmFyIGluc3RhbnRpYXRvciA9IGdldFVuY29hdGVkTW9kdWxlSW5zdGFudGlhdG9yKG5hbWUpO1xuICAgIHJldHVybiBpbnN0YW50aWF0b3IgJiYgaW5zdGFudGlhdG9yLmdldFVuY29hdGVkTW9kdWxlKCk7XG4gIH07XG59KSh0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJyA/IGdsb2JhbCA6IHRoaXMpO1xuU3lzdGVtLnJlZ2lzdGVyKFwidHJhY2V1ci1ydW50aW1lQDAuMC43Mi9zcmMvcnVudGltZS9wb2x5ZmlsbHMvdXRpbHNcIiwgW10sIGZ1bmN0aW9uKCkge1xuICBcInVzZSBzdHJpY3RcIjtcbiAgdmFyIF9fbW9kdWxlTmFtZSA9IFwidHJhY2V1ci1ydW50aW1lQDAuMC43Mi9zcmMvcnVudGltZS9wb2x5ZmlsbHMvdXRpbHNcIjtcbiAgdmFyICRjZWlsID0gTWF0aC5jZWlsO1xuICB2YXIgJGZsb29yID0gTWF0aC5mbG9vcjtcbiAgdmFyICRpc0Zpbml0ZSA9IGlzRmluaXRlO1xuICB2YXIgJGlzTmFOID0gaXNOYU47XG4gIHZhciAkcG93ID0gTWF0aC5wb3c7XG4gIHZhciAkbWluID0gTWF0aC5taW47XG4gIHZhciB0b09iamVjdCA9ICR0cmFjZXVyUnVudGltZS50b09iamVjdDtcbiAgZnVuY3Rpb24gdG9VaW50MzIoeCkge1xuICAgIHJldHVybiB4ID4+PiAwO1xuICB9XG4gIGZ1bmN0aW9uIGlzT2JqZWN0KHgpIHtcbiAgICByZXR1cm4geCAmJiAodHlwZW9mIHggPT09ICdvYmplY3QnIHx8IHR5cGVvZiB4ID09PSAnZnVuY3Rpb24nKTtcbiAgfVxuICBmdW5jdGlvbiBpc0NhbGxhYmxlKHgpIHtcbiAgICByZXR1cm4gdHlwZW9mIHggPT09ICdmdW5jdGlvbic7XG4gIH1cbiAgZnVuY3Rpb24gaXNOdW1iZXIoeCkge1xuICAgIHJldHVybiB0eXBlb2YgeCA9PT0gJ251bWJlcic7XG4gIH1cbiAgZnVuY3Rpb24gdG9JbnRlZ2VyKHgpIHtcbiAgICB4ID0gK3g7XG4gICAgaWYgKCRpc05hTih4KSlcbiAgICAgIHJldHVybiAwO1xuICAgIGlmICh4ID09PSAwIHx8ICEkaXNGaW5pdGUoeCkpXG4gICAgICByZXR1cm4geDtcbiAgICByZXR1cm4geCA+IDAgPyAkZmxvb3IoeCkgOiAkY2VpbCh4KTtcbiAgfVxuICB2YXIgTUFYX1NBRkVfTEVOR1RIID0gJHBvdygyLCA1MykgLSAxO1xuICBmdW5jdGlvbiB0b0xlbmd0aCh4KSB7XG4gICAgdmFyIGxlbiA9IHRvSW50ZWdlcih4KTtcbiAgICByZXR1cm4gbGVuIDwgMCA/IDAgOiAkbWluKGxlbiwgTUFYX1NBRkVfTEVOR1RIKTtcbiAgfVxuICBmdW5jdGlvbiBjaGVja0l0ZXJhYmxlKHgpIHtcbiAgICByZXR1cm4gIWlzT2JqZWN0KHgpID8gdW5kZWZpbmVkIDogeFtTeW1ib2wuaXRlcmF0b3JdO1xuICB9XG4gIGZ1bmN0aW9uIGlzQ29uc3RydWN0b3IoeCkge1xuICAgIHJldHVybiBpc0NhbGxhYmxlKHgpO1xuICB9XG4gIGZ1bmN0aW9uIGNyZWF0ZUl0ZXJhdG9yUmVzdWx0T2JqZWN0KHZhbHVlLCBkb25lKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgIGRvbmU6IGRvbmVcbiAgICB9O1xuICB9XG4gIGZ1bmN0aW9uIG1heWJlRGVmaW5lKG9iamVjdCwgbmFtZSwgZGVzY3IpIHtcbiAgICBpZiAoIShuYW1lIGluIG9iamVjdCkpIHtcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmplY3QsIG5hbWUsIGRlc2NyKTtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gbWF5YmVEZWZpbmVNZXRob2Qob2JqZWN0LCBuYW1lLCB2YWx1ZSkge1xuICAgIG1heWJlRGVmaW5lKG9iamVjdCwgbmFtZSwge1xuICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICB3cml0YWJsZTogdHJ1ZVxuICAgIH0pO1xuICB9XG4gIGZ1bmN0aW9uIG1heWJlRGVmaW5lQ29uc3Qob2JqZWN0LCBuYW1lLCB2YWx1ZSkge1xuICAgIG1heWJlRGVmaW5lKG9iamVjdCwgbmFtZSwge1xuICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgY29uZmlndXJhYmxlOiBmYWxzZSxcbiAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgd3JpdGFibGU6IGZhbHNlXG4gICAgfSk7XG4gIH1cbiAgZnVuY3Rpb24gbWF5YmVBZGRGdW5jdGlvbnMob2JqZWN0LCBmdW5jdGlvbnMpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGZ1bmN0aW9ucy5sZW5ndGg7IGkgKz0gMikge1xuICAgICAgdmFyIG5hbWUgPSBmdW5jdGlvbnNbaV07XG4gICAgICB2YXIgdmFsdWUgPSBmdW5jdGlvbnNbaSArIDFdO1xuICAgICAgbWF5YmVEZWZpbmVNZXRob2Qob2JqZWN0LCBuYW1lLCB2YWx1ZSk7XG4gICAgfVxuICB9XG4gIGZ1bmN0aW9uIG1heWJlQWRkQ29uc3RzKG9iamVjdCwgY29uc3RzKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb25zdHMubGVuZ3RoOyBpICs9IDIpIHtcbiAgICAgIHZhciBuYW1lID0gY29uc3RzW2ldO1xuICAgICAgdmFyIHZhbHVlID0gY29uc3RzW2kgKyAxXTtcbiAgICAgIG1heWJlRGVmaW5lQ29uc3Qob2JqZWN0LCBuYW1lLCB2YWx1ZSk7XG4gICAgfVxuICB9XG4gIGZ1bmN0aW9uIG1heWJlQWRkSXRlcmF0b3Iob2JqZWN0LCBmdW5jLCBTeW1ib2wpIHtcbiAgICBpZiAoIVN5bWJvbCB8fCAhU3ltYm9sLml0ZXJhdG9yIHx8IG9iamVjdFtTeW1ib2wuaXRlcmF0b3JdKVxuICAgICAgcmV0dXJuO1xuICAgIGlmIChvYmplY3RbJ0BAaXRlcmF0b3InXSlcbiAgICAgIGZ1bmMgPSBvYmplY3RbJ0BAaXRlcmF0b3InXTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqZWN0LCBTeW1ib2wuaXRlcmF0b3IsIHtcbiAgICAgIHZhbHVlOiBmdW5jLFxuICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICB3cml0YWJsZTogdHJ1ZVxuICAgIH0pO1xuICB9XG4gIHZhciBwb2x5ZmlsbHMgPSBbXTtcbiAgZnVuY3Rpb24gcmVnaXN0ZXJQb2x5ZmlsbChmdW5jKSB7XG4gICAgcG9seWZpbGxzLnB1c2goZnVuYyk7XG4gIH1cbiAgZnVuY3Rpb24gcG9seWZpbGxBbGwoZ2xvYmFsKSB7XG4gICAgcG9seWZpbGxzLmZvckVhY2goKGZ1bmN0aW9uKGYpIHtcbiAgICAgIHJldHVybiBmKGdsb2JhbCk7XG4gICAgfSkpO1xuICB9XG4gIHJldHVybiB7XG4gICAgZ2V0IHRvT2JqZWN0KCkge1xuICAgICAgcmV0dXJuIHRvT2JqZWN0O1xuICAgIH0sXG4gICAgZ2V0IHRvVWludDMyKCkge1xuICAgICAgcmV0dXJuIHRvVWludDMyO1xuICAgIH0sXG4gICAgZ2V0IGlzT2JqZWN0KCkge1xuICAgICAgcmV0dXJuIGlzT2JqZWN0O1xuICAgIH0sXG4gICAgZ2V0IGlzQ2FsbGFibGUoKSB7XG4gICAgICByZXR1cm4gaXNDYWxsYWJsZTtcbiAgICB9LFxuICAgIGdldCBpc051bWJlcigpIHtcbiAgICAgIHJldHVybiBpc051bWJlcjtcbiAgICB9LFxuICAgIGdldCB0b0ludGVnZXIoKSB7XG4gICAgICByZXR1cm4gdG9JbnRlZ2VyO1xuICAgIH0sXG4gICAgZ2V0IHRvTGVuZ3RoKCkge1xuICAgICAgcmV0dXJuIHRvTGVuZ3RoO1xuICAgIH0sXG4gICAgZ2V0IGNoZWNrSXRlcmFibGUoKSB7XG4gICAgICByZXR1cm4gY2hlY2tJdGVyYWJsZTtcbiAgICB9LFxuICAgIGdldCBpc0NvbnN0cnVjdG9yKCkge1xuICAgICAgcmV0dXJuIGlzQ29uc3RydWN0b3I7XG4gICAgfSxcbiAgICBnZXQgY3JlYXRlSXRlcmF0b3JSZXN1bHRPYmplY3QoKSB7XG4gICAgICByZXR1cm4gY3JlYXRlSXRlcmF0b3JSZXN1bHRPYmplY3Q7XG4gICAgfSxcbiAgICBnZXQgbWF5YmVEZWZpbmUoKSB7XG4gICAgICByZXR1cm4gbWF5YmVEZWZpbmU7XG4gICAgfSxcbiAgICBnZXQgbWF5YmVEZWZpbmVNZXRob2QoKSB7XG4gICAgICByZXR1cm4gbWF5YmVEZWZpbmVNZXRob2Q7XG4gICAgfSxcbiAgICBnZXQgbWF5YmVEZWZpbmVDb25zdCgpIHtcbiAgICAgIHJldHVybiBtYXliZURlZmluZUNvbnN0O1xuICAgIH0sXG4gICAgZ2V0IG1heWJlQWRkRnVuY3Rpb25zKCkge1xuICAgICAgcmV0dXJuIG1heWJlQWRkRnVuY3Rpb25zO1xuICAgIH0sXG4gICAgZ2V0IG1heWJlQWRkQ29uc3RzKCkge1xuICAgICAgcmV0dXJuIG1heWJlQWRkQ29uc3RzO1xuICAgIH0sXG4gICAgZ2V0IG1heWJlQWRkSXRlcmF0b3IoKSB7XG4gICAgICByZXR1cm4gbWF5YmVBZGRJdGVyYXRvcjtcbiAgICB9LFxuICAgIGdldCByZWdpc3RlclBvbHlmaWxsKCkge1xuICAgICAgcmV0dXJuIHJlZ2lzdGVyUG9seWZpbGw7XG4gICAgfSxcbiAgICBnZXQgcG9seWZpbGxBbGwoKSB7XG4gICAgICByZXR1cm4gcG9seWZpbGxBbGw7XG4gICAgfVxuICB9O1xufSk7XG5TeXN0ZW0ucmVnaXN0ZXIoXCJ0cmFjZXVyLXJ1bnRpbWVAMC4wLjcyL3NyYy9ydW50aW1lL3BvbHlmaWxscy9NYXBcIiwgW10sIGZ1bmN0aW9uKCkge1xuICBcInVzZSBzdHJpY3RcIjtcbiAgdmFyIF9fbW9kdWxlTmFtZSA9IFwidHJhY2V1ci1ydW50aW1lQDAuMC43Mi9zcmMvcnVudGltZS9wb2x5ZmlsbHMvTWFwXCI7XG4gIHZhciAkX18wID0gU3lzdGVtLmdldChcInRyYWNldXItcnVudGltZUAwLjAuNzIvc3JjL3J1bnRpbWUvcG9seWZpbGxzL3V0aWxzXCIpLFxuICAgICAgaXNPYmplY3QgPSAkX18wLmlzT2JqZWN0LFxuICAgICAgbWF5YmVBZGRJdGVyYXRvciA9ICRfXzAubWF5YmVBZGRJdGVyYXRvcixcbiAgICAgIHJlZ2lzdGVyUG9seWZpbGwgPSAkX18wLnJlZ2lzdGVyUG9seWZpbGw7XG4gIHZhciBnZXRPd25IYXNoT2JqZWN0ID0gJHRyYWNldXJSdW50aW1lLmdldE93bkhhc2hPYmplY3Q7XG4gIHZhciAkaGFzT3duUHJvcGVydHkgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xuICB2YXIgZGVsZXRlZFNlbnRpbmVsID0ge307XG4gIGZ1bmN0aW9uIGxvb2t1cEluZGV4KG1hcCwga2V5KSB7XG4gICAgaWYgKGlzT2JqZWN0KGtleSkpIHtcbiAgICAgIHZhciBoYXNoT2JqZWN0ID0gZ2V0T3duSGFzaE9iamVjdChrZXkpO1xuICAgICAgcmV0dXJuIGhhc2hPYmplY3QgJiYgbWFwLm9iamVjdEluZGV4X1toYXNoT2JqZWN0Lmhhc2hdO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIGtleSA9PT0gJ3N0cmluZycpXG4gICAgICByZXR1cm4gbWFwLnN0cmluZ0luZGV4X1trZXldO1xuICAgIHJldHVybiBtYXAucHJpbWl0aXZlSW5kZXhfW2tleV07XG4gIH1cbiAgZnVuY3Rpb24gaW5pdE1hcChtYXApIHtcbiAgICBtYXAuZW50cmllc18gPSBbXTtcbiAgICBtYXAub2JqZWN0SW5kZXhfID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICBtYXAuc3RyaW5nSW5kZXhfID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICBtYXAucHJpbWl0aXZlSW5kZXhfID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICBtYXAuZGVsZXRlZENvdW50XyA9IDA7XG4gIH1cbiAgdmFyIE1hcCA9IGZ1bmN0aW9uIE1hcCgpIHtcbiAgICB2YXIgaXRlcmFibGUgPSBhcmd1bWVudHNbMF07XG4gICAgaWYgKCFpc09iamVjdCh0aGlzKSlcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ01hcCBjYWxsZWQgb24gaW5jb21wYXRpYmxlIHR5cGUnKTtcbiAgICBpZiAoJGhhc093blByb3BlcnR5LmNhbGwodGhpcywgJ2VudHJpZXNfJykpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ01hcCBjYW4gbm90IGJlIHJlZW50cmFudGx5IGluaXRpYWxpc2VkJyk7XG4gICAgfVxuICAgIGluaXRNYXAodGhpcyk7XG4gICAgaWYgKGl0ZXJhYmxlICE9PSBudWxsICYmIGl0ZXJhYmxlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGZvciAodmFyICRfXzIgPSBpdGVyYWJsZVtTeW1ib2wuaXRlcmF0b3JdKCksXG4gICAgICAgICAgJF9fMzsgISgkX18zID0gJF9fMi5uZXh0KCkpLmRvbmU7ICkge1xuICAgICAgICB2YXIgJF9fNCA9ICRfXzMudmFsdWUsXG4gICAgICAgICAgICBrZXkgPSAkX180WzBdLFxuICAgICAgICAgICAgdmFsdWUgPSAkX180WzFdO1xuICAgICAgICB7XG4gICAgICAgICAgdGhpcy5zZXQoa2V5LCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH07XG4gICgkdHJhY2V1clJ1bnRpbWUuY3JlYXRlQ2xhc3MpKE1hcCwge1xuICAgIGdldCBzaXplKCkge1xuICAgICAgcmV0dXJuIHRoaXMuZW50cmllc18ubGVuZ3RoIC8gMiAtIHRoaXMuZGVsZXRlZENvdW50XztcbiAgICB9LFxuICAgIGdldDogZnVuY3Rpb24oa2V5KSB7XG4gICAgICB2YXIgaW5kZXggPSBsb29rdXBJbmRleCh0aGlzLCBrZXkpO1xuICAgICAgaWYgKGluZGV4ICE9PSB1bmRlZmluZWQpXG4gICAgICAgIHJldHVybiB0aGlzLmVudHJpZXNfW2luZGV4ICsgMV07XG4gICAgfSxcbiAgICBzZXQ6IGZ1bmN0aW9uKGtleSwgdmFsdWUpIHtcbiAgICAgIHZhciBvYmplY3RNb2RlID0gaXNPYmplY3Qoa2V5KTtcbiAgICAgIHZhciBzdHJpbmdNb2RlID0gdHlwZW9mIGtleSA9PT0gJ3N0cmluZyc7XG4gICAgICB2YXIgaW5kZXggPSBsb29rdXBJbmRleCh0aGlzLCBrZXkpO1xuICAgICAgaWYgKGluZGV4ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGhpcy5lbnRyaWVzX1tpbmRleCArIDFdID0gdmFsdWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpbmRleCA9IHRoaXMuZW50cmllc18ubGVuZ3RoO1xuICAgICAgICB0aGlzLmVudHJpZXNfW2luZGV4XSA9IGtleTtcbiAgICAgICAgdGhpcy5lbnRyaWVzX1tpbmRleCArIDFdID0gdmFsdWU7XG4gICAgICAgIGlmIChvYmplY3RNb2RlKSB7XG4gICAgICAgICAgdmFyIGhhc2hPYmplY3QgPSBnZXRPd25IYXNoT2JqZWN0KGtleSk7XG4gICAgICAgICAgdmFyIGhhc2ggPSBoYXNoT2JqZWN0Lmhhc2g7XG4gICAgICAgICAgdGhpcy5vYmplY3RJbmRleF9baGFzaF0gPSBpbmRleDtcbiAgICAgICAgfSBlbHNlIGlmIChzdHJpbmdNb2RlKSB7XG4gICAgICAgICAgdGhpcy5zdHJpbmdJbmRleF9ba2V5XSA9IGluZGV4O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMucHJpbWl0aXZlSW5kZXhfW2tleV0gPSBpbmRleDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICBoYXM6IGZ1bmN0aW9uKGtleSkge1xuICAgICAgcmV0dXJuIGxvb2t1cEluZGV4KHRoaXMsIGtleSkgIT09IHVuZGVmaW5lZDtcbiAgICB9LFxuICAgIGRlbGV0ZTogZnVuY3Rpb24oa2V5KSB7XG4gICAgICB2YXIgb2JqZWN0TW9kZSA9IGlzT2JqZWN0KGtleSk7XG4gICAgICB2YXIgc3RyaW5nTW9kZSA9IHR5cGVvZiBrZXkgPT09ICdzdHJpbmcnO1xuICAgICAgdmFyIGluZGV4O1xuICAgICAgdmFyIGhhc2g7XG4gICAgICBpZiAob2JqZWN0TW9kZSkge1xuICAgICAgICB2YXIgaGFzaE9iamVjdCA9IGdldE93bkhhc2hPYmplY3Qoa2V5KTtcbiAgICAgICAgaWYgKGhhc2hPYmplY3QpIHtcbiAgICAgICAgICBpbmRleCA9IHRoaXMub2JqZWN0SW5kZXhfW2hhc2ggPSBoYXNoT2JqZWN0Lmhhc2hdO1xuICAgICAgICAgIGRlbGV0ZSB0aGlzLm9iamVjdEluZGV4X1toYXNoXTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChzdHJpbmdNb2RlKSB7XG4gICAgICAgIGluZGV4ID0gdGhpcy5zdHJpbmdJbmRleF9ba2V5XTtcbiAgICAgICAgZGVsZXRlIHRoaXMuc3RyaW5nSW5kZXhfW2tleV07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpbmRleCA9IHRoaXMucHJpbWl0aXZlSW5kZXhfW2tleV07XG4gICAgICAgIGRlbGV0ZSB0aGlzLnByaW1pdGl2ZUluZGV4X1trZXldO1xuICAgICAgfVxuICAgICAgaWYgKGluZGV4ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGhpcy5lbnRyaWVzX1tpbmRleF0gPSBkZWxldGVkU2VudGluZWw7XG4gICAgICAgIHRoaXMuZW50cmllc19baW5kZXggKyAxXSA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5kZWxldGVkQ291bnRfKys7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0sXG4gICAgY2xlYXI6IGZ1bmN0aW9uKCkge1xuICAgICAgaW5pdE1hcCh0aGlzKTtcbiAgICB9LFxuICAgIGZvckVhY2g6IGZ1bmN0aW9uKGNhbGxiYWNrRm4pIHtcbiAgICAgIHZhciB0aGlzQXJnID0gYXJndW1lbnRzWzFdO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmVudHJpZXNfLmxlbmd0aDsgaSArPSAyKSB7XG4gICAgICAgIHZhciBrZXkgPSB0aGlzLmVudHJpZXNfW2ldO1xuICAgICAgICB2YXIgdmFsdWUgPSB0aGlzLmVudHJpZXNfW2kgKyAxXTtcbiAgICAgICAgaWYgKGtleSA9PT0gZGVsZXRlZFNlbnRpbmVsKVxuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICBjYWxsYmFja0ZuLmNhbGwodGhpc0FyZywgdmFsdWUsIGtleSwgdGhpcyk7XG4gICAgICB9XG4gICAgfSxcbiAgICBlbnRyaWVzOiAkdHJhY2V1clJ1bnRpbWUuaW5pdEdlbmVyYXRvckZ1bmN0aW9uKGZ1bmN0aW9uICRfXzUoKSB7XG4gICAgICB2YXIgaSxcbiAgICAgICAgICBrZXksXG4gICAgICAgICAgdmFsdWU7XG4gICAgICByZXR1cm4gJHRyYWNldXJSdW50aW1lLmNyZWF0ZUdlbmVyYXRvckluc3RhbmNlKGZ1bmN0aW9uKCRjdHgpIHtcbiAgICAgICAgd2hpbGUgKHRydWUpXG4gICAgICAgICAgc3dpdGNoICgkY3R4LnN0YXRlKSB7XG4gICAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICAgIGkgPSAwO1xuICAgICAgICAgICAgICAkY3R4LnN0YXRlID0gMTI7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAxMjpcbiAgICAgICAgICAgICAgJGN0eC5zdGF0ZSA9IChpIDwgdGhpcy5lbnRyaWVzXy5sZW5ndGgpID8gOCA6IC0yO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgICAgaSArPSAyO1xuICAgICAgICAgICAgICAkY3R4LnN0YXRlID0gMTI7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA4OlxuICAgICAgICAgICAgICBrZXkgPSB0aGlzLmVudHJpZXNfW2ldO1xuICAgICAgICAgICAgICB2YWx1ZSA9IHRoaXMuZW50cmllc19baSArIDFdO1xuICAgICAgICAgICAgICAkY3R4LnN0YXRlID0gOTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDk6XG4gICAgICAgICAgICAgICRjdHguc3RhdGUgPSAoa2V5ID09PSBkZWxldGVkU2VudGluZWwpID8gNCA6IDY7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA2OlxuICAgICAgICAgICAgICAkY3R4LnN0YXRlID0gMjtcbiAgICAgICAgICAgICAgcmV0dXJuIFtrZXksIHZhbHVlXTtcbiAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgJGN0eC5tYXliZVRocm93KCk7XG4gICAgICAgICAgICAgICRjdHguc3RhdGUgPSA0O1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgIHJldHVybiAkY3R4LmVuZCgpO1xuICAgICAgICAgIH1cbiAgICAgIH0sICRfXzUsIHRoaXMpO1xuICAgIH0pLFxuICAgIGtleXM6ICR0cmFjZXVyUnVudGltZS5pbml0R2VuZXJhdG9yRnVuY3Rpb24oZnVuY3Rpb24gJF9fNigpIHtcbiAgICAgIHZhciBpLFxuICAgICAgICAgIGtleSxcbiAgICAgICAgICB2YWx1ZTtcbiAgICAgIHJldHVybiAkdHJhY2V1clJ1bnRpbWUuY3JlYXRlR2VuZXJhdG9ySW5zdGFuY2UoZnVuY3Rpb24oJGN0eCkge1xuICAgICAgICB3aGlsZSAodHJ1ZSlcbiAgICAgICAgICBzd2l0Y2ggKCRjdHguc3RhdGUpIHtcbiAgICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgICAgaSA9IDA7XG4gICAgICAgICAgICAgICRjdHguc3RhdGUgPSAxMjtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDEyOlxuICAgICAgICAgICAgICAkY3R4LnN0YXRlID0gKGkgPCB0aGlzLmVudHJpZXNfLmxlbmd0aCkgPyA4IDogLTI7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgICBpICs9IDI7XG4gICAgICAgICAgICAgICRjdHguc3RhdGUgPSAxMjtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDg6XG4gICAgICAgICAgICAgIGtleSA9IHRoaXMuZW50cmllc19baV07XG4gICAgICAgICAgICAgIHZhbHVlID0gdGhpcy5lbnRyaWVzX1tpICsgMV07XG4gICAgICAgICAgICAgICRjdHguc3RhdGUgPSA5O1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgOTpcbiAgICAgICAgICAgICAgJGN0eC5zdGF0ZSA9IChrZXkgPT09IGRlbGV0ZWRTZW50aW5lbCkgPyA0IDogNjtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDY6XG4gICAgICAgICAgICAgICRjdHguc3RhdGUgPSAyO1xuICAgICAgICAgICAgICByZXR1cm4ga2V5O1xuICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAkY3R4Lm1heWJlVGhyb3coKTtcbiAgICAgICAgICAgICAgJGN0eC5zdGF0ZSA9IDQ7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgcmV0dXJuICRjdHguZW5kKCk7XG4gICAgICAgICAgfVxuICAgICAgfSwgJF9fNiwgdGhpcyk7XG4gICAgfSksXG4gICAgdmFsdWVzOiAkdHJhY2V1clJ1bnRpbWUuaW5pdEdlbmVyYXRvckZ1bmN0aW9uKGZ1bmN0aW9uICRfXzcoKSB7XG4gICAgICB2YXIgaSxcbiAgICAgICAgICBrZXksXG4gICAgICAgICAgdmFsdWU7XG4gICAgICByZXR1cm4gJHRyYWNldXJSdW50aW1lLmNyZWF0ZUdlbmVyYXRvckluc3RhbmNlKGZ1bmN0aW9uKCRjdHgpIHtcbiAgICAgICAgd2hpbGUgKHRydWUpXG4gICAgICAgICAgc3dpdGNoICgkY3R4LnN0YXRlKSB7XG4gICAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICAgIGkgPSAwO1xuICAgICAgICAgICAgICAkY3R4LnN0YXRlID0gMTI7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAxMjpcbiAgICAgICAgICAgICAgJGN0eC5zdGF0ZSA9IChpIDwgdGhpcy5lbnRyaWVzXy5sZW5ndGgpID8gOCA6IC0yO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgICAgaSArPSAyO1xuICAgICAgICAgICAgICAkY3R4LnN0YXRlID0gMTI7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA4OlxuICAgICAgICAgICAgICBrZXkgPSB0aGlzLmVudHJpZXNfW2ldO1xuICAgICAgICAgICAgICB2YWx1ZSA9IHRoaXMuZW50cmllc19baSArIDFdO1xuICAgICAgICAgICAgICAkY3R4LnN0YXRlID0gOTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDk6XG4gICAgICAgICAgICAgICRjdHguc3RhdGUgPSAoa2V5ID09PSBkZWxldGVkU2VudGluZWwpID8gNCA6IDY7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA2OlxuICAgICAgICAgICAgICAkY3R4LnN0YXRlID0gMjtcbiAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAkY3R4Lm1heWJlVGhyb3coKTtcbiAgICAgICAgICAgICAgJGN0eC5zdGF0ZSA9IDQ7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgcmV0dXJuICRjdHguZW5kKCk7XG4gICAgICAgICAgfVxuICAgICAgfSwgJF9fNywgdGhpcyk7XG4gICAgfSlcbiAgfSwge30pO1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoTWFwLnByb3RvdHlwZSwgU3ltYm9sLml0ZXJhdG9yLCB7XG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgIHZhbHVlOiBNYXAucHJvdG90eXBlLmVudHJpZXNcbiAgfSk7XG4gIGZ1bmN0aW9uIHBvbHlmaWxsTWFwKGdsb2JhbCkge1xuICAgIHZhciAkX180ID0gZ2xvYmFsLFxuICAgICAgICBPYmplY3QgPSAkX180Lk9iamVjdCxcbiAgICAgICAgU3ltYm9sID0gJF9fNC5TeW1ib2w7XG4gICAgaWYgKCFnbG9iYWwuTWFwKVxuICAgICAgZ2xvYmFsLk1hcCA9IE1hcDtcbiAgICB2YXIgbWFwUHJvdG90eXBlID0gZ2xvYmFsLk1hcC5wcm90b3R5cGU7XG4gICAgaWYgKG1hcFByb3RvdHlwZS5lbnRyaWVzID09PSB1bmRlZmluZWQpXG4gICAgICBnbG9iYWwuTWFwID0gTWFwO1xuICAgIGlmIChtYXBQcm90b3R5cGUuZW50cmllcykge1xuICAgICAgbWF5YmVBZGRJdGVyYXRvcihtYXBQcm90b3R5cGUsIG1hcFByb3RvdHlwZS5lbnRyaWVzLCBTeW1ib2wpO1xuICAgICAgbWF5YmVBZGRJdGVyYXRvcihPYmplY3QuZ2V0UHJvdG90eXBlT2YobmV3IGdsb2JhbC5NYXAoKS5lbnRyaWVzKCkpLCBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9LCBTeW1ib2wpO1xuICAgIH1cbiAgfVxuICByZWdpc3RlclBvbHlmaWxsKHBvbHlmaWxsTWFwKTtcbiAgcmV0dXJuIHtcbiAgICBnZXQgTWFwKCkge1xuICAgICAgcmV0dXJuIE1hcDtcbiAgICB9LFxuICAgIGdldCBwb2x5ZmlsbE1hcCgpIHtcbiAgICAgIHJldHVybiBwb2x5ZmlsbE1hcDtcbiAgICB9XG4gIH07XG59KTtcblN5c3RlbS5nZXQoXCJ0cmFjZXVyLXJ1bnRpbWVAMC4wLjcyL3NyYy9ydW50aW1lL3BvbHlmaWxscy9NYXBcIiArICcnKTtcblN5c3RlbS5yZWdpc3RlcihcInRyYWNldXItcnVudGltZUAwLjAuNzIvc3JjL3J1bnRpbWUvcG9seWZpbGxzL1NldFwiLCBbXSwgZnVuY3Rpb24oKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuICB2YXIgX19tb2R1bGVOYW1lID0gXCJ0cmFjZXVyLXJ1bnRpbWVAMC4wLjcyL3NyYy9ydW50aW1lL3BvbHlmaWxscy9TZXRcIjtcbiAgdmFyICRfXzAgPSBTeXN0ZW0uZ2V0KFwidHJhY2V1ci1ydW50aW1lQDAuMC43Mi9zcmMvcnVudGltZS9wb2x5ZmlsbHMvdXRpbHNcIiksXG4gICAgICBpc09iamVjdCA9ICRfXzAuaXNPYmplY3QsXG4gICAgICBtYXliZUFkZEl0ZXJhdG9yID0gJF9fMC5tYXliZUFkZEl0ZXJhdG9yLFxuICAgICAgcmVnaXN0ZXJQb2x5ZmlsbCA9ICRfXzAucmVnaXN0ZXJQb2x5ZmlsbDtcbiAgdmFyIE1hcCA9IFN5c3RlbS5nZXQoXCJ0cmFjZXVyLXJ1bnRpbWVAMC4wLjcyL3NyYy9ydW50aW1lL3BvbHlmaWxscy9NYXBcIikuTWFwO1xuICB2YXIgZ2V0T3duSGFzaE9iamVjdCA9ICR0cmFjZXVyUnVudGltZS5nZXRPd25IYXNoT2JqZWN0O1xuICB2YXIgJGhhc093blByb3BlcnR5ID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcbiAgZnVuY3Rpb24gaW5pdFNldChzZXQpIHtcbiAgICBzZXQubWFwXyA9IG5ldyBNYXAoKTtcbiAgfVxuICB2YXIgU2V0ID0gZnVuY3Rpb24gU2V0KCkge1xuICAgIHZhciBpdGVyYWJsZSA9IGFyZ3VtZW50c1swXTtcbiAgICBpZiAoIWlzT2JqZWN0KHRoaXMpKVxuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignU2V0IGNhbGxlZCBvbiBpbmNvbXBhdGlibGUgdHlwZScpO1xuICAgIGlmICgkaGFzT3duUHJvcGVydHkuY2FsbCh0aGlzLCAnbWFwXycpKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdTZXQgY2FuIG5vdCBiZSByZWVudHJhbnRseSBpbml0aWFsaXNlZCcpO1xuICAgIH1cbiAgICBpbml0U2V0KHRoaXMpO1xuICAgIGlmIChpdGVyYWJsZSAhPT0gbnVsbCAmJiBpdGVyYWJsZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBmb3IgKHZhciAkX180ID0gaXRlcmFibGVbU3ltYm9sLml0ZXJhdG9yXSgpLFxuICAgICAgICAgICRfXzU7ICEoJF9fNSA9ICRfXzQubmV4dCgpKS5kb25lOyApIHtcbiAgICAgICAgdmFyIGl0ZW0gPSAkX181LnZhbHVlO1xuICAgICAgICB7XG4gICAgICAgICAgdGhpcy5hZGQoaXRlbSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH07XG4gICgkdHJhY2V1clJ1bnRpbWUuY3JlYXRlQ2xhc3MpKFNldCwge1xuICAgIGdldCBzaXplKCkge1xuICAgICAgcmV0dXJuIHRoaXMubWFwXy5zaXplO1xuICAgIH0sXG4gICAgaGFzOiBmdW5jdGlvbihrZXkpIHtcbiAgICAgIHJldHVybiB0aGlzLm1hcF8uaGFzKGtleSk7XG4gICAgfSxcbiAgICBhZGQ6IGZ1bmN0aW9uKGtleSkge1xuICAgICAgdGhpcy5tYXBfLnNldChrZXksIGtleSk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuICAgIGRlbGV0ZTogZnVuY3Rpb24oa2V5KSB7XG4gICAgICByZXR1cm4gdGhpcy5tYXBfLmRlbGV0ZShrZXkpO1xuICAgIH0sXG4gICAgY2xlYXI6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMubWFwXy5jbGVhcigpO1xuICAgIH0sXG4gICAgZm9yRWFjaDogZnVuY3Rpb24oY2FsbGJhY2tGbikge1xuICAgICAgdmFyIHRoaXNBcmcgPSBhcmd1bWVudHNbMV07XG4gICAgICB2YXIgJF9fMiA9IHRoaXM7XG4gICAgICByZXR1cm4gdGhpcy5tYXBfLmZvckVhY2goKGZ1bmN0aW9uKHZhbHVlLCBrZXkpIHtcbiAgICAgICAgY2FsbGJhY2tGbi5jYWxsKHRoaXNBcmcsIGtleSwga2V5LCAkX18yKTtcbiAgICAgIH0pKTtcbiAgICB9LFxuICAgIHZhbHVlczogJHRyYWNldXJSdW50aW1lLmluaXRHZW5lcmF0b3JGdW5jdGlvbihmdW5jdGlvbiAkX183KCkge1xuICAgICAgdmFyICRfXzgsXG4gICAgICAgICAgJF9fOTtcbiAgICAgIHJldHVybiAkdHJhY2V1clJ1bnRpbWUuY3JlYXRlR2VuZXJhdG9ySW5zdGFuY2UoZnVuY3Rpb24oJGN0eCkge1xuICAgICAgICB3aGlsZSAodHJ1ZSlcbiAgICAgICAgICBzd2l0Y2ggKCRjdHguc3RhdGUpIHtcbiAgICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgICAgJF9fOCA9IHRoaXMubWFwXy5rZXlzKClbU3ltYm9sLml0ZXJhdG9yXSgpO1xuICAgICAgICAgICAgICAkY3R4LnNlbnQgPSB2b2lkIDA7XG4gICAgICAgICAgICAgICRjdHguYWN0aW9uID0gJ25leHQnO1xuICAgICAgICAgICAgICAkY3R4LnN0YXRlID0gMTI7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAxMjpcbiAgICAgICAgICAgICAgJF9fOSA9ICRfXzhbJGN0eC5hY3Rpb25dKCRjdHguc2VudElnbm9yZVRocm93KTtcbiAgICAgICAgICAgICAgJGN0eC5zdGF0ZSA9IDk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA5OlxuICAgICAgICAgICAgICAkY3R4LnN0YXRlID0gKCRfXzkuZG9uZSkgPyAzIDogMjtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICAgICRjdHguc2VudCA9ICRfXzkudmFsdWU7XG4gICAgICAgICAgICAgICRjdHguc3RhdGUgPSAtMjtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICRjdHguc3RhdGUgPSAxMjtcbiAgICAgICAgICAgICAgcmV0dXJuICRfXzkudmFsdWU7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICByZXR1cm4gJGN0eC5lbmQoKTtcbiAgICAgICAgICB9XG4gICAgICB9LCAkX183LCB0aGlzKTtcbiAgICB9KSxcbiAgICBlbnRyaWVzOiAkdHJhY2V1clJ1bnRpbWUuaW5pdEdlbmVyYXRvckZ1bmN0aW9uKGZ1bmN0aW9uICRfXzEwKCkge1xuICAgICAgdmFyICRfXzExLFxuICAgICAgICAgICRfXzEyO1xuICAgICAgcmV0dXJuICR0cmFjZXVyUnVudGltZS5jcmVhdGVHZW5lcmF0b3JJbnN0YW5jZShmdW5jdGlvbigkY3R4KSB7XG4gICAgICAgIHdoaWxlICh0cnVlKVxuICAgICAgICAgIHN3aXRjaCAoJGN0eC5zdGF0ZSkge1xuICAgICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgICAkX18xMSA9IHRoaXMubWFwXy5lbnRyaWVzKClbU3ltYm9sLml0ZXJhdG9yXSgpO1xuICAgICAgICAgICAgICAkY3R4LnNlbnQgPSB2b2lkIDA7XG4gICAgICAgICAgICAgICRjdHguYWN0aW9uID0gJ25leHQnO1xuICAgICAgICAgICAgICAkY3R4LnN0YXRlID0gMTI7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAxMjpcbiAgICAgICAgICAgICAgJF9fMTIgPSAkX18xMVskY3R4LmFjdGlvbl0oJGN0eC5zZW50SWdub3JlVGhyb3cpO1xuICAgICAgICAgICAgICAkY3R4LnN0YXRlID0gOTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDk6XG4gICAgICAgICAgICAgICRjdHguc3RhdGUgPSAoJF9fMTIuZG9uZSkgPyAzIDogMjtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICAgICRjdHguc2VudCA9ICRfXzEyLnZhbHVlO1xuICAgICAgICAgICAgICAkY3R4LnN0YXRlID0gLTI7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAkY3R4LnN0YXRlID0gMTI7XG4gICAgICAgICAgICAgIHJldHVybiAkX18xMi52YWx1ZTtcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgIHJldHVybiAkY3R4LmVuZCgpO1xuICAgICAgICAgIH1cbiAgICAgIH0sICRfXzEwLCB0aGlzKTtcbiAgICB9KVxuICB9LCB7fSk7XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTZXQucHJvdG90eXBlLCBTeW1ib2wuaXRlcmF0b3IsIHtcbiAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgd3JpdGFibGU6IHRydWUsXG4gICAgdmFsdWU6IFNldC5wcm90b3R5cGUudmFsdWVzXG4gIH0pO1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU2V0LnByb3RvdHlwZSwgJ2tleXMnLCB7XG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgIHZhbHVlOiBTZXQucHJvdG90eXBlLnZhbHVlc1xuICB9KTtcbiAgZnVuY3Rpb24gcG9seWZpbGxTZXQoZ2xvYmFsKSB7XG4gICAgdmFyICRfXzYgPSBnbG9iYWwsXG4gICAgICAgIE9iamVjdCA9ICRfXzYuT2JqZWN0LFxuICAgICAgICBTeW1ib2wgPSAkX182LlN5bWJvbDtcbiAgICBpZiAoIWdsb2JhbC5TZXQpXG4gICAgICBnbG9iYWwuU2V0ID0gU2V0O1xuICAgIHZhciBzZXRQcm90b3R5cGUgPSBnbG9iYWwuU2V0LnByb3RvdHlwZTtcbiAgICBpZiAoc2V0UHJvdG90eXBlLnZhbHVlcykge1xuICAgICAgbWF5YmVBZGRJdGVyYXRvcihzZXRQcm90b3R5cGUsIHNldFByb3RvdHlwZS52YWx1ZXMsIFN5bWJvbCk7XG4gICAgICBtYXliZUFkZEl0ZXJhdG9yKE9iamVjdC5nZXRQcm90b3R5cGVPZihuZXcgZ2xvYmFsLlNldCgpLnZhbHVlcygpKSwgZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfSwgU3ltYm9sKTtcbiAgICB9XG4gIH1cbiAgcmVnaXN0ZXJQb2x5ZmlsbChwb2x5ZmlsbFNldCk7XG4gIHJldHVybiB7XG4gICAgZ2V0IFNldCgpIHtcbiAgICAgIHJldHVybiBTZXQ7XG4gICAgfSxcbiAgICBnZXQgcG9seWZpbGxTZXQoKSB7XG4gICAgICByZXR1cm4gcG9seWZpbGxTZXQ7XG4gICAgfVxuICB9O1xufSk7XG5TeXN0ZW0uZ2V0KFwidHJhY2V1ci1ydW50aW1lQDAuMC43Mi9zcmMvcnVudGltZS9wb2x5ZmlsbHMvU2V0XCIgKyAnJyk7XG5TeXN0ZW0ucmVnaXN0ZXIoXCJ0cmFjZXVyLXJ1bnRpbWVAMC4wLjcyL25vZGVfbW9kdWxlcy9yc3ZwL2xpYi9yc3ZwL2FzYXBcIiwgW10sIGZ1bmN0aW9uKCkge1xuICBcInVzZSBzdHJpY3RcIjtcbiAgdmFyIF9fbW9kdWxlTmFtZSA9IFwidHJhY2V1ci1ydW50aW1lQDAuMC43Mi9ub2RlX21vZHVsZXMvcnN2cC9saWIvcnN2cC9hc2FwXCI7XG4gIHZhciBsZW4gPSAwO1xuICBmdW5jdGlvbiBhc2FwKGNhbGxiYWNrLCBhcmcpIHtcbiAgICBxdWV1ZVtsZW5dID0gY2FsbGJhY2s7XG4gICAgcXVldWVbbGVuICsgMV0gPSBhcmc7XG4gICAgbGVuICs9IDI7XG4gICAgaWYgKGxlbiA9PT0gMikge1xuICAgICAgc2NoZWR1bGVGbHVzaCgpO1xuICAgIH1cbiAgfVxuICB2YXIgJF9fZGVmYXVsdCA9IGFzYXA7XG4gIHZhciBicm93c2VyR2xvYmFsID0gKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSA/IHdpbmRvdyA6IHt9O1xuICB2YXIgQnJvd3Nlck11dGF0aW9uT2JzZXJ2ZXIgPSBicm93c2VyR2xvYmFsLk11dGF0aW9uT2JzZXJ2ZXIgfHwgYnJvd3Nlckdsb2JhbC5XZWJLaXRNdXRhdGlvbk9ic2VydmVyO1xuICB2YXIgaXNXb3JrZXIgPSB0eXBlb2YgVWludDhDbGFtcGVkQXJyYXkgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBpbXBvcnRTY3JpcHRzICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgTWVzc2FnZUNoYW5uZWwgIT09ICd1bmRlZmluZWQnO1xuICBmdW5jdGlvbiB1c2VOZXh0VGljaygpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICBwcm9jZXNzLm5leHRUaWNrKGZsdXNoKTtcbiAgICB9O1xuICB9XG4gIGZ1bmN0aW9uIHVzZU11dGF0aW9uT2JzZXJ2ZXIoKSB7XG4gICAgdmFyIGl0ZXJhdGlvbnMgPSAwO1xuICAgIHZhciBvYnNlcnZlciA9IG5ldyBCcm93c2VyTXV0YXRpb25PYnNlcnZlcihmbHVzaCk7XG4gICAgdmFyIG5vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSgnJyk7XG4gICAgb2JzZXJ2ZXIub2JzZXJ2ZShub2RlLCB7Y2hhcmFjdGVyRGF0YTogdHJ1ZX0pO1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIG5vZGUuZGF0YSA9IChpdGVyYXRpb25zID0gKytpdGVyYXRpb25zICUgMik7XG4gICAgfTtcbiAgfVxuICBmdW5jdGlvbiB1c2VNZXNzYWdlQ2hhbm5lbCgpIHtcbiAgICB2YXIgY2hhbm5lbCA9IG5ldyBNZXNzYWdlQ2hhbm5lbCgpO1xuICAgIGNoYW5uZWwucG9ydDEub25tZXNzYWdlID0gZmx1c2g7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgY2hhbm5lbC5wb3J0Mi5wb3N0TWVzc2FnZSgwKTtcbiAgICB9O1xuICB9XG4gIGZ1bmN0aW9uIHVzZVNldFRpbWVvdXQoKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgc2V0VGltZW91dChmbHVzaCwgMSk7XG4gICAgfTtcbiAgfVxuICB2YXIgcXVldWUgPSBuZXcgQXJyYXkoMTAwMCk7XG4gIGZ1bmN0aW9uIGZsdXNoKCkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpICs9IDIpIHtcbiAgICAgIHZhciBjYWxsYmFjayA9IHF1ZXVlW2ldO1xuICAgICAgdmFyIGFyZyA9IHF1ZXVlW2kgKyAxXTtcbiAgICAgIGNhbGxiYWNrKGFyZyk7XG4gICAgICBxdWV1ZVtpXSA9IHVuZGVmaW5lZDtcbiAgICAgIHF1ZXVlW2kgKyAxXSA9IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgbGVuID0gMDtcbiAgfVxuICB2YXIgc2NoZWR1bGVGbHVzaDtcbiAgaWYgKHR5cGVvZiBwcm9jZXNzICE9PSAndW5kZWZpbmVkJyAmJiB7fS50b1N0cmluZy5jYWxsKHByb2Nlc3MpID09PSAnW29iamVjdCBwcm9jZXNzXScpIHtcbiAgICBzY2hlZHVsZUZsdXNoID0gdXNlTmV4dFRpY2soKTtcbiAgfSBlbHNlIGlmIChCcm93c2VyTXV0YXRpb25PYnNlcnZlcikge1xuICAgIHNjaGVkdWxlRmx1c2ggPSB1c2VNdXRhdGlvbk9ic2VydmVyKCk7XG4gIH0gZWxzZSBpZiAoaXNXb3JrZXIpIHtcbiAgICBzY2hlZHVsZUZsdXNoID0gdXNlTWVzc2FnZUNoYW5uZWwoKTtcbiAgfSBlbHNlIHtcbiAgICBzY2hlZHVsZUZsdXNoID0gdXNlU2V0VGltZW91dCgpO1xuICB9XG4gIHJldHVybiB7Z2V0IGRlZmF1bHQoKSB7XG4gICAgICByZXR1cm4gJF9fZGVmYXVsdDtcbiAgICB9fTtcbn0pO1xuU3lzdGVtLnJlZ2lzdGVyKFwidHJhY2V1ci1ydW50aW1lQDAuMC43Mi9zcmMvcnVudGltZS9wb2x5ZmlsbHMvUHJvbWlzZVwiLCBbXSwgZnVuY3Rpb24oKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuICB2YXIgX19tb2R1bGVOYW1lID0gXCJ0cmFjZXVyLXJ1bnRpbWVAMC4wLjcyL3NyYy9ydW50aW1lL3BvbHlmaWxscy9Qcm9taXNlXCI7XG4gIHZhciBhc3luYyA9IFN5c3RlbS5nZXQoXCJ0cmFjZXVyLXJ1bnRpbWVAMC4wLjcyL25vZGVfbW9kdWxlcy9yc3ZwL2xpYi9yc3ZwL2FzYXBcIikuZGVmYXVsdDtcbiAgdmFyIHJlZ2lzdGVyUG9seWZpbGwgPSBTeXN0ZW0uZ2V0KFwidHJhY2V1ci1ydW50aW1lQDAuMC43Mi9zcmMvcnVudGltZS9wb2x5ZmlsbHMvdXRpbHNcIikucmVnaXN0ZXJQb2x5ZmlsbDtcbiAgdmFyIHByb21pc2VSYXcgPSB7fTtcbiAgZnVuY3Rpb24gaXNQcm9taXNlKHgpIHtcbiAgICByZXR1cm4geCAmJiB0eXBlb2YgeCA9PT0gJ29iamVjdCcgJiYgeC5zdGF0dXNfICE9PSB1bmRlZmluZWQ7XG4gIH1cbiAgZnVuY3Rpb24gaWRSZXNvbHZlSGFuZGxlcih4KSB7XG4gICAgcmV0dXJuIHg7XG4gIH1cbiAgZnVuY3Rpb24gaWRSZWplY3RIYW5kbGVyKHgpIHtcbiAgICB0aHJvdyB4O1xuICB9XG4gIGZ1bmN0aW9uIGNoYWluKHByb21pc2UpIHtcbiAgICB2YXIgb25SZXNvbHZlID0gYXJndW1lbnRzWzFdICE9PSAodm9pZCAwKSA/IGFyZ3VtZW50c1sxXSA6IGlkUmVzb2x2ZUhhbmRsZXI7XG4gICAgdmFyIG9uUmVqZWN0ID0gYXJndW1lbnRzWzJdICE9PSAodm9pZCAwKSA/IGFyZ3VtZW50c1syXSA6IGlkUmVqZWN0SGFuZGxlcjtcbiAgICB2YXIgZGVmZXJyZWQgPSBnZXREZWZlcnJlZChwcm9taXNlLmNvbnN0cnVjdG9yKTtcbiAgICBzd2l0Y2ggKHByb21pc2Uuc3RhdHVzXykge1xuICAgICAgY2FzZSB1bmRlZmluZWQ6XG4gICAgICAgIHRocm93IFR5cGVFcnJvcjtcbiAgICAgIGNhc2UgMDpcbiAgICAgICAgcHJvbWlzZS5vblJlc29sdmVfLnB1c2gob25SZXNvbHZlLCBkZWZlcnJlZCk7XG4gICAgICAgIHByb21pc2Uub25SZWplY3RfLnB1c2gob25SZWplY3QsIGRlZmVycmVkKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICsxOlxuICAgICAgICBwcm9taXNlRW5xdWV1ZShwcm9taXNlLnZhbHVlXywgW29uUmVzb2x2ZSwgZGVmZXJyZWRdKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIC0xOlxuICAgICAgICBwcm9taXNlRW5xdWV1ZShwcm9taXNlLnZhbHVlXywgW29uUmVqZWN0LCBkZWZlcnJlZF0pO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH1cbiAgZnVuY3Rpb24gZ2V0RGVmZXJyZWQoQykge1xuICAgIGlmICh0aGlzID09PSAkUHJvbWlzZSkge1xuICAgICAgdmFyIHByb21pc2UgPSBwcm9taXNlSW5pdChuZXcgJFByb21pc2UocHJvbWlzZVJhdykpO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgcHJvbWlzZTogcHJvbWlzZSxcbiAgICAgICAgcmVzb2x2ZTogKGZ1bmN0aW9uKHgpIHtcbiAgICAgICAgICBwcm9taXNlUmVzb2x2ZShwcm9taXNlLCB4KTtcbiAgICAgICAgfSksXG4gICAgICAgIHJlamVjdDogKGZ1bmN0aW9uKHIpIHtcbiAgICAgICAgICBwcm9taXNlUmVqZWN0KHByb21pc2UsIHIpO1xuICAgICAgICB9KVxuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIHJlc3VsdCA9IHt9O1xuICAgICAgcmVzdWx0LnByb21pc2UgPSBuZXcgQygoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIHJlc3VsdC5yZXNvbHZlID0gcmVzb2x2ZTtcbiAgICAgICAgcmVzdWx0LnJlamVjdCA9IHJlamVjdDtcbiAgICAgIH0pKTtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICB9XG4gIGZ1bmN0aW9uIHByb21pc2VTZXQocHJvbWlzZSwgc3RhdHVzLCB2YWx1ZSwgb25SZXNvbHZlLCBvblJlamVjdCkge1xuICAgIHByb21pc2Uuc3RhdHVzXyA9IHN0YXR1cztcbiAgICBwcm9taXNlLnZhbHVlXyA9IHZhbHVlO1xuICAgIHByb21pc2Uub25SZXNvbHZlXyA9IG9uUmVzb2x2ZTtcbiAgICBwcm9taXNlLm9uUmVqZWN0XyA9IG9uUmVqZWN0O1xuICAgIHJldHVybiBwcm9taXNlO1xuICB9XG4gIGZ1bmN0aW9uIHByb21pc2VJbml0KHByb21pc2UpIHtcbiAgICByZXR1cm4gcHJvbWlzZVNldChwcm9taXNlLCAwLCB1bmRlZmluZWQsIFtdLCBbXSk7XG4gIH1cbiAgdmFyIFByb21pc2UgPSBmdW5jdGlvbiBQcm9taXNlKHJlc29sdmVyKSB7XG4gICAgaWYgKHJlc29sdmVyID09PSBwcm9taXNlUmF3KVxuICAgICAgcmV0dXJuO1xuICAgIGlmICh0eXBlb2YgcmVzb2x2ZXIgIT09ICdmdW5jdGlvbicpXG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yO1xuICAgIHZhciBwcm9taXNlID0gcHJvbWlzZUluaXQodGhpcyk7XG4gICAgdHJ5IHtcbiAgICAgIHJlc29sdmVyKChmdW5jdGlvbih4KSB7XG4gICAgICAgIHByb21pc2VSZXNvbHZlKHByb21pc2UsIHgpO1xuICAgICAgfSksIChmdW5jdGlvbihyKSB7XG4gICAgICAgIHByb21pc2VSZWplY3QocHJvbWlzZSwgcik7XG4gICAgICB9KSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcHJvbWlzZVJlamVjdChwcm9taXNlLCBlKTtcbiAgICB9XG4gIH07XG4gICgkdHJhY2V1clJ1bnRpbWUuY3JlYXRlQ2xhc3MpKFByb21pc2UsIHtcbiAgICBjYXRjaDogZnVuY3Rpb24ob25SZWplY3QpIHtcbiAgICAgIHJldHVybiB0aGlzLnRoZW4odW5kZWZpbmVkLCBvblJlamVjdCk7XG4gICAgfSxcbiAgICB0aGVuOiBmdW5jdGlvbihvblJlc29sdmUsIG9uUmVqZWN0KSB7XG4gICAgICBpZiAodHlwZW9mIG9uUmVzb2x2ZSAhPT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgb25SZXNvbHZlID0gaWRSZXNvbHZlSGFuZGxlcjtcbiAgICAgIGlmICh0eXBlb2Ygb25SZWplY3QgIT09ICdmdW5jdGlvbicpXG4gICAgICAgIG9uUmVqZWN0ID0gaWRSZWplY3RIYW5kbGVyO1xuICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgICAgdmFyIGNvbnN0cnVjdG9yID0gdGhpcy5jb25zdHJ1Y3RvcjtcbiAgICAgIHJldHVybiBjaGFpbih0aGlzLCBmdW5jdGlvbih4KSB7XG4gICAgICAgIHggPSBwcm9taXNlQ29lcmNlKGNvbnN0cnVjdG9yLCB4KTtcbiAgICAgICAgcmV0dXJuIHggPT09IHRoYXQgPyBvblJlamVjdChuZXcgVHlwZUVycm9yKSA6IGlzUHJvbWlzZSh4KSA/IHgudGhlbihvblJlc29sdmUsIG9uUmVqZWN0KSA6IG9uUmVzb2x2ZSh4KTtcbiAgICAgIH0sIG9uUmVqZWN0KTtcbiAgICB9XG4gIH0sIHtcbiAgICByZXNvbHZlOiBmdW5jdGlvbih4KSB7XG4gICAgICBpZiAodGhpcyA9PT0gJFByb21pc2UpIHtcbiAgICAgICAgaWYgKGlzUHJvbWlzZSh4KSkge1xuICAgICAgICAgIHJldHVybiB4O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNlU2V0KG5ldyAkUHJvbWlzZShwcm9taXNlUmF3KSwgKzEsIHgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG5ldyB0aGlzKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgIHJlc29sdmUoeCk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0sXG4gICAgcmVqZWN0OiBmdW5jdGlvbihyKSB7XG4gICAgICBpZiAodGhpcyA9PT0gJFByb21pc2UpIHtcbiAgICAgICAgcmV0dXJuIHByb21pc2VTZXQobmV3ICRQcm9taXNlKHByb21pc2VSYXcpLCAtMSwgcik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gbmV3IHRoaXMoKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgIHJlamVjdChyKTtcbiAgICAgICAgfSkpO1xuICAgICAgfVxuICAgIH0sXG4gICAgYWxsOiBmdW5jdGlvbih2YWx1ZXMpIHtcbiAgICAgIHZhciBkZWZlcnJlZCA9IGdldERlZmVycmVkKHRoaXMpO1xuICAgICAgdmFyIHJlc29sdXRpb25zID0gW107XG4gICAgICB0cnkge1xuICAgICAgICB2YXIgY291bnQgPSB2YWx1ZXMubGVuZ3RoO1xuICAgICAgICBpZiAoY291bnQgPT09IDApIHtcbiAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHJlc29sdXRpb25zKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHZhbHVlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdGhpcy5yZXNvbHZlKHZhbHVlc1tpXSkudGhlbihmdW5jdGlvbihpLCB4KSB7XG4gICAgICAgICAgICAgIHJlc29sdXRpb25zW2ldID0geDtcbiAgICAgICAgICAgICAgaWYgKC0tY291bnQgPT09IDApXG4gICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShyZXNvbHV0aW9ucyk7XG4gICAgICAgICAgICB9LmJpbmQodW5kZWZpbmVkLCBpKSwgKGZ1bmN0aW9uKHIpIHtcbiAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KHIpO1xuICAgICAgICAgICAgfSkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBkZWZlcnJlZC5yZWplY3QoZSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9LFxuICAgIHJhY2U6IGZ1bmN0aW9uKHZhbHVlcykge1xuICAgICAgdmFyIGRlZmVycmVkID0gZ2V0RGVmZXJyZWQodGhpcyk7XG4gICAgICB0cnkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHZhbHVlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIHRoaXMucmVzb2x2ZSh2YWx1ZXNbaV0pLnRoZW4oKGZ1bmN0aW9uKHgpIHtcbiAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoeCk7XG4gICAgICAgICAgfSksIChmdW5jdGlvbihyKSB7XG4gICAgICAgICAgICBkZWZlcnJlZC5yZWplY3Qocik7XG4gICAgICAgICAgfSkpO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGRlZmVycmVkLnJlamVjdChlKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH1cbiAgfSk7XG4gIHZhciAkUHJvbWlzZSA9IFByb21pc2U7XG4gIHZhciAkUHJvbWlzZVJlamVjdCA9ICRQcm9taXNlLnJlamVjdDtcbiAgZnVuY3Rpb24gcHJvbWlzZVJlc29sdmUocHJvbWlzZSwgeCkge1xuICAgIHByb21pc2VEb25lKHByb21pc2UsICsxLCB4LCBwcm9taXNlLm9uUmVzb2x2ZV8pO1xuICB9XG4gIGZ1bmN0aW9uIHByb21pc2VSZWplY3QocHJvbWlzZSwgcikge1xuICAgIHByb21pc2VEb25lKHByb21pc2UsIC0xLCByLCBwcm9taXNlLm9uUmVqZWN0Xyk7XG4gIH1cbiAgZnVuY3Rpb24gcHJvbWlzZURvbmUocHJvbWlzZSwgc3RhdHVzLCB2YWx1ZSwgcmVhY3Rpb25zKSB7XG4gICAgaWYgKHByb21pc2Uuc3RhdHVzXyAhPT0gMClcbiAgICAgIHJldHVybjtcbiAgICBwcm9taXNlRW5xdWV1ZSh2YWx1ZSwgcmVhY3Rpb25zKTtcbiAgICBwcm9taXNlU2V0KHByb21pc2UsIHN0YXR1cywgdmFsdWUpO1xuICB9XG4gIGZ1bmN0aW9uIHByb21pc2VFbnF1ZXVlKHZhbHVlLCB0YXNrcykge1xuICAgIGFzeW5jKChmdW5jdGlvbigpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGFza3MubGVuZ3RoOyBpICs9IDIpIHtcbiAgICAgICAgcHJvbWlzZUhhbmRsZSh2YWx1ZSwgdGFza3NbaV0sIHRhc2tzW2kgKyAxXSk7XG4gICAgICB9XG4gICAgfSkpO1xuICB9XG4gIGZ1bmN0aW9uIHByb21pc2VIYW5kbGUodmFsdWUsIGhhbmRsZXIsIGRlZmVycmVkKSB7XG4gICAgdHJ5IHtcbiAgICAgIHZhciByZXN1bHQgPSBoYW5kbGVyKHZhbHVlKTtcbiAgICAgIGlmIChyZXN1bHQgPT09IGRlZmVycmVkLnByb21pc2UpXG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3I7XG4gICAgICBlbHNlIGlmIChpc1Byb21pc2UocmVzdWx0KSlcbiAgICAgICAgY2hhaW4ocmVzdWx0LCBkZWZlcnJlZC5yZXNvbHZlLCBkZWZlcnJlZC5yZWplY3QpO1xuICAgICAgZWxzZVxuICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHJlc3VsdCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgZGVmZXJyZWQucmVqZWN0KGUpO1xuICAgICAgfSBjYXRjaCAoZSkge31cbiAgICB9XG4gIH1cbiAgdmFyIHRoZW5hYmxlU3ltYm9sID0gJ0BAdGhlbmFibGUnO1xuICBmdW5jdGlvbiBpc09iamVjdCh4KSB7XG4gICAgcmV0dXJuIHggJiYgKHR5cGVvZiB4ID09PSAnb2JqZWN0JyB8fCB0eXBlb2YgeCA9PT0gJ2Z1bmN0aW9uJyk7XG4gIH1cbiAgZnVuY3Rpb24gcHJvbWlzZUNvZXJjZShjb25zdHJ1Y3RvciwgeCkge1xuICAgIGlmICghaXNQcm9taXNlKHgpICYmIGlzT2JqZWN0KHgpKSB7XG4gICAgICB2YXIgdGhlbjtcbiAgICAgIHRyeSB7XG4gICAgICAgIHRoZW4gPSB4LnRoZW47XG4gICAgICB9IGNhdGNoIChyKSB7XG4gICAgICAgIHZhciBwcm9taXNlID0gJFByb21pc2VSZWplY3QuY2FsbChjb25zdHJ1Y3Rvciwgcik7XG4gICAgICAgIHhbdGhlbmFibGVTeW1ib2xdID0gcHJvbWlzZTtcbiAgICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIHRoZW4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdmFyIHAgPSB4W3RoZW5hYmxlU3ltYm9sXTtcbiAgICAgICAgaWYgKHApIHtcbiAgICAgICAgICByZXR1cm4gcDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2YXIgZGVmZXJyZWQgPSBnZXREZWZlcnJlZChjb25zdHJ1Y3Rvcik7XG4gICAgICAgICAgeFt0aGVuYWJsZVN5bWJvbF0gPSBkZWZlcnJlZC5wcm9taXNlO1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0aGVuLmNhbGwoeCwgZGVmZXJyZWQucmVzb2x2ZSwgZGVmZXJyZWQucmVqZWN0KTtcbiAgICAgICAgICB9IGNhdGNoIChyKSB7XG4gICAgICAgICAgICBkZWZlcnJlZC5yZWplY3Qocik7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB4O1xuICB9XG4gIGZ1bmN0aW9uIHBvbHlmaWxsUHJvbWlzZShnbG9iYWwpIHtcbiAgICBpZiAoIWdsb2JhbC5Qcm9taXNlKVxuICAgICAgZ2xvYmFsLlByb21pc2UgPSBQcm9taXNlO1xuICB9XG4gIHJlZ2lzdGVyUG9seWZpbGwocG9seWZpbGxQcm9taXNlKTtcbiAgcmV0dXJuIHtcbiAgICBnZXQgUHJvbWlzZSgpIHtcbiAgICAgIHJldHVybiBQcm9taXNlO1xuICAgIH0sXG4gICAgZ2V0IHBvbHlmaWxsUHJvbWlzZSgpIHtcbiAgICAgIHJldHVybiBwb2x5ZmlsbFByb21pc2U7XG4gICAgfVxuICB9O1xufSk7XG5TeXN0ZW0uZ2V0KFwidHJhY2V1ci1ydW50aW1lQDAuMC43Mi9zcmMvcnVudGltZS9wb2x5ZmlsbHMvUHJvbWlzZVwiICsgJycpO1xuU3lzdGVtLnJlZ2lzdGVyKFwidHJhY2V1ci1ydW50aW1lQDAuMC43Mi9zcmMvcnVudGltZS9wb2x5ZmlsbHMvU3RyaW5nSXRlcmF0b3JcIiwgW10sIGZ1bmN0aW9uKCkge1xuICBcInVzZSBzdHJpY3RcIjtcbiAgdmFyICRfXzI7XG4gIHZhciBfX21vZHVsZU5hbWUgPSBcInRyYWNldXItcnVudGltZUAwLjAuNzIvc3JjL3J1bnRpbWUvcG9seWZpbGxzL1N0cmluZ0l0ZXJhdG9yXCI7XG4gIHZhciAkX18wID0gU3lzdGVtLmdldChcInRyYWNldXItcnVudGltZUAwLjAuNzIvc3JjL3J1bnRpbWUvcG9seWZpbGxzL3V0aWxzXCIpLFxuICAgICAgY3JlYXRlSXRlcmF0b3JSZXN1bHRPYmplY3QgPSAkX18wLmNyZWF0ZUl0ZXJhdG9yUmVzdWx0T2JqZWN0LFxuICAgICAgaXNPYmplY3QgPSAkX18wLmlzT2JqZWN0O1xuICB2YXIgdG9Qcm9wZXJ0eSA9ICR0cmFjZXVyUnVudGltZS50b1Byb3BlcnR5O1xuICB2YXIgaGFzT3duUHJvcGVydHkgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xuICB2YXIgaXRlcmF0ZWRTdHJpbmcgPSBTeW1ib2woJ2l0ZXJhdGVkU3RyaW5nJyk7XG4gIHZhciBzdHJpbmdJdGVyYXRvck5leHRJbmRleCA9IFN5bWJvbCgnc3RyaW5nSXRlcmF0b3JOZXh0SW5kZXgnKTtcbiAgdmFyIFN0cmluZ0l0ZXJhdG9yID0gZnVuY3Rpb24gU3RyaW5nSXRlcmF0b3IoKSB7fTtcbiAgKCR0cmFjZXVyUnVudGltZS5jcmVhdGVDbGFzcykoU3RyaW5nSXRlcmF0b3IsICgkX18yID0ge30sIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSgkX18yLCBcIm5leHRcIiwge1xuICAgIHZhbHVlOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBvID0gdGhpcztcbiAgICAgIGlmICghaXNPYmplY3QobykgfHwgIWhhc093blByb3BlcnR5LmNhbGwobywgaXRlcmF0ZWRTdHJpbmcpKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ3RoaXMgbXVzdCBiZSBhIFN0cmluZ0l0ZXJhdG9yIG9iamVjdCcpO1xuICAgICAgfVxuICAgICAgdmFyIHMgPSBvW3RvUHJvcGVydHkoaXRlcmF0ZWRTdHJpbmcpXTtcbiAgICAgIGlmIChzID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIGNyZWF0ZUl0ZXJhdG9yUmVzdWx0T2JqZWN0KHVuZGVmaW5lZCwgdHJ1ZSk7XG4gICAgICB9XG4gICAgICB2YXIgcG9zaXRpb24gPSBvW3RvUHJvcGVydHkoc3RyaW5nSXRlcmF0b3JOZXh0SW5kZXgpXTtcbiAgICAgIHZhciBsZW4gPSBzLmxlbmd0aDtcbiAgICAgIGlmIChwb3NpdGlvbiA+PSBsZW4pIHtcbiAgICAgICAgb1t0b1Byb3BlcnR5KGl0ZXJhdGVkU3RyaW5nKV0gPSB1bmRlZmluZWQ7XG4gICAgICAgIHJldHVybiBjcmVhdGVJdGVyYXRvclJlc3VsdE9iamVjdCh1bmRlZmluZWQsIHRydWUpO1xuICAgICAgfVxuICAgICAgdmFyIGZpcnN0ID0gcy5jaGFyQ29kZUF0KHBvc2l0aW9uKTtcbiAgICAgIHZhciByZXN1bHRTdHJpbmc7XG4gICAgICBpZiAoZmlyc3QgPCAweEQ4MDAgfHwgZmlyc3QgPiAweERCRkYgfHwgcG9zaXRpb24gKyAxID09PSBsZW4pIHtcbiAgICAgICAgcmVzdWx0U3RyaW5nID0gU3RyaW5nLmZyb21DaGFyQ29kZShmaXJzdCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgc2Vjb25kID0gcy5jaGFyQ29kZUF0KHBvc2l0aW9uICsgMSk7XG4gICAgICAgIGlmIChzZWNvbmQgPCAweERDMDAgfHwgc2Vjb25kID4gMHhERkZGKSB7XG4gICAgICAgICAgcmVzdWx0U3RyaW5nID0gU3RyaW5nLmZyb21DaGFyQ29kZShmaXJzdCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVzdWx0U3RyaW5nID0gU3RyaW5nLmZyb21DaGFyQ29kZShmaXJzdCkgKyBTdHJpbmcuZnJvbUNoYXJDb2RlKHNlY29uZCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIG9bdG9Qcm9wZXJ0eShzdHJpbmdJdGVyYXRvck5leHRJbmRleCldID0gcG9zaXRpb24gKyByZXN1bHRTdHJpbmcubGVuZ3RoO1xuICAgICAgcmV0dXJuIGNyZWF0ZUl0ZXJhdG9yUmVzdWx0T2JqZWN0KHJlc3VsdFN0cmluZywgZmFsc2UpO1xuICAgIH0sXG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgd3JpdGFibGU6IHRydWVcbiAgfSksIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSgkX18yLCBTeW1ib2wuaXRlcmF0b3IsIHtcbiAgICB2YWx1ZTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgIHdyaXRhYmxlOiB0cnVlXG4gIH0pLCAkX18yKSwge30pO1xuICBmdW5jdGlvbiBjcmVhdGVTdHJpbmdJdGVyYXRvcihzdHJpbmcpIHtcbiAgICB2YXIgcyA9IFN0cmluZyhzdHJpbmcpO1xuICAgIHZhciBpdGVyYXRvciA9IE9iamVjdC5jcmVhdGUoU3RyaW5nSXRlcmF0b3IucHJvdG90eXBlKTtcbiAgICBpdGVyYXRvclt0b1Byb3BlcnR5KGl0ZXJhdGVkU3RyaW5nKV0gPSBzO1xuICAgIGl0ZXJhdG9yW3RvUHJvcGVydHkoc3RyaW5nSXRlcmF0b3JOZXh0SW5kZXgpXSA9IDA7XG4gICAgcmV0dXJuIGl0ZXJhdG9yO1xuICB9XG4gIHJldHVybiB7Z2V0IGNyZWF0ZVN0cmluZ0l0ZXJhdG9yKCkge1xuICAgICAgcmV0dXJuIGNyZWF0ZVN0cmluZ0l0ZXJhdG9yO1xuICAgIH19O1xufSk7XG5TeXN0ZW0ucmVnaXN0ZXIoXCJ0cmFjZXVyLXJ1bnRpbWVAMC4wLjcyL3NyYy9ydW50aW1lL3BvbHlmaWxscy9TdHJpbmdcIiwgW10sIGZ1bmN0aW9uKCkge1xuICBcInVzZSBzdHJpY3RcIjtcbiAgdmFyIF9fbW9kdWxlTmFtZSA9IFwidHJhY2V1ci1ydW50aW1lQDAuMC43Mi9zcmMvcnVudGltZS9wb2x5ZmlsbHMvU3RyaW5nXCI7XG4gIHZhciBjcmVhdGVTdHJpbmdJdGVyYXRvciA9IFN5c3RlbS5nZXQoXCJ0cmFjZXVyLXJ1bnRpbWVAMC4wLjcyL3NyYy9ydW50aW1lL3BvbHlmaWxscy9TdHJpbmdJdGVyYXRvclwiKS5jcmVhdGVTdHJpbmdJdGVyYXRvcjtcbiAgdmFyICRfXzEgPSBTeXN0ZW0uZ2V0KFwidHJhY2V1ci1ydW50aW1lQDAuMC43Mi9zcmMvcnVudGltZS9wb2x5ZmlsbHMvdXRpbHNcIiksXG4gICAgICBtYXliZUFkZEZ1bmN0aW9ucyA9ICRfXzEubWF5YmVBZGRGdW5jdGlvbnMsXG4gICAgICBtYXliZUFkZEl0ZXJhdG9yID0gJF9fMS5tYXliZUFkZEl0ZXJhdG9yLFxuICAgICAgcmVnaXN0ZXJQb2x5ZmlsbCA9ICRfXzEucmVnaXN0ZXJQb2x5ZmlsbDtcbiAgdmFyICR0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG4gIHZhciAkaW5kZXhPZiA9IFN0cmluZy5wcm90b3R5cGUuaW5kZXhPZjtcbiAgdmFyICRsYXN0SW5kZXhPZiA9IFN0cmluZy5wcm90b3R5cGUubGFzdEluZGV4T2Y7XG4gIGZ1bmN0aW9uIHN0YXJ0c1dpdGgoc2VhcmNoKSB7XG4gICAgdmFyIHN0cmluZyA9IFN0cmluZyh0aGlzKTtcbiAgICBpZiAodGhpcyA9PSBudWxsIHx8ICR0b1N0cmluZy5jYWxsKHNlYXJjaCkgPT0gJ1tvYmplY3QgUmVnRXhwXScpIHtcbiAgICAgIHRocm93IFR5cGVFcnJvcigpO1xuICAgIH1cbiAgICB2YXIgc3RyaW5nTGVuZ3RoID0gc3RyaW5nLmxlbmd0aDtcbiAgICB2YXIgc2VhcmNoU3RyaW5nID0gU3RyaW5nKHNlYXJjaCk7XG4gICAgdmFyIHNlYXJjaExlbmd0aCA9IHNlYXJjaFN0cmluZy5sZW5ndGg7XG4gICAgdmFyIHBvc2l0aW9uID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgPyBhcmd1bWVudHNbMV0gOiB1bmRlZmluZWQ7XG4gICAgdmFyIHBvcyA9IHBvc2l0aW9uID8gTnVtYmVyKHBvc2l0aW9uKSA6IDA7XG4gICAgaWYgKGlzTmFOKHBvcykpIHtcbiAgICAgIHBvcyA9IDA7XG4gICAgfVxuICAgIHZhciBzdGFydCA9IE1hdGgubWluKE1hdGgubWF4KHBvcywgMCksIHN0cmluZ0xlbmd0aCk7XG4gICAgcmV0dXJuICRpbmRleE9mLmNhbGwoc3RyaW5nLCBzZWFyY2hTdHJpbmcsIHBvcykgPT0gc3RhcnQ7XG4gIH1cbiAgZnVuY3Rpb24gZW5kc1dpdGgoc2VhcmNoKSB7XG4gICAgdmFyIHN0cmluZyA9IFN0cmluZyh0aGlzKTtcbiAgICBpZiAodGhpcyA9PSBudWxsIHx8ICR0b1N0cmluZy5jYWxsKHNlYXJjaCkgPT0gJ1tvYmplY3QgUmVnRXhwXScpIHtcbiAgICAgIHRocm93IFR5cGVFcnJvcigpO1xuICAgIH1cbiAgICB2YXIgc3RyaW5nTGVuZ3RoID0gc3RyaW5nLmxlbmd0aDtcbiAgICB2YXIgc2VhcmNoU3RyaW5nID0gU3RyaW5nKHNlYXJjaCk7XG4gICAgdmFyIHNlYXJjaExlbmd0aCA9IHNlYXJjaFN0cmluZy5sZW5ndGg7XG4gICAgdmFyIHBvcyA9IHN0cmluZ0xlbmd0aDtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgIHZhciBwb3NpdGlvbiA9IGFyZ3VtZW50c1sxXTtcbiAgICAgIGlmIChwb3NpdGlvbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHBvcyA9IHBvc2l0aW9uID8gTnVtYmVyKHBvc2l0aW9uKSA6IDA7XG4gICAgICAgIGlmIChpc05hTihwb3MpKSB7XG4gICAgICAgICAgcG9zID0gMDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICB2YXIgZW5kID0gTWF0aC5taW4oTWF0aC5tYXgocG9zLCAwKSwgc3RyaW5nTGVuZ3RoKTtcbiAgICB2YXIgc3RhcnQgPSBlbmQgLSBzZWFyY2hMZW5ndGg7XG4gICAgaWYgKHN0YXJ0IDwgMCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gJGxhc3RJbmRleE9mLmNhbGwoc3RyaW5nLCBzZWFyY2hTdHJpbmcsIHN0YXJ0KSA9PSBzdGFydDtcbiAgfVxuICBmdW5jdGlvbiBjb250YWlucyhzZWFyY2gpIHtcbiAgICBpZiAodGhpcyA9PSBudWxsKSB7XG4gICAgICB0aHJvdyBUeXBlRXJyb3IoKTtcbiAgICB9XG4gICAgdmFyIHN0cmluZyA9IFN0cmluZyh0aGlzKTtcbiAgICB2YXIgc3RyaW5nTGVuZ3RoID0gc3RyaW5nLmxlbmd0aDtcbiAgICB2YXIgc2VhcmNoU3RyaW5nID0gU3RyaW5nKHNlYXJjaCk7XG4gICAgdmFyIHNlYXJjaExlbmd0aCA9IHNlYXJjaFN0cmluZy5sZW5ndGg7XG4gICAgdmFyIHBvc2l0aW9uID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgPyBhcmd1bWVudHNbMV0gOiB1bmRlZmluZWQ7XG4gICAgdmFyIHBvcyA9IHBvc2l0aW9uID8gTnVtYmVyKHBvc2l0aW9uKSA6IDA7XG4gICAgaWYgKGlzTmFOKHBvcykpIHtcbiAgICAgIHBvcyA9IDA7XG4gICAgfVxuICAgIHZhciBzdGFydCA9IE1hdGgubWluKE1hdGgubWF4KHBvcywgMCksIHN0cmluZ0xlbmd0aCk7XG4gICAgcmV0dXJuICRpbmRleE9mLmNhbGwoc3RyaW5nLCBzZWFyY2hTdHJpbmcsIHBvcykgIT0gLTE7XG4gIH1cbiAgZnVuY3Rpb24gcmVwZWF0KGNvdW50KSB7XG4gICAgaWYgKHRoaXMgPT0gbnVsbCkge1xuICAgICAgdGhyb3cgVHlwZUVycm9yKCk7XG4gICAgfVxuICAgIHZhciBzdHJpbmcgPSBTdHJpbmcodGhpcyk7XG4gICAgdmFyIG4gPSBjb3VudCA/IE51bWJlcihjb3VudCkgOiAwO1xuICAgIGlmIChpc05hTihuKSkge1xuICAgICAgbiA9IDA7XG4gICAgfVxuICAgIGlmIChuIDwgMCB8fCBuID09IEluZmluaXR5KSB7XG4gICAgICB0aHJvdyBSYW5nZUVycm9yKCk7XG4gICAgfVxuICAgIGlmIChuID09IDApIHtcbiAgICAgIHJldHVybiAnJztcbiAgICB9XG4gICAgdmFyIHJlc3VsdCA9ICcnO1xuICAgIHdoaWxlIChuLS0pIHtcbiAgICAgIHJlc3VsdCArPSBzdHJpbmc7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbiAgZnVuY3Rpb24gY29kZVBvaW50QXQocG9zaXRpb24pIHtcbiAgICBpZiAodGhpcyA9PSBudWxsKSB7XG4gICAgICB0aHJvdyBUeXBlRXJyb3IoKTtcbiAgICB9XG4gICAgdmFyIHN0cmluZyA9IFN0cmluZyh0aGlzKTtcbiAgICB2YXIgc2l6ZSA9IHN0cmluZy5sZW5ndGg7XG4gICAgdmFyIGluZGV4ID0gcG9zaXRpb24gPyBOdW1iZXIocG9zaXRpb24pIDogMDtcbiAgICBpZiAoaXNOYU4oaW5kZXgpKSB7XG4gICAgICBpbmRleCA9IDA7XG4gICAgfVxuICAgIGlmIChpbmRleCA8IDAgfHwgaW5kZXggPj0gc2l6ZSkge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gICAgdmFyIGZpcnN0ID0gc3RyaW5nLmNoYXJDb2RlQXQoaW5kZXgpO1xuICAgIHZhciBzZWNvbmQ7XG4gICAgaWYgKGZpcnN0ID49IDB4RDgwMCAmJiBmaXJzdCA8PSAweERCRkYgJiYgc2l6ZSA+IGluZGV4ICsgMSkge1xuICAgICAgc2Vjb25kID0gc3RyaW5nLmNoYXJDb2RlQXQoaW5kZXggKyAxKTtcbiAgICAgIGlmIChzZWNvbmQgPj0gMHhEQzAwICYmIHNlY29uZCA8PSAweERGRkYpIHtcbiAgICAgICAgcmV0dXJuIChmaXJzdCAtIDB4RDgwMCkgKiAweDQwMCArIHNlY29uZCAtIDB4REMwMCArIDB4MTAwMDA7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmaXJzdDtcbiAgfVxuICBmdW5jdGlvbiByYXcoY2FsbHNpdGUpIHtcbiAgICB2YXIgcmF3ID0gY2FsbHNpdGUucmF3O1xuICAgIHZhciBsZW4gPSByYXcubGVuZ3RoID4+PiAwO1xuICAgIGlmIChsZW4gPT09IDApXG4gICAgICByZXR1cm4gJyc7XG4gICAgdmFyIHMgPSAnJztcbiAgICB2YXIgaSA9IDA7XG4gICAgd2hpbGUgKHRydWUpIHtcbiAgICAgIHMgKz0gcmF3W2ldO1xuICAgICAgaWYgKGkgKyAxID09PSBsZW4pXG4gICAgICAgIHJldHVybiBzO1xuICAgICAgcyArPSBhcmd1bWVudHNbKytpXTtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gZnJvbUNvZGVQb2ludCgpIHtcbiAgICB2YXIgY29kZVVuaXRzID0gW107XG4gICAgdmFyIGZsb29yID0gTWF0aC5mbG9vcjtcbiAgICB2YXIgaGlnaFN1cnJvZ2F0ZTtcbiAgICB2YXIgbG93U3Vycm9nYXRlO1xuICAgIHZhciBpbmRleCA9IC0xO1xuICAgIHZhciBsZW5ndGggPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgIGlmICghbGVuZ3RoKSB7XG4gICAgICByZXR1cm4gJyc7XG4gICAgfVxuICAgIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgICB2YXIgY29kZVBvaW50ID0gTnVtYmVyKGFyZ3VtZW50c1tpbmRleF0pO1xuICAgICAgaWYgKCFpc0Zpbml0ZShjb2RlUG9pbnQpIHx8IGNvZGVQb2ludCA8IDAgfHwgY29kZVBvaW50ID4gMHgxMEZGRkYgfHwgZmxvb3IoY29kZVBvaW50KSAhPSBjb2RlUG9pbnQpIHtcbiAgICAgICAgdGhyb3cgUmFuZ2VFcnJvcignSW52YWxpZCBjb2RlIHBvaW50OiAnICsgY29kZVBvaW50KTtcbiAgICAgIH1cbiAgICAgIGlmIChjb2RlUG9pbnQgPD0gMHhGRkZGKSB7XG4gICAgICAgIGNvZGVVbml0cy5wdXNoKGNvZGVQb2ludCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb2RlUG9pbnQgLT0gMHgxMDAwMDtcbiAgICAgICAgaGlnaFN1cnJvZ2F0ZSA9IChjb2RlUG9pbnQgPj4gMTApICsgMHhEODAwO1xuICAgICAgICBsb3dTdXJyb2dhdGUgPSAoY29kZVBvaW50ICUgMHg0MDApICsgMHhEQzAwO1xuICAgICAgICBjb2RlVW5pdHMucHVzaChoaWdoU3Vycm9nYXRlLCBsb3dTdXJyb2dhdGUpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZS5hcHBseShudWxsLCBjb2RlVW5pdHMpO1xuICB9XG4gIGZ1bmN0aW9uIHN0cmluZ1Byb3RvdHlwZUl0ZXJhdG9yKCkge1xuICAgIHZhciBvID0gJHRyYWNldXJSdW50aW1lLmNoZWNrT2JqZWN0Q29lcmNpYmxlKHRoaXMpO1xuICAgIHZhciBzID0gU3RyaW5nKG8pO1xuICAgIHJldHVybiBjcmVhdGVTdHJpbmdJdGVyYXRvcihzKTtcbiAgfVxuICBmdW5jdGlvbiBwb2x5ZmlsbFN0cmluZyhnbG9iYWwpIHtcbiAgICB2YXIgU3RyaW5nID0gZ2xvYmFsLlN0cmluZztcbiAgICBtYXliZUFkZEZ1bmN0aW9ucyhTdHJpbmcucHJvdG90eXBlLCBbJ2NvZGVQb2ludEF0JywgY29kZVBvaW50QXQsICdjb250YWlucycsIGNvbnRhaW5zLCAnZW5kc1dpdGgnLCBlbmRzV2l0aCwgJ3N0YXJ0c1dpdGgnLCBzdGFydHNXaXRoLCAncmVwZWF0JywgcmVwZWF0XSk7XG4gICAgbWF5YmVBZGRGdW5jdGlvbnMoU3RyaW5nLCBbJ2Zyb21Db2RlUG9pbnQnLCBmcm9tQ29kZVBvaW50LCAncmF3JywgcmF3XSk7XG4gICAgbWF5YmVBZGRJdGVyYXRvcihTdHJpbmcucHJvdG90eXBlLCBzdHJpbmdQcm90b3R5cGVJdGVyYXRvciwgU3ltYm9sKTtcbiAgfVxuICByZWdpc3RlclBvbHlmaWxsKHBvbHlmaWxsU3RyaW5nKTtcbiAgcmV0dXJuIHtcbiAgICBnZXQgc3RhcnRzV2l0aCgpIHtcbiAgICAgIHJldHVybiBzdGFydHNXaXRoO1xuICAgIH0sXG4gICAgZ2V0IGVuZHNXaXRoKCkge1xuICAgICAgcmV0dXJuIGVuZHNXaXRoO1xuICAgIH0sXG4gICAgZ2V0IGNvbnRhaW5zKCkge1xuICAgICAgcmV0dXJuIGNvbnRhaW5zO1xuICAgIH0sXG4gICAgZ2V0IHJlcGVhdCgpIHtcbiAgICAgIHJldHVybiByZXBlYXQ7XG4gICAgfSxcbiAgICBnZXQgY29kZVBvaW50QXQoKSB7XG4gICAgICByZXR1cm4gY29kZVBvaW50QXQ7XG4gICAgfSxcbiAgICBnZXQgcmF3KCkge1xuICAgICAgcmV0dXJuIHJhdztcbiAgICB9LFxuICAgIGdldCBmcm9tQ29kZVBvaW50KCkge1xuICAgICAgcmV0dXJuIGZyb21Db2RlUG9pbnQ7XG4gICAgfSxcbiAgICBnZXQgc3RyaW5nUHJvdG90eXBlSXRlcmF0b3IoKSB7XG4gICAgICByZXR1cm4gc3RyaW5nUHJvdG90eXBlSXRlcmF0b3I7XG4gICAgfSxcbiAgICBnZXQgcG9seWZpbGxTdHJpbmcoKSB7XG4gICAgICByZXR1cm4gcG9seWZpbGxTdHJpbmc7XG4gICAgfVxuICB9O1xufSk7XG5TeXN0ZW0uZ2V0KFwidHJhY2V1ci1ydW50aW1lQDAuMC43Mi9zcmMvcnVudGltZS9wb2x5ZmlsbHMvU3RyaW5nXCIgKyAnJyk7XG5TeXN0ZW0ucmVnaXN0ZXIoXCJ0cmFjZXVyLXJ1bnRpbWVAMC4wLjcyL3NyYy9ydW50aW1lL3BvbHlmaWxscy9BcnJheUl0ZXJhdG9yXCIsIFtdLCBmdW5jdGlvbigpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG4gIHZhciAkX18yO1xuICB2YXIgX19tb2R1bGVOYW1lID0gXCJ0cmFjZXVyLXJ1bnRpbWVAMC4wLjcyL3NyYy9ydW50aW1lL3BvbHlmaWxscy9BcnJheUl0ZXJhdG9yXCI7XG4gIHZhciAkX18wID0gU3lzdGVtLmdldChcInRyYWNldXItcnVudGltZUAwLjAuNzIvc3JjL3J1bnRpbWUvcG9seWZpbGxzL3V0aWxzXCIpLFxuICAgICAgdG9PYmplY3QgPSAkX18wLnRvT2JqZWN0LFxuICAgICAgdG9VaW50MzIgPSAkX18wLnRvVWludDMyLFxuICAgICAgY3JlYXRlSXRlcmF0b3JSZXN1bHRPYmplY3QgPSAkX18wLmNyZWF0ZUl0ZXJhdG9yUmVzdWx0T2JqZWN0O1xuICB2YXIgQVJSQVlfSVRFUkFUT1JfS0lORF9LRVlTID0gMTtcbiAgdmFyIEFSUkFZX0lURVJBVE9SX0tJTkRfVkFMVUVTID0gMjtcbiAgdmFyIEFSUkFZX0lURVJBVE9SX0tJTkRfRU5UUklFUyA9IDM7XG4gIHZhciBBcnJheUl0ZXJhdG9yID0gZnVuY3Rpb24gQXJyYXlJdGVyYXRvcigpIHt9O1xuICAoJHRyYWNldXJSdW50aW1lLmNyZWF0ZUNsYXNzKShBcnJheUl0ZXJhdG9yLCAoJF9fMiA9IHt9LCBPYmplY3QuZGVmaW5lUHJvcGVydHkoJF9fMiwgXCJuZXh0XCIsIHtcbiAgICB2YWx1ZTogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgaXRlcmF0b3IgPSB0b09iamVjdCh0aGlzKTtcbiAgICAgIHZhciBhcnJheSA9IGl0ZXJhdG9yLml0ZXJhdG9yT2JqZWN0XztcbiAgICAgIGlmICghYXJyYXkpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignT2JqZWN0IGlzIG5vdCBhbiBBcnJheUl0ZXJhdG9yJyk7XG4gICAgICB9XG4gICAgICB2YXIgaW5kZXggPSBpdGVyYXRvci5hcnJheUl0ZXJhdG9yTmV4dEluZGV4XztcbiAgICAgIHZhciBpdGVtS2luZCA9IGl0ZXJhdG9yLmFycmF5SXRlcmF0aW9uS2luZF87XG4gICAgICB2YXIgbGVuZ3RoID0gdG9VaW50MzIoYXJyYXkubGVuZ3RoKTtcbiAgICAgIGlmIChpbmRleCA+PSBsZW5ndGgpIHtcbiAgICAgICAgaXRlcmF0b3IuYXJyYXlJdGVyYXRvck5leHRJbmRleF8gPSBJbmZpbml0eTtcbiAgICAgICAgcmV0dXJuIGNyZWF0ZUl0ZXJhdG9yUmVzdWx0T2JqZWN0KHVuZGVmaW5lZCwgdHJ1ZSk7XG4gICAgICB9XG4gICAgICBpdGVyYXRvci5hcnJheUl0ZXJhdG9yTmV4dEluZGV4XyA9IGluZGV4ICsgMTtcbiAgICAgIGlmIChpdGVtS2luZCA9PSBBUlJBWV9JVEVSQVRPUl9LSU5EX1ZBTFVFUylcbiAgICAgICAgcmV0dXJuIGNyZWF0ZUl0ZXJhdG9yUmVzdWx0T2JqZWN0KGFycmF5W2luZGV4XSwgZmFsc2UpO1xuICAgICAgaWYgKGl0ZW1LaW5kID09IEFSUkFZX0lURVJBVE9SX0tJTkRfRU5UUklFUylcbiAgICAgICAgcmV0dXJuIGNyZWF0ZUl0ZXJhdG9yUmVzdWx0T2JqZWN0KFtpbmRleCwgYXJyYXlbaW5kZXhdXSwgZmFsc2UpO1xuICAgICAgcmV0dXJuIGNyZWF0ZUl0ZXJhdG9yUmVzdWx0T2JqZWN0KGluZGV4LCBmYWxzZSk7XG4gICAgfSxcbiAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICB3cml0YWJsZTogdHJ1ZVxuICB9KSwgT2JqZWN0LmRlZmluZVByb3BlcnR5KCRfXzIsIFN5bWJvbC5pdGVyYXRvciwge1xuICAgIHZhbHVlOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgd3JpdGFibGU6IHRydWVcbiAgfSksICRfXzIpLCB7fSk7XG4gIGZ1bmN0aW9uIGNyZWF0ZUFycmF5SXRlcmF0b3IoYXJyYXksIGtpbmQpIHtcbiAgICB2YXIgb2JqZWN0ID0gdG9PYmplY3QoYXJyYXkpO1xuICAgIHZhciBpdGVyYXRvciA9IG5ldyBBcnJheUl0ZXJhdG9yO1xuICAgIGl0ZXJhdG9yLml0ZXJhdG9yT2JqZWN0XyA9IG9iamVjdDtcbiAgICBpdGVyYXRvci5hcnJheUl0ZXJhdG9yTmV4dEluZGV4XyA9IDA7XG4gICAgaXRlcmF0b3IuYXJyYXlJdGVyYXRpb25LaW5kXyA9IGtpbmQ7XG4gICAgcmV0dXJuIGl0ZXJhdG9yO1xuICB9XG4gIGZ1bmN0aW9uIGVudHJpZXMoKSB7XG4gICAgcmV0dXJuIGNyZWF0ZUFycmF5SXRlcmF0b3IodGhpcywgQVJSQVlfSVRFUkFUT1JfS0lORF9FTlRSSUVTKTtcbiAgfVxuICBmdW5jdGlvbiBrZXlzKCkge1xuICAgIHJldHVybiBjcmVhdGVBcnJheUl0ZXJhdG9yKHRoaXMsIEFSUkFZX0lURVJBVE9SX0tJTkRfS0VZUyk7XG4gIH1cbiAgZnVuY3Rpb24gdmFsdWVzKCkge1xuICAgIHJldHVybiBjcmVhdGVBcnJheUl0ZXJhdG9yKHRoaXMsIEFSUkFZX0lURVJBVE9SX0tJTkRfVkFMVUVTKTtcbiAgfVxuICByZXR1cm4ge1xuICAgIGdldCBlbnRyaWVzKCkge1xuICAgICAgcmV0dXJuIGVudHJpZXM7XG4gICAgfSxcbiAgICBnZXQga2V5cygpIHtcbiAgICAgIHJldHVybiBrZXlzO1xuICAgIH0sXG4gICAgZ2V0IHZhbHVlcygpIHtcbiAgICAgIHJldHVybiB2YWx1ZXM7XG4gICAgfVxuICB9O1xufSk7XG5TeXN0ZW0ucmVnaXN0ZXIoXCJ0cmFjZXVyLXJ1bnRpbWVAMC4wLjcyL3NyYy9ydW50aW1lL3BvbHlmaWxscy9BcnJheVwiLCBbXSwgZnVuY3Rpb24oKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuICB2YXIgX19tb2R1bGVOYW1lID0gXCJ0cmFjZXVyLXJ1bnRpbWVAMC4wLjcyL3NyYy9ydW50aW1lL3BvbHlmaWxscy9BcnJheVwiO1xuICB2YXIgJF9fMCA9IFN5c3RlbS5nZXQoXCJ0cmFjZXVyLXJ1bnRpbWVAMC4wLjcyL3NyYy9ydW50aW1lL3BvbHlmaWxscy9BcnJheUl0ZXJhdG9yXCIpLFxuICAgICAgZW50cmllcyA9ICRfXzAuZW50cmllcyxcbiAgICAgIGtleXMgPSAkX18wLmtleXMsXG4gICAgICB2YWx1ZXMgPSAkX18wLnZhbHVlcztcbiAgdmFyICRfXzEgPSBTeXN0ZW0uZ2V0KFwidHJhY2V1ci1ydW50aW1lQDAuMC43Mi9zcmMvcnVudGltZS9wb2x5ZmlsbHMvdXRpbHNcIiksXG4gICAgICBjaGVja0l0ZXJhYmxlID0gJF9fMS5jaGVja0l0ZXJhYmxlLFxuICAgICAgaXNDYWxsYWJsZSA9ICRfXzEuaXNDYWxsYWJsZSxcbiAgICAgIGlzQ29uc3RydWN0b3IgPSAkX18xLmlzQ29uc3RydWN0b3IsXG4gICAgICBtYXliZUFkZEZ1bmN0aW9ucyA9ICRfXzEubWF5YmVBZGRGdW5jdGlvbnMsXG4gICAgICBtYXliZUFkZEl0ZXJhdG9yID0gJF9fMS5tYXliZUFkZEl0ZXJhdG9yLFxuICAgICAgcmVnaXN0ZXJQb2x5ZmlsbCA9ICRfXzEucmVnaXN0ZXJQb2x5ZmlsbCxcbiAgICAgIHRvSW50ZWdlciA9ICRfXzEudG9JbnRlZ2VyLFxuICAgICAgdG9MZW5ndGggPSAkX18xLnRvTGVuZ3RoLFxuICAgICAgdG9PYmplY3QgPSAkX18xLnRvT2JqZWN0O1xuICBmdW5jdGlvbiBmcm9tKGFyckxpa2UpIHtcbiAgICB2YXIgbWFwRm4gPSBhcmd1bWVudHNbMV07XG4gICAgdmFyIHRoaXNBcmcgPSBhcmd1bWVudHNbMl07XG4gICAgdmFyIEMgPSB0aGlzO1xuICAgIHZhciBpdGVtcyA9IHRvT2JqZWN0KGFyckxpa2UpO1xuICAgIHZhciBtYXBwaW5nID0gbWFwRm4gIT09IHVuZGVmaW5lZDtcbiAgICB2YXIgayA9IDA7XG4gICAgdmFyIGFycixcbiAgICAgICAgbGVuO1xuICAgIGlmIChtYXBwaW5nICYmICFpc0NhbGxhYmxlKG1hcEZuKSkge1xuICAgICAgdGhyb3cgVHlwZUVycm9yKCk7XG4gICAgfVxuICAgIGlmIChjaGVja0l0ZXJhYmxlKGl0ZW1zKSkge1xuICAgICAgYXJyID0gaXNDb25zdHJ1Y3RvcihDKSA/IG5ldyBDKCkgOiBbXTtcbiAgICAgIGZvciAodmFyICRfXzIgPSBpdGVtc1tTeW1ib2wuaXRlcmF0b3JdKCksXG4gICAgICAgICAgJF9fMzsgISgkX18zID0gJF9fMi5uZXh0KCkpLmRvbmU7ICkge1xuICAgICAgICB2YXIgaXRlbSA9ICRfXzMudmFsdWU7XG4gICAgICAgIHtcbiAgICAgICAgICBpZiAobWFwcGluZykge1xuICAgICAgICAgICAgYXJyW2tdID0gbWFwRm4uY2FsbCh0aGlzQXJnLCBpdGVtLCBrKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYXJyW2tdID0gaXRlbTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaysrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBhcnIubGVuZ3RoID0gaztcbiAgICAgIHJldHVybiBhcnI7XG4gICAgfVxuICAgIGxlbiA9IHRvTGVuZ3RoKGl0ZW1zLmxlbmd0aCk7XG4gICAgYXJyID0gaXNDb25zdHJ1Y3RvcihDKSA/IG5ldyBDKGxlbikgOiBuZXcgQXJyYXkobGVuKTtcbiAgICBmb3IgKDsgayA8IGxlbjsgaysrKSB7XG4gICAgICBpZiAobWFwcGluZykge1xuICAgICAgICBhcnJba10gPSB0eXBlb2YgdGhpc0FyZyA9PT0gJ3VuZGVmaW5lZCcgPyBtYXBGbihpdGVtc1trXSwgaykgOiBtYXBGbi5jYWxsKHRoaXNBcmcsIGl0ZW1zW2tdLCBrKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGFycltrXSA9IGl0ZW1zW2tdO1xuICAgICAgfVxuICAgIH1cbiAgICBhcnIubGVuZ3RoID0gbGVuO1xuICAgIHJldHVybiBhcnI7XG4gIH1cbiAgZnVuY3Rpb24gb2YoKSB7XG4gICAgZm9yICh2YXIgaXRlbXMgPSBbXSxcbiAgICAgICAgJF9fNCA9IDA7ICRfXzQgPCBhcmd1bWVudHMubGVuZ3RoOyAkX180KyspXG4gICAgICBpdGVtc1skX180XSA9IGFyZ3VtZW50c1skX180XTtcbiAgICB2YXIgQyA9IHRoaXM7XG4gICAgdmFyIGxlbiA9IGl0ZW1zLmxlbmd0aDtcbiAgICB2YXIgYXJyID0gaXNDb25zdHJ1Y3RvcihDKSA/IG5ldyBDKGxlbikgOiBuZXcgQXJyYXkobGVuKTtcbiAgICBmb3IgKHZhciBrID0gMDsgayA8IGxlbjsgaysrKSB7XG4gICAgICBhcnJba10gPSBpdGVtc1trXTtcbiAgICB9XG4gICAgYXJyLmxlbmd0aCA9IGxlbjtcbiAgICByZXR1cm4gYXJyO1xuICB9XG4gIGZ1bmN0aW9uIGZpbGwodmFsdWUpIHtcbiAgICB2YXIgc3RhcnQgPSBhcmd1bWVudHNbMV0gIT09ICh2b2lkIDApID8gYXJndW1lbnRzWzFdIDogMDtcbiAgICB2YXIgZW5kID0gYXJndW1lbnRzWzJdO1xuICAgIHZhciBvYmplY3QgPSB0b09iamVjdCh0aGlzKTtcbiAgICB2YXIgbGVuID0gdG9MZW5ndGgob2JqZWN0Lmxlbmd0aCk7XG4gICAgdmFyIGZpbGxTdGFydCA9IHRvSW50ZWdlcihzdGFydCk7XG4gICAgdmFyIGZpbGxFbmQgPSBlbmQgIT09IHVuZGVmaW5lZCA/IHRvSW50ZWdlcihlbmQpIDogbGVuO1xuICAgIGZpbGxTdGFydCA9IGZpbGxTdGFydCA8IDAgPyBNYXRoLm1heChsZW4gKyBmaWxsU3RhcnQsIDApIDogTWF0aC5taW4oZmlsbFN0YXJ0LCBsZW4pO1xuICAgIGZpbGxFbmQgPSBmaWxsRW5kIDwgMCA/IE1hdGgubWF4KGxlbiArIGZpbGxFbmQsIDApIDogTWF0aC5taW4oZmlsbEVuZCwgbGVuKTtcbiAgICB3aGlsZSAoZmlsbFN0YXJ0IDwgZmlsbEVuZCkge1xuICAgICAgb2JqZWN0W2ZpbGxTdGFydF0gPSB2YWx1ZTtcbiAgICAgIGZpbGxTdGFydCsrO1xuICAgIH1cbiAgICByZXR1cm4gb2JqZWN0O1xuICB9XG4gIGZ1bmN0aW9uIGZpbmQocHJlZGljYXRlKSB7XG4gICAgdmFyIHRoaXNBcmcgPSBhcmd1bWVudHNbMV07XG4gICAgcmV0dXJuIGZpbmRIZWxwZXIodGhpcywgcHJlZGljYXRlLCB0aGlzQXJnKTtcbiAgfVxuICBmdW5jdGlvbiBmaW5kSW5kZXgocHJlZGljYXRlKSB7XG4gICAgdmFyIHRoaXNBcmcgPSBhcmd1bWVudHNbMV07XG4gICAgcmV0dXJuIGZpbmRIZWxwZXIodGhpcywgcHJlZGljYXRlLCB0aGlzQXJnLCB0cnVlKTtcbiAgfVxuICBmdW5jdGlvbiBmaW5kSGVscGVyKHNlbGYsIHByZWRpY2F0ZSkge1xuICAgIHZhciB0aGlzQXJnID0gYXJndW1lbnRzWzJdO1xuICAgIHZhciByZXR1cm5JbmRleCA9IGFyZ3VtZW50c1szXSAhPT0gKHZvaWQgMCkgPyBhcmd1bWVudHNbM10gOiBmYWxzZTtcbiAgICB2YXIgb2JqZWN0ID0gdG9PYmplY3Qoc2VsZik7XG4gICAgdmFyIGxlbiA9IHRvTGVuZ3RoKG9iamVjdC5sZW5ndGgpO1xuICAgIGlmICghaXNDYWxsYWJsZShwcmVkaWNhdGUpKSB7XG4gICAgICB0aHJvdyBUeXBlRXJyb3IoKTtcbiAgICB9XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgdmFyIHZhbHVlID0gb2JqZWN0W2ldO1xuICAgICAgaWYgKHByZWRpY2F0ZS5jYWxsKHRoaXNBcmcsIHZhbHVlLCBpLCBvYmplY3QpKSB7XG4gICAgICAgIHJldHVybiByZXR1cm5JbmRleCA/IGkgOiB2YWx1ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJldHVybkluZGV4ID8gLTEgOiB1bmRlZmluZWQ7XG4gIH1cbiAgZnVuY3Rpb24gcG9seWZpbGxBcnJheShnbG9iYWwpIHtcbiAgICB2YXIgJF9fNSA9IGdsb2JhbCxcbiAgICAgICAgQXJyYXkgPSAkX181LkFycmF5LFxuICAgICAgICBPYmplY3QgPSAkX181Lk9iamVjdCxcbiAgICAgICAgU3ltYm9sID0gJF9fNS5TeW1ib2w7XG4gICAgbWF5YmVBZGRGdW5jdGlvbnMoQXJyYXkucHJvdG90eXBlLCBbJ2VudHJpZXMnLCBlbnRyaWVzLCAna2V5cycsIGtleXMsICd2YWx1ZXMnLCB2YWx1ZXMsICdmaWxsJywgZmlsbCwgJ2ZpbmQnLCBmaW5kLCAnZmluZEluZGV4JywgZmluZEluZGV4XSk7XG4gICAgbWF5YmVBZGRGdW5jdGlvbnMoQXJyYXksIFsnZnJvbScsIGZyb20sICdvZicsIG9mXSk7XG4gICAgbWF5YmVBZGRJdGVyYXRvcihBcnJheS5wcm90b3R5cGUsIHZhbHVlcywgU3ltYm9sKTtcbiAgICBtYXliZUFkZEl0ZXJhdG9yKE9iamVjdC5nZXRQcm90b3R5cGVPZihbXS52YWx1ZXMoKSksIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSwgU3ltYm9sKTtcbiAgfVxuICByZWdpc3RlclBvbHlmaWxsKHBvbHlmaWxsQXJyYXkpO1xuICByZXR1cm4ge1xuICAgIGdldCBmcm9tKCkge1xuICAgICAgcmV0dXJuIGZyb207XG4gICAgfSxcbiAgICBnZXQgb2YoKSB7XG4gICAgICByZXR1cm4gb2Y7XG4gICAgfSxcbiAgICBnZXQgZmlsbCgpIHtcbiAgICAgIHJldHVybiBmaWxsO1xuICAgIH0sXG4gICAgZ2V0IGZpbmQoKSB7XG4gICAgICByZXR1cm4gZmluZDtcbiAgICB9LFxuICAgIGdldCBmaW5kSW5kZXgoKSB7XG4gICAgICByZXR1cm4gZmluZEluZGV4O1xuICAgIH0sXG4gICAgZ2V0IHBvbHlmaWxsQXJyYXkoKSB7XG4gICAgICByZXR1cm4gcG9seWZpbGxBcnJheTtcbiAgICB9XG4gIH07XG59KTtcblN5c3RlbS5nZXQoXCJ0cmFjZXVyLXJ1bnRpbWVAMC4wLjcyL3NyYy9ydW50aW1lL3BvbHlmaWxscy9BcnJheVwiICsgJycpO1xuU3lzdGVtLnJlZ2lzdGVyKFwidHJhY2V1ci1ydW50aW1lQDAuMC43Mi9zcmMvcnVudGltZS9wb2x5ZmlsbHMvT2JqZWN0XCIsIFtdLCBmdW5jdGlvbigpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG4gIHZhciBfX21vZHVsZU5hbWUgPSBcInRyYWNldXItcnVudGltZUAwLjAuNzIvc3JjL3J1bnRpbWUvcG9seWZpbGxzL09iamVjdFwiO1xuICB2YXIgJF9fMCA9IFN5c3RlbS5nZXQoXCJ0cmFjZXVyLXJ1bnRpbWVAMC4wLjcyL3NyYy9ydW50aW1lL3BvbHlmaWxscy91dGlsc1wiKSxcbiAgICAgIG1heWJlQWRkRnVuY3Rpb25zID0gJF9fMC5tYXliZUFkZEZ1bmN0aW9ucyxcbiAgICAgIHJlZ2lzdGVyUG9seWZpbGwgPSAkX18wLnJlZ2lzdGVyUG9seWZpbGw7XG4gIHZhciAkX18xID0gJHRyYWNldXJSdW50aW1lLFxuICAgICAgZGVmaW5lUHJvcGVydHkgPSAkX18xLmRlZmluZVByb3BlcnR5LFxuICAgICAgZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yID0gJF9fMS5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IsXG4gICAgICBnZXRPd25Qcm9wZXJ0eU5hbWVzID0gJF9fMS5nZXRPd25Qcm9wZXJ0eU5hbWVzLFxuICAgICAgaXNQcml2YXRlTmFtZSA9ICRfXzEuaXNQcml2YXRlTmFtZSxcbiAgICAgIGtleXMgPSAkX18xLmtleXM7XG4gIGZ1bmN0aW9uIGlzKGxlZnQsIHJpZ2h0KSB7XG4gICAgaWYgKGxlZnQgPT09IHJpZ2h0KVxuICAgICAgcmV0dXJuIGxlZnQgIT09IDAgfHwgMSAvIGxlZnQgPT09IDEgLyByaWdodDtcbiAgICByZXR1cm4gbGVmdCAhPT0gbGVmdCAmJiByaWdodCAhPT0gcmlnaHQ7XG4gIH1cbiAgZnVuY3Rpb24gYXNzaWduKHRhcmdldCkge1xuICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldO1xuICAgICAgdmFyIHByb3BzID0ga2V5cyhzb3VyY2UpO1xuICAgICAgdmFyIHAsXG4gICAgICAgICAgbGVuZ3RoID0gcHJvcHMubGVuZ3RoO1xuICAgICAgZm9yIChwID0gMDsgcCA8IGxlbmd0aDsgcCsrKSB7XG4gICAgICAgIHZhciBuYW1lID0gcHJvcHNbcF07XG4gICAgICAgIGlmIChpc1ByaXZhdGVOYW1lKG5hbWUpKVxuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB0YXJnZXRbbmFtZV0gPSBzb3VyY2VbbmFtZV07XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0YXJnZXQ7XG4gIH1cbiAgZnVuY3Rpb24gbWl4aW4odGFyZ2V0LCBzb3VyY2UpIHtcbiAgICB2YXIgcHJvcHMgPSBnZXRPd25Qcm9wZXJ0eU5hbWVzKHNvdXJjZSk7XG4gICAgdmFyIHAsXG4gICAgICAgIGRlc2NyaXB0b3IsXG4gICAgICAgIGxlbmd0aCA9IHByb3BzLmxlbmd0aDtcbiAgICBmb3IgKHAgPSAwOyBwIDwgbGVuZ3RoOyBwKyspIHtcbiAgICAgIHZhciBuYW1lID0gcHJvcHNbcF07XG4gICAgICBpZiAoaXNQcml2YXRlTmFtZShuYW1lKSlcbiAgICAgICAgY29udGludWU7XG4gICAgICBkZXNjcmlwdG9yID0gZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHNvdXJjZSwgcHJvcHNbcF0pO1xuICAgICAgZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBwcm9wc1twXSwgZGVzY3JpcHRvcik7XG4gICAgfVxuICAgIHJldHVybiB0YXJnZXQ7XG4gIH1cbiAgZnVuY3Rpb24gcG9seWZpbGxPYmplY3QoZ2xvYmFsKSB7XG4gICAgdmFyIE9iamVjdCA9IGdsb2JhbC5PYmplY3Q7XG4gICAgbWF5YmVBZGRGdW5jdGlvbnMoT2JqZWN0LCBbJ2Fzc2lnbicsIGFzc2lnbiwgJ2lzJywgaXMsICdtaXhpbicsIG1peGluXSk7XG4gIH1cbiAgcmVnaXN0ZXJQb2x5ZmlsbChwb2x5ZmlsbE9iamVjdCk7XG4gIHJldHVybiB7XG4gICAgZ2V0IGlzKCkge1xuICAgICAgcmV0dXJuIGlzO1xuICAgIH0sXG4gICAgZ2V0IGFzc2lnbigpIHtcbiAgICAgIHJldHVybiBhc3NpZ247XG4gICAgfSxcbiAgICBnZXQgbWl4aW4oKSB7XG4gICAgICByZXR1cm4gbWl4aW47XG4gICAgfSxcbiAgICBnZXQgcG9seWZpbGxPYmplY3QoKSB7XG4gICAgICByZXR1cm4gcG9seWZpbGxPYmplY3Q7XG4gICAgfVxuICB9O1xufSk7XG5TeXN0ZW0uZ2V0KFwidHJhY2V1ci1ydW50aW1lQDAuMC43Mi9zcmMvcnVudGltZS9wb2x5ZmlsbHMvT2JqZWN0XCIgKyAnJyk7XG5TeXN0ZW0ucmVnaXN0ZXIoXCJ0cmFjZXVyLXJ1bnRpbWVAMC4wLjcyL3NyYy9ydW50aW1lL3BvbHlmaWxscy9OdW1iZXJcIiwgW10sIGZ1bmN0aW9uKCkge1xuICBcInVzZSBzdHJpY3RcIjtcbiAgdmFyIF9fbW9kdWxlTmFtZSA9IFwidHJhY2V1ci1ydW50aW1lQDAuMC43Mi9zcmMvcnVudGltZS9wb2x5ZmlsbHMvTnVtYmVyXCI7XG4gIHZhciAkX18wID0gU3lzdGVtLmdldChcInRyYWNldXItcnVudGltZUAwLjAuNzIvc3JjL3J1bnRpbWUvcG9seWZpbGxzL3V0aWxzXCIpLFxuICAgICAgaXNOdW1iZXIgPSAkX18wLmlzTnVtYmVyLFxuICAgICAgbWF5YmVBZGRDb25zdHMgPSAkX18wLm1heWJlQWRkQ29uc3RzLFxuICAgICAgbWF5YmVBZGRGdW5jdGlvbnMgPSAkX18wLm1heWJlQWRkRnVuY3Rpb25zLFxuICAgICAgcmVnaXN0ZXJQb2x5ZmlsbCA9ICRfXzAucmVnaXN0ZXJQb2x5ZmlsbCxcbiAgICAgIHRvSW50ZWdlciA9ICRfXzAudG9JbnRlZ2VyO1xuICB2YXIgJGFicyA9IE1hdGguYWJzO1xuICB2YXIgJGlzRmluaXRlID0gaXNGaW5pdGU7XG4gIHZhciAkaXNOYU4gPSBpc05hTjtcbiAgdmFyIE1BWF9TQUZFX0lOVEVHRVIgPSBNYXRoLnBvdygyLCA1MykgLSAxO1xuICB2YXIgTUlOX1NBRkVfSU5URUdFUiA9IC1NYXRoLnBvdygyLCA1MykgKyAxO1xuICB2YXIgRVBTSUxPTiA9IE1hdGgucG93KDIsIC01Mik7XG4gIGZ1bmN0aW9uIE51bWJlcklzRmluaXRlKG51bWJlcikge1xuICAgIHJldHVybiBpc051bWJlcihudW1iZXIpICYmICRpc0Zpbml0ZShudW1iZXIpO1xuICB9XG4gIDtcbiAgZnVuY3Rpb24gaXNJbnRlZ2VyKG51bWJlcikge1xuICAgIHJldHVybiBOdW1iZXJJc0Zpbml0ZShudW1iZXIpICYmIHRvSW50ZWdlcihudW1iZXIpID09PSBudW1iZXI7XG4gIH1cbiAgZnVuY3Rpb24gTnVtYmVySXNOYU4obnVtYmVyKSB7XG4gICAgcmV0dXJuIGlzTnVtYmVyKG51bWJlcikgJiYgJGlzTmFOKG51bWJlcik7XG4gIH1cbiAgO1xuICBmdW5jdGlvbiBpc1NhZmVJbnRlZ2VyKG51bWJlcikge1xuICAgIGlmIChOdW1iZXJJc0Zpbml0ZShudW1iZXIpKSB7XG4gICAgICB2YXIgaW50ZWdyYWwgPSB0b0ludGVnZXIobnVtYmVyKTtcbiAgICAgIGlmIChpbnRlZ3JhbCA9PT0gbnVtYmVyKVxuICAgICAgICByZXR1cm4gJGFicyhpbnRlZ3JhbCkgPD0gTUFYX1NBRkVfSU5URUdFUjtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGZ1bmN0aW9uIHBvbHlmaWxsTnVtYmVyKGdsb2JhbCkge1xuICAgIHZhciBOdW1iZXIgPSBnbG9iYWwuTnVtYmVyO1xuICAgIG1heWJlQWRkQ29uc3RzKE51bWJlciwgWydNQVhfU0FGRV9JTlRFR0VSJywgTUFYX1NBRkVfSU5URUdFUiwgJ01JTl9TQUZFX0lOVEVHRVInLCBNSU5fU0FGRV9JTlRFR0VSLCAnRVBTSUxPTicsIEVQU0lMT05dKTtcbiAgICBtYXliZUFkZEZ1bmN0aW9ucyhOdW1iZXIsIFsnaXNGaW5pdGUnLCBOdW1iZXJJc0Zpbml0ZSwgJ2lzSW50ZWdlcicsIGlzSW50ZWdlciwgJ2lzTmFOJywgTnVtYmVySXNOYU4sICdpc1NhZmVJbnRlZ2VyJywgaXNTYWZlSW50ZWdlcl0pO1xuICB9XG4gIHJlZ2lzdGVyUG9seWZpbGwocG9seWZpbGxOdW1iZXIpO1xuICByZXR1cm4ge1xuICAgIGdldCBNQVhfU0FGRV9JTlRFR0VSKCkge1xuICAgICAgcmV0dXJuIE1BWF9TQUZFX0lOVEVHRVI7XG4gICAgfSxcbiAgICBnZXQgTUlOX1NBRkVfSU5URUdFUigpIHtcbiAgICAgIHJldHVybiBNSU5fU0FGRV9JTlRFR0VSO1xuICAgIH0sXG4gICAgZ2V0IEVQU0lMT04oKSB7XG4gICAgICByZXR1cm4gRVBTSUxPTjtcbiAgICB9LFxuICAgIGdldCBpc0Zpbml0ZSgpIHtcbiAgICAgIHJldHVybiBOdW1iZXJJc0Zpbml0ZTtcbiAgICB9LFxuICAgIGdldCBpc0ludGVnZXIoKSB7XG4gICAgICByZXR1cm4gaXNJbnRlZ2VyO1xuICAgIH0sXG4gICAgZ2V0IGlzTmFOKCkge1xuICAgICAgcmV0dXJuIE51bWJlcklzTmFOO1xuICAgIH0sXG4gICAgZ2V0IGlzU2FmZUludGVnZXIoKSB7XG4gICAgICByZXR1cm4gaXNTYWZlSW50ZWdlcjtcbiAgICB9LFxuICAgIGdldCBwb2x5ZmlsbE51bWJlcigpIHtcbiAgICAgIHJldHVybiBwb2x5ZmlsbE51bWJlcjtcbiAgICB9XG4gIH07XG59KTtcblN5c3RlbS5nZXQoXCJ0cmFjZXVyLXJ1bnRpbWVAMC4wLjcyL3NyYy9ydW50aW1lL3BvbHlmaWxscy9OdW1iZXJcIiArICcnKTtcblN5c3RlbS5yZWdpc3RlcihcInRyYWNldXItcnVudGltZUAwLjAuNzIvc3JjL3J1bnRpbWUvcG9seWZpbGxzL3BvbHlmaWxsc1wiLCBbXSwgZnVuY3Rpb24oKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuICB2YXIgX19tb2R1bGVOYW1lID0gXCJ0cmFjZXVyLXJ1bnRpbWVAMC4wLjcyL3NyYy9ydW50aW1lL3BvbHlmaWxscy9wb2x5ZmlsbHNcIjtcbiAgdmFyIHBvbHlmaWxsQWxsID0gU3lzdGVtLmdldChcInRyYWNldXItcnVudGltZUAwLjAuNzIvc3JjL3J1bnRpbWUvcG9seWZpbGxzL3V0aWxzXCIpLnBvbHlmaWxsQWxsO1xuICBwb2x5ZmlsbEFsbCh0aGlzKTtcbiAgdmFyIHNldHVwR2xvYmFscyA9ICR0cmFjZXVyUnVudGltZS5zZXR1cEdsb2JhbHM7XG4gICR0cmFjZXVyUnVudGltZS5zZXR1cEdsb2JhbHMgPSBmdW5jdGlvbihnbG9iYWwpIHtcbiAgICBzZXR1cEdsb2JhbHMoZ2xvYmFsKTtcbiAgICBwb2x5ZmlsbEFsbChnbG9iYWwpO1xuICB9O1xuICByZXR1cm4ge307XG59KTtcblN5c3RlbS5nZXQoXCJ0cmFjZXVyLXJ1bnRpbWVAMC4wLjcyL3NyYy9ydW50aW1lL3BvbHlmaWxscy9wb2x5ZmlsbHNcIiArICcnKTtcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoJ19wcm9jZXNzJyksdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCJpbXBvcnQge0NvbG9yc30gZnJvbSAnLi4vdXRpbHMvY29sb3JzJztcblxuZnVuY3Rpb24gZ2V0SGVpZ2h0IChlbGVtZW50LCBoZWlnaHQgPSAnYXV0bycpIHtcbiAgICBpZiAoaGVpZ2h0ID09PSAnYXV0bycpIHtcbiAgICAgICAgcmV0dXJuIGVsZW1lbnQuaGVpZ2h0KCkgPiAxNDAgPyBlbGVtZW50LmhlaWdodCgpIC0gNTAgOiAzMDA7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGhlaWdodDtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGdldFdpZHRoIChlbGVtZW50LCB3aWR0aCA9ICdhdXRvJykge1xuICAgIGlmICh3aWR0aCA9PT0gJ2F1dG8nKSB7XG4gICAgICAgIHJldHVybiBlbGVtZW50LndpZHRoKCkgPiA5MCA/IGVsZW1lbnQud2lkdGgoKSAtIDUwIDogMzAwO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB3aWR0aDtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBDaGFydGpzQWRhcHRlciB7XG5cbiAgICByZW5kZXJHcmFwaFRvKGVsZW1lbnQsIGdyYXBoKcKge1xuICAgICAgICBsZXQgZ2V0Q2hhcnREYXRhID0gZnVuY3Rpb24oZ3JhcGgpIHtcbiAgICAgICAgICAgICAgICBsZXQgaW5kZXggPSAwLFxuICAgICAgICAgICAgICAgICAgICBjb2xvcnMgPSBuZXcgQ29sb3JzKCksXG4gICAgICAgICAgICAgICAgICAgIGNvbG9yU2NoZW1lID0gY29sb3JzLmRlZmF1bHRTY2hlbWUoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBsYWJlbHM6IGdyYXBoLmxhYmVscyxcbiAgICAgICAgICAgICAgICAgICAgZGF0YXNldHM6IGdyYXBoLmRhdGFzZXRzLm1hcChkYXRhc2V0ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBjb2xvckluZGV4ID0gaW5kZXggJSBjb2xvclNjaGVtZS5sZW5ndGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmdiQ29sb3IgPSBjb2xvcnMuaGV4VG9SZ2IoY29sb3JTY2hlbWVbY29sb3JJbmRleF0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YXNldC5maWxsQ29sb3IgPSBjb2xvcnMucmdiVG9TdHJpbmcocmdiQ29sb3IsIDAuMik7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhc2V0LnN0cm9rZUNvbG9yID0gY29sb3JzLnJnYlRvU3RyaW5nKHJnYkNvbG9yLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFzZXQucG9pbnRDb2xvciA9IGNvbG9ycy5yZ2JUb1N0cmluZyhyZ2JDb2xvciwgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhc2V0LnBvaW50U3Ryb2tlQ29sb3IgPSBjb2xvcnMucmdiVG9TdHJpbmcocmdiQ29sb3IsIDAuMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhc2V0LnBvaW50SGlnaGxpZ2h0RmlsbCA9IGNvbG9ycy5yZ2JUb1N0cmluZyhyZ2JDb2xvciwgMC4xKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFzZXQucG9pbnRIaWdobGlnaHRTdHJva2UgPSBjb2xvcnMucmdiVG9TdHJpbmcocmdiQ29sb3IsIDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaW5kZXgrKztcblxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGRhdGFzZXQ7XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgZWxlbWVudC5wcmVwZW5kKCc8Y2FudmFzIHdpZHRoPVwiJytnZXRXaWR0aChlbGVtZW50LCBncmFwaC53aWR0aCkrJ1wiIGhlaWdodD1cIicrZ2V0SGVpZ2h0KGVsZW1lbnQsIGdyYXBoLmhlaWdodCkrJ1wiPjwvY2FudmFzPicpO1xuICAgICAgICBsZXQgY29udGV4dCA9IGVsZW1lbnQuZmluZCgnY2FudmFzOmZpcnN0JykuZ2V0KDApLmdldENvbnRleHQoJzJkJyksXG4gICAgICAgICAgICBjaGFydCA9IG5ldyBDaGFydChjb250ZXh0KSxcbiAgICAgICAgICAgIGNoYXJ0T3B0aW9ucyA9IHtcbiAgICAgICAgICAgICAgbGVnZW5kVGVtcGxhdGUgOiAnPHVsIGNsYXNzPVwiY2hhcnRqcy1sZWdlbmQgPCU9bmFtZS50b0xvd2VyQ2FzZSgpJT4tbGVnZW5kXCI+PCUgZm9yICh2YXIgaT0wOyBpPGRhdGFzZXRzLmxlbmd0aDsgaSsrKXslPjxsaT48c3BhbiBjbGFzcz1cInBpbGxcIiBzdHlsZT1cImJhY2tncm91bmQtY29sb3I6PCU9ZGF0YXNldHNbaV0uc3Ryb2tlQ29sb3IlPlwiPjwvc3Bhbj48JWlmKGRhdGFzZXRzW2ldLmxhYmVsKXslPjwlPWRhdGFzZXRzW2ldLmxhYmVsJT48JX0lPjwvbGk+PCV9JT48L3VsPidcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgc3dpdGNoIChncmFwaC5ncmFwaFR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ2xpbmUnOlxuICAgICAgICAgICAgICAgIGNoYXJ0ID0gY2hhcnQuTGluZShnZXRDaGFydERhdGEoZ3JhcGgpLCBjaGFydE9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIGVsZW1lbnQuYXBwZW5kKGNoYXJ0LmdlbmVyYXRlTGVnZW5kKCkpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnYmFyJzpcbiAgICAgICAgICAgICAgICBjaGFydCA9IGNoYXJ0LkJhcihnZXRDaGFydERhdGEoZ3JhcGgpLCBjaGFydE9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIGVsZW1lbnQuYXBwZW5kKGNoYXJ0LmdlbmVyYXRlTGVnZW5kKCkpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAncmFkYXInOlxuICAgICAgICAgICAgICAgIGNoYXJ0ID0gY2hhcnQuUmFkYXIoZ2V0Q2hhcnREYXRhKGdyYXBoKSwgY2hhcnRPcHRpb25zKTtcbiAgICAgICAgICAgICAgICBlbGVtZW50LmFwcGVuZChjaGFydC5nZW5lcmF0ZUxlZ2VuZCgpKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgdGhyb3cgRXJyb3IoJ1Vua25vd24gZ3JhcGggdHlwZSBcIicgKyBncmFwaC5ncmFwaFR5cGUgKyAnXCInKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlbmRlclNlZ21lbnRHcmFwaFRvKGVsZW1lbnQsIGdyYXBoKcKge1xuICAgICAgICBsZXQgZ2V0Q2hhcnREYXRhID0gZnVuY3Rpb24oZ3JhcGgpIHtcbiAgICAgICAgICAgICAgICBsZXQgaW5kZXggPSAwLFxuICAgICAgICAgICAgICAgICAgICBjb2xvcnMgPSBuZXcgQ29sb3JzKCksXG4gICAgICAgICAgICAgICAgICAgIGNvbG9yU2NoZW1lID0gY29sb3JzLmRlZmF1bHRTY2hlbWUoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZ3JhcGgubGFiZWxzLm1hcChsYWJlbCA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBjb2xvckluZGV4ID0gaW5kZXggJSBjb2xvclNjaGVtZS5sZW5ndGgsXG4gICAgICAgICAgICAgICAgICAgICAgICByZ2JDb2xvciA9IGNvbG9ycy5oZXhUb1JnYihjb2xvclNjaGVtZVtjb2xvckluZGV4XSk7XG4gICAgICAgICAgICAgICAgICAgIGxhYmVsLmNvbG9yID0gY29sb3JzLnJnYlRvU3RyaW5nKHJnYkNvbG9yLCAwLjgpO1xuICAgICAgICAgICAgICAgICAgICBsYWJlbC5oaWdobGlnaHQgPSBjb2xvcnMucmdiVG9TdHJpbmcocmdiQ29sb3IsIDEpO1xuICAgICAgICAgICAgICAgICAgICBpbmRleCsrO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsYWJlbDtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgZWxlbWVudC5wcmVwZW5kKCc8Y2FudmFzIHdpZHRoPVwiJytnZXRXaWR0aChlbGVtZW50LCBncmFwaC53aWR0aCkrJ1wiIGhlaWdodD1cIicrZ2V0SGVpZ2h0KGVsZW1lbnQsIGdyYXBoLmhlaWdodCkrJ1wiPjwvY2FudmFzPicpO1xuICAgICAgICBsZXQgY29udGV4dCA9IGVsZW1lbnQuZmluZCgnY2FudmFzOmZpcnN0JykuZ2V0KDApLmdldENvbnRleHQoJzJkJyksXG4gICAgICAgICAgICBjaGFydCA9IG5ldyBDaGFydChjb250ZXh0KSxcbiAgICAgICAgICAgIGNoYXJ0T3B0aW9ucyA9IHtcbiAgICAgICAgICAgICAgbGVnZW5kVGVtcGxhdGUgOiAnPHVsIGNsYXNzPVwiY2hhcnRqcy1sZWdlbmQgPCU9bmFtZS50b0xvd2VyQ2FzZSgpJT4tbGVnZW5kXCI+PCUgZm9yICh2YXIgaT0wOyBpPHNlZ21lbnRzLmxlbmd0aDsgaSsrKXslPjxsaT48c3BhbiBjbGFzcz1cInBpbGxcIiBzdHlsZT1cImJhY2tncm91bmQtY29sb3I6PCU9c2VnbWVudHNbaV0uZmlsbENvbG9yJT5cIj48L3NwYW4+PCVpZihzZWdtZW50c1tpXS5sYWJlbCl7JT48JT1zZWdtZW50c1tpXS5sYWJlbCU+PCV9JT48L2xpPjwlfSU+PC91bD4nXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgIHN3aXRjaCAoZ3JhcGguZ3JhcGhUeXBlKSB7XG4gICAgICAgICAgICBjYXNlICdwaWUnOlxuICAgICAgICAgICAgICAgIGNoYXJ0ID0gY2hhcnQuUGllKGdldENoYXJ0RGF0YShncmFwaCksIGNoYXJ0T3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgZWxlbWVudC5hcHBlbmQoY2hhcnQuZ2VuZXJhdGVMZWdlbmQoKSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdwb2xhckFyZWEnOlxuICAgICAgICAgICAgICAgIGNoYXJ0ID0gY2hhcnQuUG9sYXJBcmVhKGdldENoYXJ0RGF0YShncmFwaCksIGNoYXJ0T3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgZWxlbWVudC5hcHBlbmQoY2hhcnQuZ2VuZXJhdGVMZWdlbmQoKSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdkb3VnaG51dCc6XG4gICAgICAgICAgICAgICAgY2hhcnQgPSBjaGFydC5Eb3VnaG51dChnZXRDaGFydERhdGEoZ3JhcGgpLCBjaGFydE9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIGVsZW1lbnQuYXBwZW5kKGNoYXJ0LmdlbmVyYXRlTGVnZW5kKCkpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICB0aHJvdyBFcnJvcignVW5rbm93biBzZWdtZW50IGdyYXBoIHR5cGUgXCInICsgZ3JhcGguZ3JhcGhUeXBlICsgJ1wiJyk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJleHBvcnQgY2xhc3MgQ2VsbCB7XG5cbiAgICBjb25zdHJ1Y3RvcihkaW1lbnNpb25WYWx1ZXMsIHZhbHVlKSB7XG4gICAgICAgIHRoaXMuZGltZW5zaW9uVmFsdWVzID0gZGltZW5zaW9uVmFsdWVzO1xuICAgICAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG4gICAgfVxuXG4gICAgZ2V0RGltZW5zaW9uVmFsdWUoZGltZW5zaW9uKSB7XG4gICAgICAgIGlmICghdGhpcy5kaW1lbnNpb25WYWx1ZXMuaGFzKGRpbWVuc2lvbi5pZCkpIHtcbiAgICAgICAgICAgIHRocm93IEVycm9yKCdUaGUgY2VsbCBoYXMgbm8gZGltZW5zaW9uIHZhbHVlIGZvciB0aGUgZGltZW5zaW9uIFwiJyArIGRpbWVuc2lvbi5pZCArICdcIicpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuZGltZW5zaW9uVmFsdWVzLmdldChkaW1lbnNpb24uaWQpO1xuICAgIH1cbn1cbiIsImV4cG9ydCBjbGFzcyBEaW1lbnNpb24ge1xuXG4gICAgY29uc3RydWN0b3IoaWQsIGNhcHRpb24pIHtcbiAgICAgICAgdGhpcy5pZCAgICAgID0gaWQ7XG4gICAgICAgIHRoaXMuY2FwdGlvbiA9IGNhcHRpb24gPT09IHVuZGVmaW5lZCA/IGlkIDogY2FwdGlvbjtcbiAgICB9XG5cbn1cbiIsImV4cG9ydCBjbGFzcyBEaW1lbnNpb25WYWx1ZSB7XG5cbiAgICBjb25zdHJ1Y3RvcihpZCwgY2FwdGlvbikge1xuICAgICAgICB0aGlzLmlkICAgICAgPSBpZDtcbiAgICAgICAgdGhpcy5jYXB0aW9uID0gY2FwdGlvbiA9PT0gdW5kZWZpbmVkID8gaWQgOiBjYXB0aW9uO1xuICAgIH1cblxufVxuIiwiaW1wb3J0IHtNYXBzfSAgICAgICAgICAgZnJvbSAnLi4vdXRpbHMvbWFwcyc7XG5pbXBvcnQge0RpbWVuc2lvbn0gICAgICBmcm9tICcuLi9kYXRhL2RpbWVuc2lvbic7XG5pbXBvcnQge0RpbWVuc2lvblZhbHVlfSBmcm9tICcuLi9kYXRhL2RpbWVuc2lvblZhbHVlJztcbmltcG9ydCB7Q2VsbH0gICAgICAgICAgIGZyb20gJy4uL2RhdGEvY2VsbCc7XG5cbmV4cG9ydCBjbGFzcyBHcmlkIHtcblxuICAgIGNvbnN0cnVjdG9yKGRpbWVuc2lvbnMsIGRpbWVuc2lvblZhbHVlcywgY2VsbHMpIHtcbiAgICAgICAgdGhpcy5jZWxscyA9IGNlbGxzO1xuICAgICAgICB0aGlzLmRpbWVuc2lvbnMgPSBkaW1lbnNpb25zO1xuICAgICAgICB0aGlzLmRpbWVuc2lvblZhbHVlcyA9IGRpbWVuc2lvblZhbHVlcztcbiAgICB9XG5cbiAgICBnZXREaW1lbnNpb24oZGltZW5zaW9uSWQpIHtcbiAgICAgICAgaWYgKCF0aGlzLmRpbWVuc2lvbnMuaGFzKGRpbWVuc2lvbklkKSkge1xuICAgICAgICAgICAgdGhyb3cgRXJyb3IoJ1RoZSBncmlkIGhhcyBubyBkaW1lbnNpb24gXCInICsgZGltZW5zaW9uSWQgKyAnXCInKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLmRpbWVuc2lvbnMuZ2V0KGRpbWVuc2lvbklkKTtcbiAgICB9XG5cbiAgICBnZXREaW1lbnNpb25WYWx1ZXMoZGltZW5zaW9uKSB7XG4gICAgICAgIGlmICghdGhpcy5kaW1lbnNpb25WYWx1ZXMuaGFzKGRpbWVuc2lvbi5pZCkpIHtcbiAgICAgICAgICAgIHRocm93IEVycm9yKCdUaGUgZ3JpZCBoYXMgbm8gZGltZW5zaW9uIHZhbHVlcyBmb3IgdGhlIGRpbWVuc2lvbiBcIicgKyBkaW1lbnNpb24uaWQgKyAnXCInKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLmRpbWVuc2lvblZhbHVlcy5nZXQoZGltZW5zaW9uLmlkKTtcbiAgICB9XG5cbiAgICBnZXREaW1lbmlvblZhbHVlc1NldHMoZGltZW5zaW9ucykge1xuICAgICAgICBsZXQgbWFwVXRpbHMgPSBuZXcgTWFwcygpLFxuICAgICAgICAgICAgZ2V0U2V0cyA9IGZ1bmN0aW9uKHNldHMsIGRpbWVuc2lvbnMsIGNlbGxzLCBzZXQgPSBuZXcgTWFwKCkpIHtcbiAgICAgICAgICAgICAgICBpZiAoZGltZW5zaW9ucy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgc2V0cy5wdXNoKHNldCk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGxldCBjdXJyZW50RGltZW5zaW9uICAgICA9IGRpbWVuc2lvbnNbMF0sXG4gICAgICAgICAgICAgICAgICAgIHJlbWFpbmluZ0RpbWVuc2lvbnMgICAgPSBkaW1lbnNpb25zLnNsaWNlKDEpO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5nZXREaW1lbnNpb25WYWx1ZXMoY3VycmVudERpbWVuc2lvbikuZm9yRWFjaChkaW1lbnNpb25WYWx1ZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBzdWJDZWxscyA9IGNlbGxzLmZpbHRlcihjZWxsID0+IGNlbGwuZ2V0RGltZW5zaW9uVmFsdWUoY3VycmVudERpbWVuc2lvbikgPT09IGRpbWVuc2lvblZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN1YkNlbGxzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGN1cnJlbnRTZXQgPSBtYXBVdGlscy5jbG9uZShzZXQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudFNldC5zZXQoY3VycmVudERpbWVuc2lvbi5pZCwgZGltZW5zaW9uVmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZ2V0U2V0cy5jYWxsKHRoaXMsIHNldHMsIHJlbWFpbmluZ0RpbWVuc2lvbnMsIHN1YkNlbGxzLCBjdXJyZW50U2V0KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICBsZXQgc2V0cyA9IFtdO1xuICAgICAgICBnZXRTZXRzLmNhbGwodGhpcywgc2V0cywgZGltZW5zaW9ucywgdGhpcy5jZWxscyk7XG5cbiAgICAgICAgcmV0dXJuIHNldHM7XG4gICAgfVxuXG4gICAgZ2V0Q2VsbChkaW1lbnNpb25WYWx1ZXMpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY2VsbHMuZmluZChjZWxsID0+IHtcbiAgICAgICAgICAgIGxldCBmb3VuZCA9IHRydWU7XG4gICAgICAgICAgICBkaW1lbnNpb25WYWx1ZXMuZm9yRWFjaCgoZGltZW5zaW9uVmFsdWUsIGRpbWVuc2lvbklkKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGRpbWVuc2lvblZhbHVlLmlkICE9PSBjZWxsLmdldERpbWVuc2lvblZhbHVlKHRoaXMuZ2V0RGltZW5zaW9uKGRpbWVuc2lvbklkKSkuaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgZm91bmQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICAgICAgcmV0dXJuIGZvdW5kO1xuICAgICAgICB9LCB0aGlzKTtcbiAgICB9XG5cbiAgICBtZXJnZURpbWVuc2lvbnMoZGltZW5zaW9ucywgbmV3RGltZW5zaW9uSWQpIHtcbiAgICAgICAgLy8gTmV3IERpbWVuc2lvbnNcbiAgICAgICAgbGV0IG5ld0RpbWVuc2lvbiA9IG5ldyBEaW1lbnNpb24obmV3RGltZW5zaW9uSWQsIGRpbWVuc2lvbnMubWFwKGRpbWVuc2lvbiA9PiBkaW1lbnNpb24uY2FwdGlvbikuam9pbignIC0gJykpLFxuICAgICAgICAgICAgbmV3RGltZW5zaW9ucyA9IG5ldyBNYXAoKTtcbiAgICAgICAgdGhpcy5kaW1lbnNpb25zLmZvckVhY2goZGltZW5zaW9uID0+IHtcbiAgICAgICAgICAgIGlmIChkaW1lbnNpb25zLmluZGV4T2YoZGltZW5zaW9uKSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICBuZXdEaW1lbnNpb25zLnNldChkaW1lbnNpb24uaWQsIGRpbWVuc2lvbik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBuZXdEaW1lbnNpb25zLnNldChuZXdEaW1lbnNpb25JZCwgbmV3RGltZW5zaW9uKTtcblxuICAgICAgICAvLyBOZXcgZGltZW5zaW9uIFZhbHVlc1xuICAgICAgICBsZXQgbmV3RGltZW5zaW9uVmFsdWVzID0gbmV3IE1hcCgpO1xuICAgICAgICB0aGlzLmRpbWVuc2lvblZhbHVlcy5mb3JFYWNoKChkaW1lbnNpb25WYWx1ZXMsIGRpbWVuc2lvbklkKSA9PiB7XG4gICAgICAgICAgICBpZiAoZGltZW5zaW9ucy5maW5kKGRpbSA9PiBkaW0uaWQgPT09IGRpbWVuc2lvbklkKSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgbmV3RGltZW5zaW9uVmFsdWVzLnNldChkaW1lbnNpb25JZCwgZGltZW5zaW9uVmFsdWVzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIG5ld0RpbWVuc2lvblZhbHVlcy5zZXQobmV3RGltZW5zaW9uSWQsIG5ldyBNYXAoKSk7XG5cbiAgICAgICAgLy8gQ2VsbHNcbiAgICAgICAgbGV0IG5ld0NlbGxzID0gW107XG4gICAgICAgIHRoaXMuY2VsbHMuZm9yRWFjaChjZWxsID0+IHtcbiAgICAgICAgICAgIGxldCBuZXdDZWxsRGltZW5zaW9uVmFsdWVzID0gbmV3IE1hcCgpLFxuICAgICAgICAgICAgICAgIGRpbWVuc2lvblZhbHVlc1RvTWVyZ2UgPSBbXTtcbiAgICAgICAgICAgIGNlbGwuZGltZW5zaW9uVmFsdWVzLmZvckVhY2goKGRpbWVuc2lvblZhbHVlLCBkaW1lbnNpb25JZCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChkaW1lbnNpb25zLmZpbmQoZGltID0+IGRpbS5pZCA9PT0gZGltZW5zaW9uSWQpID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgbmV3Q2VsbERpbWVuc2lvblZhbHVlcy5zZXQoZGltZW5zaW9uSWQsIGRpbWVuc2lvblZhbHVlKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBkaW1lbnNpb25WYWx1ZXNUb01lcmdlLnB1c2goZGltZW5zaW9uVmFsdWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgbGV0IG5ld0NlbGxEaW1lbnNpb25WYWx1ZSA9IG5ldyBEaW1lbnNpb25WYWx1ZShcbiAgICAgICAgICAgICAgICBkaW1lbnNpb25WYWx1ZXNUb01lcmdlLm1hcChkaW1lbnNpb25WYWx1ZSA9PiBkaW1lbnNpb25WYWx1ZS5pZCkuam9pbignLScpLFxuICAgICAgICAgICAgICAgIGRpbWVuc2lvblZhbHVlc1RvTWVyZ2UubWFwKGRpbWVuc2lvblZhbHVlID0+IGRpbWVuc2lvblZhbHVlLmNhcHRpb24pLmpvaW4oJyAtICcpXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgbmV3Q2VsbERpbWVuc2lvblZhbHVlcy5zZXQobmV3RGltZW5zaW9uSWQsIG5ld0NlbGxEaW1lbnNpb25WYWx1ZSk7XG4gICAgICAgICAgICBuZXdEaW1lbnNpb25WYWx1ZXMuZ2V0KG5ld0RpbWVuc2lvbklkKS5zZXQobmV3Q2VsbERpbWVuc2lvblZhbHVlLmlkLCBuZXdDZWxsRGltZW5zaW9uVmFsdWUpO1xuICAgICAgICAgICAgbmV3Q2VsbHMucHVzaChuZXcgQ2VsbChuZXdDZWxsRGltZW5zaW9uVmFsdWVzLCBjZWxsLnZhbHVlKSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBuZXcgR3JpZChuZXdEaW1lbnNpb25zLCBuZXdEaW1lbnNpb25WYWx1ZXMsIG5ld0NlbGxzKTtcbiAgICB9XG59XG4iLCJpbXBvcnQge0RpbWVuc2lvbn0gZnJvbSAnLi4vZGF0YS9kaW1lbnNpb24nO1xuaW1wb3J0IHtEaW1lbnNpb25WYWx1ZX0gZnJvbSAnLi4vZGF0YS9kaW1lbnNpb25WYWx1ZSc7XG5pbXBvcnQge0NlbGx9IGZyb20gJy4uL2RhdGEvY2VsbCc7XG5pbXBvcnQge0dyaWR9IGZyb20gJy4uL2RhdGEvZ3JpZCc7XG5cbmV4cG9ydCBjbGFzcyBHcmlkRmFjdG9yeSB7XG5cbiAgICBidWlsZEZyb21Kc29uKGdyaWREYXRhKSB7XG4gICAgICAgIGxldCBkaW1lbnNpb25zID0gbmV3IE1hcCgpLFxuICAgICAgICAgICAgZGltZW5zaW9uVmFsdWVzQnlEaW1lbnNpb25zID0gbmV3IE1hcCgpLFxuICAgICAgICAgICAgY2VsbHMgPSBbXSxcblxuICAgICAgICAgICAgZGltZW5zaW9uUG9zaXRpb25zID0gbmV3IE1hcCgpLFxuICAgICAgICAgICAgZGltZW5zaW9uVmFsdWVQb3NpdGlvbnMgPSBuZXcgTWFwKClcbiAgICAgICAgO1xuXG4gICAgICAgIGdyaWREYXRhLmRpbWVuc2lvbnMuZm9yRWFjaCgoZGltZW5zaW9uLCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgZGltZW5zaW9ucy5zZXQoZGltZW5zaW9uLmlkLCBuZXcgRGltZW5zaW9uKGRpbWVuc2lvbi5pZCwgZGltZW5zaW9uLmNhcHRpb24pKTtcbiAgICAgICAgICAgIGRpbWVuc2lvblBvc2l0aW9ucy5zZXQoZGltZW5zaW9uLmlkLCBpbmRleCk7XG5cbiAgICAgICAgICAgIGRpbWVuc2lvblZhbHVlc0J5RGltZW5zaW9ucy5zZXQoZGltZW5zaW9uLmlkLCBuZXcgTWFwKCkpO1xuICAgICAgICAgICAgZGltZW5zaW9uVmFsdWVQb3NpdGlvbnMuc2V0KGRpbWVuc2lvbi5pZCwgbmV3IE1hcCgpKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGRpbWVuc2lvblBvc2l0aW9ucy5mb3JFYWNoKChpbmRleCwgZGltZW5zaW9uSWQpID0+IHtcbiAgICAgICAgICAgIGdyaWREYXRhLmRpbWVuc2lvblZhbHVlc1tpbmRleF0uZm9yRWFjaCgoZGltZW5zaW9uVmFsdWUsIGRpbWVuc2lvblZhbHVlSW5kZXgpID0+IHtcbiAgICAgICAgICAgICAgICBkaW1lbnNpb25WYWx1ZXNCeURpbWVuc2lvbnMuZ2V0KGRpbWVuc2lvbklkKS5zZXQoZGltZW5zaW9uVmFsdWUuaWQsIG5ldyBEaW1lbnNpb25WYWx1ZShkaW1lbnNpb25WYWx1ZS5pZCwgZGltZW5zaW9uVmFsdWUuY2FwdGlvbikpO1xuICAgICAgICAgICAgICAgIGRpbWVuc2lvblZhbHVlUG9zaXRpb25zLmdldChkaW1lbnNpb25JZCkuc2V0KGRpbWVuc2lvblZhbHVlSW5kZXgsIGRpbWVuc2lvblZhbHVlLmlkKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICBncmlkRGF0YS5jZWxscy5mb3JFYWNoKGNlbGwgPT4ge1xuICAgICAgICAgICAgbGV0IGNlbGxEaW1lbnNpb25WYWx1ZXMgPSBuZXcgTWFwKCk7XG5cbiAgICAgICAgICAgIGRpbWVuc2lvblBvc2l0aW9ucy5mb3JFYWNoKChpbmRleCwgZGltZW5zaW9uSWQpID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgZGltZW5zaW9uVmFsdWUgPSBkaW1lbnNpb25WYWx1ZXNCeURpbWVuc2lvbnMuZ2V0KGRpbWVuc2lvbklkKS5nZXQoZGltZW5zaW9uVmFsdWVQb3NpdGlvbnMuZ2V0KGRpbWVuc2lvbklkKS5nZXQoY2VsbC5kaW1lbnNpb25WYWx1ZXNbaW5kZXhdKSk7XG4gICAgICAgICAgICAgICAgY2VsbERpbWVuc2lvblZhbHVlcy5zZXQoZGltZW5zaW9uSWQsIGRpbWVuc2lvblZhbHVlKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBjZWxscy5wdXNoKG5ldyBDZWxsKGNlbGxEaW1lbnNpb25WYWx1ZXMsIGNlbGwudmFsdWUpKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIG5ldyBHcmlkKGRpbWVuc2lvbnMsIGRpbWVuc2lvblZhbHVlc0J5RGltZW5zaW9ucywgY2VsbHMpO1xuICAgIH1cbn1cbiIsImltcG9ydCB7R3JpZEZhY3Rvcnl9IGZyb20gJy4vZGF0YS9ncmlkRmFjdG9yeSc7XG5pbXBvcnQge1RhYmxlUmVuZGVyZXJ9IGZyb20gJy4vcmVuZGVyZXIvdGFibGUvdGFibGVSZW5kZXJlcic7XG5pbXBvcnQge0dyYXBoUmVuZGVyZXJ9IGZyb20gJy4vcmVuZGVyZXIvZ3JhcGgvZ3JhcGhSZW5kZXJlcic7XG5pbXBvcnQge1NlZ21lbnRHcmFwaFJlbmRlcmVyfSBmcm9tICcuL3JlbmRlcmVyL2dyYXBoL3NlZ21lbnRHcmFwaFJlbmRlcmVyJztcbmltcG9ydCB7Q2hhcnRqc0FkYXB0ZXJ9IGZyb20gJy4vYWRhcHRlci9jaGFydGpzQWRhcHRlcic7XG5cbmV4cG9ydCBjbGFzcyBSZW5kZXJlciB7XG5cbiAgICByZW5kZXJUbyhlbGVtZW50LCBvcHRpb25zKcKge1xuICAgICAgICBsZXQgZ3JpZEZhY3RvcnkgPSBuZXcgR3JpZEZhY3RvcnkoKSxcbiAgICAgICAgICAgIGdyaWQgPSBncmlkRmFjdG9yeS5idWlsZEZyb21Kc29uKG9wdGlvbnMuZGF0YSk7XG5cbiAgICAgICAgaWYgKG9wdGlvbnMubGF5b3V0LnR5cGUgPT09ICd0YWJsZScpIHtcbiAgICAgICAgICAgIGxldCB0YWJsZVJlbmRlcmVyID0gbmV3IFRhYmxlUmVuZGVyZXIob3B0aW9ucy5sYXlvdXQucm93cywgb3B0aW9ucy5sYXlvdXQuY29sdW1ucywgb3B0aW9ucy5sYXlvdXQub3B0aW9ucyksXG4gICAgICAgICAgICAgICAgdGFibGUgPSB0YWJsZVJlbmRlcmVyLnJlbmRlcihncmlkKTtcbiAgICAgICAgICAgICAgICBlbGVtZW50Lmh0bWwodGFibGUuZ2V0SHRtbCgpKTtcbiAgICAgICAgfSBlbHNlIGlmIChvcHRpb25zLmxheW91dC50eXBlID09PSAnZ3JhcGgnKSB7XG4gICAgICAgICAgICBsZXQgZ3JhcGhSZW5kZXJlciA9IG5ldyBHcmFwaFJlbmRlcmVyKG9wdGlvbnMubGF5b3V0LmRhdGFzZXRzLCBvcHRpb25zLmxheW91dC5sYWJlbHMsIG9wdGlvbnMubGF5b3V0LmdyYXBoVHlwZSwgb3B0aW9ucy5sYXlvdXQuaGVpZ2h0LCBvcHRpb25zLmxheW91dC53aWR0aCksXG4gICAgICAgICAgICAgICAgZ3JhcGggPSBncmFwaFJlbmRlcmVyLnJlbmRlcihncmlkKSxcbiAgICAgICAgICAgICAgICBhZGFwdGVyID0gbmV3IENoYXJ0anNBZGFwdGVyKCk7XG4gICAgICAgICAgICBhZGFwdGVyLnJlbmRlckdyYXBoVG8oZWxlbWVudCwgZ3JhcGgpO1xuICAgICAgICB9IGVsc2UgaWYgKG9wdGlvbnMubGF5b3V0LnR5cGUgPT09ICdzZWdtZW50R3JhcGgnKSB7XG4gICAgICAgICAgICBsZXQgZ3JhcGhSZW5kZXJlciA9IG5ldyBTZWdtZW50R3JhcGhSZW5kZXJlcihvcHRpb25zLmxheW91dC5ncmFwaFR5cGUsIG9wdGlvbnMubGF5b3V0LmhlaWdodCwgb3B0aW9ucy5sYXlvdXQud2lkdGgpLFxuICAgICAgICAgICAgICAgIGdyYXBoID0gZ3JhcGhSZW5kZXJlci5yZW5kZXIoZ3JpZCksXG4gICAgICAgICAgICAgICAgYWRhcHRlciA9IG5ldyBDaGFydGpzQWRhcHRlcigpO1xuICAgICAgICAgICAgYWRhcHRlci5yZW5kZXJTZWdtZW50R3JhcGhUbyhlbGVtZW50LCBncmFwaCk7XG4gICAgICAgIH1cbiAgICB9XG5cbn1cbiIsImltcG9ydCB7R3JhcGh9IGZyb20gJy4uLy4uL3Jlc3VsdC9ncmFwaC9ncmFwaCc7XG5cbmV4cG9ydCBjbGFzcyBHcmFwaFJlbmRlcmVyIHtcblxuICAgIGNvbnN0cnVjdG9yKGRhdGFzZXRzRGltZW5zaW9ucywgbGFiZWxzRGltZW5zaW9ucywgZ3JhcGhUeXBlID0gJ2xpbmUnLCBoZWlnaHQgPSAnYXV0bycsIHdpZHRoID0gJ2F1dG8nKSB7XG4gICAgICAgIHRoaXMuZGF0YXNldHNEaW1lbnNpb25zID0gZGF0YXNldHNEaW1lbnNpb25zO1xuICAgICAgICB0aGlzLmxhYmVsc0RpbWVuc2lvbnMgICA9IGxhYmVsc0RpbWVuc2lvbnM7XG4gICAgICAgIHRoaXMuZ3JhcGhUeXBlICAgICAgICAgID0gZ3JhcGhUeXBlO1xuICAgICAgICB0aGlzLmhlaWdodCAgICAgICAgICAgICA9IGhlaWdodDtcbiAgICAgICAgdGhpcy53aWR0aCAgICAgICAgICAgICAgPSB3aWR0aDtcbiAgICB9XG5cbiAgICByZW5kZXIoZ3JpZCkge1xuICAgICAgICBsZXQgZGF0YXNldHNEaW1lbnNpb25JZCA9ICdkYXRhc2V0JyxcbiAgICAgICAgICAgIGxhYmVsc0RpbWVuc2lvbklkID0gJ2xhYmVsJyxcbiAgICAgICAgICAgIG1lcmdlZEdyaWQgPSBncmlkLm1lcmdlRGltZW5zaW9ucyh0aGlzLmRhdGFzZXRzRGltZW5zaW9ucy5tYXAoZGltZW5zaW9uID0+IGdyaWQuZ2V0RGltZW5zaW9uKGRpbWVuc2lvbikpLCBkYXRhc2V0c0RpbWVuc2lvbklkKTtcbiAgICAgICAgbWVyZ2VkR3JpZCA9IG1lcmdlZEdyaWQubWVyZ2VEaW1lbnNpb25zKHRoaXMubGFiZWxzRGltZW5zaW9ucy5tYXAoZGltZW5zaW9uID0+IGdyaWQuZ2V0RGltZW5zaW9uKGRpbWVuc2lvbikpLCBsYWJlbHNEaW1lbnNpb25JZCk7XG5cbiAgICAgICAgbGV0IGxhYmVscyA9IFtdO1xuICAgICAgICBtZXJnZWRHcmlkLmdldERpbWVuc2lvblZhbHVlcyhtZXJnZWRHcmlkLmdldERpbWVuc2lvbihsYWJlbHNEaW1lbnNpb25JZCkpLmZvckVhY2gobGFiZWxEViA9PiB7XG4gICAgICAgICAgICBsYWJlbHMucHVzaChsYWJlbERWLmNhcHRpb24pO1xuICAgICAgICB9KTtcblxuICAgICAgICBsZXQgZGF0YXNldHMgPSBbXTtcbiAgICAgICAgbWVyZ2VkR3JpZC5nZXREaW1lbnNpb25WYWx1ZXMobWVyZ2VkR3JpZC5nZXREaW1lbnNpb24oZGF0YXNldHNEaW1lbnNpb25JZCkpLmZvckVhY2goZGF0YXNldERWID0+IHtcbiAgICAgICAgICAgIGxldCBkYXRhc2V0ID0ge1xuICAgICAgICAgICAgICAgIGxhYmVsOiBkYXRhc2V0RFYuY2FwdGlvbixcbiAgICAgICAgICAgICAgICBkYXRhOiBbXVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIG1lcmdlZEdyaWQuZ2V0RGltZW5zaW9uVmFsdWVzKG1lcmdlZEdyaWQuZ2V0RGltZW5zaW9uKGxhYmVsc0RpbWVuc2lvbklkKSkuZm9yRWFjaChsYWJlbERWID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgY2VsbERpbWVuc2lvblZhbHVlcyA9IG5ldyBNYXAoKTtcbiAgICAgICAgICAgICAgICBjZWxsRGltZW5zaW9uVmFsdWVzLnNldChkYXRhc2V0c0RpbWVuc2lvbklkLCBkYXRhc2V0RFYpO1xuICAgICAgICAgICAgICAgIGNlbGxEaW1lbnNpb25WYWx1ZXMuc2V0KGxhYmVsc0RpbWVuc2lvbklkLCBsYWJlbERWKTtcblxuICAgICAgICAgICAgICAgIGxldCBjZWxsID0gbWVyZ2VkR3JpZC5nZXRDZWxsKGNlbGxEaW1lbnNpb25WYWx1ZXMpO1xuICAgICAgICAgICAgICAgIGlmIChjZWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGFzZXQuZGF0YS5wdXNoKGNlbGwudmFsdWUpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGFzZXQuZGF0YS5wdXNoKG51bGwpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZGF0YXNldHMucHVzaChkYXRhc2V0KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIG5ldyBHcmFwaCh0aGlzLmdyYXBoVHlwZSwgbGFiZWxzLCBkYXRhc2V0cywgdGhpcy5oZWlnaHQsIHRoaXMud2lkdGgpO1xuICAgIH1cbn1cbiIsImltcG9ydCB7U2VnbWVudEdyYXBofSBmcm9tICcuLi8uLi9yZXN1bHQvZ3JhcGgvc2VnbWVudEdyYXBoJztcblxuZXhwb3J0IGNsYXNzIFNlZ21lbnRHcmFwaFJlbmRlcmVyIHtcblxuICAgIGNvbnN0cnVjdG9yKGdyYXBoVHlwZSA9ICdwaWUnLCBoZWlnaHQgPSAnYXV0bycsIHdpZHRoID0gJ2F1dG8nKSB7XG4gICAgICAgIHRoaXMuZ3JhcGhUeXBlID0gZ3JhcGhUeXBlO1xuICAgICAgICB0aGlzLmhlaWdodCAgICA9IGhlaWdodDtcbiAgICAgICAgdGhpcy53aWR0aCAgICAgPSB3aWR0aDtcbiAgICB9XG5cbiAgICByZW5kZXIoZ3JpZCkge1xuICAgICAgICBsZXQgZGltZW5zaW9ucyA9IFtdO1xuICAgICAgICBncmlkLmRpbWVuc2lvbnMuZm9yRWFjaChkaW0gPT4geyBkaW1lbnNpb25zLnB1c2goZGltKTsgfSk7XG5cbiAgICAgICAgbGV0IGxhYmVsc0RpbWVuc2lvbklkID0gJ2xhYmVsJyxcbiAgICAgICAgICAgIG1lcmdlZEdyaWQgPSBncmlkLm1lcmdlRGltZW5zaW9ucyhkaW1lbnNpb25zLCBsYWJlbHNEaW1lbnNpb25JZCk7XG5cbiAgICAgICAgbGV0IGxhYmVscyA9IFtdO1xuICAgICAgICBtZXJnZWRHcmlkLmdldERpbWVuc2lvblZhbHVlcyhtZXJnZWRHcmlkLmdldERpbWVuc2lvbihsYWJlbHNEaW1lbnNpb25JZCkpLmZvckVhY2gobGFiZWxEViA9PiB7XG4gICAgICAgICAgICBsZXQgY2VsbERpbWVuc2lvblZhbHVlcyA9IG5ldyBNYXAoKTtcbiAgICAgICAgICAgIGNlbGxEaW1lbnNpb25WYWx1ZXMuc2V0KGxhYmVsc0RpbWVuc2lvbklkLCBsYWJlbERWKTtcbiAgICAgICAgICAgIGxldCBjZWxsID0gbWVyZ2VkR3JpZC5nZXRDZWxsKGNlbGxEaW1lbnNpb25WYWx1ZXMpO1xuXG4gICAgICAgICAgICBsYWJlbHMucHVzaCh7XG4gICAgICAgICAgICAgICAgbGFiZWw6IGxhYmVsRFYuY2FwdGlvbixcbiAgICAgICAgICAgICAgICB2YWx1ZTogY2VsbC52YWx1ZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBuZXcgU2VnbWVudEdyYXBoKHRoaXMuZ3JhcGhUeXBlLCBsYWJlbHMsIHRoaXMuaGVpZ2h0LCB0aGlzLndpZHRoKTtcbiAgICB9XG59XG4iLCJpbXBvcnQge1RhYmxlUm93fSAgZnJvbSAnLi4vLi4vcmVzdWx0L3RhYmxlL3RhYmxlUm93JztcbmltcG9ydCB7VGFibGVDZWxsfSBmcm9tICcuLi8uLi9yZXN1bHQvdGFibGUvdGFibGVDZWxsJztcbmltcG9ydCB7TWFwc30gICAgICBmcm9tICcuLi8uLi91dGlscy9tYXBzJztcblxuZXhwb3J0IGNsYXNzIFRhYmxlQm9keVJlbmRlcmVyIHtcblxuICAgIGNvbnN0cnVjdG9yKHJvd0RpbWVuc2lvbnMsIGNvbHVtbkRpbWVuc2lvbnMsIG9wdGlvbnMgPSB7fSkge1xuICAgICAgICB0aGlzLnJvd0RpbWVuc2lvbnMgPSByb3dEaW1lbnNpb25zO1xuICAgICAgICB0aGlzLmNvbHVtbkRpbWVuc2lvbnMgPSBjb2x1bW5EaW1lbnNpb25zO1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICAgIH1cblxuICAgIHJlbmRlcihncmlkKSB7XG4gICAgICAgIGxldCBtYXBVdGlscyA9IG5ldyBNYXBzKCksXG5cbiAgICAgICAgICAgIGdldEJvZHlDZWxscyA9IGZ1bmN0aW9uKGN1cnJlbnRSb3csIGNvbHVtbkRpbWVuc2lvbnMsIGNlbGxzLCBkaW1lbnNpb25WYWx1ZXMpIHtcbiAgICAgICAgICAgICAgICBsZXQgY29sU2V0cyA9IGdyaWQuZ2V0RGltZW5pb25WYWx1ZXNTZXRzKGNvbHVtbkRpbWVuc2lvbnMubWFwKGRpbWVuc2lvbiA9PiBncmlkLmdldERpbWVuc2lvbihkaW1lbnNpb24pKSk7XG5cbiAgICAgICAgICAgICAgICBjb2xTZXRzLmZvckVhY2goc2V0ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNlbGxTZXQgPSBtYXBVdGlscy5zdW0oZGltZW5zaW9uVmFsdWVzLCBzZXQpO1xuICAgICAgICAgICAgICAgICAgICBsZXQgY2VsbCA9IGdyaWQuZ2V0Q2VsbChjZWxsU2V0KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNlbGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRSb3cuYWRkQ2VsbChuZXcgVGFibGVDZWxsKGNlbGwudmFsdWUpKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRSb3cuYWRkQ2VsbChuZXcgVGFibGVDZWxsKCcnKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIGdldFJvd3MgPSBmdW5jdGlvbihyb3dzLCByb3dEaW1lbnNpb25zLCBjb2x1bW5EaW1lbnNpb25zLCBjZWxscywgZGltZW5zaW9uVmFsdWVzID0gbmV3IE1hcCgpLCByb3cgPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgaWYgKHJvd0RpbWVuc2lvbnMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGdldEJvZHlDZWxscyhyb3csIGNvbHVtbkRpbWVuc2lvbnMsIGNlbGxzLCBkaW1lbnNpb25WYWx1ZXMpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBsZXQgY3VycmVudERpbWVuc2lvbklkICAgICA9IHJvd0RpbWVuc2lvbnNbMF0sXG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnREaW1lbnNpb24gICAgICAgPSBncmlkLmdldERpbWVuc2lvbihjdXJyZW50RGltZW5zaW9uSWQpLFxuICAgICAgICAgICAgICAgICAgICByZW1haW5pbmdEaW1lbnNpb25zICAgID0gcm93RGltZW5zaW9ucy5zbGljZSgxKSxcbiAgICAgICAgICAgICAgICAgICAgY291bnRDZWxscyAgICAgICAgICAgICA9IDAsXG4gICAgICAgICAgICAgICAgICAgIGZpcnN0ICAgICAgICAgICAgICAgICAgPSB0cnVlO1xuXG4gICAgICAgICAgICAgICAgZ3JpZC5nZXREaW1lbnNpb25WYWx1ZXMoY3VycmVudERpbWVuc2lvbikuZm9yRWFjaChkaW1lbnNpb25WYWx1ZSA9PiB7XG5cbiAgICAgICAgICAgICAgICAgICAgbGV0IHN1YkNlbGxzID0gY2VsbHMuZmlsdGVyKGNlbGwgPT4gY2VsbC5nZXREaW1lbnNpb25WYWx1ZShjdXJyZW50RGltZW5zaW9uKSA9PT0gZGltZW5zaW9uVmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoc3ViQ2VsbHMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgY3VycmVudFJvdyA9IHJvdztcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyb3cgPT09IG51bGwgfHwgIWZpcnN0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudFJvdyA9IG5ldyBUYWJsZVJvdygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvd3MucHVzaChjdXJyZW50Um93KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGZpcnN0ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgY3VycmVudERpbWVuc2lvblZhbHVlcyA9IG1hcFV0aWxzLmNsb25lKGRpbWVuc2lvblZhbHVlcyk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnREaW1lbnNpb25WYWx1ZXMuc2V0KGN1cnJlbnREaW1lbnNpb25JZCwgZGltZW5zaW9uVmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHRhYmxlQ2VsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghdGhpcy5vcHRpb25zLmhpZGVIZWFkZXJzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFibGVDZWxsID0gbmV3IFRhYmxlQ2VsbChkaW1lbnNpb25WYWx1ZS5jYXB0aW9uLCB7IGhlYWRlcjogdHJ1ZSB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50Um93LmFkZENlbGwodGFibGVDZWxsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBjaGlsZENlbGxzQ291bnQgPSBnZXRSb3dzLmNhbGwodGhpcywgcm93cywgcmVtYWluaW5nRGltZW5zaW9ucywgY29sdW1uRGltZW5zaW9ucywgc3ViQ2VsbHMsIGN1cnJlbnREaW1lbnNpb25WYWx1ZXMsIGN1cnJlbnRSb3cpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzLm9wdGlvbnMuaGlkZUhlYWRlcnMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YWJsZUNlbGwuc2V0T3B0aW9uKCdyb3dzcGFuJywgY2hpbGRDZWxsc0NvdW50KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50Q2VsbHMgKz0gY2hpbGRDZWxsc0NvdW50O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgICAgIHJldHVybiBjb3VudENlbGxzO1xuICAgICAgICB9O1xuXG4gICAgICAgIGxldCByb3dzID0gW107XG4gICAgICAgIGdldFJvd3MuY2FsbCh0aGlzLCByb3dzLCB0aGlzLnJvd0RpbWVuc2lvbnMsIHRoaXMuY29sdW1uRGltZW5zaW9ucywgZ3JpZC5jZWxscyk7XG5cbiAgICAgICAgcmV0dXJuIHJvd3M7XG4gICAgfVxuXG4gICAgZ2V0SGVhZGVyQ2VsbHMoKSB7XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuaGlkZUhlYWRlcnMpIHtcbiAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgbmV3IFRhYmxlQ2VsbCgnJywge1xuICAgICAgICAgICAgICAgIGNvbHNwYW46IHRoaXMucm93RGltZW5zaW9ucy5sZW5ndGgsXG4gICAgICAgICAgICAgICAgaGVhZGVyOiB0cnVlXG4gICAgICAgICAgICB9KVxuICAgICAgICBdO1xuXG4gICAgfVxufVxuIiwiaW1wb3J0IHtUYWJsZVJvd30gIGZyb20gJy4uLy4uL3Jlc3VsdC90YWJsZS90YWJsZVJvdyc7XG5pbXBvcnQge1RhYmxlQ2VsbH0gZnJvbSAnLi4vLi4vcmVzdWx0L3RhYmxlL3RhYmxlQ2VsbCc7XG5pbXBvcnQge01hcHN9ICAgICAgZnJvbSAnLi4vLi4vdXRpbHMvbWFwcyc7XG5cbmV4cG9ydCBjbGFzcyBUYWJsZUhlYWRlclJlbmRlcmVyIHtcblxuICAgIGNvbnN0cnVjdG9yKGNvbHVtbkRpbWVuc2lvbnMsIG9wdGlvbnMgPSB7fSkge1xuICAgICAgICB0aGlzLmNvbHVtbkRpbWVuc2lvbnMgPSBjb2x1bW5EaW1lbnNpb25zO1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICAgIH1cblxuICAgIHJlbmRlcihncmlkLCBoZWFkZXJDZWxscyA9IFtdKSB7XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuaGlkZUhlYWRlcnMpIHtcbiAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBtYXBVdGlscyA9IG5ldyBNYXBzKCksXG4gICAgICAgICAgICBnZXRIZWFkZXJSb3dzID0gZnVuY3Rpb24ocm93cywgZGltZW5zaW9ucywgY2VsbHMsIGRpbWVuc2lvblZhbHVlcyA9IG5ldyBNYXAoKSkge1xuICAgICAgICAgICAgICAgIGlmIChkaW1lbnNpb25zLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBsZXQgY3VycmVudERpbWVuc2lvbklkICAgICA9IGRpbWVuc2lvbnNbMF0sXG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnREaW1lbnNpb24gICAgICAgPSBncmlkLmdldERpbWVuc2lvbihjdXJyZW50RGltZW5zaW9uSWQpLFxuICAgICAgICAgICAgICAgICAgICByZW1haW5pbmdEaW1lbnNpb25zICAgID0gZGltZW5zaW9ucy5zbGljZSgxKSxcbiAgICAgICAgICAgICAgICAgICAgY291bnRDZWxscyAgICAgICAgICAgICA9IDAsXG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRSb3c7XG4gICAgICAgICAgICAgICAgaWYgKHJvd3MuaGFzKGN1cnJlbnREaW1lbnNpb25JZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudFJvdyA9IHJvd3MuZ2V0KGN1cnJlbnREaW1lbnNpb25JZCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudFJvdyA9IG5ldyBUYWJsZVJvdygpO1xuICAgICAgICAgICAgICAgICAgICByb3dzLnNldChjdXJyZW50RGltZW5zaW9uSWQsIGN1cnJlbnRSb3cpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBncmlkLmdldERpbWVuc2lvblZhbHVlcyhjdXJyZW50RGltZW5zaW9uKS5mb3JFYWNoKGRpbWVuc2lvblZhbHVlID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHN1YkNlbGxzID0gY2VsbHMuZmlsdGVyKGNlbGwgPT4gY2VsbC5nZXREaW1lbnNpb25WYWx1ZShjdXJyZW50RGltZW5zaW9uKSA9PT0gZGltZW5zaW9uVmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoc3ViQ2VsbHMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgY3VycmVudERpbWVuc2lvblZhbHVlcyA9IG1hcFV0aWxzLmNsb25lKGRpbWVuc2lvblZhbHVlcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50RGltZW5zaW9uVmFsdWVzLnNldChjdXJyZW50RGltZW5zaW9uSWQsIGRpbWVuc2lvblZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBjaGlsZENlbGxzQ291bnQgPSBnZXRIZWFkZXJSb3dzKHJvd3MsIHJlbWFpbmluZ0RpbWVuc2lvbnMsIHN1YkNlbGxzLCBjdXJyZW50RGltZW5zaW9uVmFsdWVzKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudFJvdy5hZGRDZWxsKG5ldyBUYWJsZUNlbGwoZGltZW5zaW9uVmFsdWUuY2FwdGlvbiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbHNwYW46IGNoaWxkQ2VsbHNDb3VudCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWFkZXI6IHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgY291bnRDZWxscyArPSBjaGlsZENlbGxzQ291bnQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIHJldHVybiBjb3VudENlbGxzO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICBsZXQgcm93c01hcCA9IG5ldyBNYXAoKTtcbiAgICAgICAgaWYgKHRoaXMuY29sdW1uRGltZW5zaW9ucy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiBoZWFkZXJDZWxscy5jb25jYXQoW25ldyBUYWJsZVJvdyhbIG5ldyBUYWJsZUNlbGwoJycsIHsgaGVhZGVyOiB0cnVlIH0pIF0pXSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBnZXRIZWFkZXJSb3dzKHJvd3NNYXAsIHRoaXMuY29sdW1uRGltZW5zaW9ucywgZ3JpZC5jZWxscyk7XG4gICAgICAgICAgICBsZXQgcm93cyA9IFtdO1xuICAgICAgICAgICAgcm93c01hcC5mb3JFYWNoKHJvdyA9PiB7XG4gICAgICAgICAgICAgICAgcm93LmNlbGxzID0gaGVhZGVyQ2VsbHMuY29uY2F0KHJvdy5jZWxscyk7XG4gICAgICAgICAgICAgICAgcm93cy5wdXNoKHJvdyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiByb3dzO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiaW1wb3J0IHtUYWJsZX0gZnJvbSAnLi4vLi4vcmVzdWx0L3RhYmxlL3RhYmxlJztcbmltcG9ydCB7VGFibGVIZWFkZXJSZW5kZXJlcn0gZnJvbSAnLi4vLi4vcmVuZGVyZXIvdGFibGUvdGFibGVIZWFkZXJSZW5kZXJlcic7XG5pbXBvcnQge1RhYmxlQm9keVJlbmRlcmVyfSBmcm9tICcuLi8uLi9yZW5kZXJlci90YWJsZS90YWJsZUJvZHlSZW5kZXJlcic7XG5cbmV4cG9ydCBjbGFzcyBUYWJsZVJlbmRlcmVyIHtcblxuICAgIGNvbnN0cnVjdG9yKHJvd0RpbWVuc2lvbnMsIGNvbHVtbkRpbWVuc2lvbnMsIG9wdGlvbnMgPSB7fSkge1xuICAgICAgICB0aGlzLnJvd0RpbWVuc2lvbnMgICAgPSByb3dEaW1lbnNpb25zO1xuICAgICAgICB0aGlzLmNvbHVtbkRpbWVuc2lvbnMgPSBjb2x1bW5EaW1lbnNpb25zO1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICAgIH1cblxuICAgIHJlbmRlcihncmlkKSB7XG4gICAgICAgIGxldCB0YWJsZSA9IG5ldyBUYWJsZSgpLFxuICAgICAgICAgICAgdGFibGVIZWFkZXJSZW5kZXJlciA9IG5ldyBUYWJsZUhlYWRlclJlbmRlcmVyKHRoaXMuY29sdW1uRGltZW5zaW9ucywge1xuICAgICAgICAgICAgICAgIGhpZGVIZWFkZXJzOiB0aGlzLm9wdGlvbnMuaGlkZUNvbHVtbkhlYWRlcnNcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgdGFibGVCb2R5UmVuZGVyZXIgPSBuZXcgVGFibGVCb2R5UmVuZGVyZXIodGhpcy5yb3dEaW1lbnNpb25zLCB0aGlzLmNvbHVtbkRpbWVuc2lvbnMsIHtcbiAgICAgICAgICAgICAgICBoaWRlSGVhZGVyczogdGhpcy5vcHRpb25zLmhpZGVSb3dIZWFkZXJzXG4gICAgICAgICAgICB9KSxcblxuICAgICAgICAgICAgaGVhZGVyUm93cyA9IHRhYmxlSGVhZGVyUmVuZGVyZXIucmVuZGVyKGdyaWQsIHRhYmxlQm9keVJlbmRlcmVyLmdldEhlYWRlckNlbGxzKCkpLFxuICAgICAgICAgICAgYm9keVJvd3MgPSB0YWJsZUJvZHlSZW5kZXJlci5yZW5kZXIoZ3JpZCk7XG5cbiAgICAgICAgaGVhZGVyUm93cy5mb3JFYWNoKHJvdyA9PiB7IHRhYmxlLmFkZFJvdyhyb3cpOyB9KTtcbiAgICAgICAgYm9keVJvd3MuZm9yRWFjaChyb3cgPT4geyB0YWJsZS5hZGRSb3cocm93KTsgfSk7XG5cbiAgICAgICAgcmV0dXJuIHRhYmxlO1xuICAgIH1cbn1cbiIsImV4cG9ydCBjbGFzcyBHcmFwaCB7XG5cbiAgICBjb25zdHJ1Y3RvcihncmFwaFR5cGUsIGxhYmVscyA9IFtdLCBkYXRhc2V0cyA9IFtdLCBoZWlnaHQgPSAnYXV0bycsIHdpZHRoID0gJ2F1dG8nKSB7XG4gICAgICAgIHRoaXMuZ3JhcGhUeXBlID0gZ3JhcGhUeXBlO1xuICAgICAgICB0aGlzLmxhYmVscyAgID0gbGFiZWxzO1xuICAgICAgICB0aGlzLmRhdGFzZXRzID0gZGF0YXNldHM7XG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgICAgICB0aGlzLndpZHRoID0gd2lkdGg7XG4gICAgfVxuXG4gICAgYWRkRGF0YXNldChkYXRhc2V0KSB7XG4gICAgICAgIHRoaXMuZGF0YXNldHMucHVzaChkYXRhc2V0KTtcbiAgICB9XG59XG4iLCJleHBvcnQgY2xhc3MgU2VnbWVudEdyYXBoIHtcblxuICAgIGNvbnN0cnVjdG9yKGdyYXBoVHlwZSwgbGFiZWxzID0gW10sIGhlaWdodCA9ICdhdXRvJywgd2lkdGggPSAnYXV0bycpIHtcbiAgICAgICAgdGhpcy5ncmFwaFR5cGUgPSBncmFwaFR5cGU7XG4gICAgICAgIHRoaXMubGFiZWxzICAgPSBsYWJlbHM7XG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgICAgICB0aGlzLndpZHRoID0gd2lkdGg7XG4gICAgfVxuXG59XG4iLCJleHBvcnQgY2xhc3MgVGFibGUge1xuXG4gICAgY29uc3RydWN0b3Iocm93cyA9IFtdKSB7XG4gICAgICAgIHRoaXMucm93cyA9IHJvd3M7XG4gICAgfVxuXG4gICAgYWRkUm93KHJvdykge1xuICAgICAgICB0aGlzLnJvd3MucHVzaChyb3cpO1xuICAgIH1cblxuICAgIGdldEh0bWwoKSB7XG4gICAgICAgIGxldCBodG1sID0gJyc7XG4gICAgICAgIHRoaXMucm93cy5mb3JFYWNoKHJvdyA9PiB7XG4gICAgICAgICAgICBsZXQgcm93SHRtbCA9ICcnO1xuICAgICAgICAgICAgcm93LmNlbGxzLmZvckVhY2goY2VsbCA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IGNlbGxBdHRyaWJ1dGVzID0gW107XG4gICAgICAgICAgICAgICAgaWYgKGNlbGwub3B0aW9ucy5yb3dzcGFuICE9PSB1bmRlZmluZWQgJiYgY2VsbC5vcHRpb25zLnJvd3NwYW4gPiAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGNlbGxBdHRyaWJ1dGVzLnB1c2goJ3Jvd3NwYW49XCInK2NlbGwub3B0aW9ucy5yb3dzcGFuKydcIicpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoY2VsbC5vcHRpb25zLmNvbHNwYW4gIT09IHVuZGVmaW5lZCAmJiBjZWxsLm9wdGlvbnMuY29sc3BhbiA+IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgY2VsbEF0dHJpYnV0ZXMucHVzaCgnY29sc3Bhbj1cIicrY2VsbC5vcHRpb25zLmNvbHNwYW4rJ1wiJyk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgbGV0IHRhZyA9IGNlbGwub3B0aW9ucy5oZWFkZXIgPT09IHVuZGVmaW5lZCB8fCAhY2VsbC5vcHRpb25zLmhlYWRlciA/ICd0ZCcgOiAndGgnO1xuICAgICAgICAgICAgICAgIHJvd0h0bWwgKz0gJzwnICsgdGFnICsgKGNlbGxBdHRyaWJ1dGVzLmxlbmd0aCA/ICcgJyArIGNlbGxBdHRyaWJ1dGVzLmpvaW4oJyAnKSA6ICcnKSArICc+JyArIGNlbGwudmFsdWUgKyAnPC8nICsgdGFnICsgJz4nO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJvd0h0bWwgPSAnPHRyPicgKyByb3dIdG1sICsgJzwvdHI+JztcbiAgICAgICAgICAgIGh0bWwgKz0gcm93SHRtbDtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuICc8dGFibGU+JyArIGh0bWwgKyAnPC90YWJsZT4nO1xuICAgIH1cbn1cbiIsImV4cG9ydCBjbGFzcyBUYWJsZUNlbGwge1xuXG4gICAgY29uc3RydWN0b3IodmFsdWUsIG9wdGlvbnMgPSB7fSkge1xuICAgICAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgfVxuXG4gICAgc2V0T3B0aW9uKGtleSwgdmFsdWUpIHtcbiAgICAgICAgdGhpcy5vcHRpb25zW2tleV0gPSB2YWx1ZTtcbiAgICB9XG59XG4iLCJleHBvcnQgY2xhc3MgVGFibGVSb3cge1xuXG4gICAgY29uc3RydWN0b3IoY2VsbHMgPSBbXSkge1xuICAgICAgICB0aGlzLmNlbGxzID0gY2VsbHM7XG4gICAgfVxuXG4gICAgYWRkQ2VsbChjZWxsKSB7XG4gICAgICAgIHRoaXMuY2VsbHMucHVzaChjZWxsKTtcbiAgICB9XG5cbn1cbiIsImV4cG9ydCBjbGFzcyBDb2xvcnMge1xuXG4gICAgaGV4VG9SZ2IoaGV4KSB7XG4gICAgICAgIGxldCByZXN1bHQgPSAvXiM/KFthLWZcXGRdezJ9KShbYS1mXFxkXXsyfSkoW2EtZlxcZF17Mn0pJC9pLmV4ZWMoaGV4KTtcbiAgICAgICAgaWYgKCFyZXN1bHQpIHtcbiAgICAgICAgICAgIHRocm93IEVycm9yKCdcIicgKyBoZXggKyAnXCIgaXMgbm90IGEgdmFsaWQgaGV4IGNvbG9yJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHI6IHBhcnNlSW50KHJlc3VsdFsxXSwgMTYpLFxuICAgICAgICAgICAgZzogcGFyc2VJbnQocmVzdWx0WzJdLCAxNiksXG4gICAgICAgICAgICBiOiBwYXJzZUludChyZXN1bHRbM10sIDE2KVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHJnYlRvU3RyaW5nKHJnYiwgYWxwaGEgPSAxKSB7XG4gICAgICAgIHJldHVybiAncmdiYSgnICsgKFtyZ2IuciwgcmdiLmcsIHJnYi5iLCBhbHBoYV0uam9pbignLCcpKSArJyknO1xuICAgIH1cblxuICAgIGRlZmF1bHRTY2hlbWUoKSB7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICAnIzk3YmJjZCcsXG4gICAgICAgICAgICAnI2RjZGNkYycsXG4gICAgICAgICAgICAnI0Y3NDY0QScsXG4gICAgICAgICAgICAnIzQ2QkZCRCcsXG4gICAgICAgICAgICAnIzk0OUZCMScsXG4gICAgICAgICAgICAnI0ZEQjQ1QycsXG4gICAgICAgICAgICAnIzRENTM2MCcsXG4gICAgICAgICAgICAnIzdjYjVlYycsXG4gICAgICAgICAgICAnIzkwZWQ3ZCcsXG4gICAgICAgICAgICAnI2Y3YTM1YycsXG4gICAgICAgICAgICAnIzgwODVlOScsXG4gICAgICAgICAgICAnI2YxNWM4MCcsXG4gICAgICAgICAgICAnI2U0ZDM1NCcsXG4gICAgICAgICAgICAnIzgwODVlOCcsXG4gICAgICAgICAgICAnIzhkNDY1MycsXG4gICAgICAgICAgICAnIzkxZThlMSdcbiAgICAgICAgXTtcbiAgICB9XG59XG4iLCJleHBvcnQgY2xhc3MgTWFwcyB7XG5cbiAgICBjbG9uZShtYXApIHtcbiAgICAgICAgbGV0IG5ld01hcCA9IG5ldyBNYXAoKTtcbiAgICAgICAgbWFwLmZvckVhY2goKHZhbHVlLCBrZXkpID0+IHtcbiAgICAgICAgICAgIG5ld01hcC5zZXQoa2V5LCB2YWx1ZSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBuZXdNYXA7XG4gICAgfVxuXG4gICAgc3VtKG1hcDEsIG1hcDIpIHtcbiAgICAgICAgbGV0IG5ld01hcCA9IG5ldyBNYXAoKTtcbiAgICAgICAgbWFwMS5mb3JFYWNoKCh2YWx1ZSwga2V5KSA9PiB7XG4gICAgICAgICAgICBuZXdNYXAuc2V0KGtleSwgdmFsdWUpO1xuICAgICAgICB9KTtcbiAgICAgICAgbWFwMi5mb3JFYWNoKCh2YWx1ZSwga2V5KSA9PiB7XG4gICAgICAgICAgICBuZXdNYXAuc2V0KGtleSwgdmFsdWUpO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gbmV3TWFwO1xuICAgIH1cbn1cbiIsIndpbmRvdy5yZXBvcnRqcyA9IHJlcXVpcmUoJy4uL3NyYy9pbmRleC5qcycpO1xuIl19
