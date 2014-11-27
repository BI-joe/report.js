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
  renderGraphToCanvas: function(canvas, graph) {
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
    var context = canvas.getContext('2d'),
        chart = new Chart(context),
        chartOptions = {legendTemplate: '<ul class="chartjs-legend <%=name.toLowerCase()%>-legend"><% for (var i=0; i<datasets.length; i++){%><li><span class="pill" style="background-color:<%=datasets[i].strokeColor%>"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>'};
    switch (graph.graphType) {
      case 'line':
        chart = chart.Line(getChartData(graph), chartOptions);
        break;
      case 'bar':
        chart = chart.Bar(getChartData(graph), chartOptions);
        break;
      case 'radar':
        chart = chart.Radar(getChartData(graph), chartOptions);
        break;
      default:
        throw Error('Unknown graph type "' + graph.graphType + '"');
    }
    return chart;
  },
  renderSegmentGraphToCanvas: function(canvas, graph) {
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
    var context = canvas.getContext('2d'),
        chart = new Chart(context),
        chartOptions = {legendTemplate: '<ul class="chartjs-legend <%=name.toLowerCase()%>-legend"><% for (var i=0; i<segments.length; i++){%><li><span class="pill" style="background-color:<%=segments[i].fillColor%>"></span><%if(segments[i].label){%><%=segments[i].label%><%}%></li><%}%></ul>'};
    switch (graph.graphType) {
      case 'pie':
        chart = chart.Pie(getChartData(graph), chartOptions);
        break;
      case 'polarArea':
        chart = chart.PolarArea(getChartData(graph), chartOptions);
        break;
      case 'doughnut':
        chart = chart.Doughnut(getChartData(graph), chartOptions);
        break;
      default:
        throw Error('Unknown segment graph type "' + graph.graphType + '"');
    }
    return chart;
  },
  renderGraphTo: function(element, graph) {
    element.prepend('<canvas width="' + getWidth(element, graph.width) + '" height="' + getHeight(element, graph.height) + '"></canvas>');
    var canvas = element.find('canvas:first').get(0);
    var chart = this.renderGraphToCanvas(canvas, graph);
    element.append(chart.generateLegend());
  },
  renderSegmentGraphTo: function(element, graph) {
    element.prepend('<canvas width="' + getWidth(element, graph.width) + '" height="' + getHeight(element, graph.height) + '"></canvas>');
    var canvas = element.find('canvas:first').get(0);
    var chart = this.renderSegmentGraphToCanvas(canvas, graph);
    element.append(chart.generateLegend());
  }
}, {});

//# sourceMappingURL=<compileOutput>


},{"../utils/colors":22}],4:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  JQueryAdapter: {get: function() {
      return JQueryAdapter;
    }},
  __esModule: {value: true}
});
var JQueryAdapter = function JQueryAdapter() {};
($traceurRuntime.createClass)(JQueryAdapter, {renderTableTo: function(element, table) {
    element.html(table.getHtml());
  }}, {});

//# sourceMappingURL=<compileOutput>


},{}],5:[function(require,module,exports){
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


},{}],6:[function(require,module,exports){
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


},{}],7:[function(require,module,exports){
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


},{}],8:[function(require,module,exports){
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


},{"../data/cell":5,"../data/dimension":6,"../data/dimensionValue":7,"../utils/maps":23}],9:[function(require,module,exports){
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


},{"../data/cell":5,"../data/dimension":6,"../data/dimensionValue":7,"../data/grid":8}],10:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  reportjs: {get: function() {
      return reportjs;
    }},
  __esModule: {value: true}
});
var $__renderer_47_renderer__,
    $__adapter_47_chartjsAdapter__,
    $__adapter_47_jqueryAdapter__;
var Renderer = ($__renderer_47_renderer__ = require("./renderer/renderer"), $__renderer_47_renderer__ && $__renderer_47_renderer__.__esModule && $__renderer_47_renderer__ || {default: $__renderer_47_renderer__}).Renderer;
var ChartjsAdapter = ($__adapter_47_chartjsAdapter__ = require("./adapter/chartjsAdapter"), $__adapter_47_chartjsAdapter__ && $__adapter_47_chartjsAdapter__.__esModule && $__adapter_47_chartjsAdapter__ || {default: $__adapter_47_chartjsAdapter__}).ChartjsAdapter;
var JQueryAdapter = ($__adapter_47_jqueryAdapter__ = require("./adapter/jqueryAdapter"), $__adapter_47_jqueryAdapter__ && $__adapter_47_jqueryAdapter__.__esModule && $__adapter_47_jqueryAdapter__ || {default: $__adapter_47_jqueryAdapter__}).JQueryAdapter;
var reportjs = {
  Renderer: Renderer,
  ChartjsAdapter: ChartjsAdapter,
  JQueryAdapter: JQueryAdapter
};
;

//# sourceMappingURL=<compileOutput>


},{"./adapter/chartjsAdapter":3,"./adapter/jqueryAdapter":4,"./renderer/renderer":13}],11:[function(require,module,exports){
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


},{"../../result/graph/graph":17}],12:[function(require,module,exports){
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


},{"../../result/graph/segmentGraph":18}],13:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  Renderer: {get: function() {
      return Renderer;
    }},
  __esModule: {value: true}
});
var $___46__46__47_data_47_gridFactory__,
    $__table_47_tableRenderer__,
    $__graph_47_graphRenderer__,
    $__graph_47_segmentGraphRenderer__;
var GridFactory = ($___46__46__47_data_47_gridFactory__ = require("../data/gridFactory"), $___46__46__47_data_47_gridFactory__ && $___46__46__47_data_47_gridFactory__.__esModule && $___46__46__47_data_47_gridFactory__ || {default: $___46__46__47_data_47_gridFactory__}).GridFactory;
var TableRenderer = ($__table_47_tableRenderer__ = require("./table/tableRenderer"), $__table_47_tableRenderer__ && $__table_47_tableRenderer__.__esModule && $__table_47_tableRenderer__ || {default: $__table_47_tableRenderer__}).TableRenderer;
var GraphRenderer = ($__graph_47_graphRenderer__ = require("./graph/graphRenderer"), $__graph_47_graphRenderer__ && $__graph_47_graphRenderer__.__esModule && $__graph_47_graphRenderer__ || {default: $__graph_47_graphRenderer__}).GraphRenderer;
var SegmentGraphRenderer = ($__graph_47_segmentGraphRenderer__ = require("./graph/segmentGraphRenderer"), $__graph_47_segmentGraphRenderer__ && $__graph_47_segmentGraphRenderer__.__esModule && $__graph_47_segmentGraphRenderer__ || {default: $__graph_47_segmentGraphRenderer__}).SegmentGraphRenderer;
var Renderer = function Renderer() {};
($traceurRuntime.createClass)(Renderer, {render: function(options) {
    var gridFactory = new GridFactory(),
        grid = gridFactory.buildFromJson(options.data),
        output;
    switch (options.layout.type) {
      case 'table':
        var tableRenderer = new TableRenderer(options.layout.rows, options.layout.columns, options.layout.options);
        output = tableRenderer.render(grid);
        break;
      case 'graph':
        var graphRenderer = new GraphRenderer(options.layout.datasets, options.layout.labels, options.layout.graphType, options.layout.height, options.layout.width);
        output = graphRenderer.render(grid);
        break;
      case 'segmentGraph':
        var segmentGraphRenderer = new SegmentGraphRenderer(options.layout.graphType, options.layout.height, options.layout.width);
        output = segmentGraphRenderer.render(grid);
        break;
      default:
        throw Error('unknown layout type');
    }
    return output;
  }}, {});

//# sourceMappingURL=<compileOutput>


},{"../data/gridFactory":9,"./graph/graphRenderer":11,"./graph/segmentGraphRenderer":12,"./table/tableRenderer":16}],14:[function(require,module,exports){
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


},{"../../result/table/tableCell":20,"../../result/table/tableRow":21,"../../utils/maps":23}],15:[function(require,module,exports){
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


},{"../../result/table/tableCell":20,"../../result/table/tableRow":21,"../../utils/maps":23}],16:[function(require,module,exports){
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


},{"../../renderer/table/tableBodyRenderer":14,"../../renderer/table/tableHeaderRenderer":15,"../../result/table/table":19}],17:[function(require,module,exports){
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


},{}],18:[function(require,module,exports){
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


},{}],19:[function(require,module,exports){
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


},{}],20:[function(require,module,exports){
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


},{}],21:[function(require,module,exports){
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


},{}],22:[function(require,module,exports){
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


},{}],23:[function(require,module,exports){
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


},{}],24:[function(require,module,exports){
"use strict";
window.reportjs = require('../src/index.js');

//# sourceMappingURL=<compileOutput>


},{"../src/index.js":10}]},{},[2,24])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL2VzNmlmeS9ub2RlX21vZHVsZXMvdHJhY2V1ci9iaW4vdHJhY2V1ci1ydW50aW1lLmpzIiwiL1VzZXJzL3JpYWQuYmVuZ3VlbGxhL1NpdGVzL3BlcnNvL2Jpam9lL3JlcG9ydC5qcy9zcmMvYWRhcHRlci9jaGFydGpzQWRhcHRlci5qcyIsIi9Vc2Vycy9yaWFkLmJlbmd1ZWxsYS9TaXRlcy9wZXJzby9iaWpvZS9yZXBvcnQuanMvc3JjL2FkYXB0ZXIvanF1ZXJ5QWRhcHRlci5qcyIsIi9Vc2Vycy9yaWFkLmJlbmd1ZWxsYS9TaXRlcy9wZXJzby9iaWpvZS9yZXBvcnQuanMvc3JjL2RhdGEvY2VsbC5qcyIsIi9Vc2Vycy9yaWFkLmJlbmd1ZWxsYS9TaXRlcy9wZXJzby9iaWpvZS9yZXBvcnQuanMvc3JjL2RhdGEvZGltZW5zaW9uLmpzIiwiL1VzZXJzL3JpYWQuYmVuZ3VlbGxhL1NpdGVzL3BlcnNvL2Jpam9lL3JlcG9ydC5qcy9zcmMvZGF0YS9kaW1lbnNpb25WYWx1ZS5qcyIsIi9Vc2Vycy9yaWFkLmJlbmd1ZWxsYS9TaXRlcy9wZXJzby9iaWpvZS9yZXBvcnQuanMvc3JjL2RhdGEvZ3JpZC5qcyIsIi9Vc2Vycy9yaWFkLmJlbmd1ZWxsYS9TaXRlcy9wZXJzby9iaWpvZS9yZXBvcnQuanMvc3JjL2RhdGEvZ3JpZEZhY3RvcnkuanMiLCIvVXNlcnMvcmlhZC5iZW5ndWVsbGEvU2l0ZXMvcGVyc28vYmlqb2UvcmVwb3J0LmpzL3NyYy9pbmRleC5qcyIsIi9Vc2Vycy9yaWFkLmJlbmd1ZWxsYS9TaXRlcy9wZXJzby9iaWpvZS9yZXBvcnQuanMvc3JjL3JlbmRlcmVyL2dyYXBoL2dyYXBoUmVuZGVyZXIuanMiLCIvVXNlcnMvcmlhZC5iZW5ndWVsbGEvU2l0ZXMvcGVyc28vYmlqb2UvcmVwb3J0LmpzL3NyYy9yZW5kZXJlci9ncmFwaC9zZWdtZW50R3JhcGhSZW5kZXJlci5qcyIsIi9Vc2Vycy9yaWFkLmJlbmd1ZWxsYS9TaXRlcy9wZXJzby9iaWpvZS9yZXBvcnQuanMvc3JjL3JlbmRlcmVyL3JlbmRlcmVyLmpzIiwiL1VzZXJzL3JpYWQuYmVuZ3VlbGxhL1NpdGVzL3BlcnNvL2Jpam9lL3JlcG9ydC5qcy9zcmMvcmVuZGVyZXIvdGFibGUvdGFibGVCb2R5UmVuZGVyZXIuanMiLCIvVXNlcnMvcmlhZC5iZW5ndWVsbGEvU2l0ZXMvcGVyc28vYmlqb2UvcmVwb3J0LmpzL3NyYy9yZW5kZXJlci90YWJsZS90YWJsZUhlYWRlclJlbmRlcmVyLmpzIiwiL1VzZXJzL3JpYWQuYmVuZ3VlbGxhL1NpdGVzL3BlcnNvL2Jpam9lL3JlcG9ydC5qcy9zcmMvcmVuZGVyZXIvdGFibGUvdGFibGVSZW5kZXJlci5qcyIsIi9Vc2Vycy9yaWFkLmJlbmd1ZWxsYS9TaXRlcy9wZXJzby9iaWpvZS9yZXBvcnQuanMvc3JjL3Jlc3VsdC9ncmFwaC9ncmFwaC5qcyIsIi9Vc2Vycy9yaWFkLmJlbmd1ZWxsYS9TaXRlcy9wZXJzby9iaWpvZS9yZXBvcnQuanMvc3JjL3Jlc3VsdC9ncmFwaC9zZWdtZW50R3JhcGguanMiLCIvVXNlcnMvcmlhZC5iZW5ndWVsbGEvU2l0ZXMvcGVyc28vYmlqb2UvcmVwb3J0LmpzL3NyYy9yZXN1bHQvdGFibGUvdGFibGUuanMiLCIvVXNlcnMvcmlhZC5iZW5ndWVsbGEvU2l0ZXMvcGVyc28vYmlqb2UvcmVwb3J0LmpzL3NyYy9yZXN1bHQvdGFibGUvdGFibGVDZWxsLmpzIiwiL1VzZXJzL3JpYWQuYmVuZ3VlbGxhL1NpdGVzL3BlcnNvL2Jpam9lL3JlcG9ydC5qcy9zcmMvcmVzdWx0L3RhYmxlL3RhYmxlUm93LmpzIiwiL1VzZXJzL3JpYWQuYmVuZ3VlbGxhL1NpdGVzL3BlcnNvL2Jpam9lL3JlcG9ydC5qcy9zcmMvdXRpbHMvY29sb3JzLmpzIiwiL1VzZXJzL3JpYWQuYmVuZ3VlbGxhL1NpdGVzL3BlcnNvL2Jpam9lL3JlcG9ydC5qcy9zcmMvdXRpbHMvbWFwcy5qcyIsIi9Vc2Vycy9yaWFkLmJlbmd1ZWxsYS9TaXRlcy9wZXJzby9iaWpvZS9yZXBvcnQuanMvdmVuZG9yL2xvYWRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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QUMsaUJBQWdCLENBQUMsQ0FBQztBQUM1QyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcblxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG5wcm9jZXNzLm5leHRUaWNrID0gKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY2FuU2V0SW1tZWRpYXRlID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAmJiB3aW5kb3cuc2V0SW1tZWRpYXRlO1xuICAgIHZhciBjYW5NdXRhdGlvbk9ic2VydmVyID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAmJiB3aW5kb3cuTXV0YXRpb25PYnNlcnZlcjtcbiAgICB2YXIgY2FuUG9zdCA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnBvc3RNZXNzYWdlICYmIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyXG4gICAgO1xuXG4gICAgaWYgKGNhblNldEltbWVkaWF0ZSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGYpIHsgcmV0dXJuIHdpbmRvdy5zZXRJbW1lZGlhdGUoZikgfTtcbiAgICB9XG5cbiAgICB2YXIgcXVldWUgPSBbXTtcblxuICAgIGlmIChjYW5NdXRhdGlvbk9ic2VydmVyKSB7XG4gICAgICAgIHZhciBoaWRkZW5EaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICB2YXIgb2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgcXVldWVMaXN0ID0gcXVldWUuc2xpY2UoKTtcbiAgICAgICAgICAgIHF1ZXVlLmxlbmd0aCA9IDA7XG4gICAgICAgICAgICBxdWV1ZUxpc3QuZm9yRWFjaChmdW5jdGlvbiAoZm4pIHtcbiAgICAgICAgICAgICAgICBmbigpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIG9ic2VydmVyLm9ic2VydmUoaGlkZGVuRGl2LCB7IGF0dHJpYnV0ZXM6IHRydWUgfSk7XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgICAgICBpZiAoIXF1ZXVlLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGhpZGRlbkRpdi5zZXRBdHRyaWJ1dGUoJ3llcycsICdubycpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcXVldWUucHVzaChmbik7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgaWYgKGNhblBvc3QpIHtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBmdW5jdGlvbiAoZXYpIHtcbiAgICAgICAgICAgIHZhciBzb3VyY2UgPSBldi5zb3VyY2U7XG4gICAgICAgICAgICBpZiAoKHNvdXJjZSA9PT0gd2luZG93IHx8IHNvdXJjZSA9PT0gbnVsbCkgJiYgZXYuZGF0YSA9PT0gJ3Byb2Nlc3MtdGljaycpIHtcbiAgICAgICAgICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICBpZiAocXVldWUubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZm4gPSBxdWV1ZS5zaGlmdCgpO1xuICAgICAgICAgICAgICAgICAgICBmbigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgdHJ1ZSk7XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgICAgICBxdWV1ZS5wdXNoKGZuKTtcbiAgICAgICAgICAgIHdpbmRvdy5wb3N0TWVzc2FnZSgncHJvY2Vzcy10aWNrJywgJyonKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gbmV4dFRpY2soZm4pIHtcbiAgICAgICAgc2V0VGltZW91dChmbiwgMCk7XG4gICAgfTtcbn0pKCk7XG5cbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxuLy8gVE9ETyhzaHR5bG1hbilcbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCl7XG4oZnVuY3Rpb24oZ2xvYmFsKSB7XG4gICd1c2Ugc3RyaWN0JztcbiAgaWYgKGdsb2JhbC4kdHJhY2V1clJ1bnRpbWUpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdmFyICRPYmplY3QgPSBPYmplY3Q7XG4gIHZhciAkVHlwZUVycm9yID0gVHlwZUVycm9yO1xuICB2YXIgJGNyZWF0ZSA9ICRPYmplY3QuY3JlYXRlO1xuICB2YXIgJGRlZmluZVByb3BlcnRpZXMgPSAkT2JqZWN0LmRlZmluZVByb3BlcnRpZXM7XG4gIHZhciAkZGVmaW5lUHJvcGVydHkgPSAkT2JqZWN0LmRlZmluZVByb3BlcnR5O1xuICB2YXIgJGZyZWV6ZSA9ICRPYmplY3QuZnJlZXplO1xuICB2YXIgJGdldE93blByb3BlcnR5RGVzY3JpcHRvciA9ICRPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yO1xuICB2YXIgJGdldE93blByb3BlcnR5TmFtZXMgPSAkT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXM7XG4gIHZhciAka2V5cyA9ICRPYmplY3Qua2V5cztcbiAgdmFyICRoYXNPd25Qcm9wZXJ0eSA9ICRPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xuICB2YXIgJHRvU3RyaW5nID0gJE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG4gIHZhciAkcHJldmVudEV4dGVuc2lvbnMgPSBPYmplY3QucHJldmVudEV4dGVuc2lvbnM7XG4gIHZhciAkc2VhbCA9IE9iamVjdC5zZWFsO1xuICB2YXIgJGlzRXh0ZW5zaWJsZSA9IE9iamVjdC5pc0V4dGVuc2libGU7XG4gIGZ1bmN0aW9uIG5vbkVudW0odmFsdWUpIHtcbiAgICByZXR1cm4ge1xuICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICB3cml0YWJsZTogdHJ1ZVxuICAgIH07XG4gIH1cbiAgdmFyIHR5cGVzID0ge1xuICAgIHZvaWQ6IGZ1bmN0aW9uIHZvaWRUeXBlKCkge30sXG4gICAgYW55OiBmdW5jdGlvbiBhbnkoKSB7fSxcbiAgICBzdHJpbmc6IGZ1bmN0aW9uIHN0cmluZygpIHt9LFxuICAgIG51bWJlcjogZnVuY3Rpb24gbnVtYmVyKCkge30sXG4gICAgYm9vbGVhbjogZnVuY3Rpb24gYm9vbGVhbigpIHt9XG4gIH07XG4gIHZhciBtZXRob2QgPSBub25FbnVtO1xuICB2YXIgY291bnRlciA9IDA7XG4gIGZ1bmN0aW9uIG5ld1VuaXF1ZVN0cmluZygpIHtcbiAgICByZXR1cm4gJ19fJCcgKyBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxZTkpICsgJyQnICsgKytjb3VudGVyICsgJyRfXyc7XG4gIH1cbiAgdmFyIHN5bWJvbEludGVybmFsUHJvcGVydHkgPSBuZXdVbmlxdWVTdHJpbmcoKTtcbiAgdmFyIHN5bWJvbERlc2NyaXB0aW9uUHJvcGVydHkgPSBuZXdVbmlxdWVTdHJpbmcoKTtcbiAgdmFyIHN5bWJvbERhdGFQcm9wZXJ0eSA9IG5ld1VuaXF1ZVN0cmluZygpO1xuICB2YXIgc3ltYm9sVmFsdWVzID0gJGNyZWF0ZShudWxsKTtcbiAgdmFyIHByaXZhdGVOYW1lcyA9ICRjcmVhdGUobnVsbCk7XG4gIGZ1bmN0aW9uIGlzUHJpdmF0ZU5hbWUocykge1xuICAgIHJldHVybiBwcml2YXRlTmFtZXNbc107XG4gIH1cbiAgZnVuY3Rpb24gY3JlYXRlUHJpdmF0ZU5hbWUoKSB7XG4gICAgdmFyIHMgPSBuZXdVbmlxdWVTdHJpbmcoKTtcbiAgICBwcml2YXRlTmFtZXNbc10gPSB0cnVlO1xuICAgIHJldHVybiBzO1xuICB9XG4gIGZ1bmN0aW9uIGlzU2hpbVN5bWJvbChzeW1ib2wpIHtcbiAgICByZXR1cm4gdHlwZW9mIHN5bWJvbCA9PT0gJ29iamVjdCcgJiYgc3ltYm9sIGluc3RhbmNlb2YgU3ltYm9sVmFsdWU7XG4gIH1cbiAgZnVuY3Rpb24gdHlwZU9mKHYpIHtcbiAgICBpZiAoaXNTaGltU3ltYm9sKHYpKVxuICAgICAgcmV0dXJuICdzeW1ib2wnO1xuICAgIHJldHVybiB0eXBlb2YgdjtcbiAgfVxuICBmdW5jdGlvbiBTeW1ib2woZGVzY3JpcHRpb24pIHtcbiAgICB2YXIgdmFsdWUgPSBuZXcgU3ltYm9sVmFsdWUoZGVzY3JpcHRpb24pO1xuICAgIGlmICghKHRoaXMgaW5zdGFuY2VvZiBTeW1ib2wpKVxuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1N5bWJvbCBjYW5ub3QgYmUgbmV3XFwnZWQnKTtcbiAgfVxuICAkZGVmaW5lUHJvcGVydHkoU3ltYm9sLnByb3RvdHlwZSwgJ2NvbnN0cnVjdG9yJywgbm9uRW51bShTeW1ib2wpKTtcbiAgJGRlZmluZVByb3BlcnR5KFN5bWJvbC5wcm90b3R5cGUsICd0b1N0cmluZycsIG1ldGhvZChmdW5jdGlvbigpIHtcbiAgICB2YXIgc3ltYm9sVmFsdWUgPSB0aGlzW3N5bWJvbERhdGFQcm9wZXJ0eV07XG4gICAgaWYgKCFnZXRPcHRpb24oJ3N5bWJvbHMnKSlcbiAgICAgIHJldHVybiBzeW1ib2xWYWx1ZVtzeW1ib2xJbnRlcm5hbFByb3BlcnR5XTtcbiAgICBpZiAoIXN5bWJvbFZhbHVlKVxuICAgICAgdGhyb3cgVHlwZUVycm9yKCdDb252ZXJzaW9uIGZyb20gc3ltYm9sIHRvIHN0cmluZycpO1xuICAgIHZhciBkZXNjID0gc3ltYm9sVmFsdWVbc3ltYm9sRGVzY3JpcHRpb25Qcm9wZXJ0eV07XG4gICAgaWYgKGRlc2MgPT09IHVuZGVmaW5lZClcbiAgICAgIGRlc2MgPSAnJztcbiAgICByZXR1cm4gJ1N5bWJvbCgnICsgZGVzYyArICcpJztcbiAgfSkpO1xuICAkZGVmaW5lUHJvcGVydHkoU3ltYm9sLnByb3RvdHlwZSwgJ3ZhbHVlT2YnLCBtZXRob2QoZnVuY3Rpb24oKSB7XG4gICAgdmFyIHN5bWJvbFZhbHVlID0gdGhpc1tzeW1ib2xEYXRhUHJvcGVydHldO1xuICAgIGlmICghc3ltYm9sVmFsdWUpXG4gICAgICB0aHJvdyBUeXBlRXJyb3IoJ0NvbnZlcnNpb24gZnJvbSBzeW1ib2wgdG8gc3RyaW5nJyk7XG4gICAgaWYgKCFnZXRPcHRpb24oJ3N5bWJvbHMnKSlcbiAgICAgIHJldHVybiBzeW1ib2xWYWx1ZVtzeW1ib2xJbnRlcm5hbFByb3BlcnR5XTtcbiAgICByZXR1cm4gc3ltYm9sVmFsdWU7XG4gIH0pKTtcbiAgZnVuY3Rpb24gU3ltYm9sVmFsdWUoZGVzY3JpcHRpb24pIHtcbiAgICB2YXIga2V5ID0gbmV3VW5pcXVlU3RyaW5nKCk7XG4gICAgJGRlZmluZVByb3BlcnR5KHRoaXMsIHN5bWJvbERhdGFQcm9wZXJ0eSwge3ZhbHVlOiB0aGlzfSk7XG4gICAgJGRlZmluZVByb3BlcnR5KHRoaXMsIHN5bWJvbEludGVybmFsUHJvcGVydHksIHt2YWx1ZToga2V5fSk7XG4gICAgJGRlZmluZVByb3BlcnR5KHRoaXMsIHN5bWJvbERlc2NyaXB0aW9uUHJvcGVydHksIHt2YWx1ZTogZGVzY3JpcHRpb259KTtcbiAgICBmcmVlemUodGhpcyk7XG4gICAgc3ltYm9sVmFsdWVzW2tleV0gPSB0aGlzO1xuICB9XG4gICRkZWZpbmVQcm9wZXJ0eShTeW1ib2xWYWx1ZS5wcm90b3R5cGUsICdjb25zdHJ1Y3RvcicsIG5vbkVudW0oU3ltYm9sKSk7XG4gICRkZWZpbmVQcm9wZXJ0eShTeW1ib2xWYWx1ZS5wcm90b3R5cGUsICd0b1N0cmluZycsIHtcbiAgICB2YWx1ZTogU3ltYm9sLnByb3RvdHlwZS50b1N0cmluZyxcbiAgICBlbnVtZXJhYmxlOiBmYWxzZVxuICB9KTtcbiAgJGRlZmluZVByb3BlcnR5KFN5bWJvbFZhbHVlLnByb3RvdHlwZSwgJ3ZhbHVlT2YnLCB7XG4gICAgdmFsdWU6IFN5bWJvbC5wcm90b3R5cGUudmFsdWVPZixcbiAgICBlbnVtZXJhYmxlOiBmYWxzZVxuICB9KTtcbiAgdmFyIGhhc2hQcm9wZXJ0eSA9IGNyZWF0ZVByaXZhdGVOYW1lKCk7XG4gIHZhciBoYXNoUHJvcGVydHlEZXNjcmlwdG9yID0ge3ZhbHVlOiB1bmRlZmluZWR9O1xuICB2YXIgaGFzaE9iamVjdFByb3BlcnRpZXMgPSB7XG4gICAgaGFzaDoge3ZhbHVlOiB1bmRlZmluZWR9LFxuICAgIHNlbGY6IHt2YWx1ZTogdW5kZWZpbmVkfVxuICB9O1xuICB2YXIgaGFzaENvdW50ZXIgPSAwO1xuICBmdW5jdGlvbiBnZXRPd25IYXNoT2JqZWN0KG9iamVjdCkge1xuICAgIHZhciBoYXNoT2JqZWN0ID0gb2JqZWN0W2hhc2hQcm9wZXJ0eV07XG4gICAgaWYgKGhhc2hPYmplY3QgJiYgaGFzaE9iamVjdC5zZWxmID09PSBvYmplY3QpXG4gICAgICByZXR1cm4gaGFzaE9iamVjdDtcbiAgICBpZiAoJGlzRXh0ZW5zaWJsZShvYmplY3QpKSB7XG4gICAgICBoYXNoT2JqZWN0UHJvcGVydGllcy5oYXNoLnZhbHVlID0gaGFzaENvdW50ZXIrKztcbiAgICAgIGhhc2hPYmplY3RQcm9wZXJ0aWVzLnNlbGYudmFsdWUgPSBvYmplY3Q7XG4gICAgICBoYXNoUHJvcGVydHlEZXNjcmlwdG9yLnZhbHVlID0gJGNyZWF0ZShudWxsLCBoYXNoT2JqZWN0UHJvcGVydGllcyk7XG4gICAgICAkZGVmaW5lUHJvcGVydHkob2JqZWN0LCBoYXNoUHJvcGVydHksIGhhc2hQcm9wZXJ0eURlc2NyaXB0b3IpO1xuICAgICAgcmV0dXJuIGhhc2hQcm9wZXJ0eURlc2NyaXB0b3IudmFsdWU7XG4gICAgfVxuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cbiAgZnVuY3Rpb24gZnJlZXplKG9iamVjdCkge1xuICAgIGdldE93bkhhc2hPYmplY3Qob2JqZWN0KTtcbiAgICByZXR1cm4gJGZyZWV6ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9XG4gIGZ1bmN0aW9uIHByZXZlbnRFeHRlbnNpb25zKG9iamVjdCkge1xuICAgIGdldE93bkhhc2hPYmplY3Qob2JqZWN0KTtcbiAgICByZXR1cm4gJHByZXZlbnRFeHRlbnNpb25zLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH1cbiAgZnVuY3Rpb24gc2VhbChvYmplY3QpIHtcbiAgICBnZXRPd25IYXNoT2JqZWN0KG9iamVjdCk7XG4gICAgcmV0dXJuICRzZWFsLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH1cbiAgZnJlZXplKFN5bWJvbFZhbHVlLnByb3RvdHlwZSk7XG4gIGZ1bmN0aW9uIGlzU3ltYm9sU3RyaW5nKHMpIHtcbiAgICByZXR1cm4gc3ltYm9sVmFsdWVzW3NdIHx8IHByaXZhdGVOYW1lc1tzXTtcbiAgfVxuICBmdW5jdGlvbiB0b1Byb3BlcnR5KG5hbWUpIHtcbiAgICBpZiAoaXNTaGltU3ltYm9sKG5hbWUpKVxuICAgICAgcmV0dXJuIG5hbWVbc3ltYm9sSW50ZXJuYWxQcm9wZXJ0eV07XG4gICAgcmV0dXJuIG5hbWU7XG4gIH1cbiAgZnVuY3Rpb24gcmVtb3ZlU3ltYm9sS2V5cyhhcnJheSkge1xuICAgIHZhciBydiA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyYXkubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmICghaXNTeW1ib2xTdHJpbmcoYXJyYXlbaV0pKSB7XG4gICAgICAgIHJ2LnB1c2goYXJyYXlbaV0pO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcnY7XG4gIH1cbiAgZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlOYW1lcyhvYmplY3QpIHtcbiAgICByZXR1cm4gcmVtb3ZlU3ltYm9sS2V5cygkZ2V0T3duUHJvcGVydHlOYW1lcyhvYmplY3QpKTtcbiAgfVxuICBmdW5jdGlvbiBrZXlzKG9iamVjdCkge1xuICAgIHJldHVybiByZW1vdmVTeW1ib2xLZXlzKCRrZXlzKG9iamVjdCkpO1xuICB9XG4gIGZ1bmN0aW9uIGdldE93blByb3BlcnR5U3ltYm9scyhvYmplY3QpIHtcbiAgICB2YXIgcnYgPSBbXTtcbiAgICB2YXIgbmFtZXMgPSAkZ2V0T3duUHJvcGVydHlOYW1lcyhvYmplY3QpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbmFtZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBzeW1ib2wgPSBzeW1ib2xWYWx1ZXNbbmFtZXNbaV1dO1xuICAgICAgaWYgKHN5bWJvbCkge1xuICAgICAgICBydi5wdXNoKHN5bWJvbCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBydjtcbiAgfVxuICBmdW5jdGlvbiBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBuYW1lKSB7XG4gICAgcmV0dXJuICRnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCB0b1Byb3BlcnR5KG5hbWUpKTtcbiAgfVxuICBmdW5jdGlvbiBoYXNPd25Qcm9wZXJ0eShuYW1lKSB7XG4gICAgcmV0dXJuICRoYXNPd25Qcm9wZXJ0eS5jYWxsKHRoaXMsIHRvUHJvcGVydHkobmFtZSkpO1xuICB9XG4gIGZ1bmN0aW9uIGdldE9wdGlvbihuYW1lKSB7XG4gICAgcmV0dXJuIGdsb2JhbC50cmFjZXVyICYmIGdsb2JhbC50cmFjZXVyLm9wdGlvbnNbbmFtZV07XG4gIH1cbiAgZnVuY3Rpb24gZGVmaW5lUHJvcGVydHkob2JqZWN0LCBuYW1lLCBkZXNjcmlwdG9yKSB7XG4gICAgaWYgKGlzU2hpbVN5bWJvbChuYW1lKSkge1xuICAgICAgbmFtZSA9IG5hbWVbc3ltYm9sSW50ZXJuYWxQcm9wZXJ0eV07XG4gICAgfVxuICAgICRkZWZpbmVQcm9wZXJ0eShvYmplY3QsIG5hbWUsIGRlc2NyaXB0b3IpO1xuICAgIHJldHVybiBvYmplY3Q7XG4gIH1cbiAgZnVuY3Rpb24gcG9seWZpbGxPYmplY3QoT2JqZWN0KSB7XG4gICAgJGRlZmluZVByb3BlcnR5KE9iamVjdCwgJ2RlZmluZVByb3BlcnR5Jywge3ZhbHVlOiBkZWZpbmVQcm9wZXJ0eX0pO1xuICAgICRkZWZpbmVQcm9wZXJ0eShPYmplY3QsICdnZXRPd25Qcm9wZXJ0eU5hbWVzJywge3ZhbHVlOiBnZXRPd25Qcm9wZXJ0eU5hbWVzfSk7XG4gICAgJGRlZmluZVByb3BlcnR5KE9iamVjdCwgJ2dldE93blByb3BlcnR5RGVzY3JpcHRvcicsIHt2YWx1ZTogZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yfSk7XG4gICAgJGRlZmluZVByb3BlcnR5KE9iamVjdC5wcm90b3R5cGUsICdoYXNPd25Qcm9wZXJ0eScsIHt2YWx1ZTogaGFzT3duUHJvcGVydHl9KTtcbiAgICAkZGVmaW5lUHJvcGVydHkoT2JqZWN0LCAnZnJlZXplJywge3ZhbHVlOiBmcmVlemV9KTtcbiAgICAkZGVmaW5lUHJvcGVydHkoT2JqZWN0LCAncHJldmVudEV4dGVuc2lvbnMnLCB7dmFsdWU6IHByZXZlbnRFeHRlbnNpb25zfSk7XG4gICAgJGRlZmluZVByb3BlcnR5KE9iamVjdCwgJ3NlYWwnLCB7dmFsdWU6IHNlYWx9KTtcbiAgICAkZGVmaW5lUHJvcGVydHkoT2JqZWN0LCAna2V5cycsIHt2YWx1ZToga2V5c30pO1xuICB9XG4gIGZ1bmN0aW9uIGV4cG9ydFN0YXIob2JqZWN0KSB7XG4gICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBuYW1lcyA9ICRnZXRPd25Qcm9wZXJ0eU5hbWVzKGFyZ3VtZW50c1tpXSk7XG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IG5hbWVzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgIHZhciBuYW1lID0gbmFtZXNbal07XG4gICAgICAgIGlmIChpc1N5bWJvbFN0cmluZyhuYW1lKSlcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgKGZ1bmN0aW9uKG1vZCwgbmFtZSkge1xuICAgICAgICAgICRkZWZpbmVQcm9wZXJ0eShvYmplY3QsIG5hbWUsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHJldHVybiBtb2RbbmFtZV07XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZVxuICAgICAgICAgIH0pO1xuICAgICAgICB9KShhcmd1bWVudHNbaV0sIG5hbWVzW2pdKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG9iamVjdDtcbiAgfVxuICBmdW5jdGlvbiBpc09iamVjdCh4KSB7XG4gICAgcmV0dXJuIHggIT0gbnVsbCAmJiAodHlwZW9mIHggPT09ICdvYmplY3QnIHx8IHR5cGVvZiB4ID09PSAnZnVuY3Rpb24nKTtcbiAgfVxuICBmdW5jdGlvbiB0b09iamVjdCh4KSB7XG4gICAgaWYgKHggPT0gbnVsbClcbiAgICAgIHRocm93ICRUeXBlRXJyb3IoKTtcbiAgICByZXR1cm4gJE9iamVjdCh4KTtcbiAgfVxuICBmdW5jdGlvbiBjaGVja09iamVjdENvZXJjaWJsZShhcmd1bWVudCkge1xuICAgIGlmIChhcmd1bWVudCA9PSBudWxsKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdWYWx1ZSBjYW5ub3QgYmUgY29udmVydGVkIHRvIGFuIE9iamVjdCcpO1xuICAgIH1cbiAgICByZXR1cm4gYXJndW1lbnQ7XG4gIH1cbiAgZnVuY3Rpb24gcG9seWZpbGxTeW1ib2woZ2xvYmFsLCBTeW1ib2wpIHtcbiAgICBpZiAoIWdsb2JhbC5TeW1ib2wpIHtcbiAgICAgIGdsb2JhbC5TeW1ib2wgPSBTeW1ib2w7XG4gICAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzID0gZ2V0T3duUHJvcGVydHlTeW1ib2xzO1xuICAgIH1cbiAgICBpZiAoIWdsb2JhbC5TeW1ib2wuaXRlcmF0b3IpIHtcbiAgICAgIGdsb2JhbC5TeW1ib2wuaXRlcmF0b3IgPSBTeW1ib2woJ1N5bWJvbC5pdGVyYXRvcicpO1xuICAgIH1cbiAgfVxuICBmdW5jdGlvbiBzZXR1cEdsb2JhbHMoZ2xvYmFsKSB7XG4gICAgcG9seWZpbGxTeW1ib2woZ2xvYmFsLCBTeW1ib2wpO1xuICAgIGdsb2JhbC5SZWZsZWN0ID0gZ2xvYmFsLlJlZmxlY3QgfHwge307XG4gICAgZ2xvYmFsLlJlZmxlY3QuZ2xvYmFsID0gZ2xvYmFsLlJlZmxlY3QuZ2xvYmFsIHx8IGdsb2JhbDtcbiAgICBwb2x5ZmlsbE9iamVjdChnbG9iYWwuT2JqZWN0KTtcbiAgfVxuICBzZXR1cEdsb2JhbHMoZ2xvYmFsKTtcbiAgZ2xvYmFsLiR0cmFjZXVyUnVudGltZSA9IHtcbiAgICBjaGVja09iamVjdENvZXJjaWJsZTogY2hlY2tPYmplY3RDb2VyY2libGUsXG4gICAgY3JlYXRlUHJpdmF0ZU5hbWU6IGNyZWF0ZVByaXZhdGVOYW1lLFxuICAgIGRlZmluZVByb3BlcnRpZXM6ICRkZWZpbmVQcm9wZXJ0aWVzLFxuICAgIGRlZmluZVByb3BlcnR5OiAkZGVmaW5lUHJvcGVydHksXG4gICAgZXhwb3J0U3RhcjogZXhwb3J0U3RhcixcbiAgICBnZXRPd25IYXNoT2JqZWN0OiBnZXRPd25IYXNoT2JqZWN0LFxuICAgIGdldE93blByb3BlcnR5RGVzY3JpcHRvcjogJGdldE93blByb3BlcnR5RGVzY3JpcHRvcixcbiAgICBnZXRPd25Qcm9wZXJ0eU5hbWVzOiAkZ2V0T3duUHJvcGVydHlOYW1lcyxcbiAgICBpc09iamVjdDogaXNPYmplY3QsXG4gICAgaXNQcml2YXRlTmFtZTogaXNQcml2YXRlTmFtZSxcbiAgICBpc1N5bWJvbFN0cmluZzogaXNTeW1ib2xTdHJpbmcsXG4gICAga2V5czogJGtleXMsXG4gICAgc2V0dXBHbG9iYWxzOiBzZXR1cEdsb2JhbHMsXG4gICAgdG9PYmplY3Q6IHRvT2JqZWN0LFxuICAgIHRvUHJvcGVydHk6IHRvUHJvcGVydHksXG4gICAgdHlwZTogdHlwZXMsXG4gICAgdHlwZW9mOiB0eXBlT2ZcbiAgfTtcbn0pKHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnID8gZ2xvYmFsIDogdGhpcyk7XG4oZnVuY3Rpb24oKSB7XG4gICd1c2Ugc3RyaWN0JztcbiAgZnVuY3Rpb24gc3ByZWFkKCkge1xuICAgIHZhciBydiA9IFtdLFxuICAgICAgICBqID0gMCxcbiAgICAgICAgaXRlclJlc3VsdDtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIHZhbHVlVG9TcHJlYWQgPSAkdHJhY2V1clJ1bnRpbWUuY2hlY2tPYmplY3RDb2VyY2libGUoYXJndW1lbnRzW2ldKTtcbiAgICAgIGlmICh0eXBlb2YgdmFsdWVUb1NwcmVhZFskdHJhY2V1clJ1bnRpbWUudG9Qcm9wZXJ0eShTeW1ib2wuaXRlcmF0b3IpXSAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3Qgc3ByZWFkIG5vbi1pdGVyYWJsZSBvYmplY3QuJyk7XG4gICAgICB9XG4gICAgICB2YXIgaXRlciA9IHZhbHVlVG9TcHJlYWRbJHRyYWNldXJSdW50aW1lLnRvUHJvcGVydHkoU3ltYm9sLml0ZXJhdG9yKV0oKTtcbiAgICAgIHdoaWxlICghKGl0ZXJSZXN1bHQgPSBpdGVyLm5leHQoKSkuZG9uZSkge1xuICAgICAgICBydltqKytdID0gaXRlclJlc3VsdC52YWx1ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJ2O1xuICB9XG4gICR0cmFjZXVyUnVudGltZS5zcHJlYWQgPSBzcHJlYWQ7XG59KSgpO1xuKGZ1bmN0aW9uKCkge1xuICAndXNlIHN0cmljdCc7XG4gIHZhciAkT2JqZWN0ID0gT2JqZWN0O1xuICB2YXIgJFR5cGVFcnJvciA9IFR5cGVFcnJvcjtcbiAgdmFyICRjcmVhdGUgPSAkT2JqZWN0LmNyZWF0ZTtcbiAgdmFyICRkZWZpbmVQcm9wZXJ0aWVzID0gJHRyYWNldXJSdW50aW1lLmRlZmluZVByb3BlcnRpZXM7XG4gIHZhciAkZGVmaW5lUHJvcGVydHkgPSAkdHJhY2V1clJ1bnRpbWUuZGVmaW5lUHJvcGVydHk7XG4gIHZhciAkZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yID0gJHRyYWNldXJSdW50aW1lLmdldE93blByb3BlcnR5RGVzY3JpcHRvcjtcbiAgdmFyICRnZXRPd25Qcm9wZXJ0eU5hbWVzID0gJHRyYWNldXJSdW50aW1lLmdldE93blByb3BlcnR5TmFtZXM7XG4gIHZhciAkZ2V0UHJvdG90eXBlT2YgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Y7XG4gIHZhciAkX18wID0gT2JqZWN0LFxuICAgICAgZ2V0T3duUHJvcGVydHlOYW1lcyA9ICRfXzAuZ2V0T3duUHJvcGVydHlOYW1lcyxcbiAgICAgIGdldE93blByb3BlcnR5U3ltYm9scyA9ICRfXzAuZ2V0T3duUHJvcGVydHlTeW1ib2xzO1xuICBmdW5jdGlvbiBzdXBlckRlc2NyaXB0b3IoaG9tZU9iamVjdCwgbmFtZSkge1xuICAgIHZhciBwcm90byA9ICRnZXRQcm90b3R5cGVPZihob21lT2JqZWN0KTtcbiAgICBkbyB7XG4gICAgICB2YXIgcmVzdWx0ID0gJGdldE93blByb3BlcnR5RGVzY3JpcHRvcihwcm90bywgbmFtZSk7XG4gICAgICBpZiAocmVzdWx0KVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgcHJvdG8gPSAkZ2V0UHJvdG90eXBlT2YocHJvdG8pO1xuICAgIH0gd2hpbGUgKHByb3RvKTtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG4gIGZ1bmN0aW9uIHN1cGVyQ2FsbChzZWxmLCBob21lT2JqZWN0LCBuYW1lLCBhcmdzKSB7XG4gICAgcmV0dXJuIHN1cGVyR2V0KHNlbGYsIGhvbWVPYmplY3QsIG5hbWUpLmFwcGx5KHNlbGYsIGFyZ3MpO1xuICB9XG4gIGZ1bmN0aW9uIHN1cGVyR2V0KHNlbGYsIGhvbWVPYmplY3QsIG5hbWUpIHtcbiAgICB2YXIgZGVzY3JpcHRvciA9IHN1cGVyRGVzY3JpcHRvcihob21lT2JqZWN0LCBuYW1lKTtcbiAgICBpZiAoZGVzY3JpcHRvcikge1xuICAgICAgaWYgKCFkZXNjcmlwdG9yLmdldClcbiAgICAgICAgcmV0dXJuIGRlc2NyaXB0b3IudmFsdWU7XG4gICAgICByZXR1cm4gZGVzY3JpcHRvci5nZXQuY2FsbChzZWxmKTtcbiAgICB9XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuICBmdW5jdGlvbiBzdXBlclNldChzZWxmLCBob21lT2JqZWN0LCBuYW1lLCB2YWx1ZSkge1xuICAgIHZhciBkZXNjcmlwdG9yID0gc3VwZXJEZXNjcmlwdG9yKGhvbWVPYmplY3QsIG5hbWUpO1xuICAgIGlmIChkZXNjcmlwdG9yICYmIGRlc2NyaXB0b3Iuc2V0KSB7XG4gICAgICBkZXNjcmlwdG9yLnNldC5jYWxsKHNlbGYsIHZhbHVlKTtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG4gICAgdGhyb3cgJFR5cGVFcnJvcigoXCJzdXBlciBoYXMgbm8gc2V0dGVyICdcIiArIG5hbWUgKyBcIicuXCIpKTtcbiAgfVxuICBmdW5jdGlvbiBnZXREZXNjcmlwdG9ycyhvYmplY3QpIHtcbiAgICB2YXIgZGVzY3JpcHRvcnMgPSB7fTtcbiAgICB2YXIgbmFtZXMgPSBnZXRPd25Qcm9wZXJ0eU5hbWVzKG9iamVjdCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBuYW1lcy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIG5hbWUgPSBuYW1lc1tpXTtcbiAgICAgIGRlc2NyaXB0b3JzW25hbWVdID0gJGdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsIG5hbWUpO1xuICAgIH1cbiAgICB2YXIgc3ltYm9scyA9IGdldE93blByb3BlcnR5U3ltYm9scyhvYmplY3QpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3ltYm9scy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIHN5bWJvbCA9IHN5bWJvbHNbaV07XG4gICAgICBkZXNjcmlwdG9yc1skdHJhY2V1clJ1bnRpbWUudG9Qcm9wZXJ0eShzeW1ib2wpXSA9ICRnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCAkdHJhY2V1clJ1bnRpbWUudG9Qcm9wZXJ0eShzeW1ib2wpKTtcbiAgICB9XG4gICAgcmV0dXJuIGRlc2NyaXB0b3JzO1xuICB9XG4gIGZ1bmN0aW9uIGNyZWF0ZUNsYXNzKGN0b3IsIG9iamVjdCwgc3RhdGljT2JqZWN0LCBzdXBlckNsYXNzKSB7XG4gICAgJGRlZmluZVByb3BlcnR5KG9iamVjdCwgJ2NvbnN0cnVjdG9yJywge1xuICAgICAgdmFsdWU6IGN0b3IsXG4gICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgfSk7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAzKSB7XG4gICAgICBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgPT09ICdmdW5jdGlvbicpXG4gICAgICAgIGN0b3IuX19wcm90b19fID0gc3VwZXJDbGFzcztcbiAgICAgIGN0b3IucHJvdG90eXBlID0gJGNyZWF0ZShnZXRQcm90b1BhcmVudChzdXBlckNsYXNzKSwgZ2V0RGVzY3JpcHRvcnMob2JqZWN0KSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGN0b3IucHJvdG90eXBlID0gb2JqZWN0O1xuICAgIH1cbiAgICAkZGVmaW5lUHJvcGVydHkoY3RvciwgJ3Byb3RvdHlwZScsIHtcbiAgICAgIGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gICAgICB3cml0YWJsZTogZmFsc2VcbiAgICB9KTtcbiAgICByZXR1cm4gJGRlZmluZVByb3BlcnRpZXMoY3RvciwgZ2V0RGVzY3JpcHRvcnMoc3RhdGljT2JqZWN0KSk7XG4gIH1cbiAgZnVuY3Rpb24gZ2V0UHJvdG9QYXJlbnQoc3VwZXJDbGFzcykge1xuICAgIGlmICh0eXBlb2Ygc3VwZXJDbGFzcyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdmFyIHByb3RvdHlwZSA9IHN1cGVyQ2xhc3MucHJvdG90eXBlO1xuICAgICAgaWYgKCRPYmplY3QocHJvdG90eXBlKSA9PT0gcHJvdG90eXBlIHx8IHByb3RvdHlwZSA9PT0gbnVsbClcbiAgICAgICAgcmV0dXJuIHN1cGVyQ2xhc3MucHJvdG90eXBlO1xuICAgICAgdGhyb3cgbmV3ICRUeXBlRXJyb3IoJ3N1cGVyIHByb3RvdHlwZSBtdXN0IGJlIGFuIE9iamVjdCBvciBudWxsJyk7XG4gICAgfVxuICAgIGlmIChzdXBlckNsYXNzID09PSBudWxsKVxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgdGhyb3cgbmV3ICRUeXBlRXJyb3IoKFwiU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCBcIiArIHR5cGVvZiBzdXBlckNsYXNzICsgXCIuXCIpKTtcbiAgfVxuICBmdW5jdGlvbiBkZWZhdWx0U3VwZXJDYWxsKHNlbGYsIGhvbWVPYmplY3QsIGFyZ3MpIHtcbiAgICBpZiAoJGdldFByb3RvdHlwZU9mKGhvbWVPYmplY3QpICE9PSBudWxsKVxuICAgICAgc3VwZXJDYWxsKHNlbGYsIGhvbWVPYmplY3QsICdjb25zdHJ1Y3RvcicsIGFyZ3MpO1xuICB9XG4gICR0cmFjZXVyUnVudGltZS5jcmVhdGVDbGFzcyA9IGNyZWF0ZUNsYXNzO1xuICAkdHJhY2V1clJ1bnRpbWUuZGVmYXVsdFN1cGVyQ2FsbCA9IGRlZmF1bHRTdXBlckNhbGw7XG4gICR0cmFjZXVyUnVudGltZS5zdXBlckNhbGwgPSBzdXBlckNhbGw7XG4gICR0cmFjZXVyUnVudGltZS5zdXBlckdldCA9IHN1cGVyR2V0O1xuICAkdHJhY2V1clJ1bnRpbWUuc3VwZXJTZXQgPSBzdXBlclNldDtcbn0pKCk7XG4oZnVuY3Rpb24oKSB7XG4gICd1c2Ugc3RyaWN0JztcbiAgdmFyIGNyZWF0ZVByaXZhdGVOYW1lID0gJHRyYWNldXJSdW50aW1lLmNyZWF0ZVByaXZhdGVOYW1lO1xuICB2YXIgJGRlZmluZVByb3BlcnRpZXMgPSAkdHJhY2V1clJ1bnRpbWUuZGVmaW5lUHJvcGVydGllcztcbiAgdmFyICRkZWZpbmVQcm9wZXJ0eSA9ICR0cmFjZXVyUnVudGltZS5kZWZpbmVQcm9wZXJ0eTtcbiAgdmFyICRjcmVhdGUgPSBPYmplY3QuY3JlYXRlO1xuICB2YXIgJFR5cGVFcnJvciA9IFR5cGVFcnJvcjtcbiAgZnVuY3Rpb24gbm9uRW51bSh2YWx1ZSkge1xuICAgIHJldHVybiB7XG4gICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgfTtcbiAgfVxuICB2YXIgU1RfTkVXQk9STiA9IDA7XG4gIHZhciBTVF9FWEVDVVRJTkcgPSAxO1xuICB2YXIgU1RfU1VTUEVOREVEID0gMjtcbiAgdmFyIFNUX0NMT1NFRCA9IDM7XG4gIHZhciBFTkRfU1RBVEUgPSAtMjtcbiAgdmFyIFJFVEhST1dfU1RBVEUgPSAtMztcbiAgZnVuY3Rpb24gZ2V0SW50ZXJuYWxFcnJvcihzdGF0ZSkge1xuICAgIHJldHVybiBuZXcgRXJyb3IoJ1RyYWNldXIgY29tcGlsZXIgYnVnOiBpbnZhbGlkIHN0YXRlIGluIHN0YXRlIG1hY2hpbmU6ICcgKyBzdGF0ZSk7XG4gIH1cbiAgZnVuY3Rpb24gR2VuZXJhdG9yQ29udGV4dCgpIHtcbiAgICB0aGlzLnN0YXRlID0gMDtcbiAgICB0aGlzLkdTdGF0ZSA9IFNUX05FV0JPUk47XG4gICAgdGhpcy5zdG9yZWRFeGNlcHRpb24gPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5maW5hbGx5RmFsbFRocm91Z2ggPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5zZW50XyA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLnJldHVyblZhbHVlID0gdW5kZWZpbmVkO1xuICAgIHRoaXMudHJ5U3RhY2tfID0gW107XG4gIH1cbiAgR2VuZXJhdG9yQ29udGV4dC5wcm90b3R5cGUgPSB7XG4gICAgcHVzaFRyeTogZnVuY3Rpb24oY2F0Y2hTdGF0ZSwgZmluYWxseVN0YXRlKSB7XG4gICAgICBpZiAoZmluYWxseVN0YXRlICE9PSBudWxsKSB7XG4gICAgICAgIHZhciBmaW5hbGx5RmFsbFRocm91Z2ggPSBudWxsO1xuICAgICAgICBmb3IgKHZhciBpID0gdGhpcy50cnlTdGFja18ubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICBpZiAodGhpcy50cnlTdGFja19baV0uY2F0Y2ggIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgZmluYWxseUZhbGxUaHJvdWdoID0gdGhpcy50cnlTdGFja19baV0uY2F0Y2g7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGZpbmFsbHlGYWxsVGhyb3VnaCA9PT0gbnVsbClcbiAgICAgICAgICBmaW5hbGx5RmFsbFRocm91Z2ggPSBSRVRIUk9XX1NUQVRFO1xuICAgICAgICB0aGlzLnRyeVN0YWNrXy5wdXNoKHtcbiAgICAgICAgICBmaW5hbGx5OiBmaW5hbGx5U3RhdGUsXG4gICAgICAgICAgZmluYWxseUZhbGxUaHJvdWdoOiBmaW5hbGx5RmFsbFRocm91Z2hcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBpZiAoY2F0Y2hTdGF0ZSAhPT0gbnVsbCkge1xuICAgICAgICB0aGlzLnRyeVN0YWNrXy5wdXNoKHtjYXRjaDogY2F0Y2hTdGF0ZX0pO1xuICAgICAgfVxuICAgIH0sXG4gICAgcG9wVHJ5OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMudHJ5U3RhY2tfLnBvcCgpO1xuICAgIH0sXG4gICAgZ2V0IHNlbnQoKSB7XG4gICAgICB0aGlzLm1heWJlVGhyb3coKTtcbiAgICAgIHJldHVybiB0aGlzLnNlbnRfO1xuICAgIH0sXG4gICAgc2V0IHNlbnQodikge1xuICAgICAgdGhpcy5zZW50XyA9IHY7XG4gICAgfSxcbiAgICBnZXQgc2VudElnbm9yZVRocm93KCkge1xuICAgICAgcmV0dXJuIHRoaXMuc2VudF87XG4gICAgfSxcbiAgICBtYXliZVRocm93OiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICh0aGlzLmFjdGlvbiA9PT0gJ3Rocm93Jykge1xuICAgICAgICB0aGlzLmFjdGlvbiA9ICduZXh0JztcbiAgICAgICAgdGhyb3cgdGhpcy5zZW50XztcbiAgICAgIH1cbiAgICB9LFxuICAgIGVuZDogZnVuY3Rpb24oKSB7XG4gICAgICBzd2l0Y2ggKHRoaXMuc3RhdGUpIHtcbiAgICAgICAgY2FzZSBFTkRfU1RBVEU6XG4gICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIGNhc2UgUkVUSFJPV19TVEFURTpcbiAgICAgICAgICB0aHJvdyB0aGlzLnN0b3JlZEV4Y2VwdGlvbjtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICB0aHJvdyBnZXRJbnRlcm5hbEVycm9yKHRoaXMuc3RhdGUpO1xuICAgICAgfVxuICAgIH0sXG4gICAgaGFuZGxlRXhjZXB0aW9uOiBmdW5jdGlvbihleCkge1xuICAgICAgdGhpcy5HU3RhdGUgPSBTVF9DTE9TRUQ7XG4gICAgICB0aGlzLnN0YXRlID0gRU5EX1NUQVRFO1xuICAgICAgdGhyb3cgZXg7XG4gICAgfVxuICB9O1xuICBmdW5jdGlvbiBuZXh0T3JUaHJvdyhjdHgsIG1vdmVOZXh0LCBhY3Rpb24sIHgpIHtcbiAgICBzd2l0Y2ggKGN0eC5HU3RhdGUpIHtcbiAgICAgIGNhc2UgU1RfRVhFQ1VUSU5HOlxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoKFwiXFxcIlwiICsgYWN0aW9uICsgXCJcXFwiIG9uIGV4ZWN1dGluZyBnZW5lcmF0b3JcIikpO1xuICAgICAgY2FzZSBTVF9DTE9TRUQ6XG4gICAgICAgIGlmIChhY3Rpb24gPT0gJ25leHQnKSB7XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHZhbHVlOiB1bmRlZmluZWQsXG4gICAgICAgICAgICBkb25lOiB0cnVlXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICB0aHJvdyB4O1xuICAgICAgY2FzZSBTVF9ORVdCT1JOOlxuICAgICAgICBpZiAoYWN0aW9uID09PSAndGhyb3cnKSB7XG4gICAgICAgICAgY3R4LkdTdGF0ZSA9IFNUX0NMT1NFRDtcbiAgICAgICAgICB0aHJvdyB4O1xuICAgICAgICB9XG4gICAgICAgIGlmICh4ICE9PSB1bmRlZmluZWQpXG4gICAgICAgICAgdGhyb3cgJFR5cGVFcnJvcignU2VudCB2YWx1ZSB0byBuZXdib3JuIGdlbmVyYXRvcicpO1xuICAgICAgY2FzZSBTVF9TVVNQRU5ERUQ6XG4gICAgICAgIGN0eC5HU3RhdGUgPSBTVF9FWEVDVVRJTkc7XG4gICAgICAgIGN0eC5hY3Rpb24gPSBhY3Rpb247XG4gICAgICAgIGN0eC5zZW50ID0geDtcbiAgICAgICAgdmFyIHZhbHVlID0gbW92ZU5leHQoY3R4KTtcbiAgICAgICAgdmFyIGRvbmUgPSB2YWx1ZSA9PT0gY3R4O1xuICAgICAgICBpZiAoZG9uZSlcbiAgICAgICAgICB2YWx1ZSA9IGN0eC5yZXR1cm5WYWx1ZTtcbiAgICAgICAgY3R4LkdTdGF0ZSA9IGRvbmUgPyBTVF9DTE9TRUQgOiBTVF9TVVNQRU5ERUQ7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgICAgIGRvbmU6IGRvbmVcbiAgICAgICAgfTtcbiAgICB9XG4gIH1cbiAgdmFyIGN0eE5hbWUgPSBjcmVhdGVQcml2YXRlTmFtZSgpO1xuICB2YXIgbW92ZU5leHROYW1lID0gY3JlYXRlUHJpdmF0ZU5hbWUoKTtcbiAgZnVuY3Rpb24gR2VuZXJhdG9yRnVuY3Rpb24oKSB7fVxuICBmdW5jdGlvbiBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZSgpIHt9XG4gIEdlbmVyYXRvckZ1bmN0aW9uLnByb3RvdHlwZSA9IEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlO1xuICAkZGVmaW5lUHJvcGVydHkoR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGUsICdjb25zdHJ1Y3RvcicsIG5vbkVudW0oR2VuZXJhdG9yRnVuY3Rpb24pKTtcbiAgR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGUucHJvdG90eXBlID0ge1xuICAgIGNvbnN0cnVjdG9yOiBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZSxcbiAgICBuZXh0OiBmdW5jdGlvbih2KSB7XG4gICAgICByZXR1cm4gbmV4dE9yVGhyb3codGhpc1tjdHhOYW1lXSwgdGhpc1ttb3ZlTmV4dE5hbWVdLCAnbmV4dCcsIHYpO1xuICAgIH0sXG4gICAgdGhyb3c6IGZ1bmN0aW9uKHYpIHtcbiAgICAgIHJldHVybiBuZXh0T3JUaHJvdyh0aGlzW2N0eE5hbWVdLCB0aGlzW21vdmVOZXh0TmFtZV0sICd0aHJvdycsIHYpO1xuICAgIH1cbiAgfTtcbiAgJGRlZmluZVByb3BlcnRpZXMoR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGUucHJvdG90eXBlLCB7XG4gICAgY29uc3RydWN0b3I6IHtlbnVtZXJhYmxlOiBmYWxzZX0sXG4gICAgbmV4dDoge2VudW1lcmFibGU6IGZhbHNlfSxcbiAgICB0aHJvdzoge2VudW1lcmFibGU6IGZhbHNlfVxuICB9KTtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlLnByb3RvdHlwZSwgU3ltYm9sLml0ZXJhdG9yLCBub25FbnVtKGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzO1xuICB9KSk7XG4gIGZ1bmN0aW9uIGNyZWF0ZUdlbmVyYXRvckluc3RhbmNlKGlubmVyRnVuY3Rpb24sIGZ1bmN0aW9uT2JqZWN0LCBzZWxmKSB7XG4gICAgdmFyIG1vdmVOZXh0ID0gZ2V0TW92ZU5leHQoaW5uZXJGdW5jdGlvbiwgc2VsZik7XG4gICAgdmFyIGN0eCA9IG5ldyBHZW5lcmF0b3JDb250ZXh0KCk7XG4gICAgdmFyIG9iamVjdCA9ICRjcmVhdGUoZnVuY3Rpb25PYmplY3QucHJvdG90eXBlKTtcbiAgICBvYmplY3RbY3R4TmFtZV0gPSBjdHg7XG4gICAgb2JqZWN0W21vdmVOZXh0TmFtZV0gPSBtb3ZlTmV4dDtcbiAgICByZXR1cm4gb2JqZWN0O1xuICB9XG4gIGZ1bmN0aW9uIGluaXRHZW5lcmF0b3JGdW5jdGlvbihmdW5jdGlvbk9iamVjdCkge1xuICAgIGZ1bmN0aW9uT2JqZWN0LnByb3RvdHlwZSA9ICRjcmVhdGUoR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGUucHJvdG90eXBlKTtcbiAgICBmdW5jdGlvbk9iamVjdC5fX3Byb3RvX18gPSBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZTtcbiAgICByZXR1cm4gZnVuY3Rpb25PYmplY3Q7XG4gIH1cbiAgZnVuY3Rpb24gQXN5bmNGdW5jdGlvbkNvbnRleHQoKSB7XG4gICAgR2VuZXJhdG9yQ29udGV4dC5jYWxsKHRoaXMpO1xuICAgIHRoaXMuZXJyID0gdW5kZWZpbmVkO1xuICAgIHZhciBjdHggPSB0aGlzO1xuICAgIGN0eC5yZXN1bHQgPSBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIGN0eC5yZXNvbHZlID0gcmVzb2x2ZTtcbiAgICAgIGN0eC5yZWplY3QgPSByZWplY3Q7XG4gICAgfSk7XG4gIH1cbiAgQXN5bmNGdW5jdGlvbkNvbnRleHQucHJvdG90eXBlID0gJGNyZWF0ZShHZW5lcmF0b3JDb250ZXh0LnByb3RvdHlwZSk7XG4gIEFzeW5jRnVuY3Rpb25Db250ZXh0LnByb3RvdHlwZS5lbmQgPSBmdW5jdGlvbigpIHtcbiAgICBzd2l0Y2ggKHRoaXMuc3RhdGUpIHtcbiAgICAgIGNhc2UgRU5EX1NUQVRFOlxuICAgICAgICB0aGlzLnJlc29sdmUodGhpcy5yZXR1cm5WYWx1ZSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBSRVRIUk9XX1NUQVRFOlxuICAgICAgICB0aGlzLnJlamVjdCh0aGlzLnN0b3JlZEV4Y2VwdGlvbik7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhpcy5yZWplY3QoZ2V0SW50ZXJuYWxFcnJvcih0aGlzLnN0YXRlKSk7XG4gICAgfVxuICB9O1xuICBBc3luY0Z1bmN0aW9uQ29udGV4dC5wcm90b3R5cGUuaGFuZGxlRXhjZXB0aW9uID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5zdGF0ZSA9IFJFVEhST1dfU1RBVEU7XG4gIH07XG4gIGZ1bmN0aW9uIGFzeW5jV3JhcChpbm5lckZ1bmN0aW9uLCBzZWxmKSB7XG4gICAgdmFyIG1vdmVOZXh0ID0gZ2V0TW92ZU5leHQoaW5uZXJGdW5jdGlvbiwgc2VsZik7XG4gICAgdmFyIGN0eCA9IG5ldyBBc3luY0Z1bmN0aW9uQ29udGV4dCgpO1xuICAgIGN0eC5jcmVhdGVDYWxsYmFjayA9IGZ1bmN0aW9uKG5ld1N0YXRlKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgY3R4LnN0YXRlID0gbmV3U3RhdGU7XG4gICAgICAgIGN0eC52YWx1ZSA9IHZhbHVlO1xuICAgICAgICBtb3ZlTmV4dChjdHgpO1xuICAgICAgfTtcbiAgICB9O1xuICAgIGN0eC5lcnJiYWNrID0gZnVuY3Rpb24oZXJyKSB7XG4gICAgICBoYW5kbGVDYXRjaChjdHgsIGVycik7XG4gICAgICBtb3ZlTmV4dChjdHgpO1xuICAgIH07XG4gICAgbW92ZU5leHQoY3R4KTtcbiAgICByZXR1cm4gY3R4LnJlc3VsdDtcbiAgfVxuICBmdW5jdGlvbiBnZXRNb3ZlTmV4dChpbm5lckZ1bmN0aW9uLCBzZWxmKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGN0eCkge1xuICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICByZXR1cm4gaW5uZXJGdW5jdGlvbi5jYWxsKHNlbGYsIGN0eCk7XG4gICAgICAgIH0gY2F0Y2ggKGV4KSB7XG4gICAgICAgICAgaGFuZGxlQ2F0Y2goY3R4LCBleCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICB9XG4gIGZ1bmN0aW9uIGhhbmRsZUNhdGNoKGN0eCwgZXgpIHtcbiAgICBjdHguc3RvcmVkRXhjZXB0aW9uID0gZXg7XG4gICAgdmFyIGxhc3QgPSBjdHgudHJ5U3RhY2tfW2N0eC50cnlTdGFja18ubGVuZ3RoIC0gMV07XG4gICAgaWYgKCFsYXN0KSB7XG4gICAgICBjdHguaGFuZGxlRXhjZXB0aW9uKGV4KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY3R4LnN0YXRlID0gbGFzdC5jYXRjaCAhPT0gdW5kZWZpbmVkID8gbGFzdC5jYXRjaCA6IGxhc3QuZmluYWxseTtcbiAgICBpZiAobGFzdC5maW5hbGx5RmFsbFRocm91Z2ggIT09IHVuZGVmaW5lZClcbiAgICAgIGN0eC5maW5hbGx5RmFsbFRocm91Z2ggPSBsYXN0LmZpbmFsbHlGYWxsVGhyb3VnaDtcbiAgfVxuICAkdHJhY2V1clJ1bnRpbWUuYXN5bmNXcmFwID0gYXN5bmNXcmFwO1xuICAkdHJhY2V1clJ1bnRpbWUuaW5pdEdlbmVyYXRvckZ1bmN0aW9uID0gaW5pdEdlbmVyYXRvckZ1bmN0aW9uO1xuICAkdHJhY2V1clJ1bnRpbWUuY3JlYXRlR2VuZXJhdG9ySW5zdGFuY2UgPSBjcmVhdGVHZW5lcmF0b3JJbnN0YW5jZTtcbn0pKCk7XG4oZnVuY3Rpb24oKSB7XG4gIGZ1bmN0aW9uIGJ1aWxkRnJvbUVuY29kZWRQYXJ0cyhvcHRfc2NoZW1lLCBvcHRfdXNlckluZm8sIG9wdF9kb21haW4sIG9wdF9wb3J0LCBvcHRfcGF0aCwgb3B0X3F1ZXJ5RGF0YSwgb3B0X2ZyYWdtZW50KSB7XG4gICAgdmFyIG91dCA9IFtdO1xuICAgIGlmIChvcHRfc2NoZW1lKSB7XG4gICAgICBvdXQucHVzaChvcHRfc2NoZW1lLCAnOicpO1xuICAgIH1cbiAgICBpZiAob3B0X2RvbWFpbikge1xuICAgICAgb3V0LnB1c2goJy8vJyk7XG4gICAgICBpZiAob3B0X3VzZXJJbmZvKSB7XG4gICAgICAgIG91dC5wdXNoKG9wdF91c2VySW5mbywgJ0AnKTtcbiAgICAgIH1cbiAgICAgIG91dC5wdXNoKG9wdF9kb21haW4pO1xuICAgICAgaWYgKG9wdF9wb3J0KSB7XG4gICAgICAgIG91dC5wdXNoKCc6Jywgb3B0X3BvcnQpO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAob3B0X3BhdGgpIHtcbiAgICAgIG91dC5wdXNoKG9wdF9wYXRoKTtcbiAgICB9XG4gICAgaWYgKG9wdF9xdWVyeURhdGEpIHtcbiAgICAgIG91dC5wdXNoKCc/Jywgb3B0X3F1ZXJ5RGF0YSk7XG4gICAgfVxuICAgIGlmIChvcHRfZnJhZ21lbnQpIHtcbiAgICAgIG91dC5wdXNoKCcjJywgb3B0X2ZyYWdtZW50KTtcbiAgICB9XG4gICAgcmV0dXJuIG91dC5qb2luKCcnKTtcbiAgfVxuICA7XG4gIHZhciBzcGxpdFJlID0gbmV3IFJlZ0V4cCgnXicgKyAnKD86JyArICcoW146Lz8jLl0rKScgKyAnOik/JyArICcoPzovLycgKyAnKD86KFteLz8jXSopQCk/JyArICcoW1xcXFx3XFxcXGRcXFxcLVxcXFx1MDEwMC1cXFxcdWZmZmYuJV0qKScgKyAnKD86OihbMC05XSspKT8nICsgJyk/JyArICcoW14/I10rKT8nICsgJyg/OlxcXFw/KFteI10qKSk/JyArICcoPzojKC4qKSk/JyArICckJyk7XG4gIHZhciBDb21wb25lbnRJbmRleCA9IHtcbiAgICBTQ0hFTUU6IDEsXG4gICAgVVNFUl9JTkZPOiAyLFxuICAgIERPTUFJTjogMyxcbiAgICBQT1JUOiA0LFxuICAgIFBBVEg6IDUsXG4gICAgUVVFUllfREFUQTogNixcbiAgICBGUkFHTUVOVDogN1xuICB9O1xuICBmdW5jdGlvbiBzcGxpdCh1cmkpIHtcbiAgICByZXR1cm4gKHVyaS5tYXRjaChzcGxpdFJlKSk7XG4gIH1cbiAgZnVuY3Rpb24gcmVtb3ZlRG90U2VnbWVudHMocGF0aCkge1xuICAgIGlmIChwYXRoID09PSAnLycpXG4gICAgICByZXR1cm4gJy8nO1xuICAgIHZhciBsZWFkaW5nU2xhc2ggPSBwYXRoWzBdID09PSAnLycgPyAnLycgOiAnJztcbiAgICB2YXIgdHJhaWxpbmdTbGFzaCA9IHBhdGguc2xpY2UoLTEpID09PSAnLycgPyAnLycgOiAnJztcbiAgICB2YXIgc2VnbWVudHMgPSBwYXRoLnNwbGl0KCcvJyk7XG4gICAgdmFyIG91dCA9IFtdO1xuICAgIHZhciB1cCA9IDA7XG4gICAgZm9yICh2YXIgcG9zID0gMDsgcG9zIDwgc2VnbWVudHMubGVuZ3RoOyBwb3MrKykge1xuICAgICAgdmFyIHNlZ21lbnQgPSBzZWdtZW50c1twb3NdO1xuICAgICAgc3dpdGNoIChzZWdtZW50KSB7XG4gICAgICAgIGNhc2UgJyc6XG4gICAgICAgIGNhc2UgJy4nOlxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICcuLic6XG4gICAgICAgICAgaWYgKG91dC5sZW5ndGgpXG4gICAgICAgICAgICBvdXQucG9wKCk7XG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgdXArKztcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBvdXQucHVzaChzZWdtZW50KTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKCFsZWFkaW5nU2xhc2gpIHtcbiAgICAgIHdoaWxlICh1cC0tID4gMCkge1xuICAgICAgICBvdXQudW5zaGlmdCgnLi4nKTtcbiAgICAgIH1cbiAgICAgIGlmIChvdXQubGVuZ3RoID09PSAwKVxuICAgICAgICBvdXQucHVzaCgnLicpO1xuICAgIH1cbiAgICByZXR1cm4gbGVhZGluZ1NsYXNoICsgb3V0LmpvaW4oJy8nKSArIHRyYWlsaW5nU2xhc2g7XG4gIH1cbiAgZnVuY3Rpb24gam9pbkFuZENhbm9uaWNhbGl6ZVBhdGgocGFydHMpIHtcbiAgICB2YXIgcGF0aCA9IHBhcnRzW0NvbXBvbmVudEluZGV4LlBBVEhdIHx8ICcnO1xuICAgIHBhdGggPSByZW1vdmVEb3RTZWdtZW50cyhwYXRoKTtcbiAgICBwYXJ0c1tDb21wb25lbnRJbmRleC5QQVRIXSA9IHBhdGg7XG4gICAgcmV0dXJuIGJ1aWxkRnJvbUVuY29kZWRQYXJ0cyhwYXJ0c1tDb21wb25lbnRJbmRleC5TQ0hFTUVdLCBwYXJ0c1tDb21wb25lbnRJbmRleC5VU0VSX0lORk9dLCBwYXJ0c1tDb21wb25lbnRJbmRleC5ET01BSU5dLCBwYXJ0c1tDb21wb25lbnRJbmRleC5QT1JUXSwgcGFydHNbQ29tcG9uZW50SW5kZXguUEFUSF0sIHBhcnRzW0NvbXBvbmVudEluZGV4LlFVRVJZX0RBVEFdLCBwYXJ0c1tDb21wb25lbnRJbmRleC5GUkFHTUVOVF0pO1xuICB9XG4gIGZ1bmN0aW9uIGNhbm9uaWNhbGl6ZVVybCh1cmwpIHtcbiAgICB2YXIgcGFydHMgPSBzcGxpdCh1cmwpO1xuICAgIHJldHVybiBqb2luQW5kQ2Fub25pY2FsaXplUGF0aChwYXJ0cyk7XG4gIH1cbiAgZnVuY3Rpb24gcmVzb2x2ZVVybChiYXNlLCB1cmwpIHtcbiAgICB2YXIgcGFydHMgPSBzcGxpdCh1cmwpO1xuICAgIHZhciBiYXNlUGFydHMgPSBzcGxpdChiYXNlKTtcbiAgICBpZiAocGFydHNbQ29tcG9uZW50SW5kZXguU0NIRU1FXSkge1xuICAgICAgcmV0dXJuIGpvaW5BbmRDYW5vbmljYWxpemVQYXRoKHBhcnRzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcGFydHNbQ29tcG9uZW50SW5kZXguU0NIRU1FXSA9IGJhc2VQYXJ0c1tDb21wb25lbnRJbmRleC5TQ0hFTUVdO1xuICAgIH1cbiAgICBmb3IgKHZhciBpID0gQ29tcG9uZW50SW5kZXguU0NIRU1FOyBpIDw9IENvbXBvbmVudEluZGV4LlBPUlQ7IGkrKykge1xuICAgICAgaWYgKCFwYXJ0c1tpXSkge1xuICAgICAgICBwYXJ0c1tpXSA9IGJhc2VQYXJ0c1tpXTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHBhcnRzW0NvbXBvbmVudEluZGV4LlBBVEhdWzBdID09ICcvJykge1xuICAgICAgcmV0dXJuIGpvaW5BbmRDYW5vbmljYWxpemVQYXRoKHBhcnRzKTtcbiAgICB9XG4gICAgdmFyIHBhdGggPSBiYXNlUGFydHNbQ29tcG9uZW50SW5kZXguUEFUSF07XG4gICAgdmFyIGluZGV4ID0gcGF0aC5sYXN0SW5kZXhPZignLycpO1xuICAgIHBhdGggPSBwYXRoLnNsaWNlKDAsIGluZGV4ICsgMSkgKyBwYXJ0c1tDb21wb25lbnRJbmRleC5QQVRIXTtcbiAgICBwYXJ0c1tDb21wb25lbnRJbmRleC5QQVRIXSA9IHBhdGg7XG4gICAgcmV0dXJuIGpvaW5BbmRDYW5vbmljYWxpemVQYXRoKHBhcnRzKTtcbiAgfVxuICBmdW5jdGlvbiBpc0Fic29sdXRlKG5hbWUpIHtcbiAgICBpZiAoIW5hbWUpXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgaWYgKG5hbWVbMF0gPT09ICcvJylcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIHZhciBwYXJ0cyA9IHNwbGl0KG5hbWUpO1xuICAgIGlmIChwYXJ0c1tDb21wb25lbnRJbmRleC5TQ0hFTUVdKVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gICR0cmFjZXVyUnVudGltZS5jYW5vbmljYWxpemVVcmwgPSBjYW5vbmljYWxpemVVcmw7XG4gICR0cmFjZXVyUnVudGltZS5pc0Fic29sdXRlID0gaXNBYnNvbHV0ZTtcbiAgJHRyYWNldXJSdW50aW1lLnJlbW92ZURvdFNlZ21lbnRzID0gcmVtb3ZlRG90U2VnbWVudHM7XG4gICR0cmFjZXVyUnVudGltZS5yZXNvbHZlVXJsID0gcmVzb2x2ZVVybDtcbn0pKCk7XG4oZnVuY3Rpb24oZ2xvYmFsKSB7XG4gICd1c2Ugc3RyaWN0JztcbiAgdmFyICRfXzIgPSAkdHJhY2V1clJ1bnRpbWUsXG4gICAgICBjYW5vbmljYWxpemVVcmwgPSAkX18yLmNhbm9uaWNhbGl6ZVVybCxcbiAgICAgIHJlc29sdmVVcmwgPSAkX18yLnJlc29sdmVVcmwsXG4gICAgICBpc0Fic29sdXRlID0gJF9fMi5pc0Fic29sdXRlO1xuICB2YXIgbW9kdWxlSW5zdGFudGlhdG9ycyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gIHZhciBiYXNlVVJMO1xuICBpZiAoZ2xvYmFsLmxvY2F0aW9uICYmIGdsb2JhbC5sb2NhdGlvbi5ocmVmKVxuICAgIGJhc2VVUkwgPSByZXNvbHZlVXJsKGdsb2JhbC5sb2NhdGlvbi5ocmVmLCAnLi8nKTtcbiAgZWxzZVxuICAgIGJhc2VVUkwgPSAnJztcbiAgdmFyIFVuY29hdGVkTW9kdWxlRW50cnkgPSBmdW5jdGlvbiBVbmNvYXRlZE1vZHVsZUVudHJ5KHVybCwgdW5jb2F0ZWRNb2R1bGUpIHtcbiAgICB0aGlzLnVybCA9IHVybDtcbiAgICB0aGlzLnZhbHVlXyA9IHVuY29hdGVkTW9kdWxlO1xuICB9O1xuICAoJHRyYWNldXJSdW50aW1lLmNyZWF0ZUNsYXNzKShVbmNvYXRlZE1vZHVsZUVudHJ5LCB7fSwge30pO1xuICB2YXIgTW9kdWxlRXZhbHVhdGlvbkVycm9yID0gZnVuY3Rpb24gTW9kdWxlRXZhbHVhdGlvbkVycm9yKGVycm9uZW91c01vZHVsZU5hbWUsIGNhdXNlKSB7XG4gICAgdGhpcy5tZXNzYWdlID0gdGhpcy5jb25zdHJ1Y3Rvci5uYW1lICsgJzogJyArIHRoaXMuc3RyaXBDYXVzZShjYXVzZSkgKyAnIGluICcgKyBlcnJvbmVvdXNNb2R1bGVOYW1lO1xuICAgIGlmICghKGNhdXNlIGluc3RhbmNlb2YgJE1vZHVsZUV2YWx1YXRpb25FcnJvcikgJiYgY2F1c2Uuc3RhY2spXG4gICAgICB0aGlzLnN0YWNrID0gdGhpcy5zdHJpcFN0YWNrKGNhdXNlLnN0YWNrKTtcbiAgICBlbHNlXG4gICAgICB0aGlzLnN0YWNrID0gJyc7XG4gIH07XG4gIHZhciAkTW9kdWxlRXZhbHVhdGlvbkVycm9yID0gTW9kdWxlRXZhbHVhdGlvbkVycm9yO1xuICAoJHRyYWNldXJSdW50aW1lLmNyZWF0ZUNsYXNzKShNb2R1bGVFdmFsdWF0aW9uRXJyb3IsIHtcbiAgICBzdHJpcEVycm9yOiBmdW5jdGlvbihtZXNzYWdlKSB7XG4gICAgICByZXR1cm4gbWVzc2FnZS5yZXBsYWNlKC8uKkVycm9yOi8sIHRoaXMuY29uc3RydWN0b3IubmFtZSArICc6Jyk7XG4gICAgfSxcbiAgICBzdHJpcENhdXNlOiBmdW5jdGlvbihjYXVzZSkge1xuICAgICAgaWYgKCFjYXVzZSlcbiAgICAgICAgcmV0dXJuICcnO1xuICAgICAgaWYgKCFjYXVzZS5tZXNzYWdlKVxuICAgICAgICByZXR1cm4gY2F1c2UgKyAnJztcbiAgICAgIHJldHVybiB0aGlzLnN0cmlwRXJyb3IoY2F1c2UubWVzc2FnZSk7XG4gICAgfSxcbiAgICBsb2FkZWRCeTogZnVuY3Rpb24obW9kdWxlTmFtZSkge1xuICAgICAgdGhpcy5zdGFjayArPSAnXFxuIGxvYWRlZCBieSAnICsgbW9kdWxlTmFtZTtcbiAgICB9LFxuICAgIHN0cmlwU3RhY2s6IGZ1bmN0aW9uKGNhdXNlU3RhY2spIHtcbiAgICAgIHZhciBzdGFjayA9IFtdO1xuICAgICAgY2F1c2VTdGFjay5zcGxpdCgnXFxuJykuc29tZSgoZnVuY3Rpb24oZnJhbWUpIHtcbiAgICAgICAgaWYgKC9VbmNvYXRlZE1vZHVsZUluc3RhbnRpYXRvci8udGVzdChmcmFtZSkpXG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIHN0YWNrLnB1c2goZnJhbWUpO1xuICAgICAgfSkpO1xuICAgICAgc3RhY2tbMF0gPSB0aGlzLnN0cmlwRXJyb3Ioc3RhY2tbMF0pO1xuICAgICAgcmV0dXJuIHN0YWNrLmpvaW4oJ1xcbicpO1xuICAgIH1cbiAgfSwge30sIEVycm9yKTtcbiAgdmFyIFVuY29hdGVkTW9kdWxlSW5zdGFudGlhdG9yID0gZnVuY3Rpb24gVW5jb2F0ZWRNb2R1bGVJbnN0YW50aWF0b3IodXJsLCBmdW5jKSB7XG4gICAgJHRyYWNldXJSdW50aW1lLnN1cGVyQ2FsbCh0aGlzLCAkVW5jb2F0ZWRNb2R1bGVJbnN0YW50aWF0b3IucHJvdG90eXBlLCBcImNvbnN0cnVjdG9yXCIsIFt1cmwsIG51bGxdKTtcbiAgICB0aGlzLmZ1bmMgPSBmdW5jO1xuICB9O1xuICB2YXIgJFVuY29hdGVkTW9kdWxlSW5zdGFudGlhdG9yID0gVW5jb2F0ZWRNb2R1bGVJbnN0YW50aWF0b3I7XG4gICgkdHJhY2V1clJ1bnRpbWUuY3JlYXRlQ2xhc3MpKFVuY29hdGVkTW9kdWxlSW5zdGFudGlhdG9yLCB7Z2V0VW5jb2F0ZWRNb2R1bGU6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHRoaXMudmFsdWVfKVxuICAgICAgICByZXR1cm4gdGhpcy52YWx1ZV87XG4gICAgICB0cnkge1xuICAgICAgICByZXR1cm4gdGhpcy52YWx1ZV8gPSB0aGlzLmZ1bmMuY2FsbChnbG9iYWwpO1xuICAgICAgfSBjYXRjaCAoZXgpIHtcbiAgICAgICAgaWYgKGV4IGluc3RhbmNlb2YgTW9kdWxlRXZhbHVhdGlvbkVycm9yKSB7XG4gICAgICAgICAgZXgubG9hZGVkQnkodGhpcy51cmwpO1xuICAgICAgICAgIHRocm93IGV4O1xuICAgICAgICB9XG4gICAgICAgIHRocm93IG5ldyBNb2R1bGVFdmFsdWF0aW9uRXJyb3IodGhpcy51cmwsIGV4KTtcbiAgICAgIH1cbiAgICB9fSwge30sIFVuY29hdGVkTW9kdWxlRW50cnkpO1xuICBmdW5jdGlvbiBnZXRVbmNvYXRlZE1vZHVsZUluc3RhbnRpYXRvcihuYW1lKSB7XG4gICAgaWYgKCFuYW1lKVxuICAgICAgcmV0dXJuO1xuICAgIHZhciB1cmwgPSBNb2R1bGVTdG9yZS5ub3JtYWxpemUobmFtZSk7XG4gICAgcmV0dXJuIG1vZHVsZUluc3RhbnRpYXRvcnNbdXJsXTtcbiAgfVxuICA7XG4gIHZhciBtb2R1bGVJbnN0YW5jZXMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICB2YXIgbGl2ZU1vZHVsZVNlbnRpbmVsID0ge307XG4gIGZ1bmN0aW9uIE1vZHVsZSh1bmNvYXRlZE1vZHVsZSkge1xuICAgIHZhciBpc0xpdmUgPSBhcmd1bWVudHNbMV07XG4gICAgdmFyIGNvYXRlZE1vZHVsZSA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gICAgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXModW5jb2F0ZWRNb2R1bGUpLmZvckVhY2goKGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgIHZhciBnZXR0ZXIsXG4gICAgICAgICAgdmFsdWU7XG4gICAgICBpZiAoaXNMaXZlID09PSBsaXZlTW9kdWxlU2VudGluZWwpIHtcbiAgICAgICAgdmFyIGRlc2NyID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih1bmNvYXRlZE1vZHVsZSwgbmFtZSk7XG4gICAgICAgIGlmIChkZXNjci5nZXQpXG4gICAgICAgICAgZ2V0dGVyID0gZGVzY3IuZ2V0O1xuICAgICAgfVxuICAgICAgaWYgKCFnZXR0ZXIpIHtcbiAgICAgICAgdmFsdWUgPSB1bmNvYXRlZE1vZHVsZVtuYW1lXTtcbiAgICAgICAgZ2V0dGVyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGNvYXRlZE1vZHVsZSwgbmFtZSwge1xuICAgICAgICBnZXQ6IGdldHRlcixcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZVxuICAgICAgfSk7XG4gICAgfSkpO1xuICAgIE9iamVjdC5wcmV2ZW50RXh0ZW5zaW9ucyhjb2F0ZWRNb2R1bGUpO1xuICAgIHJldHVybiBjb2F0ZWRNb2R1bGU7XG4gIH1cbiAgdmFyIE1vZHVsZVN0b3JlID0ge1xuICAgIG5vcm1hbGl6ZTogZnVuY3Rpb24obmFtZSwgcmVmZXJlck5hbWUsIHJlZmVyZXJBZGRyZXNzKSB7XG4gICAgICBpZiAodHlwZW9mIG5hbWUgIT09IFwic3RyaW5nXCIpXG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJtb2R1bGUgbmFtZSBtdXN0IGJlIGEgc3RyaW5nLCBub3QgXCIgKyB0eXBlb2YgbmFtZSk7XG4gICAgICBpZiAoaXNBYnNvbHV0ZShuYW1lKSlcbiAgICAgICAgcmV0dXJuIGNhbm9uaWNhbGl6ZVVybChuYW1lKTtcbiAgICAgIGlmICgvW15cXC5dXFwvXFwuXFwuXFwvLy50ZXN0KG5hbWUpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignbW9kdWxlIG5hbWUgZW1iZWRzIC8uLi86ICcgKyBuYW1lKTtcbiAgICAgIH1cbiAgICAgIGlmIChuYW1lWzBdID09PSAnLicgJiYgcmVmZXJlck5hbWUpXG4gICAgICAgIHJldHVybiByZXNvbHZlVXJsKHJlZmVyZXJOYW1lLCBuYW1lKTtcbiAgICAgIHJldHVybiBjYW5vbmljYWxpemVVcmwobmFtZSk7XG4gICAgfSxcbiAgICBnZXQ6IGZ1bmN0aW9uKG5vcm1hbGl6ZWROYW1lKSB7XG4gICAgICB2YXIgbSA9IGdldFVuY29hdGVkTW9kdWxlSW5zdGFudGlhdG9yKG5vcm1hbGl6ZWROYW1lKTtcbiAgICAgIGlmICghbSlcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgIHZhciBtb2R1bGVJbnN0YW5jZSA9IG1vZHVsZUluc3RhbmNlc1ttLnVybF07XG4gICAgICBpZiAobW9kdWxlSW5zdGFuY2UpXG4gICAgICAgIHJldHVybiBtb2R1bGVJbnN0YW5jZTtcbiAgICAgIG1vZHVsZUluc3RhbmNlID0gTW9kdWxlKG0uZ2V0VW5jb2F0ZWRNb2R1bGUoKSwgbGl2ZU1vZHVsZVNlbnRpbmVsKTtcbiAgICAgIHJldHVybiBtb2R1bGVJbnN0YW5jZXNbbS51cmxdID0gbW9kdWxlSW5zdGFuY2U7XG4gICAgfSxcbiAgICBzZXQ6IGZ1bmN0aW9uKG5vcm1hbGl6ZWROYW1lLCBtb2R1bGUpIHtcbiAgICAgIG5vcm1hbGl6ZWROYW1lID0gU3RyaW5nKG5vcm1hbGl6ZWROYW1lKTtcbiAgICAgIG1vZHVsZUluc3RhbnRpYXRvcnNbbm9ybWFsaXplZE5hbWVdID0gbmV3IFVuY29hdGVkTW9kdWxlSW5zdGFudGlhdG9yKG5vcm1hbGl6ZWROYW1lLCAoZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBtb2R1bGU7XG4gICAgICB9KSk7XG4gICAgICBtb2R1bGVJbnN0YW5jZXNbbm9ybWFsaXplZE5hbWVdID0gbW9kdWxlO1xuICAgIH0sXG4gICAgZ2V0IGJhc2VVUkwoKSB7XG4gICAgICByZXR1cm4gYmFzZVVSTDtcbiAgICB9LFxuICAgIHNldCBiYXNlVVJMKHYpIHtcbiAgICAgIGJhc2VVUkwgPSBTdHJpbmcodik7XG4gICAgfSxcbiAgICByZWdpc3Rlck1vZHVsZTogZnVuY3Rpb24obmFtZSwgZnVuYykge1xuICAgICAgdmFyIG5vcm1hbGl6ZWROYW1lID0gTW9kdWxlU3RvcmUubm9ybWFsaXplKG5hbWUpO1xuICAgICAgaWYgKG1vZHVsZUluc3RhbnRpYXRvcnNbbm9ybWFsaXplZE5hbWVdKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2R1cGxpY2F0ZSBtb2R1bGUgbmFtZWQgJyArIG5vcm1hbGl6ZWROYW1lKTtcbiAgICAgIG1vZHVsZUluc3RhbnRpYXRvcnNbbm9ybWFsaXplZE5hbWVdID0gbmV3IFVuY29hdGVkTW9kdWxlSW5zdGFudGlhdG9yKG5vcm1hbGl6ZWROYW1lLCBmdW5jKTtcbiAgICB9LFxuICAgIGJ1bmRsZVN0b3JlOiBPYmplY3QuY3JlYXRlKG51bGwpLFxuICAgIHJlZ2lzdGVyOiBmdW5jdGlvbihuYW1lLCBkZXBzLCBmdW5jKSB7XG4gICAgICBpZiAoIWRlcHMgfHwgIWRlcHMubGVuZ3RoICYmICFmdW5jLmxlbmd0aCkge1xuICAgICAgICB0aGlzLnJlZ2lzdGVyTW9kdWxlKG5hbWUsIGZ1bmMpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5idW5kbGVTdG9yZVtuYW1lXSA9IHtcbiAgICAgICAgICBkZXBzOiBkZXBzLFxuICAgICAgICAgIGV4ZWN1dGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyICRfXzAgPSBhcmd1bWVudHM7XG4gICAgICAgICAgICB2YXIgZGVwTWFwID0ge307XG4gICAgICAgICAgICBkZXBzLmZvckVhY2goKGZ1bmN0aW9uKGRlcCwgaW5kZXgpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGRlcE1hcFtkZXBdID0gJF9fMFtpbmRleF07XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICB2YXIgcmVnaXN0cnlFbnRyeSA9IGZ1bmMuY2FsbCh0aGlzLCBkZXBNYXApO1xuICAgICAgICAgICAgcmVnaXN0cnlFbnRyeS5leGVjdXRlLmNhbGwodGhpcyk7XG4gICAgICAgICAgICByZXR1cm4gcmVnaXN0cnlFbnRyeS5leHBvcnRzO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGdldEFub255bW91c01vZHVsZTogZnVuY3Rpb24oZnVuYykge1xuICAgICAgcmV0dXJuIG5ldyBNb2R1bGUoZnVuYy5jYWxsKGdsb2JhbCksIGxpdmVNb2R1bGVTZW50aW5lbCk7XG4gICAgfSxcbiAgICBnZXRGb3JUZXN0aW5nOiBmdW5jdGlvbihuYW1lKSB7XG4gICAgICB2YXIgJF9fMCA9IHRoaXM7XG4gICAgICBpZiAoIXRoaXMudGVzdGluZ1ByZWZpeF8pIHtcbiAgICAgICAgT2JqZWN0LmtleXMobW9kdWxlSW5zdGFuY2VzKS5zb21lKChmdW5jdGlvbihrZXkpIHtcbiAgICAgICAgICB2YXIgbSA9IC8odHJhY2V1ckBbXlxcL10qXFwvKS8uZXhlYyhrZXkpO1xuICAgICAgICAgIGlmIChtKSB7XG4gICAgICAgICAgICAkX18wLnRlc3RpbmdQcmVmaXhfID0gbVsxXTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfSkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMuZ2V0KHRoaXMudGVzdGluZ1ByZWZpeF8gKyBuYW1lKTtcbiAgICB9XG4gIH07XG4gIE1vZHVsZVN0b3JlLnNldCgnQHRyYWNldXIvc3JjL3J1bnRpbWUvTW9kdWxlU3RvcmUnLCBuZXcgTW9kdWxlKHtNb2R1bGVTdG9yZTogTW9kdWxlU3RvcmV9KSk7XG4gIHZhciBzZXR1cEdsb2JhbHMgPSAkdHJhY2V1clJ1bnRpbWUuc2V0dXBHbG9iYWxzO1xuICAkdHJhY2V1clJ1bnRpbWUuc2V0dXBHbG9iYWxzID0gZnVuY3Rpb24oZ2xvYmFsKSB7XG4gICAgc2V0dXBHbG9iYWxzKGdsb2JhbCk7XG4gIH07XG4gICR0cmFjZXVyUnVudGltZS5Nb2R1bGVTdG9yZSA9IE1vZHVsZVN0b3JlO1xuICBnbG9iYWwuU3lzdGVtID0ge1xuICAgIHJlZ2lzdGVyOiBNb2R1bGVTdG9yZS5yZWdpc3Rlci5iaW5kKE1vZHVsZVN0b3JlKSxcbiAgICBnZXQ6IE1vZHVsZVN0b3JlLmdldCxcbiAgICBzZXQ6IE1vZHVsZVN0b3JlLnNldCxcbiAgICBub3JtYWxpemU6IE1vZHVsZVN0b3JlLm5vcm1hbGl6ZVxuICB9O1xuICAkdHJhY2V1clJ1bnRpbWUuZ2V0TW9kdWxlSW1wbCA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICB2YXIgaW5zdGFudGlhdG9yID0gZ2V0VW5jb2F0ZWRNb2R1bGVJbnN0YW50aWF0b3IobmFtZSk7XG4gICAgcmV0dXJuIGluc3RhbnRpYXRvciAmJiBpbnN0YW50aWF0b3IuZ2V0VW5jb2F0ZWRNb2R1bGUoKTtcbiAgfTtcbn0pKHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnID8gZ2xvYmFsIDogdGhpcyk7XG5TeXN0ZW0ucmVnaXN0ZXIoXCJ0cmFjZXVyLXJ1bnRpbWVAMC4wLjcyL3NyYy9ydW50aW1lL3BvbHlmaWxscy91dGlsc1wiLCBbXSwgZnVuY3Rpb24oKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuICB2YXIgX19tb2R1bGVOYW1lID0gXCJ0cmFjZXVyLXJ1bnRpbWVAMC4wLjcyL3NyYy9ydW50aW1lL3BvbHlmaWxscy91dGlsc1wiO1xuICB2YXIgJGNlaWwgPSBNYXRoLmNlaWw7XG4gIHZhciAkZmxvb3IgPSBNYXRoLmZsb29yO1xuICB2YXIgJGlzRmluaXRlID0gaXNGaW5pdGU7XG4gIHZhciAkaXNOYU4gPSBpc05hTjtcbiAgdmFyICRwb3cgPSBNYXRoLnBvdztcbiAgdmFyICRtaW4gPSBNYXRoLm1pbjtcbiAgdmFyIHRvT2JqZWN0ID0gJHRyYWNldXJSdW50aW1lLnRvT2JqZWN0O1xuICBmdW5jdGlvbiB0b1VpbnQzMih4KSB7XG4gICAgcmV0dXJuIHggPj4+IDA7XG4gIH1cbiAgZnVuY3Rpb24gaXNPYmplY3QoeCkge1xuICAgIHJldHVybiB4ICYmICh0eXBlb2YgeCA9PT0gJ29iamVjdCcgfHwgdHlwZW9mIHggPT09ICdmdW5jdGlvbicpO1xuICB9XG4gIGZ1bmN0aW9uIGlzQ2FsbGFibGUoeCkge1xuICAgIHJldHVybiB0eXBlb2YgeCA9PT0gJ2Z1bmN0aW9uJztcbiAgfVxuICBmdW5jdGlvbiBpc051bWJlcih4KSB7XG4gICAgcmV0dXJuIHR5cGVvZiB4ID09PSAnbnVtYmVyJztcbiAgfVxuICBmdW5jdGlvbiB0b0ludGVnZXIoeCkge1xuICAgIHggPSAreDtcbiAgICBpZiAoJGlzTmFOKHgpKVxuICAgICAgcmV0dXJuIDA7XG4gICAgaWYgKHggPT09IDAgfHwgISRpc0Zpbml0ZSh4KSlcbiAgICAgIHJldHVybiB4O1xuICAgIHJldHVybiB4ID4gMCA/ICRmbG9vcih4KSA6ICRjZWlsKHgpO1xuICB9XG4gIHZhciBNQVhfU0FGRV9MRU5HVEggPSAkcG93KDIsIDUzKSAtIDE7XG4gIGZ1bmN0aW9uIHRvTGVuZ3RoKHgpIHtcbiAgICB2YXIgbGVuID0gdG9JbnRlZ2VyKHgpO1xuICAgIHJldHVybiBsZW4gPCAwID8gMCA6ICRtaW4obGVuLCBNQVhfU0FGRV9MRU5HVEgpO1xuICB9XG4gIGZ1bmN0aW9uIGNoZWNrSXRlcmFibGUoeCkge1xuICAgIHJldHVybiAhaXNPYmplY3QoeCkgPyB1bmRlZmluZWQgOiB4W1N5bWJvbC5pdGVyYXRvcl07XG4gIH1cbiAgZnVuY3Rpb24gaXNDb25zdHJ1Y3Rvcih4KSB7XG4gICAgcmV0dXJuIGlzQ2FsbGFibGUoeCk7XG4gIH1cbiAgZnVuY3Rpb24gY3JlYXRlSXRlcmF0b3JSZXN1bHRPYmplY3QodmFsdWUsIGRvbmUpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgZG9uZTogZG9uZVxuICAgIH07XG4gIH1cbiAgZnVuY3Rpb24gbWF5YmVEZWZpbmUob2JqZWN0LCBuYW1lLCBkZXNjcikge1xuICAgIGlmICghKG5hbWUgaW4gb2JqZWN0KSkge1xuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iamVjdCwgbmFtZSwgZGVzY3IpO1xuICAgIH1cbiAgfVxuICBmdW5jdGlvbiBtYXliZURlZmluZU1ldGhvZChvYmplY3QsIG5hbWUsIHZhbHVlKSB7XG4gICAgbWF5YmVEZWZpbmUob2JqZWN0LCBuYW1lLCB7XG4gICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgfSk7XG4gIH1cbiAgZnVuY3Rpb24gbWF5YmVEZWZpbmVDb25zdChvYmplY3QsIG5hbWUsIHZhbHVlKSB7XG4gICAgbWF5YmVEZWZpbmUob2JqZWN0LCBuYW1lLCB7XG4gICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICBjb25maWd1cmFibGU6IGZhbHNlLFxuICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICB3cml0YWJsZTogZmFsc2VcbiAgICB9KTtcbiAgfVxuICBmdW5jdGlvbiBtYXliZUFkZEZ1bmN0aW9ucyhvYmplY3QsIGZ1bmN0aW9ucykge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZnVuY3Rpb25zLmxlbmd0aDsgaSArPSAyKSB7XG4gICAgICB2YXIgbmFtZSA9IGZ1bmN0aW9uc1tpXTtcbiAgICAgIHZhciB2YWx1ZSA9IGZ1bmN0aW9uc1tpICsgMV07XG4gICAgICBtYXliZURlZmluZU1ldGhvZChvYmplY3QsIG5hbWUsIHZhbHVlKTtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gbWF5YmVBZGRDb25zdHMob2JqZWN0LCBjb25zdHMpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvbnN0cy5sZW5ndGg7IGkgKz0gMikge1xuICAgICAgdmFyIG5hbWUgPSBjb25zdHNbaV07XG4gICAgICB2YXIgdmFsdWUgPSBjb25zdHNbaSArIDFdO1xuICAgICAgbWF5YmVEZWZpbmVDb25zdChvYmplY3QsIG5hbWUsIHZhbHVlKTtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gbWF5YmVBZGRJdGVyYXRvcihvYmplY3QsIGZ1bmMsIFN5bWJvbCkge1xuICAgIGlmICghU3ltYm9sIHx8ICFTeW1ib2wuaXRlcmF0b3IgfHwgb2JqZWN0W1N5bWJvbC5pdGVyYXRvcl0pXG4gICAgICByZXR1cm47XG4gICAgaWYgKG9iamVjdFsnQEBpdGVyYXRvciddKVxuICAgICAgZnVuYyA9IG9iamVjdFsnQEBpdGVyYXRvciddO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmplY3QsIFN5bWJvbC5pdGVyYXRvciwge1xuICAgICAgdmFsdWU6IGZ1bmMsXG4gICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgfSk7XG4gIH1cbiAgdmFyIHBvbHlmaWxscyA9IFtdO1xuICBmdW5jdGlvbiByZWdpc3RlclBvbHlmaWxsKGZ1bmMpIHtcbiAgICBwb2x5ZmlsbHMucHVzaChmdW5jKTtcbiAgfVxuICBmdW5jdGlvbiBwb2x5ZmlsbEFsbChnbG9iYWwpIHtcbiAgICBwb2x5ZmlsbHMuZm9yRWFjaCgoZnVuY3Rpb24oZikge1xuICAgICAgcmV0dXJuIGYoZ2xvYmFsKTtcbiAgICB9KSk7XG4gIH1cbiAgcmV0dXJuIHtcbiAgICBnZXQgdG9PYmplY3QoKSB7XG4gICAgICByZXR1cm4gdG9PYmplY3Q7XG4gICAgfSxcbiAgICBnZXQgdG9VaW50MzIoKSB7XG4gICAgICByZXR1cm4gdG9VaW50MzI7XG4gICAgfSxcbiAgICBnZXQgaXNPYmplY3QoKSB7XG4gICAgICByZXR1cm4gaXNPYmplY3Q7XG4gICAgfSxcbiAgICBnZXQgaXNDYWxsYWJsZSgpIHtcbiAgICAgIHJldHVybiBpc0NhbGxhYmxlO1xuICAgIH0sXG4gICAgZ2V0IGlzTnVtYmVyKCkge1xuICAgICAgcmV0dXJuIGlzTnVtYmVyO1xuICAgIH0sXG4gICAgZ2V0IHRvSW50ZWdlcigpIHtcbiAgICAgIHJldHVybiB0b0ludGVnZXI7XG4gICAgfSxcbiAgICBnZXQgdG9MZW5ndGgoKSB7XG4gICAgICByZXR1cm4gdG9MZW5ndGg7XG4gICAgfSxcbiAgICBnZXQgY2hlY2tJdGVyYWJsZSgpIHtcbiAgICAgIHJldHVybiBjaGVja0l0ZXJhYmxlO1xuICAgIH0sXG4gICAgZ2V0IGlzQ29uc3RydWN0b3IoKSB7XG4gICAgICByZXR1cm4gaXNDb25zdHJ1Y3RvcjtcbiAgICB9LFxuICAgIGdldCBjcmVhdGVJdGVyYXRvclJlc3VsdE9iamVjdCgpIHtcbiAgICAgIHJldHVybiBjcmVhdGVJdGVyYXRvclJlc3VsdE9iamVjdDtcbiAgICB9LFxuICAgIGdldCBtYXliZURlZmluZSgpIHtcbiAgICAgIHJldHVybiBtYXliZURlZmluZTtcbiAgICB9LFxuICAgIGdldCBtYXliZURlZmluZU1ldGhvZCgpIHtcbiAgICAgIHJldHVybiBtYXliZURlZmluZU1ldGhvZDtcbiAgICB9LFxuICAgIGdldCBtYXliZURlZmluZUNvbnN0KCkge1xuICAgICAgcmV0dXJuIG1heWJlRGVmaW5lQ29uc3Q7XG4gICAgfSxcbiAgICBnZXQgbWF5YmVBZGRGdW5jdGlvbnMoKSB7XG4gICAgICByZXR1cm4gbWF5YmVBZGRGdW5jdGlvbnM7XG4gICAgfSxcbiAgICBnZXQgbWF5YmVBZGRDb25zdHMoKSB7XG4gICAgICByZXR1cm4gbWF5YmVBZGRDb25zdHM7XG4gICAgfSxcbiAgICBnZXQgbWF5YmVBZGRJdGVyYXRvcigpIHtcbiAgICAgIHJldHVybiBtYXliZUFkZEl0ZXJhdG9yO1xuICAgIH0sXG4gICAgZ2V0IHJlZ2lzdGVyUG9seWZpbGwoKSB7XG4gICAgICByZXR1cm4gcmVnaXN0ZXJQb2x5ZmlsbDtcbiAgICB9LFxuICAgIGdldCBwb2x5ZmlsbEFsbCgpIHtcbiAgICAgIHJldHVybiBwb2x5ZmlsbEFsbDtcbiAgICB9XG4gIH07XG59KTtcblN5c3RlbS5yZWdpc3RlcihcInRyYWNldXItcnVudGltZUAwLjAuNzIvc3JjL3J1bnRpbWUvcG9seWZpbGxzL01hcFwiLCBbXSwgZnVuY3Rpb24oKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuICB2YXIgX19tb2R1bGVOYW1lID0gXCJ0cmFjZXVyLXJ1bnRpbWVAMC4wLjcyL3NyYy9ydW50aW1lL3BvbHlmaWxscy9NYXBcIjtcbiAgdmFyICRfXzAgPSBTeXN0ZW0uZ2V0KFwidHJhY2V1ci1ydW50aW1lQDAuMC43Mi9zcmMvcnVudGltZS9wb2x5ZmlsbHMvdXRpbHNcIiksXG4gICAgICBpc09iamVjdCA9ICRfXzAuaXNPYmplY3QsXG4gICAgICBtYXliZUFkZEl0ZXJhdG9yID0gJF9fMC5tYXliZUFkZEl0ZXJhdG9yLFxuICAgICAgcmVnaXN0ZXJQb2x5ZmlsbCA9ICRfXzAucmVnaXN0ZXJQb2x5ZmlsbDtcbiAgdmFyIGdldE93bkhhc2hPYmplY3QgPSAkdHJhY2V1clJ1bnRpbWUuZ2V0T3duSGFzaE9iamVjdDtcbiAgdmFyICRoYXNPd25Qcm9wZXJ0eSA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG4gIHZhciBkZWxldGVkU2VudGluZWwgPSB7fTtcbiAgZnVuY3Rpb24gbG9va3VwSW5kZXgobWFwLCBrZXkpIHtcbiAgICBpZiAoaXNPYmplY3Qoa2V5KSkge1xuICAgICAgdmFyIGhhc2hPYmplY3QgPSBnZXRPd25IYXNoT2JqZWN0KGtleSk7XG4gICAgICByZXR1cm4gaGFzaE9iamVjdCAmJiBtYXAub2JqZWN0SW5kZXhfW2hhc2hPYmplY3QuaGFzaF07XG4gICAgfVxuICAgIGlmICh0eXBlb2Yga2V5ID09PSAnc3RyaW5nJylcbiAgICAgIHJldHVybiBtYXAuc3RyaW5nSW5kZXhfW2tleV07XG4gICAgcmV0dXJuIG1hcC5wcmltaXRpdmVJbmRleF9ba2V5XTtcbiAgfVxuICBmdW5jdGlvbiBpbml0TWFwKG1hcCkge1xuICAgIG1hcC5lbnRyaWVzXyA9IFtdO1xuICAgIG1hcC5vYmplY3RJbmRleF8gPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgIG1hcC5zdHJpbmdJbmRleF8gPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgIG1hcC5wcmltaXRpdmVJbmRleF8gPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgIG1hcC5kZWxldGVkQ291bnRfID0gMDtcbiAgfVxuICB2YXIgTWFwID0gZnVuY3Rpb24gTWFwKCkge1xuICAgIHZhciBpdGVyYWJsZSA9IGFyZ3VtZW50c1swXTtcbiAgICBpZiAoIWlzT2JqZWN0KHRoaXMpKVxuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignTWFwIGNhbGxlZCBvbiBpbmNvbXBhdGlibGUgdHlwZScpO1xuICAgIGlmICgkaGFzT3duUHJvcGVydHkuY2FsbCh0aGlzLCAnZW50cmllc18nKSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignTWFwIGNhbiBub3QgYmUgcmVlbnRyYW50bHkgaW5pdGlhbGlzZWQnKTtcbiAgICB9XG4gICAgaW5pdE1hcCh0aGlzKTtcbiAgICBpZiAoaXRlcmFibGUgIT09IG51bGwgJiYgaXRlcmFibGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgZm9yICh2YXIgJF9fMiA9IGl0ZXJhYmxlW1N5bWJvbC5pdGVyYXRvcl0oKSxcbiAgICAgICAgICAkX18zOyAhKCRfXzMgPSAkX18yLm5leHQoKSkuZG9uZTsgKSB7XG4gICAgICAgIHZhciAkX180ID0gJF9fMy52YWx1ZSxcbiAgICAgICAgICAgIGtleSA9ICRfXzRbMF0sXG4gICAgICAgICAgICB2YWx1ZSA9ICRfXzRbMV07XG4gICAgICAgIHtcbiAgICAgICAgICB0aGlzLnNldChrZXksIHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfTtcbiAgKCR0cmFjZXVyUnVudGltZS5jcmVhdGVDbGFzcykoTWFwLCB7XG4gICAgZ2V0IHNpemUoKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbnRyaWVzXy5sZW5ndGggLyAyIC0gdGhpcy5kZWxldGVkQ291bnRfO1xuICAgIH0sXG4gICAgZ2V0OiBmdW5jdGlvbihrZXkpIHtcbiAgICAgIHZhciBpbmRleCA9IGxvb2t1cEluZGV4KHRoaXMsIGtleSk7XG4gICAgICBpZiAoaW5kZXggIT09IHVuZGVmaW5lZClcbiAgICAgICAgcmV0dXJuIHRoaXMuZW50cmllc19baW5kZXggKyAxXTtcbiAgICB9LFxuICAgIHNldDogZnVuY3Rpb24oa2V5LCB2YWx1ZSkge1xuICAgICAgdmFyIG9iamVjdE1vZGUgPSBpc09iamVjdChrZXkpO1xuICAgICAgdmFyIHN0cmluZ01vZGUgPSB0eXBlb2Yga2V5ID09PSAnc3RyaW5nJztcbiAgICAgIHZhciBpbmRleCA9IGxvb2t1cEluZGV4KHRoaXMsIGtleSk7XG4gICAgICBpZiAoaW5kZXggIT09IHVuZGVmaW5lZCkge1xuICAgICAgICB0aGlzLmVudHJpZXNfW2luZGV4ICsgMV0gPSB2YWx1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGluZGV4ID0gdGhpcy5lbnRyaWVzXy5sZW5ndGg7XG4gICAgICAgIHRoaXMuZW50cmllc19baW5kZXhdID0ga2V5O1xuICAgICAgICB0aGlzLmVudHJpZXNfW2luZGV4ICsgMV0gPSB2YWx1ZTtcbiAgICAgICAgaWYgKG9iamVjdE1vZGUpIHtcbiAgICAgICAgICB2YXIgaGFzaE9iamVjdCA9IGdldE93bkhhc2hPYmplY3Qoa2V5KTtcbiAgICAgICAgICB2YXIgaGFzaCA9IGhhc2hPYmplY3QuaGFzaDtcbiAgICAgICAgICB0aGlzLm9iamVjdEluZGV4X1toYXNoXSA9IGluZGV4O1xuICAgICAgICB9IGVsc2UgaWYgKHN0cmluZ01vZGUpIHtcbiAgICAgICAgICB0aGlzLnN0cmluZ0luZGV4X1trZXldID0gaW5kZXg7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5wcmltaXRpdmVJbmRleF9ba2V5XSA9IGluZGV4O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuICAgIGhhczogZnVuY3Rpb24oa2V5KSB7XG4gICAgICByZXR1cm4gbG9va3VwSW5kZXgodGhpcywga2V5KSAhPT0gdW5kZWZpbmVkO1xuICAgIH0sXG4gICAgZGVsZXRlOiBmdW5jdGlvbihrZXkpIHtcbiAgICAgIHZhciBvYmplY3RNb2RlID0gaXNPYmplY3Qoa2V5KTtcbiAgICAgIHZhciBzdHJpbmdNb2RlID0gdHlwZW9mIGtleSA9PT0gJ3N0cmluZyc7XG4gICAgICB2YXIgaW5kZXg7XG4gICAgICB2YXIgaGFzaDtcbiAgICAgIGlmIChvYmplY3RNb2RlKSB7XG4gICAgICAgIHZhciBoYXNoT2JqZWN0ID0gZ2V0T3duSGFzaE9iamVjdChrZXkpO1xuICAgICAgICBpZiAoaGFzaE9iamVjdCkge1xuICAgICAgICAgIGluZGV4ID0gdGhpcy5vYmplY3RJbmRleF9baGFzaCA9IGhhc2hPYmplY3QuaGFzaF07XG4gICAgICAgICAgZGVsZXRlIHRoaXMub2JqZWN0SW5kZXhfW2hhc2hdO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHN0cmluZ01vZGUpIHtcbiAgICAgICAgaW5kZXggPSB0aGlzLnN0cmluZ0luZGV4X1trZXldO1xuICAgICAgICBkZWxldGUgdGhpcy5zdHJpbmdJbmRleF9ba2V5XTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGluZGV4ID0gdGhpcy5wcmltaXRpdmVJbmRleF9ba2V5XTtcbiAgICAgICAgZGVsZXRlIHRoaXMucHJpbWl0aXZlSW5kZXhfW2tleV07XG4gICAgICB9XG4gICAgICBpZiAoaW5kZXggIT09IHVuZGVmaW5lZCkge1xuICAgICAgICB0aGlzLmVudHJpZXNfW2luZGV4XSA9IGRlbGV0ZWRTZW50aW5lbDtcbiAgICAgICAgdGhpcy5lbnRyaWVzX1tpbmRleCArIDFdID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLmRlbGV0ZWRDb3VudF8rKztcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSxcbiAgICBjbGVhcjogZnVuY3Rpb24oKSB7XG4gICAgICBpbml0TWFwKHRoaXMpO1xuICAgIH0sXG4gICAgZm9yRWFjaDogZnVuY3Rpb24oY2FsbGJhY2tGbikge1xuICAgICAgdmFyIHRoaXNBcmcgPSBhcmd1bWVudHNbMV07XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZW50cmllc18ubGVuZ3RoOyBpICs9IDIpIHtcbiAgICAgICAgdmFyIGtleSA9IHRoaXMuZW50cmllc19baV07XG4gICAgICAgIHZhciB2YWx1ZSA9IHRoaXMuZW50cmllc19baSArIDFdO1xuICAgICAgICBpZiAoa2V5ID09PSBkZWxldGVkU2VudGluZWwpXG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIGNhbGxiYWNrRm4uY2FsbCh0aGlzQXJnLCB2YWx1ZSwga2V5LCB0aGlzKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGVudHJpZXM6ICR0cmFjZXVyUnVudGltZS5pbml0R2VuZXJhdG9yRnVuY3Rpb24oZnVuY3Rpb24gJF9fNSgpIHtcbiAgICAgIHZhciBpLFxuICAgICAgICAgIGtleSxcbiAgICAgICAgICB2YWx1ZTtcbiAgICAgIHJldHVybiAkdHJhY2V1clJ1bnRpbWUuY3JlYXRlR2VuZXJhdG9ySW5zdGFuY2UoZnVuY3Rpb24oJGN0eCkge1xuICAgICAgICB3aGlsZSAodHJ1ZSlcbiAgICAgICAgICBzd2l0Y2ggKCRjdHguc3RhdGUpIHtcbiAgICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgICAgaSA9IDA7XG4gICAgICAgICAgICAgICRjdHguc3RhdGUgPSAxMjtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDEyOlxuICAgICAgICAgICAgICAkY3R4LnN0YXRlID0gKGkgPCB0aGlzLmVudHJpZXNfLmxlbmd0aCkgPyA4IDogLTI7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgICBpICs9IDI7XG4gICAgICAgICAgICAgICRjdHguc3RhdGUgPSAxMjtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDg6XG4gICAgICAgICAgICAgIGtleSA9IHRoaXMuZW50cmllc19baV07XG4gICAgICAgICAgICAgIHZhbHVlID0gdGhpcy5lbnRyaWVzX1tpICsgMV07XG4gICAgICAgICAgICAgICRjdHguc3RhdGUgPSA5O1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgOTpcbiAgICAgICAgICAgICAgJGN0eC5zdGF0ZSA9IChrZXkgPT09IGRlbGV0ZWRTZW50aW5lbCkgPyA0IDogNjtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDY6XG4gICAgICAgICAgICAgICRjdHguc3RhdGUgPSAyO1xuICAgICAgICAgICAgICByZXR1cm4gW2tleSwgdmFsdWVdO1xuICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAkY3R4Lm1heWJlVGhyb3coKTtcbiAgICAgICAgICAgICAgJGN0eC5zdGF0ZSA9IDQ7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgcmV0dXJuICRjdHguZW5kKCk7XG4gICAgICAgICAgfVxuICAgICAgfSwgJF9fNSwgdGhpcyk7XG4gICAgfSksXG4gICAga2V5czogJHRyYWNldXJSdW50aW1lLmluaXRHZW5lcmF0b3JGdW5jdGlvbihmdW5jdGlvbiAkX182KCkge1xuICAgICAgdmFyIGksXG4gICAgICAgICAga2V5LFxuICAgICAgICAgIHZhbHVlO1xuICAgICAgcmV0dXJuICR0cmFjZXVyUnVudGltZS5jcmVhdGVHZW5lcmF0b3JJbnN0YW5jZShmdW5jdGlvbigkY3R4KSB7XG4gICAgICAgIHdoaWxlICh0cnVlKVxuICAgICAgICAgIHN3aXRjaCAoJGN0eC5zdGF0ZSkge1xuICAgICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgICBpID0gMDtcbiAgICAgICAgICAgICAgJGN0eC5zdGF0ZSA9IDEyO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMTI6XG4gICAgICAgICAgICAgICRjdHguc3RhdGUgPSAoaSA8IHRoaXMuZW50cmllc18ubGVuZ3RoKSA/IDggOiAtMjtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICAgIGkgKz0gMjtcbiAgICAgICAgICAgICAgJGN0eC5zdGF0ZSA9IDEyO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgODpcbiAgICAgICAgICAgICAga2V5ID0gdGhpcy5lbnRyaWVzX1tpXTtcbiAgICAgICAgICAgICAgdmFsdWUgPSB0aGlzLmVudHJpZXNfW2kgKyAxXTtcbiAgICAgICAgICAgICAgJGN0eC5zdGF0ZSA9IDk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA5OlxuICAgICAgICAgICAgICAkY3R4LnN0YXRlID0gKGtleSA9PT0gZGVsZXRlZFNlbnRpbmVsKSA/IDQgOiA2O1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgNjpcbiAgICAgICAgICAgICAgJGN0eC5zdGF0ZSA9IDI7XG4gICAgICAgICAgICAgIHJldHVybiBrZXk7XG4gICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICRjdHgubWF5YmVUaHJvdygpO1xuICAgICAgICAgICAgICAkY3R4LnN0YXRlID0gNDtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICByZXR1cm4gJGN0eC5lbmQoKTtcbiAgICAgICAgICB9XG4gICAgICB9LCAkX182LCB0aGlzKTtcbiAgICB9KSxcbiAgICB2YWx1ZXM6ICR0cmFjZXVyUnVudGltZS5pbml0R2VuZXJhdG9yRnVuY3Rpb24oZnVuY3Rpb24gJF9fNygpIHtcbiAgICAgIHZhciBpLFxuICAgICAgICAgIGtleSxcbiAgICAgICAgICB2YWx1ZTtcbiAgICAgIHJldHVybiAkdHJhY2V1clJ1bnRpbWUuY3JlYXRlR2VuZXJhdG9ySW5zdGFuY2UoZnVuY3Rpb24oJGN0eCkge1xuICAgICAgICB3aGlsZSAodHJ1ZSlcbiAgICAgICAgICBzd2l0Y2ggKCRjdHguc3RhdGUpIHtcbiAgICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgICAgaSA9IDA7XG4gICAgICAgICAgICAgICRjdHguc3RhdGUgPSAxMjtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDEyOlxuICAgICAgICAgICAgICAkY3R4LnN0YXRlID0gKGkgPCB0aGlzLmVudHJpZXNfLmxlbmd0aCkgPyA4IDogLTI7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgICBpICs9IDI7XG4gICAgICAgICAgICAgICRjdHguc3RhdGUgPSAxMjtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDg6XG4gICAgICAgICAgICAgIGtleSA9IHRoaXMuZW50cmllc19baV07XG4gICAgICAgICAgICAgIHZhbHVlID0gdGhpcy5lbnRyaWVzX1tpICsgMV07XG4gICAgICAgICAgICAgICRjdHguc3RhdGUgPSA5O1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgOTpcbiAgICAgICAgICAgICAgJGN0eC5zdGF0ZSA9IChrZXkgPT09IGRlbGV0ZWRTZW50aW5lbCkgPyA0IDogNjtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDY6XG4gICAgICAgICAgICAgICRjdHguc3RhdGUgPSAyO1xuICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICRjdHgubWF5YmVUaHJvdygpO1xuICAgICAgICAgICAgICAkY3R4LnN0YXRlID0gNDtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICByZXR1cm4gJGN0eC5lbmQoKTtcbiAgICAgICAgICB9XG4gICAgICB9LCAkX183LCB0aGlzKTtcbiAgICB9KVxuICB9LCB7fSk7XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShNYXAucHJvdG90eXBlLCBTeW1ib2wuaXRlcmF0b3IsIHtcbiAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgd3JpdGFibGU6IHRydWUsXG4gICAgdmFsdWU6IE1hcC5wcm90b3R5cGUuZW50cmllc1xuICB9KTtcbiAgZnVuY3Rpb24gcG9seWZpbGxNYXAoZ2xvYmFsKSB7XG4gICAgdmFyICRfXzQgPSBnbG9iYWwsXG4gICAgICAgIE9iamVjdCA9ICRfXzQuT2JqZWN0LFxuICAgICAgICBTeW1ib2wgPSAkX180LlN5bWJvbDtcbiAgICBpZiAoIWdsb2JhbC5NYXApXG4gICAgICBnbG9iYWwuTWFwID0gTWFwO1xuICAgIHZhciBtYXBQcm90b3R5cGUgPSBnbG9iYWwuTWFwLnByb3RvdHlwZTtcbiAgICBpZiAobWFwUHJvdG90eXBlLmVudHJpZXMgPT09IHVuZGVmaW5lZClcbiAgICAgIGdsb2JhbC5NYXAgPSBNYXA7XG4gICAgaWYgKG1hcFByb3RvdHlwZS5lbnRyaWVzKSB7XG4gICAgICBtYXliZUFkZEl0ZXJhdG9yKG1hcFByb3RvdHlwZSwgbWFwUHJvdG90eXBlLmVudHJpZXMsIFN5bWJvbCk7XG4gICAgICBtYXliZUFkZEl0ZXJhdG9yKE9iamVjdC5nZXRQcm90b3R5cGVPZihuZXcgZ2xvYmFsLk1hcCgpLmVudHJpZXMoKSksIGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH0sIFN5bWJvbCk7XG4gICAgfVxuICB9XG4gIHJlZ2lzdGVyUG9seWZpbGwocG9seWZpbGxNYXApO1xuICByZXR1cm4ge1xuICAgIGdldCBNYXAoKSB7XG4gICAgICByZXR1cm4gTWFwO1xuICAgIH0sXG4gICAgZ2V0IHBvbHlmaWxsTWFwKCkge1xuICAgICAgcmV0dXJuIHBvbHlmaWxsTWFwO1xuICAgIH1cbiAgfTtcbn0pO1xuU3lzdGVtLmdldChcInRyYWNldXItcnVudGltZUAwLjAuNzIvc3JjL3J1bnRpbWUvcG9seWZpbGxzL01hcFwiICsgJycpO1xuU3lzdGVtLnJlZ2lzdGVyKFwidHJhY2V1ci1ydW50aW1lQDAuMC43Mi9zcmMvcnVudGltZS9wb2x5ZmlsbHMvU2V0XCIsIFtdLCBmdW5jdGlvbigpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG4gIHZhciBfX21vZHVsZU5hbWUgPSBcInRyYWNldXItcnVudGltZUAwLjAuNzIvc3JjL3J1bnRpbWUvcG9seWZpbGxzL1NldFwiO1xuICB2YXIgJF9fMCA9IFN5c3RlbS5nZXQoXCJ0cmFjZXVyLXJ1bnRpbWVAMC4wLjcyL3NyYy9ydW50aW1lL3BvbHlmaWxscy91dGlsc1wiKSxcbiAgICAgIGlzT2JqZWN0ID0gJF9fMC5pc09iamVjdCxcbiAgICAgIG1heWJlQWRkSXRlcmF0b3IgPSAkX18wLm1heWJlQWRkSXRlcmF0b3IsXG4gICAgICByZWdpc3RlclBvbHlmaWxsID0gJF9fMC5yZWdpc3RlclBvbHlmaWxsO1xuICB2YXIgTWFwID0gU3lzdGVtLmdldChcInRyYWNldXItcnVudGltZUAwLjAuNzIvc3JjL3J1bnRpbWUvcG9seWZpbGxzL01hcFwiKS5NYXA7XG4gIHZhciBnZXRPd25IYXNoT2JqZWN0ID0gJHRyYWNldXJSdW50aW1lLmdldE93bkhhc2hPYmplY3Q7XG4gIHZhciAkaGFzT3duUHJvcGVydHkgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xuICBmdW5jdGlvbiBpbml0U2V0KHNldCkge1xuICAgIHNldC5tYXBfID0gbmV3IE1hcCgpO1xuICB9XG4gIHZhciBTZXQgPSBmdW5jdGlvbiBTZXQoKSB7XG4gICAgdmFyIGl0ZXJhYmxlID0gYXJndW1lbnRzWzBdO1xuICAgIGlmICghaXNPYmplY3QodGhpcykpXG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdTZXQgY2FsbGVkIG9uIGluY29tcGF0aWJsZSB0eXBlJyk7XG4gICAgaWYgKCRoYXNPd25Qcm9wZXJ0eS5jYWxsKHRoaXMsICdtYXBfJykpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1NldCBjYW4gbm90IGJlIHJlZW50cmFudGx5IGluaXRpYWxpc2VkJyk7XG4gICAgfVxuICAgIGluaXRTZXQodGhpcyk7XG4gICAgaWYgKGl0ZXJhYmxlICE9PSBudWxsICYmIGl0ZXJhYmxlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGZvciAodmFyICRfXzQgPSBpdGVyYWJsZVtTeW1ib2wuaXRlcmF0b3JdKCksXG4gICAgICAgICAgJF9fNTsgISgkX181ID0gJF9fNC5uZXh0KCkpLmRvbmU7ICkge1xuICAgICAgICB2YXIgaXRlbSA9ICRfXzUudmFsdWU7XG4gICAgICAgIHtcbiAgICAgICAgICB0aGlzLmFkZChpdGVtKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfTtcbiAgKCR0cmFjZXVyUnVudGltZS5jcmVhdGVDbGFzcykoU2V0LCB7XG4gICAgZ2V0IHNpemUoKSB7XG4gICAgICByZXR1cm4gdGhpcy5tYXBfLnNpemU7XG4gICAgfSxcbiAgICBoYXM6IGZ1bmN0aW9uKGtleSkge1xuICAgICAgcmV0dXJuIHRoaXMubWFwXy5oYXMoa2V5KTtcbiAgICB9LFxuICAgIGFkZDogZnVuY3Rpb24oa2V5KSB7XG4gICAgICB0aGlzLm1hcF8uc2V0KGtleSwga2V5KTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gICAgZGVsZXRlOiBmdW5jdGlvbihrZXkpIHtcbiAgICAgIHJldHVybiB0aGlzLm1hcF8uZGVsZXRlKGtleSk7XG4gICAgfSxcbiAgICBjbGVhcjogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5tYXBfLmNsZWFyKCk7XG4gICAgfSxcbiAgICBmb3JFYWNoOiBmdW5jdGlvbihjYWxsYmFja0ZuKSB7XG4gICAgICB2YXIgdGhpc0FyZyA9IGFyZ3VtZW50c1sxXTtcbiAgICAgIHZhciAkX18yID0gdGhpcztcbiAgICAgIHJldHVybiB0aGlzLm1hcF8uZm9yRWFjaCgoZnVuY3Rpb24odmFsdWUsIGtleSkge1xuICAgICAgICBjYWxsYmFja0ZuLmNhbGwodGhpc0FyZywga2V5LCBrZXksICRfXzIpO1xuICAgICAgfSkpO1xuICAgIH0sXG4gICAgdmFsdWVzOiAkdHJhY2V1clJ1bnRpbWUuaW5pdEdlbmVyYXRvckZ1bmN0aW9uKGZ1bmN0aW9uICRfXzcoKSB7XG4gICAgICB2YXIgJF9fOCxcbiAgICAgICAgICAkX185O1xuICAgICAgcmV0dXJuICR0cmFjZXVyUnVudGltZS5jcmVhdGVHZW5lcmF0b3JJbnN0YW5jZShmdW5jdGlvbigkY3R4KSB7XG4gICAgICAgIHdoaWxlICh0cnVlKVxuICAgICAgICAgIHN3aXRjaCAoJGN0eC5zdGF0ZSkge1xuICAgICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgICAkX184ID0gdGhpcy5tYXBfLmtleXMoKVtTeW1ib2wuaXRlcmF0b3JdKCk7XG4gICAgICAgICAgICAgICRjdHguc2VudCA9IHZvaWQgMDtcbiAgICAgICAgICAgICAgJGN0eC5hY3Rpb24gPSAnbmV4dCc7XG4gICAgICAgICAgICAgICRjdHguc3RhdGUgPSAxMjtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDEyOlxuICAgICAgICAgICAgICAkX185ID0gJF9fOFskY3R4LmFjdGlvbl0oJGN0eC5zZW50SWdub3JlVGhyb3cpO1xuICAgICAgICAgICAgICAkY3R4LnN0YXRlID0gOTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDk6XG4gICAgICAgICAgICAgICRjdHguc3RhdGUgPSAoJF9fOS5kb25lKSA/IDMgOiAyO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgICAgJGN0eC5zZW50ID0gJF9fOS52YWx1ZTtcbiAgICAgICAgICAgICAgJGN0eC5zdGF0ZSA9IC0yO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgJGN0eC5zdGF0ZSA9IDEyO1xuICAgICAgICAgICAgICByZXR1cm4gJF9fOS52YWx1ZTtcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgIHJldHVybiAkY3R4LmVuZCgpO1xuICAgICAgICAgIH1cbiAgICAgIH0sICRfXzcsIHRoaXMpO1xuICAgIH0pLFxuICAgIGVudHJpZXM6ICR0cmFjZXVyUnVudGltZS5pbml0R2VuZXJhdG9yRnVuY3Rpb24oZnVuY3Rpb24gJF9fMTAoKSB7XG4gICAgICB2YXIgJF9fMTEsXG4gICAgICAgICAgJF9fMTI7XG4gICAgICByZXR1cm4gJHRyYWNldXJSdW50aW1lLmNyZWF0ZUdlbmVyYXRvckluc3RhbmNlKGZ1bmN0aW9uKCRjdHgpIHtcbiAgICAgICAgd2hpbGUgKHRydWUpXG4gICAgICAgICAgc3dpdGNoICgkY3R4LnN0YXRlKSB7XG4gICAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICAgICRfXzExID0gdGhpcy5tYXBfLmVudHJpZXMoKVtTeW1ib2wuaXRlcmF0b3JdKCk7XG4gICAgICAgICAgICAgICRjdHguc2VudCA9IHZvaWQgMDtcbiAgICAgICAgICAgICAgJGN0eC5hY3Rpb24gPSAnbmV4dCc7XG4gICAgICAgICAgICAgICRjdHguc3RhdGUgPSAxMjtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDEyOlxuICAgICAgICAgICAgICAkX18xMiA9ICRfXzExWyRjdHguYWN0aW9uXSgkY3R4LnNlbnRJZ25vcmVUaHJvdyk7XG4gICAgICAgICAgICAgICRjdHguc3RhdGUgPSA5O1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgOTpcbiAgICAgICAgICAgICAgJGN0eC5zdGF0ZSA9ICgkX18xMi5kb25lKSA/IDMgOiAyO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgICAgJGN0eC5zZW50ID0gJF9fMTIudmFsdWU7XG4gICAgICAgICAgICAgICRjdHguc3RhdGUgPSAtMjtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICRjdHguc3RhdGUgPSAxMjtcbiAgICAgICAgICAgICAgcmV0dXJuICRfXzEyLnZhbHVlO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgcmV0dXJuICRjdHguZW5kKCk7XG4gICAgICAgICAgfVxuICAgICAgfSwgJF9fMTAsIHRoaXMpO1xuICAgIH0pXG4gIH0sIHt9KTtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNldC5wcm90b3R5cGUsIFN5bWJvbC5pdGVyYXRvciwge1xuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICB2YWx1ZTogU2V0LnByb3RvdHlwZS52YWx1ZXNcbiAgfSk7XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTZXQucHJvdG90eXBlLCAna2V5cycsIHtcbiAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgd3JpdGFibGU6IHRydWUsXG4gICAgdmFsdWU6IFNldC5wcm90b3R5cGUudmFsdWVzXG4gIH0pO1xuICBmdW5jdGlvbiBwb2x5ZmlsbFNldChnbG9iYWwpIHtcbiAgICB2YXIgJF9fNiA9IGdsb2JhbCxcbiAgICAgICAgT2JqZWN0ID0gJF9fNi5PYmplY3QsXG4gICAgICAgIFN5bWJvbCA9ICRfXzYuU3ltYm9sO1xuICAgIGlmICghZ2xvYmFsLlNldClcbiAgICAgIGdsb2JhbC5TZXQgPSBTZXQ7XG4gICAgdmFyIHNldFByb3RvdHlwZSA9IGdsb2JhbC5TZXQucHJvdG90eXBlO1xuICAgIGlmIChzZXRQcm90b3R5cGUudmFsdWVzKSB7XG4gICAgICBtYXliZUFkZEl0ZXJhdG9yKHNldFByb3RvdHlwZSwgc2V0UHJvdG90eXBlLnZhbHVlcywgU3ltYm9sKTtcbiAgICAgIG1heWJlQWRkSXRlcmF0b3IoT2JqZWN0LmdldFByb3RvdHlwZU9mKG5ldyBnbG9iYWwuU2V0KCkudmFsdWVzKCkpLCBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9LCBTeW1ib2wpO1xuICAgIH1cbiAgfVxuICByZWdpc3RlclBvbHlmaWxsKHBvbHlmaWxsU2V0KTtcbiAgcmV0dXJuIHtcbiAgICBnZXQgU2V0KCkge1xuICAgICAgcmV0dXJuIFNldDtcbiAgICB9LFxuICAgIGdldCBwb2x5ZmlsbFNldCgpIHtcbiAgICAgIHJldHVybiBwb2x5ZmlsbFNldDtcbiAgICB9XG4gIH07XG59KTtcblN5c3RlbS5nZXQoXCJ0cmFjZXVyLXJ1bnRpbWVAMC4wLjcyL3NyYy9ydW50aW1lL3BvbHlmaWxscy9TZXRcIiArICcnKTtcblN5c3RlbS5yZWdpc3RlcihcInRyYWNldXItcnVudGltZUAwLjAuNzIvbm9kZV9tb2R1bGVzL3JzdnAvbGliL3JzdnAvYXNhcFwiLCBbXSwgZnVuY3Rpb24oKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuICB2YXIgX19tb2R1bGVOYW1lID0gXCJ0cmFjZXVyLXJ1bnRpbWVAMC4wLjcyL25vZGVfbW9kdWxlcy9yc3ZwL2xpYi9yc3ZwL2FzYXBcIjtcbiAgdmFyIGxlbiA9IDA7XG4gIGZ1bmN0aW9uIGFzYXAoY2FsbGJhY2ssIGFyZykge1xuICAgIHF1ZXVlW2xlbl0gPSBjYWxsYmFjaztcbiAgICBxdWV1ZVtsZW4gKyAxXSA9IGFyZztcbiAgICBsZW4gKz0gMjtcbiAgICBpZiAobGVuID09PSAyKSB7XG4gICAgICBzY2hlZHVsZUZsdXNoKCk7XG4gICAgfVxuICB9XG4gIHZhciAkX19kZWZhdWx0ID0gYXNhcDtcbiAgdmFyIGJyb3dzZXJHbG9iYWwgPSAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpID8gd2luZG93IDoge307XG4gIHZhciBCcm93c2VyTXV0YXRpb25PYnNlcnZlciA9IGJyb3dzZXJHbG9iYWwuTXV0YXRpb25PYnNlcnZlciB8fCBicm93c2VyR2xvYmFsLldlYktpdE11dGF0aW9uT2JzZXJ2ZXI7XG4gIHZhciBpc1dvcmtlciA9IHR5cGVvZiBVaW50OENsYW1wZWRBcnJheSAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIGltcG9ydFNjcmlwdHMgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBNZXNzYWdlQ2hhbm5lbCAhPT0gJ3VuZGVmaW5lZCc7XG4gIGZ1bmN0aW9uIHVzZU5leHRUaWNrKCkge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHByb2Nlc3MubmV4dFRpY2soZmx1c2gpO1xuICAgIH07XG4gIH1cbiAgZnVuY3Rpb24gdXNlTXV0YXRpb25PYnNlcnZlcigpIHtcbiAgICB2YXIgaXRlcmF0aW9ucyA9IDA7XG4gICAgdmFyIG9ic2VydmVyID0gbmV3IEJyb3dzZXJNdXRhdGlvbk9ic2VydmVyKGZsdXNoKTtcbiAgICB2YXIgbm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCcnKTtcbiAgICBvYnNlcnZlci5vYnNlcnZlKG5vZGUsIHtjaGFyYWN0ZXJEYXRhOiB0cnVlfSk7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgbm9kZS5kYXRhID0gKGl0ZXJhdGlvbnMgPSArK2l0ZXJhdGlvbnMgJSAyKTtcbiAgICB9O1xuICB9XG4gIGZ1bmN0aW9uIHVzZU1lc3NhZ2VDaGFubmVsKCkge1xuICAgIHZhciBjaGFubmVsID0gbmV3IE1lc3NhZ2VDaGFubmVsKCk7XG4gICAgY2hhbm5lbC5wb3J0MS5vbm1lc3NhZ2UgPSBmbHVzaDtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICBjaGFubmVsLnBvcnQyLnBvc3RNZXNzYWdlKDApO1xuICAgIH07XG4gIH1cbiAgZnVuY3Rpb24gdXNlU2V0VGltZW91dCgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICBzZXRUaW1lb3V0KGZsdXNoLCAxKTtcbiAgICB9O1xuICB9XG4gIHZhciBxdWV1ZSA9IG5ldyBBcnJheSgxMDAwKTtcbiAgZnVuY3Rpb24gZmx1c2goKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkgKz0gMikge1xuICAgICAgdmFyIGNhbGxiYWNrID0gcXVldWVbaV07XG4gICAgICB2YXIgYXJnID0gcXVldWVbaSArIDFdO1xuICAgICAgY2FsbGJhY2soYXJnKTtcbiAgICAgIHF1ZXVlW2ldID0gdW5kZWZpbmVkO1xuICAgICAgcXVldWVbaSArIDFdID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBsZW4gPSAwO1xuICB9XG4gIHZhciBzY2hlZHVsZUZsdXNoO1xuICBpZiAodHlwZW9mIHByb2Nlc3MgIT09ICd1bmRlZmluZWQnICYmIHt9LnRvU3RyaW5nLmNhbGwocHJvY2VzcykgPT09ICdbb2JqZWN0IHByb2Nlc3NdJykge1xuICAgIHNjaGVkdWxlRmx1c2ggPSB1c2VOZXh0VGljaygpO1xuICB9IGVsc2UgaWYgKEJyb3dzZXJNdXRhdGlvbk9ic2VydmVyKSB7XG4gICAgc2NoZWR1bGVGbHVzaCA9IHVzZU11dGF0aW9uT2JzZXJ2ZXIoKTtcbiAgfSBlbHNlIGlmIChpc1dvcmtlcikge1xuICAgIHNjaGVkdWxlRmx1c2ggPSB1c2VNZXNzYWdlQ2hhbm5lbCgpO1xuICB9IGVsc2Uge1xuICAgIHNjaGVkdWxlRmx1c2ggPSB1c2VTZXRUaW1lb3V0KCk7XG4gIH1cbiAgcmV0dXJuIHtnZXQgZGVmYXVsdCgpIHtcbiAgICAgIHJldHVybiAkX19kZWZhdWx0O1xuICAgIH19O1xufSk7XG5TeXN0ZW0ucmVnaXN0ZXIoXCJ0cmFjZXVyLXJ1bnRpbWVAMC4wLjcyL3NyYy9ydW50aW1lL3BvbHlmaWxscy9Qcm9taXNlXCIsIFtdLCBmdW5jdGlvbigpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG4gIHZhciBfX21vZHVsZU5hbWUgPSBcInRyYWNldXItcnVudGltZUAwLjAuNzIvc3JjL3J1bnRpbWUvcG9seWZpbGxzL1Byb21pc2VcIjtcbiAgdmFyIGFzeW5jID0gU3lzdGVtLmdldChcInRyYWNldXItcnVudGltZUAwLjAuNzIvbm9kZV9tb2R1bGVzL3JzdnAvbGliL3JzdnAvYXNhcFwiKS5kZWZhdWx0O1xuICB2YXIgcmVnaXN0ZXJQb2x5ZmlsbCA9IFN5c3RlbS5nZXQoXCJ0cmFjZXVyLXJ1bnRpbWVAMC4wLjcyL3NyYy9ydW50aW1lL3BvbHlmaWxscy91dGlsc1wiKS5yZWdpc3RlclBvbHlmaWxsO1xuICB2YXIgcHJvbWlzZVJhdyA9IHt9O1xuICBmdW5jdGlvbiBpc1Byb21pc2UoeCkge1xuICAgIHJldHVybiB4ICYmIHR5cGVvZiB4ID09PSAnb2JqZWN0JyAmJiB4LnN0YXR1c18gIT09IHVuZGVmaW5lZDtcbiAgfVxuICBmdW5jdGlvbiBpZFJlc29sdmVIYW5kbGVyKHgpIHtcbiAgICByZXR1cm4geDtcbiAgfVxuICBmdW5jdGlvbiBpZFJlamVjdEhhbmRsZXIoeCkge1xuICAgIHRocm93IHg7XG4gIH1cbiAgZnVuY3Rpb24gY2hhaW4ocHJvbWlzZSkge1xuICAgIHZhciBvblJlc29sdmUgPSBhcmd1bWVudHNbMV0gIT09ICh2b2lkIDApID8gYXJndW1lbnRzWzFdIDogaWRSZXNvbHZlSGFuZGxlcjtcbiAgICB2YXIgb25SZWplY3QgPSBhcmd1bWVudHNbMl0gIT09ICh2b2lkIDApID8gYXJndW1lbnRzWzJdIDogaWRSZWplY3RIYW5kbGVyO1xuICAgIHZhciBkZWZlcnJlZCA9IGdldERlZmVycmVkKHByb21pc2UuY29uc3RydWN0b3IpO1xuICAgIHN3aXRjaCAocHJvbWlzZS5zdGF0dXNfKSB7XG4gICAgICBjYXNlIHVuZGVmaW5lZDpcbiAgICAgICAgdGhyb3cgVHlwZUVycm9yO1xuICAgICAgY2FzZSAwOlxuICAgICAgICBwcm9taXNlLm9uUmVzb2x2ZV8ucHVzaChvblJlc29sdmUsIGRlZmVycmVkKTtcbiAgICAgICAgcHJvbWlzZS5vblJlamVjdF8ucHVzaChvblJlamVjdCwgZGVmZXJyZWQpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgKzE6XG4gICAgICAgIHByb21pc2VFbnF1ZXVlKHByb21pc2UudmFsdWVfLCBbb25SZXNvbHZlLCBkZWZlcnJlZF0pO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgLTE6XG4gICAgICAgIHByb21pc2VFbnF1ZXVlKHByb21pc2UudmFsdWVfLCBbb25SZWplY3QsIGRlZmVycmVkXSk7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfVxuICBmdW5jdGlvbiBnZXREZWZlcnJlZChDKSB7XG4gICAgaWYgKHRoaXMgPT09ICRQcm9taXNlKSB7XG4gICAgICB2YXIgcHJvbWlzZSA9IHByb21pc2VJbml0KG5ldyAkUHJvbWlzZShwcm9taXNlUmF3KSk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBwcm9taXNlOiBwcm9taXNlLFxuICAgICAgICByZXNvbHZlOiAoZnVuY3Rpb24oeCkge1xuICAgICAgICAgIHByb21pc2VSZXNvbHZlKHByb21pc2UsIHgpO1xuICAgICAgICB9KSxcbiAgICAgICAgcmVqZWN0OiAoZnVuY3Rpb24ocikge1xuICAgICAgICAgIHByb21pc2VSZWplY3QocHJvbWlzZSwgcik7XG4gICAgICAgIH0pXG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgcmVzdWx0ID0ge307XG4gICAgICByZXN1bHQucHJvbWlzZSA9IG5ldyBDKChmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgcmVzdWx0LnJlc29sdmUgPSByZXNvbHZlO1xuICAgICAgICByZXN1bHQucmVqZWN0ID0gcmVqZWN0O1xuICAgICAgfSkpO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gcHJvbWlzZVNldChwcm9taXNlLCBzdGF0dXMsIHZhbHVlLCBvblJlc29sdmUsIG9uUmVqZWN0KSB7XG4gICAgcHJvbWlzZS5zdGF0dXNfID0gc3RhdHVzO1xuICAgIHByb21pc2UudmFsdWVfID0gdmFsdWU7XG4gICAgcHJvbWlzZS5vblJlc29sdmVfID0gb25SZXNvbHZlO1xuICAgIHByb21pc2Uub25SZWplY3RfID0gb25SZWplY3Q7XG4gICAgcmV0dXJuIHByb21pc2U7XG4gIH1cbiAgZnVuY3Rpb24gcHJvbWlzZUluaXQocHJvbWlzZSkge1xuICAgIHJldHVybiBwcm9taXNlU2V0KHByb21pc2UsIDAsIHVuZGVmaW5lZCwgW10sIFtdKTtcbiAgfVxuICB2YXIgUHJvbWlzZSA9IGZ1bmN0aW9uIFByb21pc2UocmVzb2x2ZXIpIHtcbiAgICBpZiAocmVzb2x2ZXIgPT09IHByb21pc2VSYXcpXG4gICAgICByZXR1cm47XG4gICAgaWYgKHR5cGVvZiByZXNvbHZlciAhPT0gJ2Z1bmN0aW9uJylcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3I7XG4gICAgdmFyIHByb21pc2UgPSBwcm9taXNlSW5pdCh0aGlzKTtcbiAgICB0cnkge1xuICAgICAgcmVzb2x2ZXIoKGZ1bmN0aW9uKHgpIHtcbiAgICAgICAgcHJvbWlzZVJlc29sdmUocHJvbWlzZSwgeCk7XG4gICAgICB9KSwgKGZ1bmN0aW9uKHIpIHtcbiAgICAgICAgcHJvbWlzZVJlamVjdChwcm9taXNlLCByKTtcbiAgICAgIH0pKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBwcm9taXNlUmVqZWN0KHByb21pc2UsIGUpO1xuICAgIH1cbiAgfTtcbiAgKCR0cmFjZXVyUnVudGltZS5jcmVhdGVDbGFzcykoUHJvbWlzZSwge1xuICAgIGNhdGNoOiBmdW5jdGlvbihvblJlamVjdCkge1xuICAgICAgcmV0dXJuIHRoaXMudGhlbih1bmRlZmluZWQsIG9uUmVqZWN0KTtcbiAgICB9LFxuICAgIHRoZW46IGZ1bmN0aW9uKG9uUmVzb2x2ZSwgb25SZWplY3QpIHtcbiAgICAgIGlmICh0eXBlb2Ygb25SZXNvbHZlICE9PSAnZnVuY3Rpb24nKVxuICAgICAgICBvblJlc29sdmUgPSBpZFJlc29sdmVIYW5kbGVyO1xuICAgICAgaWYgKHR5cGVvZiBvblJlamVjdCAhPT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgb25SZWplY3QgPSBpZFJlamVjdEhhbmRsZXI7XG4gICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICB2YXIgY29uc3RydWN0b3IgPSB0aGlzLmNvbnN0cnVjdG9yO1xuICAgICAgcmV0dXJuIGNoYWluKHRoaXMsIGZ1bmN0aW9uKHgpIHtcbiAgICAgICAgeCA9IHByb21pc2VDb2VyY2UoY29uc3RydWN0b3IsIHgpO1xuICAgICAgICByZXR1cm4geCA9PT0gdGhhdCA/IG9uUmVqZWN0KG5ldyBUeXBlRXJyb3IpIDogaXNQcm9taXNlKHgpID8geC50aGVuKG9uUmVzb2x2ZSwgb25SZWplY3QpIDogb25SZXNvbHZlKHgpO1xuICAgICAgfSwgb25SZWplY3QpO1xuICAgIH1cbiAgfSwge1xuICAgIHJlc29sdmU6IGZ1bmN0aW9uKHgpIHtcbiAgICAgIGlmICh0aGlzID09PSAkUHJvbWlzZSkge1xuICAgICAgICBpZiAoaXNQcm9taXNlKHgpKSB7XG4gICAgICAgICAgcmV0dXJuIHg7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2VTZXQobmV3ICRQcm9taXNlKHByb21pc2VSYXcpLCArMSwgeCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gbmV3IHRoaXMoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgcmVzb2x2ZSh4KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSxcbiAgICByZWplY3Q6IGZ1bmN0aW9uKHIpIHtcbiAgICAgIGlmICh0aGlzID09PSAkUHJvbWlzZSkge1xuICAgICAgICByZXR1cm4gcHJvbWlzZVNldChuZXcgJFByb21pc2UocHJvbWlzZVJhdyksIC0xLCByKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBuZXcgdGhpcygoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgcmVqZWN0KHIpO1xuICAgICAgICB9KSk7XG4gICAgICB9XG4gICAgfSxcbiAgICBhbGw6IGZ1bmN0aW9uKHZhbHVlcykge1xuICAgICAgdmFyIGRlZmVycmVkID0gZ2V0RGVmZXJyZWQodGhpcyk7XG4gICAgICB2YXIgcmVzb2x1dGlvbnMgPSBbXTtcbiAgICAgIHRyeSB7XG4gICAgICAgIHZhciBjb3VudCA9IHZhbHVlcy5sZW5ndGg7XG4gICAgICAgIGlmIChjb3VudCA9PT0gMCkge1xuICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUocmVzb2x1dGlvbnMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdmFsdWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLnJlc29sdmUodmFsdWVzW2ldKS50aGVuKGZ1bmN0aW9uKGksIHgpIHtcbiAgICAgICAgICAgICAgcmVzb2x1dGlvbnNbaV0gPSB4O1xuICAgICAgICAgICAgICBpZiAoLS1jb3VudCA9PT0gMClcbiAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHJlc29sdXRpb25zKTtcbiAgICAgICAgICAgIH0uYmluZCh1bmRlZmluZWQsIGkpLCAoZnVuY3Rpb24ocikge1xuICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3Qocik7XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGRlZmVycmVkLnJlamVjdChlKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH0sXG4gICAgcmFjZTogZnVuY3Rpb24odmFsdWVzKSB7XG4gICAgICB2YXIgZGVmZXJyZWQgPSBnZXREZWZlcnJlZCh0aGlzKTtcbiAgICAgIHRyeSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdmFsdWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgdGhpcy5yZXNvbHZlKHZhbHVlc1tpXSkudGhlbigoZnVuY3Rpb24oeCkge1xuICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSh4KTtcbiAgICAgICAgICB9KSwgKGZ1bmN0aW9uKHIpIHtcbiAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdChyKTtcbiAgICAgICAgICB9KSk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgZGVmZXJyZWQucmVqZWN0KGUpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfVxuICB9KTtcbiAgdmFyICRQcm9taXNlID0gUHJvbWlzZTtcbiAgdmFyICRQcm9taXNlUmVqZWN0ID0gJFByb21pc2UucmVqZWN0O1xuICBmdW5jdGlvbiBwcm9taXNlUmVzb2x2ZShwcm9taXNlLCB4KSB7XG4gICAgcHJvbWlzZURvbmUocHJvbWlzZSwgKzEsIHgsIHByb21pc2Uub25SZXNvbHZlXyk7XG4gIH1cbiAgZnVuY3Rpb24gcHJvbWlzZVJlamVjdChwcm9taXNlLCByKSB7XG4gICAgcHJvbWlzZURvbmUocHJvbWlzZSwgLTEsIHIsIHByb21pc2Uub25SZWplY3RfKTtcbiAgfVxuICBmdW5jdGlvbiBwcm9taXNlRG9uZShwcm9taXNlLCBzdGF0dXMsIHZhbHVlLCByZWFjdGlvbnMpIHtcbiAgICBpZiAocHJvbWlzZS5zdGF0dXNfICE9PSAwKVxuICAgICAgcmV0dXJuO1xuICAgIHByb21pc2VFbnF1ZXVlKHZhbHVlLCByZWFjdGlvbnMpO1xuICAgIHByb21pc2VTZXQocHJvbWlzZSwgc3RhdHVzLCB2YWx1ZSk7XG4gIH1cbiAgZnVuY3Rpb24gcHJvbWlzZUVucXVldWUodmFsdWUsIHRhc2tzKSB7XG4gICAgYXN5bmMoKGZ1bmN0aW9uKCkge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0YXNrcy5sZW5ndGg7IGkgKz0gMikge1xuICAgICAgICBwcm9taXNlSGFuZGxlKHZhbHVlLCB0YXNrc1tpXSwgdGFza3NbaSArIDFdKTtcbiAgICAgIH1cbiAgICB9KSk7XG4gIH1cbiAgZnVuY3Rpb24gcHJvbWlzZUhhbmRsZSh2YWx1ZSwgaGFuZGxlciwgZGVmZXJyZWQpIHtcbiAgICB0cnkge1xuICAgICAgdmFyIHJlc3VsdCA9IGhhbmRsZXIodmFsdWUpO1xuICAgICAgaWYgKHJlc3VsdCA9PT0gZGVmZXJyZWQucHJvbWlzZSlcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcjtcbiAgICAgIGVsc2UgaWYgKGlzUHJvbWlzZShyZXN1bHQpKVxuICAgICAgICBjaGFpbihyZXN1bHQsIGRlZmVycmVkLnJlc29sdmUsIGRlZmVycmVkLnJlamVjdCk7XG4gICAgICBlbHNlXG4gICAgICAgIGRlZmVycmVkLnJlc29sdmUocmVzdWx0KTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICB0cnkge1xuICAgICAgICBkZWZlcnJlZC5yZWplY3QoZSk7XG4gICAgICB9IGNhdGNoIChlKSB7fVxuICAgIH1cbiAgfVxuICB2YXIgdGhlbmFibGVTeW1ib2wgPSAnQEB0aGVuYWJsZSc7XG4gIGZ1bmN0aW9uIGlzT2JqZWN0KHgpIHtcbiAgICByZXR1cm4geCAmJiAodHlwZW9mIHggPT09ICdvYmplY3QnIHx8IHR5cGVvZiB4ID09PSAnZnVuY3Rpb24nKTtcbiAgfVxuICBmdW5jdGlvbiBwcm9taXNlQ29lcmNlKGNvbnN0cnVjdG9yLCB4KSB7XG4gICAgaWYgKCFpc1Byb21pc2UoeCkgJiYgaXNPYmplY3QoeCkpIHtcbiAgICAgIHZhciB0aGVuO1xuICAgICAgdHJ5IHtcbiAgICAgICAgdGhlbiA9IHgudGhlbjtcbiAgICAgIH0gY2F0Y2ggKHIpIHtcbiAgICAgICAgdmFyIHByb21pc2UgPSAkUHJvbWlzZVJlamVjdC5jYWxsKGNvbnN0cnVjdG9yLCByKTtcbiAgICAgICAgeFt0aGVuYWJsZVN5bWJvbF0gPSBwcm9taXNlO1xuICAgICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2YgdGhlbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB2YXIgcCA9IHhbdGhlbmFibGVTeW1ib2xdO1xuICAgICAgICBpZiAocCkge1xuICAgICAgICAgIHJldHVybiBwO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZhciBkZWZlcnJlZCA9IGdldERlZmVycmVkKGNvbnN0cnVjdG9yKTtcbiAgICAgICAgICB4W3RoZW5hYmxlU3ltYm9sXSA9IGRlZmVycmVkLnByb21pc2U7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHRoZW4uY2FsbCh4LCBkZWZlcnJlZC5yZXNvbHZlLCBkZWZlcnJlZC5yZWplY3QpO1xuICAgICAgICAgIH0gY2F0Y2ggKHIpIHtcbiAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdChyKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHg7XG4gIH1cbiAgZnVuY3Rpb24gcG9seWZpbGxQcm9taXNlKGdsb2JhbCkge1xuICAgIGlmICghZ2xvYmFsLlByb21pc2UpXG4gICAgICBnbG9iYWwuUHJvbWlzZSA9IFByb21pc2U7XG4gIH1cbiAgcmVnaXN0ZXJQb2x5ZmlsbChwb2x5ZmlsbFByb21pc2UpO1xuICByZXR1cm4ge1xuICAgIGdldCBQcm9taXNlKCkge1xuICAgICAgcmV0dXJuIFByb21pc2U7XG4gICAgfSxcbiAgICBnZXQgcG9seWZpbGxQcm9taXNlKCkge1xuICAgICAgcmV0dXJuIHBvbHlmaWxsUHJvbWlzZTtcbiAgICB9XG4gIH07XG59KTtcblN5c3RlbS5nZXQoXCJ0cmFjZXVyLXJ1bnRpbWVAMC4wLjcyL3NyYy9ydW50aW1lL3BvbHlmaWxscy9Qcm9taXNlXCIgKyAnJyk7XG5TeXN0ZW0ucmVnaXN0ZXIoXCJ0cmFjZXVyLXJ1bnRpbWVAMC4wLjcyL3NyYy9ydW50aW1lL3BvbHlmaWxscy9TdHJpbmdJdGVyYXRvclwiLCBbXSwgZnVuY3Rpb24oKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuICB2YXIgJF9fMjtcbiAgdmFyIF9fbW9kdWxlTmFtZSA9IFwidHJhY2V1ci1ydW50aW1lQDAuMC43Mi9zcmMvcnVudGltZS9wb2x5ZmlsbHMvU3RyaW5nSXRlcmF0b3JcIjtcbiAgdmFyICRfXzAgPSBTeXN0ZW0uZ2V0KFwidHJhY2V1ci1ydW50aW1lQDAuMC43Mi9zcmMvcnVudGltZS9wb2x5ZmlsbHMvdXRpbHNcIiksXG4gICAgICBjcmVhdGVJdGVyYXRvclJlc3VsdE9iamVjdCA9ICRfXzAuY3JlYXRlSXRlcmF0b3JSZXN1bHRPYmplY3QsXG4gICAgICBpc09iamVjdCA9ICRfXzAuaXNPYmplY3Q7XG4gIHZhciB0b1Byb3BlcnR5ID0gJHRyYWNldXJSdW50aW1lLnRvUHJvcGVydHk7XG4gIHZhciBoYXNPd25Qcm9wZXJ0eSA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG4gIHZhciBpdGVyYXRlZFN0cmluZyA9IFN5bWJvbCgnaXRlcmF0ZWRTdHJpbmcnKTtcbiAgdmFyIHN0cmluZ0l0ZXJhdG9yTmV4dEluZGV4ID0gU3ltYm9sKCdzdHJpbmdJdGVyYXRvck5leHRJbmRleCcpO1xuICB2YXIgU3RyaW5nSXRlcmF0b3IgPSBmdW5jdGlvbiBTdHJpbmdJdGVyYXRvcigpIHt9O1xuICAoJHRyYWNldXJSdW50aW1lLmNyZWF0ZUNsYXNzKShTdHJpbmdJdGVyYXRvciwgKCRfXzIgPSB7fSwgT2JqZWN0LmRlZmluZVByb3BlcnR5KCRfXzIsIFwibmV4dFwiLCB7XG4gICAgdmFsdWU6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIG8gPSB0aGlzO1xuICAgICAgaWYgKCFpc09iamVjdChvKSB8fCAhaGFzT3duUHJvcGVydHkuY2FsbChvLCBpdGVyYXRlZFN0cmluZykpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcigndGhpcyBtdXN0IGJlIGEgU3RyaW5nSXRlcmF0b3Igb2JqZWN0Jyk7XG4gICAgICB9XG4gICAgICB2YXIgcyA9IG9bdG9Qcm9wZXJ0eShpdGVyYXRlZFN0cmluZyldO1xuICAgICAgaWYgKHMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4gY3JlYXRlSXRlcmF0b3JSZXN1bHRPYmplY3QodW5kZWZpbmVkLCB0cnVlKTtcbiAgICAgIH1cbiAgICAgIHZhciBwb3NpdGlvbiA9IG9bdG9Qcm9wZXJ0eShzdHJpbmdJdGVyYXRvck5leHRJbmRleCldO1xuICAgICAgdmFyIGxlbiA9IHMubGVuZ3RoO1xuICAgICAgaWYgKHBvc2l0aW9uID49IGxlbikge1xuICAgICAgICBvW3RvUHJvcGVydHkoaXRlcmF0ZWRTdHJpbmcpXSA9IHVuZGVmaW5lZDtcbiAgICAgICAgcmV0dXJuIGNyZWF0ZUl0ZXJhdG9yUmVzdWx0T2JqZWN0KHVuZGVmaW5lZCwgdHJ1ZSk7XG4gICAgICB9XG4gICAgICB2YXIgZmlyc3QgPSBzLmNoYXJDb2RlQXQocG9zaXRpb24pO1xuICAgICAgdmFyIHJlc3VsdFN0cmluZztcbiAgICAgIGlmIChmaXJzdCA8IDB4RDgwMCB8fCBmaXJzdCA+IDB4REJGRiB8fCBwb3NpdGlvbiArIDEgPT09IGxlbikge1xuICAgICAgICByZXN1bHRTdHJpbmcgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGZpcnN0KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBzZWNvbmQgPSBzLmNoYXJDb2RlQXQocG9zaXRpb24gKyAxKTtcbiAgICAgICAgaWYgKHNlY29uZCA8IDB4REMwMCB8fCBzZWNvbmQgPiAweERGRkYpIHtcbiAgICAgICAgICByZXN1bHRTdHJpbmcgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGZpcnN0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXN1bHRTdHJpbmcgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGZpcnN0KSArIFN0cmluZy5mcm9tQ2hhckNvZGUoc2Vjb25kKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgb1t0b1Byb3BlcnR5KHN0cmluZ0l0ZXJhdG9yTmV4dEluZGV4KV0gPSBwb3NpdGlvbiArIHJlc3VsdFN0cmluZy5sZW5ndGg7XG4gICAgICByZXR1cm4gY3JlYXRlSXRlcmF0b3JSZXN1bHRPYmplY3QocmVzdWx0U3RyaW5nLCBmYWxzZSk7XG4gICAgfSxcbiAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICB3cml0YWJsZTogdHJ1ZVxuICB9KSwgT2JqZWN0LmRlZmluZVByb3BlcnR5KCRfXzIsIFN5bWJvbC5pdGVyYXRvciwge1xuICAgIHZhbHVlOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgd3JpdGFibGU6IHRydWVcbiAgfSksICRfXzIpLCB7fSk7XG4gIGZ1bmN0aW9uIGNyZWF0ZVN0cmluZ0l0ZXJhdG9yKHN0cmluZykge1xuICAgIHZhciBzID0gU3RyaW5nKHN0cmluZyk7XG4gICAgdmFyIGl0ZXJhdG9yID0gT2JqZWN0LmNyZWF0ZShTdHJpbmdJdGVyYXRvci5wcm90b3R5cGUpO1xuICAgIGl0ZXJhdG9yW3RvUHJvcGVydHkoaXRlcmF0ZWRTdHJpbmcpXSA9IHM7XG4gICAgaXRlcmF0b3JbdG9Qcm9wZXJ0eShzdHJpbmdJdGVyYXRvck5leHRJbmRleCldID0gMDtcbiAgICByZXR1cm4gaXRlcmF0b3I7XG4gIH1cbiAgcmV0dXJuIHtnZXQgY3JlYXRlU3RyaW5nSXRlcmF0b3IoKSB7XG4gICAgICByZXR1cm4gY3JlYXRlU3RyaW5nSXRlcmF0b3I7XG4gICAgfX07XG59KTtcblN5c3RlbS5yZWdpc3RlcihcInRyYWNldXItcnVudGltZUAwLjAuNzIvc3JjL3J1bnRpbWUvcG9seWZpbGxzL1N0cmluZ1wiLCBbXSwgZnVuY3Rpb24oKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuICB2YXIgX19tb2R1bGVOYW1lID0gXCJ0cmFjZXVyLXJ1bnRpbWVAMC4wLjcyL3NyYy9ydW50aW1lL3BvbHlmaWxscy9TdHJpbmdcIjtcbiAgdmFyIGNyZWF0ZVN0cmluZ0l0ZXJhdG9yID0gU3lzdGVtLmdldChcInRyYWNldXItcnVudGltZUAwLjAuNzIvc3JjL3J1bnRpbWUvcG9seWZpbGxzL1N0cmluZ0l0ZXJhdG9yXCIpLmNyZWF0ZVN0cmluZ0l0ZXJhdG9yO1xuICB2YXIgJF9fMSA9IFN5c3RlbS5nZXQoXCJ0cmFjZXVyLXJ1bnRpbWVAMC4wLjcyL3NyYy9ydW50aW1lL3BvbHlmaWxscy91dGlsc1wiKSxcbiAgICAgIG1heWJlQWRkRnVuY3Rpb25zID0gJF9fMS5tYXliZUFkZEZ1bmN0aW9ucyxcbiAgICAgIG1heWJlQWRkSXRlcmF0b3IgPSAkX18xLm1heWJlQWRkSXRlcmF0b3IsXG4gICAgICByZWdpc3RlclBvbHlmaWxsID0gJF9fMS5yZWdpc3RlclBvbHlmaWxsO1xuICB2YXIgJHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcbiAgdmFyICRpbmRleE9mID0gU3RyaW5nLnByb3RvdHlwZS5pbmRleE9mO1xuICB2YXIgJGxhc3RJbmRleE9mID0gU3RyaW5nLnByb3RvdHlwZS5sYXN0SW5kZXhPZjtcbiAgZnVuY3Rpb24gc3RhcnRzV2l0aChzZWFyY2gpIHtcbiAgICB2YXIgc3RyaW5nID0gU3RyaW5nKHRoaXMpO1xuICAgIGlmICh0aGlzID09IG51bGwgfHwgJHRvU3RyaW5nLmNhbGwoc2VhcmNoKSA9PSAnW29iamVjdCBSZWdFeHBdJykge1xuICAgICAgdGhyb3cgVHlwZUVycm9yKCk7XG4gICAgfVxuICAgIHZhciBzdHJpbmdMZW5ndGggPSBzdHJpbmcubGVuZ3RoO1xuICAgIHZhciBzZWFyY2hTdHJpbmcgPSBTdHJpbmcoc2VhcmNoKTtcbiAgICB2YXIgc2VhcmNoTGVuZ3RoID0gc2VhcmNoU3RyaW5nLmxlbmd0aDtcbiAgICB2YXIgcG9zaXRpb24gPSBhcmd1bWVudHMubGVuZ3RoID4gMSA/IGFyZ3VtZW50c1sxXSA6IHVuZGVmaW5lZDtcbiAgICB2YXIgcG9zID0gcG9zaXRpb24gPyBOdW1iZXIocG9zaXRpb24pIDogMDtcbiAgICBpZiAoaXNOYU4ocG9zKSkge1xuICAgICAgcG9zID0gMDtcbiAgICB9XG4gICAgdmFyIHN0YXJ0ID0gTWF0aC5taW4oTWF0aC5tYXgocG9zLCAwKSwgc3RyaW5nTGVuZ3RoKTtcbiAgICByZXR1cm4gJGluZGV4T2YuY2FsbChzdHJpbmcsIHNlYXJjaFN0cmluZywgcG9zKSA9PSBzdGFydDtcbiAgfVxuICBmdW5jdGlvbiBlbmRzV2l0aChzZWFyY2gpIHtcbiAgICB2YXIgc3RyaW5nID0gU3RyaW5nKHRoaXMpO1xuICAgIGlmICh0aGlzID09IG51bGwgfHwgJHRvU3RyaW5nLmNhbGwoc2VhcmNoKSA9PSAnW29iamVjdCBSZWdFeHBdJykge1xuICAgICAgdGhyb3cgVHlwZUVycm9yKCk7XG4gICAgfVxuICAgIHZhciBzdHJpbmdMZW5ndGggPSBzdHJpbmcubGVuZ3RoO1xuICAgIHZhciBzZWFyY2hTdHJpbmcgPSBTdHJpbmcoc2VhcmNoKTtcbiAgICB2YXIgc2VhcmNoTGVuZ3RoID0gc2VhcmNoU3RyaW5nLmxlbmd0aDtcbiAgICB2YXIgcG9zID0gc3RyaW5nTGVuZ3RoO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgdmFyIHBvc2l0aW9uID0gYXJndW1lbnRzWzFdO1xuICAgICAgaWYgKHBvc2l0aW9uICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcG9zID0gcG9zaXRpb24gPyBOdW1iZXIocG9zaXRpb24pIDogMDtcbiAgICAgICAgaWYgKGlzTmFOKHBvcykpIHtcbiAgICAgICAgICBwb3MgPSAwO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHZhciBlbmQgPSBNYXRoLm1pbihNYXRoLm1heChwb3MsIDApLCBzdHJpbmdMZW5ndGgpO1xuICAgIHZhciBzdGFydCA9IGVuZCAtIHNlYXJjaExlbmd0aDtcbiAgICBpZiAoc3RhcnQgPCAwKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiAkbGFzdEluZGV4T2YuY2FsbChzdHJpbmcsIHNlYXJjaFN0cmluZywgc3RhcnQpID09IHN0YXJ0O1xuICB9XG4gIGZ1bmN0aW9uIGNvbnRhaW5zKHNlYXJjaCkge1xuICAgIGlmICh0aGlzID09IG51bGwpIHtcbiAgICAgIHRocm93IFR5cGVFcnJvcigpO1xuICAgIH1cbiAgICB2YXIgc3RyaW5nID0gU3RyaW5nKHRoaXMpO1xuICAgIHZhciBzdHJpbmdMZW5ndGggPSBzdHJpbmcubGVuZ3RoO1xuICAgIHZhciBzZWFyY2hTdHJpbmcgPSBTdHJpbmcoc2VhcmNoKTtcbiAgICB2YXIgc2VhcmNoTGVuZ3RoID0gc2VhcmNoU3RyaW5nLmxlbmd0aDtcbiAgICB2YXIgcG9zaXRpb24gPSBhcmd1bWVudHMubGVuZ3RoID4gMSA/IGFyZ3VtZW50c1sxXSA6IHVuZGVmaW5lZDtcbiAgICB2YXIgcG9zID0gcG9zaXRpb24gPyBOdW1iZXIocG9zaXRpb24pIDogMDtcbiAgICBpZiAoaXNOYU4ocG9zKSkge1xuICAgICAgcG9zID0gMDtcbiAgICB9XG4gICAgdmFyIHN0YXJ0ID0gTWF0aC5taW4oTWF0aC5tYXgocG9zLCAwKSwgc3RyaW5nTGVuZ3RoKTtcbiAgICByZXR1cm4gJGluZGV4T2YuY2FsbChzdHJpbmcsIHNlYXJjaFN0cmluZywgcG9zKSAhPSAtMTtcbiAgfVxuICBmdW5jdGlvbiByZXBlYXQoY291bnQpIHtcbiAgICBpZiAodGhpcyA9PSBudWxsKSB7XG4gICAgICB0aHJvdyBUeXBlRXJyb3IoKTtcbiAgICB9XG4gICAgdmFyIHN0cmluZyA9IFN0cmluZyh0aGlzKTtcbiAgICB2YXIgbiA9IGNvdW50ID8gTnVtYmVyKGNvdW50KSA6IDA7XG4gICAgaWYgKGlzTmFOKG4pKSB7XG4gICAgICBuID0gMDtcbiAgICB9XG4gICAgaWYgKG4gPCAwIHx8IG4gPT0gSW5maW5pdHkpIHtcbiAgICAgIHRocm93IFJhbmdlRXJyb3IoKTtcbiAgICB9XG4gICAgaWYgKG4gPT0gMCkge1xuICAgICAgcmV0dXJuICcnO1xuICAgIH1cbiAgICB2YXIgcmVzdWx0ID0gJyc7XG4gICAgd2hpbGUgKG4tLSkge1xuICAgICAgcmVzdWx0ICs9IHN0cmluZztcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuICBmdW5jdGlvbiBjb2RlUG9pbnRBdChwb3NpdGlvbikge1xuICAgIGlmICh0aGlzID09IG51bGwpIHtcbiAgICAgIHRocm93IFR5cGVFcnJvcigpO1xuICAgIH1cbiAgICB2YXIgc3RyaW5nID0gU3RyaW5nKHRoaXMpO1xuICAgIHZhciBzaXplID0gc3RyaW5nLmxlbmd0aDtcbiAgICB2YXIgaW5kZXggPSBwb3NpdGlvbiA/IE51bWJlcihwb3NpdGlvbikgOiAwO1xuICAgIGlmIChpc05hTihpbmRleCkpIHtcbiAgICAgIGluZGV4ID0gMDtcbiAgICB9XG4gICAgaWYgKGluZGV4IDwgMCB8fCBpbmRleCA+PSBzaXplKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgICB2YXIgZmlyc3QgPSBzdHJpbmcuY2hhckNvZGVBdChpbmRleCk7XG4gICAgdmFyIHNlY29uZDtcbiAgICBpZiAoZmlyc3QgPj0gMHhEODAwICYmIGZpcnN0IDw9IDB4REJGRiAmJiBzaXplID4gaW5kZXggKyAxKSB7XG4gICAgICBzZWNvbmQgPSBzdHJpbmcuY2hhckNvZGVBdChpbmRleCArIDEpO1xuICAgICAgaWYgKHNlY29uZCA+PSAweERDMDAgJiYgc2Vjb25kIDw9IDB4REZGRikge1xuICAgICAgICByZXR1cm4gKGZpcnN0IC0gMHhEODAwKSAqIDB4NDAwICsgc2Vjb25kIC0gMHhEQzAwICsgMHgxMDAwMDtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZpcnN0O1xuICB9XG4gIGZ1bmN0aW9uIHJhdyhjYWxsc2l0ZSkge1xuICAgIHZhciByYXcgPSBjYWxsc2l0ZS5yYXc7XG4gICAgdmFyIGxlbiA9IHJhdy5sZW5ndGggPj4+IDA7XG4gICAgaWYgKGxlbiA9PT0gMClcbiAgICAgIHJldHVybiAnJztcbiAgICB2YXIgcyA9ICcnO1xuICAgIHZhciBpID0gMDtcbiAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgcyArPSByYXdbaV07XG4gICAgICBpZiAoaSArIDEgPT09IGxlbilcbiAgICAgICAgcmV0dXJuIHM7XG4gICAgICBzICs9IGFyZ3VtZW50c1srK2ldO1xuICAgIH1cbiAgfVxuICBmdW5jdGlvbiBmcm9tQ29kZVBvaW50KCkge1xuICAgIHZhciBjb2RlVW5pdHMgPSBbXTtcbiAgICB2YXIgZmxvb3IgPSBNYXRoLmZsb29yO1xuICAgIHZhciBoaWdoU3Vycm9nYXRlO1xuICAgIHZhciBsb3dTdXJyb2dhdGU7XG4gICAgdmFyIGluZGV4ID0gLTE7XG4gICAgdmFyIGxlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgaWYgKCFsZW5ndGgpIHtcbiAgICAgIHJldHVybiAnJztcbiAgICB9XG4gICAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICAgIHZhciBjb2RlUG9pbnQgPSBOdW1iZXIoYXJndW1lbnRzW2luZGV4XSk7XG4gICAgICBpZiAoIWlzRmluaXRlKGNvZGVQb2ludCkgfHwgY29kZVBvaW50IDwgMCB8fCBjb2RlUG9pbnQgPiAweDEwRkZGRiB8fCBmbG9vcihjb2RlUG9pbnQpICE9IGNvZGVQb2ludCkge1xuICAgICAgICB0aHJvdyBSYW5nZUVycm9yKCdJbnZhbGlkIGNvZGUgcG9pbnQ6ICcgKyBjb2RlUG9pbnQpO1xuICAgICAgfVxuICAgICAgaWYgKGNvZGVQb2ludCA8PSAweEZGRkYpIHtcbiAgICAgICAgY29kZVVuaXRzLnB1c2goY29kZVBvaW50KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvZGVQb2ludCAtPSAweDEwMDAwO1xuICAgICAgICBoaWdoU3Vycm9nYXRlID0gKGNvZGVQb2ludCA+PiAxMCkgKyAweEQ4MDA7XG4gICAgICAgIGxvd1N1cnJvZ2F0ZSA9IChjb2RlUG9pbnQgJSAweDQwMCkgKyAweERDMDA7XG4gICAgICAgIGNvZGVVbml0cy5wdXNoKGhpZ2hTdXJyb2dhdGUsIGxvd1N1cnJvZ2F0ZSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KG51bGwsIGNvZGVVbml0cyk7XG4gIH1cbiAgZnVuY3Rpb24gc3RyaW5nUHJvdG90eXBlSXRlcmF0b3IoKSB7XG4gICAgdmFyIG8gPSAkdHJhY2V1clJ1bnRpbWUuY2hlY2tPYmplY3RDb2VyY2libGUodGhpcyk7XG4gICAgdmFyIHMgPSBTdHJpbmcobyk7XG4gICAgcmV0dXJuIGNyZWF0ZVN0cmluZ0l0ZXJhdG9yKHMpO1xuICB9XG4gIGZ1bmN0aW9uIHBvbHlmaWxsU3RyaW5nKGdsb2JhbCkge1xuICAgIHZhciBTdHJpbmcgPSBnbG9iYWwuU3RyaW5nO1xuICAgIG1heWJlQWRkRnVuY3Rpb25zKFN0cmluZy5wcm90b3R5cGUsIFsnY29kZVBvaW50QXQnLCBjb2RlUG9pbnRBdCwgJ2NvbnRhaW5zJywgY29udGFpbnMsICdlbmRzV2l0aCcsIGVuZHNXaXRoLCAnc3RhcnRzV2l0aCcsIHN0YXJ0c1dpdGgsICdyZXBlYXQnLCByZXBlYXRdKTtcbiAgICBtYXliZUFkZEZ1bmN0aW9ucyhTdHJpbmcsIFsnZnJvbUNvZGVQb2ludCcsIGZyb21Db2RlUG9pbnQsICdyYXcnLCByYXddKTtcbiAgICBtYXliZUFkZEl0ZXJhdG9yKFN0cmluZy5wcm90b3R5cGUsIHN0cmluZ1Byb3RvdHlwZUl0ZXJhdG9yLCBTeW1ib2wpO1xuICB9XG4gIHJlZ2lzdGVyUG9seWZpbGwocG9seWZpbGxTdHJpbmcpO1xuICByZXR1cm4ge1xuICAgIGdldCBzdGFydHNXaXRoKCkge1xuICAgICAgcmV0dXJuIHN0YXJ0c1dpdGg7XG4gICAgfSxcbiAgICBnZXQgZW5kc1dpdGgoKSB7XG4gICAgICByZXR1cm4gZW5kc1dpdGg7XG4gICAgfSxcbiAgICBnZXQgY29udGFpbnMoKSB7XG4gICAgICByZXR1cm4gY29udGFpbnM7XG4gICAgfSxcbiAgICBnZXQgcmVwZWF0KCkge1xuICAgICAgcmV0dXJuIHJlcGVhdDtcbiAgICB9LFxuICAgIGdldCBjb2RlUG9pbnRBdCgpIHtcbiAgICAgIHJldHVybiBjb2RlUG9pbnRBdDtcbiAgICB9LFxuICAgIGdldCByYXcoKSB7XG4gICAgICByZXR1cm4gcmF3O1xuICAgIH0sXG4gICAgZ2V0IGZyb21Db2RlUG9pbnQoKSB7XG4gICAgICByZXR1cm4gZnJvbUNvZGVQb2ludDtcbiAgICB9LFxuICAgIGdldCBzdHJpbmdQcm90b3R5cGVJdGVyYXRvcigpIHtcbiAgICAgIHJldHVybiBzdHJpbmdQcm90b3R5cGVJdGVyYXRvcjtcbiAgICB9LFxuICAgIGdldCBwb2x5ZmlsbFN0cmluZygpIHtcbiAgICAgIHJldHVybiBwb2x5ZmlsbFN0cmluZztcbiAgICB9XG4gIH07XG59KTtcblN5c3RlbS5nZXQoXCJ0cmFjZXVyLXJ1bnRpbWVAMC4wLjcyL3NyYy9ydW50aW1lL3BvbHlmaWxscy9TdHJpbmdcIiArICcnKTtcblN5c3RlbS5yZWdpc3RlcihcInRyYWNldXItcnVudGltZUAwLjAuNzIvc3JjL3J1bnRpbWUvcG9seWZpbGxzL0FycmF5SXRlcmF0b3JcIiwgW10sIGZ1bmN0aW9uKCkge1xuICBcInVzZSBzdHJpY3RcIjtcbiAgdmFyICRfXzI7XG4gIHZhciBfX21vZHVsZU5hbWUgPSBcInRyYWNldXItcnVudGltZUAwLjAuNzIvc3JjL3J1bnRpbWUvcG9seWZpbGxzL0FycmF5SXRlcmF0b3JcIjtcbiAgdmFyICRfXzAgPSBTeXN0ZW0uZ2V0KFwidHJhY2V1ci1ydW50aW1lQDAuMC43Mi9zcmMvcnVudGltZS9wb2x5ZmlsbHMvdXRpbHNcIiksXG4gICAgICB0b09iamVjdCA9ICRfXzAudG9PYmplY3QsXG4gICAgICB0b1VpbnQzMiA9ICRfXzAudG9VaW50MzIsXG4gICAgICBjcmVhdGVJdGVyYXRvclJlc3VsdE9iamVjdCA9ICRfXzAuY3JlYXRlSXRlcmF0b3JSZXN1bHRPYmplY3Q7XG4gIHZhciBBUlJBWV9JVEVSQVRPUl9LSU5EX0tFWVMgPSAxO1xuICB2YXIgQVJSQVlfSVRFUkFUT1JfS0lORF9WQUxVRVMgPSAyO1xuICB2YXIgQVJSQVlfSVRFUkFUT1JfS0lORF9FTlRSSUVTID0gMztcbiAgdmFyIEFycmF5SXRlcmF0b3IgPSBmdW5jdGlvbiBBcnJheUl0ZXJhdG9yKCkge307XG4gICgkdHJhY2V1clJ1bnRpbWUuY3JlYXRlQ2xhc3MpKEFycmF5SXRlcmF0b3IsICgkX18yID0ge30sIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSgkX18yLCBcIm5leHRcIiwge1xuICAgIHZhbHVlOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBpdGVyYXRvciA9IHRvT2JqZWN0KHRoaXMpO1xuICAgICAgdmFyIGFycmF5ID0gaXRlcmF0b3IuaXRlcmF0b3JPYmplY3RfO1xuICAgICAgaWYgKCFhcnJheSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdPYmplY3QgaXMgbm90IGFuIEFycmF5SXRlcmF0b3InKTtcbiAgICAgIH1cbiAgICAgIHZhciBpbmRleCA9IGl0ZXJhdG9yLmFycmF5SXRlcmF0b3JOZXh0SW5kZXhfO1xuICAgICAgdmFyIGl0ZW1LaW5kID0gaXRlcmF0b3IuYXJyYXlJdGVyYXRpb25LaW5kXztcbiAgICAgIHZhciBsZW5ndGggPSB0b1VpbnQzMihhcnJheS5sZW5ndGgpO1xuICAgICAgaWYgKGluZGV4ID49IGxlbmd0aCkge1xuICAgICAgICBpdGVyYXRvci5hcnJheUl0ZXJhdG9yTmV4dEluZGV4XyA9IEluZmluaXR5O1xuICAgICAgICByZXR1cm4gY3JlYXRlSXRlcmF0b3JSZXN1bHRPYmplY3QodW5kZWZpbmVkLCB0cnVlKTtcbiAgICAgIH1cbiAgICAgIGl0ZXJhdG9yLmFycmF5SXRlcmF0b3JOZXh0SW5kZXhfID0gaW5kZXggKyAxO1xuICAgICAgaWYgKGl0ZW1LaW5kID09IEFSUkFZX0lURVJBVE9SX0tJTkRfVkFMVUVTKVxuICAgICAgICByZXR1cm4gY3JlYXRlSXRlcmF0b3JSZXN1bHRPYmplY3QoYXJyYXlbaW5kZXhdLCBmYWxzZSk7XG4gICAgICBpZiAoaXRlbUtpbmQgPT0gQVJSQVlfSVRFUkFUT1JfS0lORF9FTlRSSUVTKVxuICAgICAgICByZXR1cm4gY3JlYXRlSXRlcmF0b3JSZXN1bHRPYmplY3QoW2luZGV4LCBhcnJheVtpbmRleF1dLCBmYWxzZSk7XG4gICAgICByZXR1cm4gY3JlYXRlSXRlcmF0b3JSZXN1bHRPYmplY3QoaW5kZXgsIGZhbHNlKTtcbiAgICB9LFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgIHdyaXRhYmxlOiB0cnVlXG4gIH0pLCBPYmplY3QuZGVmaW5lUHJvcGVydHkoJF9fMiwgU3ltYm9sLml0ZXJhdG9yLCB7XG4gICAgdmFsdWU6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICB3cml0YWJsZTogdHJ1ZVxuICB9KSwgJF9fMiksIHt9KTtcbiAgZnVuY3Rpb24gY3JlYXRlQXJyYXlJdGVyYXRvcihhcnJheSwga2luZCkge1xuICAgIHZhciBvYmplY3QgPSB0b09iamVjdChhcnJheSk7XG4gICAgdmFyIGl0ZXJhdG9yID0gbmV3IEFycmF5SXRlcmF0b3I7XG4gICAgaXRlcmF0b3IuaXRlcmF0b3JPYmplY3RfID0gb2JqZWN0O1xuICAgIGl0ZXJhdG9yLmFycmF5SXRlcmF0b3JOZXh0SW5kZXhfID0gMDtcbiAgICBpdGVyYXRvci5hcnJheUl0ZXJhdGlvbktpbmRfID0ga2luZDtcbiAgICByZXR1cm4gaXRlcmF0b3I7XG4gIH1cbiAgZnVuY3Rpb24gZW50cmllcygpIHtcbiAgICByZXR1cm4gY3JlYXRlQXJyYXlJdGVyYXRvcih0aGlzLCBBUlJBWV9JVEVSQVRPUl9LSU5EX0VOVFJJRVMpO1xuICB9XG4gIGZ1bmN0aW9uIGtleXMoKSB7XG4gICAgcmV0dXJuIGNyZWF0ZUFycmF5SXRlcmF0b3IodGhpcywgQVJSQVlfSVRFUkFUT1JfS0lORF9LRVlTKTtcbiAgfVxuICBmdW5jdGlvbiB2YWx1ZXMoKSB7XG4gICAgcmV0dXJuIGNyZWF0ZUFycmF5SXRlcmF0b3IodGhpcywgQVJSQVlfSVRFUkFUT1JfS0lORF9WQUxVRVMpO1xuICB9XG4gIHJldHVybiB7XG4gICAgZ2V0IGVudHJpZXMoKSB7XG4gICAgICByZXR1cm4gZW50cmllcztcbiAgICB9LFxuICAgIGdldCBrZXlzKCkge1xuICAgICAgcmV0dXJuIGtleXM7XG4gICAgfSxcbiAgICBnZXQgdmFsdWVzKCkge1xuICAgICAgcmV0dXJuIHZhbHVlcztcbiAgICB9XG4gIH07XG59KTtcblN5c3RlbS5yZWdpc3RlcihcInRyYWNldXItcnVudGltZUAwLjAuNzIvc3JjL3J1bnRpbWUvcG9seWZpbGxzL0FycmF5XCIsIFtdLCBmdW5jdGlvbigpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG4gIHZhciBfX21vZHVsZU5hbWUgPSBcInRyYWNldXItcnVudGltZUAwLjAuNzIvc3JjL3J1bnRpbWUvcG9seWZpbGxzL0FycmF5XCI7XG4gIHZhciAkX18wID0gU3lzdGVtLmdldChcInRyYWNldXItcnVudGltZUAwLjAuNzIvc3JjL3J1bnRpbWUvcG9seWZpbGxzL0FycmF5SXRlcmF0b3JcIiksXG4gICAgICBlbnRyaWVzID0gJF9fMC5lbnRyaWVzLFxuICAgICAga2V5cyA9ICRfXzAua2V5cyxcbiAgICAgIHZhbHVlcyA9ICRfXzAudmFsdWVzO1xuICB2YXIgJF9fMSA9IFN5c3RlbS5nZXQoXCJ0cmFjZXVyLXJ1bnRpbWVAMC4wLjcyL3NyYy9ydW50aW1lL3BvbHlmaWxscy91dGlsc1wiKSxcbiAgICAgIGNoZWNrSXRlcmFibGUgPSAkX18xLmNoZWNrSXRlcmFibGUsXG4gICAgICBpc0NhbGxhYmxlID0gJF9fMS5pc0NhbGxhYmxlLFxuICAgICAgaXNDb25zdHJ1Y3RvciA9ICRfXzEuaXNDb25zdHJ1Y3RvcixcbiAgICAgIG1heWJlQWRkRnVuY3Rpb25zID0gJF9fMS5tYXliZUFkZEZ1bmN0aW9ucyxcbiAgICAgIG1heWJlQWRkSXRlcmF0b3IgPSAkX18xLm1heWJlQWRkSXRlcmF0b3IsXG4gICAgICByZWdpc3RlclBvbHlmaWxsID0gJF9fMS5yZWdpc3RlclBvbHlmaWxsLFxuICAgICAgdG9JbnRlZ2VyID0gJF9fMS50b0ludGVnZXIsXG4gICAgICB0b0xlbmd0aCA9ICRfXzEudG9MZW5ndGgsXG4gICAgICB0b09iamVjdCA9ICRfXzEudG9PYmplY3Q7XG4gIGZ1bmN0aW9uIGZyb20oYXJyTGlrZSkge1xuICAgIHZhciBtYXBGbiA9IGFyZ3VtZW50c1sxXTtcbiAgICB2YXIgdGhpc0FyZyA9IGFyZ3VtZW50c1syXTtcbiAgICB2YXIgQyA9IHRoaXM7XG4gICAgdmFyIGl0ZW1zID0gdG9PYmplY3QoYXJyTGlrZSk7XG4gICAgdmFyIG1hcHBpbmcgPSBtYXBGbiAhPT0gdW5kZWZpbmVkO1xuICAgIHZhciBrID0gMDtcbiAgICB2YXIgYXJyLFxuICAgICAgICBsZW47XG4gICAgaWYgKG1hcHBpbmcgJiYgIWlzQ2FsbGFibGUobWFwRm4pKSB7XG4gICAgICB0aHJvdyBUeXBlRXJyb3IoKTtcbiAgICB9XG4gICAgaWYgKGNoZWNrSXRlcmFibGUoaXRlbXMpKSB7XG4gICAgICBhcnIgPSBpc0NvbnN0cnVjdG9yKEMpID8gbmV3IEMoKSA6IFtdO1xuICAgICAgZm9yICh2YXIgJF9fMiA9IGl0ZW1zW1N5bWJvbC5pdGVyYXRvcl0oKSxcbiAgICAgICAgICAkX18zOyAhKCRfXzMgPSAkX18yLm5leHQoKSkuZG9uZTsgKSB7XG4gICAgICAgIHZhciBpdGVtID0gJF9fMy52YWx1ZTtcbiAgICAgICAge1xuICAgICAgICAgIGlmIChtYXBwaW5nKSB7XG4gICAgICAgICAgICBhcnJba10gPSBtYXBGbi5jYWxsKHRoaXNBcmcsIGl0ZW0sIGspO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhcnJba10gPSBpdGVtO1xuICAgICAgICAgIH1cbiAgICAgICAgICBrKys7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGFyci5sZW5ndGggPSBrO1xuICAgICAgcmV0dXJuIGFycjtcbiAgICB9XG4gICAgbGVuID0gdG9MZW5ndGgoaXRlbXMubGVuZ3RoKTtcbiAgICBhcnIgPSBpc0NvbnN0cnVjdG9yKEMpID8gbmV3IEMobGVuKSA6IG5ldyBBcnJheShsZW4pO1xuICAgIGZvciAoOyBrIDwgbGVuOyBrKyspIHtcbiAgICAgIGlmIChtYXBwaW5nKSB7XG4gICAgICAgIGFycltrXSA9IHR5cGVvZiB0aGlzQXJnID09PSAndW5kZWZpbmVkJyA/IG1hcEZuKGl0ZW1zW2tdLCBrKSA6IG1hcEZuLmNhbGwodGhpc0FyZywgaXRlbXNba10sIGspO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYXJyW2tdID0gaXRlbXNba107XG4gICAgICB9XG4gICAgfVxuICAgIGFyci5sZW5ndGggPSBsZW47XG4gICAgcmV0dXJuIGFycjtcbiAgfVxuICBmdW5jdGlvbiBvZigpIHtcbiAgICBmb3IgKHZhciBpdGVtcyA9IFtdLFxuICAgICAgICAkX180ID0gMDsgJF9fNCA8IGFyZ3VtZW50cy5sZW5ndGg7ICRfXzQrKylcbiAgICAgIGl0ZW1zWyRfXzRdID0gYXJndW1lbnRzWyRfXzRdO1xuICAgIHZhciBDID0gdGhpcztcbiAgICB2YXIgbGVuID0gaXRlbXMubGVuZ3RoO1xuICAgIHZhciBhcnIgPSBpc0NvbnN0cnVjdG9yKEMpID8gbmV3IEMobGVuKSA6IG5ldyBBcnJheShsZW4pO1xuICAgIGZvciAodmFyIGsgPSAwOyBrIDwgbGVuOyBrKyspIHtcbiAgICAgIGFycltrXSA9IGl0ZW1zW2tdO1xuICAgIH1cbiAgICBhcnIubGVuZ3RoID0gbGVuO1xuICAgIHJldHVybiBhcnI7XG4gIH1cbiAgZnVuY3Rpb24gZmlsbCh2YWx1ZSkge1xuICAgIHZhciBzdGFydCA9IGFyZ3VtZW50c1sxXSAhPT0gKHZvaWQgMCkgPyBhcmd1bWVudHNbMV0gOiAwO1xuICAgIHZhciBlbmQgPSBhcmd1bWVudHNbMl07XG4gICAgdmFyIG9iamVjdCA9IHRvT2JqZWN0KHRoaXMpO1xuICAgIHZhciBsZW4gPSB0b0xlbmd0aChvYmplY3QubGVuZ3RoKTtcbiAgICB2YXIgZmlsbFN0YXJ0ID0gdG9JbnRlZ2VyKHN0YXJ0KTtcbiAgICB2YXIgZmlsbEVuZCA9IGVuZCAhPT0gdW5kZWZpbmVkID8gdG9JbnRlZ2VyKGVuZCkgOiBsZW47XG4gICAgZmlsbFN0YXJ0ID0gZmlsbFN0YXJ0IDwgMCA/IE1hdGgubWF4KGxlbiArIGZpbGxTdGFydCwgMCkgOiBNYXRoLm1pbihmaWxsU3RhcnQsIGxlbik7XG4gICAgZmlsbEVuZCA9IGZpbGxFbmQgPCAwID8gTWF0aC5tYXgobGVuICsgZmlsbEVuZCwgMCkgOiBNYXRoLm1pbihmaWxsRW5kLCBsZW4pO1xuICAgIHdoaWxlIChmaWxsU3RhcnQgPCBmaWxsRW5kKSB7XG4gICAgICBvYmplY3RbZmlsbFN0YXJ0XSA9IHZhbHVlO1xuICAgICAgZmlsbFN0YXJ0Kys7XG4gICAgfVxuICAgIHJldHVybiBvYmplY3Q7XG4gIH1cbiAgZnVuY3Rpb24gZmluZChwcmVkaWNhdGUpIHtcbiAgICB2YXIgdGhpc0FyZyA9IGFyZ3VtZW50c1sxXTtcbiAgICByZXR1cm4gZmluZEhlbHBlcih0aGlzLCBwcmVkaWNhdGUsIHRoaXNBcmcpO1xuICB9XG4gIGZ1bmN0aW9uIGZpbmRJbmRleChwcmVkaWNhdGUpIHtcbiAgICB2YXIgdGhpc0FyZyA9IGFyZ3VtZW50c1sxXTtcbiAgICByZXR1cm4gZmluZEhlbHBlcih0aGlzLCBwcmVkaWNhdGUsIHRoaXNBcmcsIHRydWUpO1xuICB9XG4gIGZ1bmN0aW9uIGZpbmRIZWxwZXIoc2VsZiwgcHJlZGljYXRlKSB7XG4gICAgdmFyIHRoaXNBcmcgPSBhcmd1bWVudHNbMl07XG4gICAgdmFyIHJldHVybkluZGV4ID0gYXJndW1lbnRzWzNdICE9PSAodm9pZCAwKSA/IGFyZ3VtZW50c1szXSA6IGZhbHNlO1xuICAgIHZhciBvYmplY3QgPSB0b09iamVjdChzZWxmKTtcbiAgICB2YXIgbGVuID0gdG9MZW5ndGgob2JqZWN0Lmxlbmd0aCk7XG4gICAgaWYgKCFpc0NhbGxhYmxlKHByZWRpY2F0ZSkpIHtcbiAgICAgIHRocm93IFR5cGVFcnJvcigpO1xuICAgIH1cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICB2YXIgdmFsdWUgPSBvYmplY3RbaV07XG4gICAgICBpZiAocHJlZGljYXRlLmNhbGwodGhpc0FyZywgdmFsdWUsIGksIG9iamVjdCkpIHtcbiAgICAgICAgcmV0dXJuIHJldHVybkluZGV4ID8gaSA6IHZhbHVlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmV0dXJuSW5kZXggPyAtMSA6IHVuZGVmaW5lZDtcbiAgfVxuICBmdW5jdGlvbiBwb2x5ZmlsbEFycmF5KGdsb2JhbCkge1xuICAgIHZhciAkX181ID0gZ2xvYmFsLFxuICAgICAgICBBcnJheSA9ICRfXzUuQXJyYXksXG4gICAgICAgIE9iamVjdCA9ICRfXzUuT2JqZWN0LFxuICAgICAgICBTeW1ib2wgPSAkX181LlN5bWJvbDtcbiAgICBtYXliZUFkZEZ1bmN0aW9ucyhBcnJheS5wcm90b3R5cGUsIFsnZW50cmllcycsIGVudHJpZXMsICdrZXlzJywga2V5cywgJ3ZhbHVlcycsIHZhbHVlcywgJ2ZpbGwnLCBmaWxsLCAnZmluZCcsIGZpbmQsICdmaW5kSW5kZXgnLCBmaW5kSW5kZXhdKTtcbiAgICBtYXliZUFkZEZ1bmN0aW9ucyhBcnJheSwgWydmcm9tJywgZnJvbSwgJ29mJywgb2ZdKTtcbiAgICBtYXliZUFkZEl0ZXJhdG9yKEFycmF5LnByb3RvdHlwZSwgdmFsdWVzLCBTeW1ib2wpO1xuICAgIG1heWJlQWRkSXRlcmF0b3IoT2JqZWN0LmdldFByb3RvdHlwZU9mKFtdLnZhbHVlcygpKSwgZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LCBTeW1ib2wpO1xuICB9XG4gIHJlZ2lzdGVyUG9seWZpbGwocG9seWZpbGxBcnJheSk7XG4gIHJldHVybiB7XG4gICAgZ2V0IGZyb20oKSB7XG4gICAgICByZXR1cm4gZnJvbTtcbiAgICB9LFxuICAgIGdldCBvZigpIHtcbiAgICAgIHJldHVybiBvZjtcbiAgICB9LFxuICAgIGdldCBmaWxsKCkge1xuICAgICAgcmV0dXJuIGZpbGw7XG4gICAgfSxcbiAgICBnZXQgZmluZCgpIHtcbiAgICAgIHJldHVybiBmaW5kO1xuICAgIH0sXG4gICAgZ2V0IGZpbmRJbmRleCgpIHtcbiAgICAgIHJldHVybiBmaW5kSW5kZXg7XG4gICAgfSxcbiAgICBnZXQgcG9seWZpbGxBcnJheSgpIHtcbiAgICAgIHJldHVybiBwb2x5ZmlsbEFycmF5O1xuICAgIH1cbiAgfTtcbn0pO1xuU3lzdGVtLmdldChcInRyYWNldXItcnVudGltZUAwLjAuNzIvc3JjL3J1bnRpbWUvcG9seWZpbGxzL0FycmF5XCIgKyAnJyk7XG5TeXN0ZW0ucmVnaXN0ZXIoXCJ0cmFjZXVyLXJ1bnRpbWVAMC4wLjcyL3NyYy9ydW50aW1lL3BvbHlmaWxscy9PYmplY3RcIiwgW10sIGZ1bmN0aW9uKCkge1xuICBcInVzZSBzdHJpY3RcIjtcbiAgdmFyIF9fbW9kdWxlTmFtZSA9IFwidHJhY2V1ci1ydW50aW1lQDAuMC43Mi9zcmMvcnVudGltZS9wb2x5ZmlsbHMvT2JqZWN0XCI7XG4gIHZhciAkX18wID0gU3lzdGVtLmdldChcInRyYWNldXItcnVudGltZUAwLjAuNzIvc3JjL3J1bnRpbWUvcG9seWZpbGxzL3V0aWxzXCIpLFxuICAgICAgbWF5YmVBZGRGdW5jdGlvbnMgPSAkX18wLm1heWJlQWRkRnVuY3Rpb25zLFxuICAgICAgcmVnaXN0ZXJQb2x5ZmlsbCA9ICRfXzAucmVnaXN0ZXJQb2x5ZmlsbDtcbiAgdmFyICRfXzEgPSAkdHJhY2V1clJ1bnRpbWUsXG4gICAgICBkZWZpbmVQcm9wZXJ0eSA9ICRfXzEuZGVmaW5lUHJvcGVydHksXG4gICAgICBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IgPSAkX18xLmdldE93blByb3BlcnR5RGVzY3JpcHRvcixcbiAgICAgIGdldE93blByb3BlcnR5TmFtZXMgPSAkX18xLmdldE93blByb3BlcnR5TmFtZXMsXG4gICAgICBpc1ByaXZhdGVOYW1lID0gJF9fMS5pc1ByaXZhdGVOYW1lLFxuICAgICAga2V5cyA9ICRfXzEua2V5cztcbiAgZnVuY3Rpb24gaXMobGVmdCwgcmlnaHQpIHtcbiAgICBpZiAobGVmdCA9PT0gcmlnaHQpXG4gICAgICByZXR1cm4gbGVmdCAhPT0gMCB8fCAxIC8gbGVmdCA9PT0gMSAvIHJpZ2h0O1xuICAgIHJldHVybiBsZWZ0ICE9PSBsZWZ0ICYmIHJpZ2h0ICE9PSByaWdodDtcbiAgfVxuICBmdW5jdGlvbiBhc3NpZ24odGFyZ2V0KSB7XG4gICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07XG4gICAgICB2YXIgcHJvcHMgPSBrZXlzKHNvdXJjZSk7XG4gICAgICB2YXIgcCxcbiAgICAgICAgICBsZW5ndGggPSBwcm9wcy5sZW5ndGg7XG4gICAgICBmb3IgKHAgPSAwOyBwIDwgbGVuZ3RoOyBwKyspIHtcbiAgICAgICAgdmFyIG5hbWUgPSBwcm9wc1twXTtcbiAgICAgICAgaWYgKGlzUHJpdmF0ZU5hbWUobmFtZSkpXG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIHRhcmdldFtuYW1lXSA9IHNvdXJjZVtuYW1lXTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRhcmdldDtcbiAgfVxuICBmdW5jdGlvbiBtaXhpbih0YXJnZXQsIHNvdXJjZSkge1xuICAgIHZhciBwcm9wcyA9IGdldE93blByb3BlcnR5TmFtZXMoc291cmNlKTtcbiAgICB2YXIgcCxcbiAgICAgICAgZGVzY3JpcHRvcixcbiAgICAgICAgbGVuZ3RoID0gcHJvcHMubGVuZ3RoO1xuICAgIGZvciAocCA9IDA7IHAgPCBsZW5ndGg7IHArKykge1xuICAgICAgdmFyIG5hbWUgPSBwcm9wc1twXTtcbiAgICAgIGlmIChpc1ByaXZhdGVOYW1lKG5hbWUpKVxuICAgICAgICBjb250aW51ZTtcbiAgICAgIGRlc2NyaXB0b3IgPSBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Ioc291cmNlLCBwcm9wc1twXSk7XG4gICAgICBkZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIHByb3BzW3BdLCBkZXNjcmlwdG9yKTtcbiAgICB9XG4gICAgcmV0dXJuIHRhcmdldDtcbiAgfVxuICBmdW5jdGlvbiBwb2x5ZmlsbE9iamVjdChnbG9iYWwpIHtcbiAgICB2YXIgT2JqZWN0ID0gZ2xvYmFsLk9iamVjdDtcbiAgICBtYXliZUFkZEZ1bmN0aW9ucyhPYmplY3QsIFsnYXNzaWduJywgYXNzaWduLCAnaXMnLCBpcywgJ21peGluJywgbWl4aW5dKTtcbiAgfVxuICByZWdpc3RlclBvbHlmaWxsKHBvbHlmaWxsT2JqZWN0KTtcbiAgcmV0dXJuIHtcbiAgICBnZXQgaXMoKSB7XG4gICAgICByZXR1cm4gaXM7XG4gICAgfSxcbiAgICBnZXQgYXNzaWduKCkge1xuICAgICAgcmV0dXJuIGFzc2lnbjtcbiAgICB9LFxuICAgIGdldCBtaXhpbigpIHtcbiAgICAgIHJldHVybiBtaXhpbjtcbiAgICB9LFxuICAgIGdldCBwb2x5ZmlsbE9iamVjdCgpIHtcbiAgICAgIHJldHVybiBwb2x5ZmlsbE9iamVjdDtcbiAgICB9XG4gIH07XG59KTtcblN5c3RlbS5nZXQoXCJ0cmFjZXVyLXJ1bnRpbWVAMC4wLjcyL3NyYy9ydW50aW1lL3BvbHlmaWxscy9PYmplY3RcIiArICcnKTtcblN5c3RlbS5yZWdpc3RlcihcInRyYWNldXItcnVudGltZUAwLjAuNzIvc3JjL3J1bnRpbWUvcG9seWZpbGxzL051bWJlclwiLCBbXSwgZnVuY3Rpb24oKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuICB2YXIgX19tb2R1bGVOYW1lID0gXCJ0cmFjZXVyLXJ1bnRpbWVAMC4wLjcyL3NyYy9ydW50aW1lL3BvbHlmaWxscy9OdW1iZXJcIjtcbiAgdmFyICRfXzAgPSBTeXN0ZW0uZ2V0KFwidHJhY2V1ci1ydW50aW1lQDAuMC43Mi9zcmMvcnVudGltZS9wb2x5ZmlsbHMvdXRpbHNcIiksXG4gICAgICBpc051bWJlciA9ICRfXzAuaXNOdW1iZXIsXG4gICAgICBtYXliZUFkZENvbnN0cyA9ICRfXzAubWF5YmVBZGRDb25zdHMsXG4gICAgICBtYXliZUFkZEZ1bmN0aW9ucyA9ICRfXzAubWF5YmVBZGRGdW5jdGlvbnMsXG4gICAgICByZWdpc3RlclBvbHlmaWxsID0gJF9fMC5yZWdpc3RlclBvbHlmaWxsLFxuICAgICAgdG9JbnRlZ2VyID0gJF9fMC50b0ludGVnZXI7XG4gIHZhciAkYWJzID0gTWF0aC5hYnM7XG4gIHZhciAkaXNGaW5pdGUgPSBpc0Zpbml0ZTtcbiAgdmFyICRpc05hTiA9IGlzTmFOO1xuICB2YXIgTUFYX1NBRkVfSU5URUdFUiA9IE1hdGgucG93KDIsIDUzKSAtIDE7XG4gIHZhciBNSU5fU0FGRV9JTlRFR0VSID0gLU1hdGgucG93KDIsIDUzKSArIDE7XG4gIHZhciBFUFNJTE9OID0gTWF0aC5wb3coMiwgLTUyKTtcbiAgZnVuY3Rpb24gTnVtYmVySXNGaW5pdGUobnVtYmVyKSB7XG4gICAgcmV0dXJuIGlzTnVtYmVyKG51bWJlcikgJiYgJGlzRmluaXRlKG51bWJlcik7XG4gIH1cbiAgO1xuICBmdW5jdGlvbiBpc0ludGVnZXIobnVtYmVyKSB7XG4gICAgcmV0dXJuIE51bWJlcklzRmluaXRlKG51bWJlcikgJiYgdG9JbnRlZ2VyKG51bWJlcikgPT09IG51bWJlcjtcbiAgfVxuICBmdW5jdGlvbiBOdW1iZXJJc05hTihudW1iZXIpIHtcbiAgICByZXR1cm4gaXNOdW1iZXIobnVtYmVyKSAmJiAkaXNOYU4obnVtYmVyKTtcbiAgfVxuICA7XG4gIGZ1bmN0aW9uIGlzU2FmZUludGVnZXIobnVtYmVyKSB7XG4gICAgaWYgKE51bWJlcklzRmluaXRlKG51bWJlcikpIHtcbiAgICAgIHZhciBpbnRlZ3JhbCA9IHRvSW50ZWdlcihudW1iZXIpO1xuICAgICAgaWYgKGludGVncmFsID09PSBudW1iZXIpXG4gICAgICAgIHJldHVybiAkYWJzKGludGVncmFsKSA8PSBNQVhfU0FGRV9JTlRFR0VSO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgZnVuY3Rpb24gcG9seWZpbGxOdW1iZXIoZ2xvYmFsKSB7XG4gICAgdmFyIE51bWJlciA9IGdsb2JhbC5OdW1iZXI7XG4gICAgbWF5YmVBZGRDb25zdHMoTnVtYmVyLCBbJ01BWF9TQUZFX0lOVEVHRVInLCBNQVhfU0FGRV9JTlRFR0VSLCAnTUlOX1NBRkVfSU5URUdFUicsIE1JTl9TQUZFX0lOVEVHRVIsICdFUFNJTE9OJywgRVBTSUxPTl0pO1xuICAgIG1heWJlQWRkRnVuY3Rpb25zKE51bWJlciwgWydpc0Zpbml0ZScsIE51bWJlcklzRmluaXRlLCAnaXNJbnRlZ2VyJywgaXNJbnRlZ2VyLCAnaXNOYU4nLCBOdW1iZXJJc05hTiwgJ2lzU2FmZUludGVnZXInLCBpc1NhZmVJbnRlZ2VyXSk7XG4gIH1cbiAgcmVnaXN0ZXJQb2x5ZmlsbChwb2x5ZmlsbE51bWJlcik7XG4gIHJldHVybiB7XG4gICAgZ2V0IE1BWF9TQUZFX0lOVEVHRVIoKSB7XG4gICAgICByZXR1cm4gTUFYX1NBRkVfSU5URUdFUjtcbiAgICB9LFxuICAgIGdldCBNSU5fU0FGRV9JTlRFR0VSKCkge1xuICAgICAgcmV0dXJuIE1JTl9TQUZFX0lOVEVHRVI7XG4gICAgfSxcbiAgICBnZXQgRVBTSUxPTigpIHtcbiAgICAgIHJldHVybiBFUFNJTE9OO1xuICAgIH0sXG4gICAgZ2V0IGlzRmluaXRlKCkge1xuICAgICAgcmV0dXJuIE51bWJlcklzRmluaXRlO1xuICAgIH0sXG4gICAgZ2V0IGlzSW50ZWdlcigpIHtcbiAgICAgIHJldHVybiBpc0ludGVnZXI7XG4gICAgfSxcbiAgICBnZXQgaXNOYU4oKSB7XG4gICAgICByZXR1cm4gTnVtYmVySXNOYU47XG4gICAgfSxcbiAgICBnZXQgaXNTYWZlSW50ZWdlcigpIHtcbiAgICAgIHJldHVybiBpc1NhZmVJbnRlZ2VyO1xuICAgIH0sXG4gICAgZ2V0IHBvbHlmaWxsTnVtYmVyKCkge1xuICAgICAgcmV0dXJuIHBvbHlmaWxsTnVtYmVyO1xuICAgIH1cbiAgfTtcbn0pO1xuU3lzdGVtLmdldChcInRyYWNldXItcnVudGltZUAwLjAuNzIvc3JjL3J1bnRpbWUvcG9seWZpbGxzL051bWJlclwiICsgJycpO1xuU3lzdGVtLnJlZ2lzdGVyKFwidHJhY2V1ci1ydW50aW1lQDAuMC43Mi9zcmMvcnVudGltZS9wb2x5ZmlsbHMvcG9seWZpbGxzXCIsIFtdLCBmdW5jdGlvbigpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG4gIHZhciBfX21vZHVsZU5hbWUgPSBcInRyYWNldXItcnVudGltZUAwLjAuNzIvc3JjL3J1bnRpbWUvcG9seWZpbGxzL3BvbHlmaWxsc1wiO1xuICB2YXIgcG9seWZpbGxBbGwgPSBTeXN0ZW0uZ2V0KFwidHJhY2V1ci1ydW50aW1lQDAuMC43Mi9zcmMvcnVudGltZS9wb2x5ZmlsbHMvdXRpbHNcIikucG9seWZpbGxBbGw7XG4gIHBvbHlmaWxsQWxsKHRoaXMpO1xuICB2YXIgc2V0dXBHbG9iYWxzID0gJHRyYWNldXJSdW50aW1lLnNldHVwR2xvYmFscztcbiAgJHRyYWNldXJSdW50aW1lLnNldHVwR2xvYmFscyA9IGZ1bmN0aW9uKGdsb2JhbCkge1xuICAgIHNldHVwR2xvYmFscyhnbG9iYWwpO1xuICAgIHBvbHlmaWxsQWxsKGdsb2JhbCk7XG4gIH07XG4gIHJldHVybiB7fTtcbn0pO1xuU3lzdGVtLmdldChcInRyYWNldXItcnVudGltZUAwLjAuNzIvc3JjL3J1bnRpbWUvcG9seWZpbGxzL3BvbHlmaWxsc1wiICsgJycpO1xuXG59KS5jYWxsKHRoaXMscmVxdWlyZSgnX3Byb2Nlc3MnKSx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsImltcG9ydCB7Q29sb3JzfSBmcm9tICcuLi91dGlscy9jb2xvcnMnO1xuXG5mdW5jdGlvbiBnZXRIZWlnaHQgKGVsZW1lbnQsIGhlaWdodCA9ICdhdXRvJykge1xuICAgIGlmIChoZWlnaHQgPT09ICdhdXRvJykge1xuICAgICAgICByZXR1cm4gZWxlbWVudC5oZWlnaHQoKSA+IDE0MCA/IGVsZW1lbnQuaGVpZ2h0KCkgLSA1MCA6IDMwMDtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gaGVpZ2h0O1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZ2V0V2lkdGggKGVsZW1lbnQsIHdpZHRoID0gJ2F1dG8nKSB7XG4gICAgaWYgKHdpZHRoID09PSAnYXV0bycpIHtcbiAgICAgICAgcmV0dXJuIGVsZW1lbnQud2lkdGgoKSA+IDkwID8gZWxlbWVudC53aWR0aCgpIC0gNTAgOiAzMDA7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHdpZHRoO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIENoYXJ0anNBZGFwdGVyIHtcblxuICAgIHJlbmRlckdyYXBoVG9DYW52YXMoY2FudmFzLCBncmFwaCkge1xuICAgICAgbGV0IGdldENoYXJ0RGF0YSA9IGZ1bmN0aW9uKGdyYXBoKSB7XG4gICAgICAgICAgICAgICAgbGV0IGluZGV4ID0gMCxcbiAgICAgICAgICAgICAgICAgICAgY29sb3JzID0gbmV3IENvbG9ycygpLFxuICAgICAgICAgICAgICAgICAgICBjb2xvclNjaGVtZSA9IGNvbG9ycy5kZWZhdWx0U2NoZW1lKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgbGFiZWxzOiBncmFwaC5sYWJlbHMsXG4gICAgICAgICAgICAgICAgICAgIGRhdGFzZXRzOiBncmFwaC5kYXRhc2V0cy5tYXAoZGF0YXNldCA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgY29sb3JJbmRleCA9IGluZGV4ICUgY29sb3JTY2hlbWUubGVuZ3RoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJnYkNvbG9yID0gY29sb3JzLmhleFRvUmdiKGNvbG9yU2NoZW1lW2NvbG9ySW5kZXhdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFzZXQuZmlsbENvbG9yID0gY29sb3JzLnJnYlRvU3RyaW5nKHJnYkNvbG9yLCAwLjIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YXNldC5zdHJva2VDb2xvciA9IGNvbG9ycy5yZ2JUb1N0cmluZyhyZ2JDb2xvciwgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhc2V0LnBvaW50Q29sb3IgPSBjb2xvcnMucmdiVG9TdHJpbmcocmdiQ29sb3IsIDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YXNldC5wb2ludFN0cm9rZUNvbG9yID0gY29sb3JzLnJnYlRvU3RyaW5nKHJnYkNvbG9yLCAwLjEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YXNldC5wb2ludEhpZ2hsaWdodEZpbGwgPSBjb2xvcnMucmdiVG9TdHJpbmcocmdiQ29sb3IsIDAuMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhc2V0LnBvaW50SGlnaGxpZ2h0U3Ryb2tlID0gY29sb3JzLnJnYlRvU3RyaW5nKHJnYkNvbG9yLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4Kys7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBkYXRhc2V0O1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgIGxldCBjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyksXG4gICAgICAgICAgICBjaGFydCA9IG5ldyBDaGFydChjb250ZXh0KSxcbiAgICAgICAgICAgIGNoYXJ0T3B0aW9ucyA9IHtcbiAgICAgICAgICAgICAgbGVnZW5kVGVtcGxhdGUgOiAnPHVsIGNsYXNzPVwiY2hhcnRqcy1sZWdlbmQgPCU9bmFtZS50b0xvd2VyQ2FzZSgpJT4tbGVnZW5kXCI+PCUgZm9yICh2YXIgaT0wOyBpPGRhdGFzZXRzLmxlbmd0aDsgaSsrKXslPjxsaT48c3BhbiBjbGFzcz1cInBpbGxcIiBzdHlsZT1cImJhY2tncm91bmQtY29sb3I6PCU9ZGF0YXNldHNbaV0uc3Ryb2tlQ29sb3IlPlwiPjwvc3Bhbj48JWlmKGRhdGFzZXRzW2ldLmxhYmVsKXslPjwlPWRhdGFzZXRzW2ldLmxhYmVsJT48JX0lPjwvbGk+PCV9JT48L3VsPidcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgc3dpdGNoIChncmFwaC5ncmFwaFR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ2xpbmUnOlxuICAgICAgICAgICAgICAgIGNoYXJ0ID0gY2hhcnQuTGluZShnZXRDaGFydERhdGEoZ3JhcGgpLCBjaGFydE9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnYmFyJzpcbiAgICAgICAgICAgICAgICBjaGFydCA9IGNoYXJ0LkJhcihnZXRDaGFydERhdGEoZ3JhcGgpLCBjaGFydE9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAncmFkYXInOlxuICAgICAgICAgICAgICAgIGNoYXJ0ID0gY2hhcnQuUmFkYXIoZ2V0Q2hhcnREYXRhKGdyYXBoKSwgY2hhcnRPcHRpb25zKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgdGhyb3cgRXJyb3IoJ1Vua25vd24gZ3JhcGggdHlwZSBcIicgKyBncmFwaC5ncmFwaFR5cGUgKyAnXCInKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBjaGFydDtcbiAgICB9XG5cbiAgICByZW5kZXJTZWdtZW50R3JhcGhUb0NhbnZhcyhjYW52YXMsIGdyYXBoKSB7XG4gICAgICBsZXQgZ2V0Q2hhcnREYXRhID0gZnVuY3Rpb24oZ3JhcGgpIHtcbiAgICAgICAgICAgICAgICBsZXQgaW5kZXggPSAwLFxuICAgICAgICAgICAgICAgICAgICBjb2xvcnMgPSBuZXcgQ29sb3JzKCksXG4gICAgICAgICAgICAgICAgICAgIGNvbG9yU2NoZW1lID0gY29sb3JzLmRlZmF1bHRTY2hlbWUoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZ3JhcGgubGFiZWxzLm1hcChsYWJlbCA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBjb2xvckluZGV4ID0gaW5kZXggJSBjb2xvclNjaGVtZS5sZW5ndGgsXG4gICAgICAgICAgICAgICAgICAgICAgICByZ2JDb2xvciA9IGNvbG9ycy5oZXhUb1JnYihjb2xvclNjaGVtZVtjb2xvckluZGV4XSk7XG4gICAgICAgICAgICAgICAgICAgIGxhYmVsLmNvbG9yID0gY29sb3JzLnJnYlRvU3RyaW5nKHJnYkNvbG9yLCAwLjgpO1xuICAgICAgICAgICAgICAgICAgICBsYWJlbC5oaWdobGlnaHQgPSBjb2xvcnMucmdiVG9TdHJpbmcocmdiQ29sb3IsIDEpO1xuICAgICAgICAgICAgICAgICAgICBpbmRleCsrO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsYWJlbDtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgbGV0IGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKSxcbiAgICAgICAgICAgIGNoYXJ0ID0gbmV3IENoYXJ0KGNvbnRleHQpLFxuICAgICAgICAgICAgY2hhcnRPcHRpb25zID0ge1xuICAgICAgICAgICAgICBsZWdlbmRUZW1wbGF0ZSA6ICc8dWwgY2xhc3M9XCJjaGFydGpzLWxlZ2VuZCA8JT1uYW1lLnRvTG93ZXJDYXNlKCklPi1sZWdlbmRcIj48JSBmb3IgKHZhciBpPTA7IGk8c2VnbWVudHMubGVuZ3RoOyBpKyspeyU+PGxpPjxzcGFuIGNsYXNzPVwicGlsbFwiIHN0eWxlPVwiYmFja2dyb3VuZC1jb2xvcjo8JT1zZWdtZW50c1tpXS5maWxsQ29sb3IlPlwiPjwvc3Bhbj48JWlmKHNlZ21lbnRzW2ldLmxhYmVsKXslPjwlPXNlZ21lbnRzW2ldLmxhYmVsJT48JX0lPjwvbGk+PCV9JT48L3VsPidcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgc3dpdGNoIChncmFwaC5ncmFwaFR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ3BpZSc6XG4gICAgICAgICAgICAgICAgY2hhcnQgPSBjaGFydC5QaWUoZ2V0Q2hhcnREYXRhKGdyYXBoKSwgY2hhcnRPcHRpb25zKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3BvbGFyQXJlYSc6XG4gICAgICAgICAgICAgICAgY2hhcnQgPSBjaGFydC5Qb2xhckFyZWEoZ2V0Q2hhcnREYXRhKGdyYXBoKSwgY2hhcnRPcHRpb25zKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2RvdWdobnV0JzpcbiAgICAgICAgICAgICAgICBjaGFydCA9IGNoYXJ0LkRvdWdobnV0KGdldENoYXJ0RGF0YShncmFwaCksIGNoYXJ0T3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHRocm93IEVycm9yKCdVbmtub3duIHNlZ21lbnQgZ3JhcGggdHlwZSBcIicgKyBncmFwaC5ncmFwaFR5cGUgKyAnXCInKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBjaGFydDtcbiAgICB9XG5cbiAgICByZW5kZXJHcmFwaFRvKGVsZW1lbnQsIGdyYXBoKcKge1xuICAgICAgICBlbGVtZW50LnByZXBlbmQoJzxjYW52YXMgd2lkdGg9XCInK2dldFdpZHRoKGVsZW1lbnQsIGdyYXBoLndpZHRoKSsnXCIgaGVpZ2h0PVwiJytnZXRIZWlnaHQoZWxlbWVudCwgZ3JhcGguaGVpZ2h0KSsnXCI+PC9jYW52YXM+Jyk7XG4gICAgICAgIHZhciBjYW52YXMgPSBlbGVtZW50LmZpbmQoJ2NhbnZhczpmaXJzdCcpLmdldCgwKTtcbiAgICAgICAgdmFyIGNoYXJ0ID0gdGhpcy5yZW5kZXJHcmFwaFRvQ2FudmFzKGNhbnZhcywgZ3JhcGgpO1xuICAgICAgICBlbGVtZW50LmFwcGVuZChjaGFydC5nZW5lcmF0ZUxlZ2VuZCgpKTtcbiAgICB9XG5cbiAgICByZW5kZXJTZWdtZW50R3JhcGhUbyhlbGVtZW50LCBncmFwaCnCoHtcbiAgICAgICAgZWxlbWVudC5wcmVwZW5kKCc8Y2FudmFzIHdpZHRoPVwiJytnZXRXaWR0aChlbGVtZW50LCBncmFwaC53aWR0aCkrJ1wiIGhlaWdodD1cIicrZ2V0SGVpZ2h0KGVsZW1lbnQsIGdyYXBoLmhlaWdodCkrJ1wiPjwvY2FudmFzPicpO1xuICAgICAgICB2YXIgY2FudmFzID0gZWxlbWVudC5maW5kKCdjYW52YXM6Zmlyc3QnKS5nZXQoMCk7XG4gICAgICAgIHZhciBjaGFydCA9IHRoaXMucmVuZGVyU2VnbWVudEdyYXBoVG9DYW52YXMoY2FudmFzLCBncmFwaCk7XG4gICAgICAgIGVsZW1lbnQuYXBwZW5kKGNoYXJ0LmdlbmVyYXRlTGVnZW5kKCkpO1xuICAgIH1cbn1cbiIsImV4cG9ydCBjbGFzcyBKUXVlcnlBZGFwdGVyIHtcbiAgICByZW5kZXJUYWJsZVRvKGVsZW1lbnQsIHRhYmxlKSB7XG4gICAgICBlbGVtZW50Lmh0bWwodGFibGUuZ2V0SHRtbCgpKTtcbiAgICB9XG59XG4iLCJleHBvcnQgY2xhc3MgQ2VsbCB7XG5cbiAgICBjb25zdHJ1Y3RvcihkaW1lbnNpb25WYWx1ZXMsIHZhbHVlKSB7XG4gICAgICAgIHRoaXMuZGltZW5zaW9uVmFsdWVzID0gZGltZW5zaW9uVmFsdWVzO1xuICAgICAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG4gICAgfVxuXG4gICAgZ2V0RGltZW5zaW9uVmFsdWUoZGltZW5zaW9uKSB7XG4gICAgICAgIGlmICghdGhpcy5kaW1lbnNpb25WYWx1ZXMuaGFzKGRpbWVuc2lvbi5pZCkpIHtcbiAgICAgICAgICAgIHRocm93IEVycm9yKCdUaGUgY2VsbCBoYXMgbm8gZGltZW5zaW9uIHZhbHVlIGZvciB0aGUgZGltZW5zaW9uIFwiJyArIGRpbWVuc2lvbi5pZCArICdcIicpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuZGltZW5zaW9uVmFsdWVzLmdldChkaW1lbnNpb24uaWQpO1xuICAgIH1cbn1cbiIsImV4cG9ydCBjbGFzcyBEaW1lbnNpb24ge1xuXG4gICAgY29uc3RydWN0b3IoaWQsIGNhcHRpb24pIHtcbiAgICAgICAgdGhpcy5pZCAgICAgID0gaWQ7XG4gICAgICAgIHRoaXMuY2FwdGlvbiA9IGNhcHRpb24gPT09IHVuZGVmaW5lZCA/IGlkIDogY2FwdGlvbjtcbiAgICB9XG5cbn1cbiIsImV4cG9ydCBjbGFzcyBEaW1lbnNpb25WYWx1ZSB7XG5cbiAgICBjb25zdHJ1Y3RvcihpZCwgY2FwdGlvbikge1xuICAgICAgICB0aGlzLmlkICAgICAgPSBpZDtcbiAgICAgICAgdGhpcy5jYXB0aW9uID0gY2FwdGlvbiA9PT0gdW5kZWZpbmVkID8gaWQgOiBjYXB0aW9uO1xuICAgIH1cblxufVxuIiwiaW1wb3J0IHtNYXBzfSAgICAgICAgICAgZnJvbSAnLi4vdXRpbHMvbWFwcyc7XG5pbXBvcnQge0RpbWVuc2lvbn0gICAgICBmcm9tICcuLi9kYXRhL2RpbWVuc2lvbic7XG5pbXBvcnQge0RpbWVuc2lvblZhbHVlfSBmcm9tICcuLi9kYXRhL2RpbWVuc2lvblZhbHVlJztcbmltcG9ydCB7Q2VsbH0gICAgICAgICAgIGZyb20gJy4uL2RhdGEvY2VsbCc7XG5cbmV4cG9ydCBjbGFzcyBHcmlkIHtcblxuICAgIGNvbnN0cnVjdG9yKGRpbWVuc2lvbnMsIGRpbWVuc2lvblZhbHVlcywgY2VsbHMpIHtcbiAgICAgICAgdGhpcy5jZWxscyA9IGNlbGxzO1xuICAgICAgICB0aGlzLmRpbWVuc2lvbnMgPSBkaW1lbnNpb25zO1xuICAgICAgICB0aGlzLmRpbWVuc2lvblZhbHVlcyA9IGRpbWVuc2lvblZhbHVlcztcbiAgICB9XG5cbiAgICBnZXREaW1lbnNpb24oZGltZW5zaW9uSWQpIHtcbiAgICAgICAgaWYgKCF0aGlzLmRpbWVuc2lvbnMuaGFzKGRpbWVuc2lvbklkKSkge1xuICAgICAgICAgICAgdGhyb3cgRXJyb3IoJ1RoZSBncmlkIGhhcyBubyBkaW1lbnNpb24gXCInICsgZGltZW5zaW9uSWQgKyAnXCInKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLmRpbWVuc2lvbnMuZ2V0KGRpbWVuc2lvbklkKTtcbiAgICB9XG5cbiAgICBnZXREaW1lbnNpb25WYWx1ZXMoZGltZW5zaW9uKSB7XG4gICAgICAgIGlmICghdGhpcy5kaW1lbnNpb25WYWx1ZXMuaGFzKGRpbWVuc2lvbi5pZCkpIHtcbiAgICAgICAgICAgIHRocm93IEVycm9yKCdUaGUgZ3JpZCBoYXMgbm8gZGltZW5zaW9uIHZhbHVlcyBmb3IgdGhlIGRpbWVuc2lvbiBcIicgKyBkaW1lbnNpb24uaWQgKyAnXCInKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLmRpbWVuc2lvblZhbHVlcy5nZXQoZGltZW5zaW9uLmlkKTtcbiAgICB9XG5cbiAgICBnZXREaW1lbmlvblZhbHVlc1NldHMoZGltZW5zaW9ucykge1xuICAgICAgICBsZXQgbWFwVXRpbHMgPSBuZXcgTWFwcygpLFxuICAgICAgICAgICAgZ2V0U2V0cyA9IGZ1bmN0aW9uKHNldHMsIGRpbWVuc2lvbnMsIGNlbGxzLCBzZXQgPSBuZXcgTWFwKCkpIHtcbiAgICAgICAgICAgICAgICBpZiAoZGltZW5zaW9ucy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgc2V0cy5wdXNoKHNldCk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGxldCBjdXJyZW50RGltZW5zaW9uICAgICA9IGRpbWVuc2lvbnNbMF0sXG4gICAgICAgICAgICAgICAgICAgIHJlbWFpbmluZ0RpbWVuc2lvbnMgICAgPSBkaW1lbnNpb25zLnNsaWNlKDEpO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5nZXREaW1lbnNpb25WYWx1ZXMoY3VycmVudERpbWVuc2lvbikuZm9yRWFjaChkaW1lbnNpb25WYWx1ZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBzdWJDZWxscyA9IGNlbGxzLmZpbHRlcihjZWxsID0+IGNlbGwuZ2V0RGltZW5zaW9uVmFsdWUoY3VycmVudERpbWVuc2lvbikgPT09IGRpbWVuc2lvblZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN1YkNlbGxzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGN1cnJlbnRTZXQgPSBtYXBVdGlscy5jbG9uZShzZXQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudFNldC5zZXQoY3VycmVudERpbWVuc2lvbi5pZCwgZGltZW5zaW9uVmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZ2V0U2V0cy5jYWxsKHRoaXMsIHNldHMsIHJlbWFpbmluZ0RpbWVuc2lvbnMsIHN1YkNlbGxzLCBjdXJyZW50U2V0KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICBsZXQgc2V0cyA9IFtdO1xuICAgICAgICBnZXRTZXRzLmNhbGwodGhpcywgc2V0cywgZGltZW5zaW9ucywgdGhpcy5jZWxscyk7XG5cbiAgICAgICAgcmV0dXJuIHNldHM7XG4gICAgfVxuXG4gICAgZ2V0Q2VsbChkaW1lbnNpb25WYWx1ZXMpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY2VsbHMuZmluZChjZWxsID0+IHtcbiAgICAgICAgICAgIGxldCBmb3VuZCA9IHRydWU7XG4gICAgICAgICAgICBkaW1lbnNpb25WYWx1ZXMuZm9yRWFjaCgoZGltZW5zaW9uVmFsdWUsIGRpbWVuc2lvbklkKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGRpbWVuc2lvblZhbHVlLmlkICE9PSBjZWxsLmdldERpbWVuc2lvblZhbHVlKHRoaXMuZ2V0RGltZW5zaW9uKGRpbWVuc2lvbklkKSkuaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgZm91bmQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICAgICAgcmV0dXJuIGZvdW5kO1xuICAgICAgICB9LCB0aGlzKTtcbiAgICB9XG5cbiAgICBtZXJnZURpbWVuc2lvbnMoZGltZW5zaW9ucywgbmV3RGltZW5zaW9uSWQpIHtcbiAgICAgICAgLy8gTmV3IERpbWVuc2lvbnNcbiAgICAgICAgbGV0IG5ld0RpbWVuc2lvbiA9IG5ldyBEaW1lbnNpb24obmV3RGltZW5zaW9uSWQsIGRpbWVuc2lvbnMubWFwKGRpbWVuc2lvbiA9PiBkaW1lbnNpb24uY2FwdGlvbikuam9pbignIC0gJykpLFxuICAgICAgICAgICAgbmV3RGltZW5zaW9ucyA9IG5ldyBNYXAoKTtcbiAgICAgICAgdGhpcy5kaW1lbnNpb25zLmZvckVhY2goZGltZW5zaW9uID0+IHtcbiAgICAgICAgICAgIGlmIChkaW1lbnNpb25zLmluZGV4T2YoZGltZW5zaW9uKSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICBuZXdEaW1lbnNpb25zLnNldChkaW1lbnNpb24uaWQsIGRpbWVuc2lvbik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBuZXdEaW1lbnNpb25zLnNldChuZXdEaW1lbnNpb25JZCwgbmV3RGltZW5zaW9uKTtcblxuICAgICAgICAvLyBOZXcgZGltZW5zaW9uIFZhbHVlc1xuICAgICAgICBsZXQgbmV3RGltZW5zaW9uVmFsdWVzID0gbmV3IE1hcCgpO1xuICAgICAgICB0aGlzLmRpbWVuc2lvblZhbHVlcy5mb3JFYWNoKChkaW1lbnNpb25WYWx1ZXMsIGRpbWVuc2lvbklkKSA9PiB7XG4gICAgICAgICAgICBpZiAoZGltZW5zaW9ucy5maW5kKGRpbSA9PiBkaW0uaWQgPT09IGRpbWVuc2lvbklkKSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgbmV3RGltZW5zaW9uVmFsdWVzLnNldChkaW1lbnNpb25JZCwgZGltZW5zaW9uVmFsdWVzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIG5ld0RpbWVuc2lvblZhbHVlcy5zZXQobmV3RGltZW5zaW9uSWQsIG5ldyBNYXAoKSk7XG5cbiAgICAgICAgLy8gQ2VsbHNcbiAgICAgICAgbGV0IG5ld0NlbGxzID0gW107XG4gICAgICAgIHRoaXMuY2VsbHMuZm9yRWFjaChjZWxsID0+IHtcbiAgICAgICAgICAgIGxldCBuZXdDZWxsRGltZW5zaW9uVmFsdWVzID0gbmV3IE1hcCgpLFxuICAgICAgICAgICAgICAgIGRpbWVuc2lvblZhbHVlc1RvTWVyZ2UgPSBbXTtcbiAgICAgICAgICAgIGNlbGwuZGltZW5zaW9uVmFsdWVzLmZvckVhY2goKGRpbWVuc2lvblZhbHVlLCBkaW1lbnNpb25JZCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChkaW1lbnNpb25zLmZpbmQoZGltID0+IGRpbS5pZCA9PT0gZGltZW5zaW9uSWQpID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgbmV3Q2VsbERpbWVuc2lvblZhbHVlcy5zZXQoZGltZW5zaW9uSWQsIGRpbWVuc2lvblZhbHVlKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBkaW1lbnNpb25WYWx1ZXNUb01lcmdlLnB1c2goZGltZW5zaW9uVmFsdWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgbGV0IG5ld0NlbGxEaW1lbnNpb25WYWx1ZSA9IG5ldyBEaW1lbnNpb25WYWx1ZShcbiAgICAgICAgICAgICAgICBkaW1lbnNpb25WYWx1ZXNUb01lcmdlLm1hcChkaW1lbnNpb25WYWx1ZSA9PiBkaW1lbnNpb25WYWx1ZS5pZCkuam9pbignLScpLFxuICAgICAgICAgICAgICAgIGRpbWVuc2lvblZhbHVlc1RvTWVyZ2UubWFwKGRpbWVuc2lvblZhbHVlID0+IGRpbWVuc2lvblZhbHVlLmNhcHRpb24pLmpvaW4oJyAtICcpXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgbmV3Q2VsbERpbWVuc2lvblZhbHVlcy5zZXQobmV3RGltZW5zaW9uSWQsIG5ld0NlbGxEaW1lbnNpb25WYWx1ZSk7XG4gICAgICAgICAgICBuZXdEaW1lbnNpb25WYWx1ZXMuZ2V0KG5ld0RpbWVuc2lvbklkKS5zZXQobmV3Q2VsbERpbWVuc2lvblZhbHVlLmlkLCBuZXdDZWxsRGltZW5zaW9uVmFsdWUpO1xuICAgICAgICAgICAgbmV3Q2VsbHMucHVzaChuZXcgQ2VsbChuZXdDZWxsRGltZW5zaW9uVmFsdWVzLCBjZWxsLnZhbHVlKSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBuZXcgR3JpZChuZXdEaW1lbnNpb25zLCBuZXdEaW1lbnNpb25WYWx1ZXMsIG5ld0NlbGxzKTtcbiAgICB9XG59XG4iLCJpbXBvcnQge0RpbWVuc2lvbn0gZnJvbSAnLi4vZGF0YS9kaW1lbnNpb24nO1xuaW1wb3J0IHtEaW1lbnNpb25WYWx1ZX0gZnJvbSAnLi4vZGF0YS9kaW1lbnNpb25WYWx1ZSc7XG5pbXBvcnQge0NlbGx9IGZyb20gJy4uL2RhdGEvY2VsbCc7XG5pbXBvcnQge0dyaWR9IGZyb20gJy4uL2RhdGEvZ3JpZCc7XG5cbmV4cG9ydCBjbGFzcyBHcmlkRmFjdG9yeSB7XG5cbiAgICBidWlsZEZyb21Kc29uKGdyaWREYXRhKSB7XG4gICAgICAgIGxldCBkaW1lbnNpb25zID0gbmV3IE1hcCgpLFxuICAgICAgICAgICAgZGltZW5zaW9uVmFsdWVzQnlEaW1lbnNpb25zID0gbmV3IE1hcCgpLFxuICAgICAgICAgICAgY2VsbHMgPSBbXSxcblxuICAgICAgICAgICAgZGltZW5zaW9uUG9zaXRpb25zID0gbmV3IE1hcCgpLFxuICAgICAgICAgICAgZGltZW5zaW9uVmFsdWVQb3NpdGlvbnMgPSBuZXcgTWFwKClcbiAgICAgICAgO1xuXG4gICAgICAgIGdyaWREYXRhLmRpbWVuc2lvbnMuZm9yRWFjaCgoZGltZW5zaW9uLCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgZGltZW5zaW9ucy5zZXQoZGltZW5zaW9uLmlkLCBuZXcgRGltZW5zaW9uKGRpbWVuc2lvbi5pZCwgZGltZW5zaW9uLmNhcHRpb24pKTtcbiAgICAgICAgICAgIGRpbWVuc2lvblBvc2l0aW9ucy5zZXQoZGltZW5zaW9uLmlkLCBpbmRleCk7XG5cbiAgICAgICAgICAgIGRpbWVuc2lvblZhbHVlc0J5RGltZW5zaW9ucy5zZXQoZGltZW5zaW9uLmlkLCBuZXcgTWFwKCkpO1xuICAgICAgICAgICAgZGltZW5zaW9uVmFsdWVQb3NpdGlvbnMuc2V0KGRpbWVuc2lvbi5pZCwgbmV3IE1hcCgpKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGRpbWVuc2lvblBvc2l0aW9ucy5mb3JFYWNoKChpbmRleCwgZGltZW5zaW9uSWQpID0+IHtcbiAgICAgICAgICAgIGdyaWREYXRhLmRpbWVuc2lvblZhbHVlc1tpbmRleF0uZm9yRWFjaCgoZGltZW5zaW9uVmFsdWUsIGRpbWVuc2lvblZhbHVlSW5kZXgpID0+IHtcbiAgICAgICAgICAgICAgICBkaW1lbnNpb25WYWx1ZXNCeURpbWVuc2lvbnMuZ2V0KGRpbWVuc2lvbklkKS5zZXQoZGltZW5zaW9uVmFsdWUuaWQsIG5ldyBEaW1lbnNpb25WYWx1ZShkaW1lbnNpb25WYWx1ZS5pZCwgZGltZW5zaW9uVmFsdWUuY2FwdGlvbikpO1xuICAgICAgICAgICAgICAgIGRpbWVuc2lvblZhbHVlUG9zaXRpb25zLmdldChkaW1lbnNpb25JZCkuc2V0KGRpbWVuc2lvblZhbHVlSW5kZXgsIGRpbWVuc2lvblZhbHVlLmlkKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICBncmlkRGF0YS5jZWxscy5mb3JFYWNoKGNlbGwgPT4ge1xuICAgICAgICAgICAgbGV0IGNlbGxEaW1lbnNpb25WYWx1ZXMgPSBuZXcgTWFwKCk7XG5cbiAgICAgICAgICAgIGRpbWVuc2lvblBvc2l0aW9ucy5mb3JFYWNoKChpbmRleCwgZGltZW5zaW9uSWQpID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgZGltZW5zaW9uVmFsdWUgPSBkaW1lbnNpb25WYWx1ZXNCeURpbWVuc2lvbnMuZ2V0KGRpbWVuc2lvbklkKS5nZXQoZGltZW5zaW9uVmFsdWVQb3NpdGlvbnMuZ2V0KGRpbWVuc2lvbklkKS5nZXQoY2VsbC5kaW1lbnNpb25WYWx1ZXNbaW5kZXhdKSk7XG4gICAgICAgICAgICAgICAgY2VsbERpbWVuc2lvblZhbHVlcy5zZXQoZGltZW5zaW9uSWQsIGRpbWVuc2lvblZhbHVlKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBjZWxscy5wdXNoKG5ldyBDZWxsKGNlbGxEaW1lbnNpb25WYWx1ZXMsIGNlbGwudmFsdWUpKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIG5ldyBHcmlkKGRpbWVuc2lvbnMsIGRpbWVuc2lvblZhbHVlc0J5RGltZW5zaW9ucywgY2VsbHMpO1xuICAgIH1cbn1cbiIsImltcG9ydCB7UmVuZGVyZXJ9IGZyb20gJy4vcmVuZGVyZXIvcmVuZGVyZXInO1xuaW1wb3J0IHtDaGFydGpzQWRhcHRlcn0gZnJvbSAnLi9hZGFwdGVyL2NoYXJ0anNBZGFwdGVyJztcbmltcG9ydCB7SlF1ZXJ5QWRhcHRlcn0gZnJvbSAnLi9hZGFwdGVyL2pxdWVyeUFkYXB0ZXInO1xuXG52YXIgcmVwb3J0anMgPSB7XG4gIFJlbmRlcmVyOiBSZW5kZXJlcixcbiAgQ2hhcnRqc0FkYXB0ZXI6IENoYXJ0anNBZGFwdGVyLFxuICBKUXVlcnlBZGFwdGVyOiBKUXVlcnlBZGFwdGVyXG59O1xuXG5leHBvcnQge3JlcG9ydGpzfTtcbiIsImltcG9ydCB7R3JhcGh9IGZyb20gJy4uLy4uL3Jlc3VsdC9ncmFwaC9ncmFwaCc7XG5cbmV4cG9ydCBjbGFzcyBHcmFwaFJlbmRlcmVyIHtcblxuICAgIGNvbnN0cnVjdG9yKGRhdGFzZXRzRGltZW5zaW9ucywgbGFiZWxzRGltZW5zaW9ucywgZ3JhcGhUeXBlID0gJ2xpbmUnLCBoZWlnaHQgPSAnYXV0bycsIHdpZHRoID0gJ2F1dG8nKSB7XG4gICAgICAgIHRoaXMuZGF0YXNldHNEaW1lbnNpb25zID0gZGF0YXNldHNEaW1lbnNpb25zO1xuICAgICAgICB0aGlzLmxhYmVsc0RpbWVuc2lvbnMgICA9IGxhYmVsc0RpbWVuc2lvbnM7XG4gICAgICAgIHRoaXMuZ3JhcGhUeXBlICAgICAgICAgID0gZ3JhcGhUeXBlO1xuICAgICAgICB0aGlzLmhlaWdodCAgICAgICAgICAgICA9IGhlaWdodDtcbiAgICAgICAgdGhpcy53aWR0aCAgICAgICAgICAgICAgPSB3aWR0aDtcbiAgICB9XG5cbiAgICByZW5kZXIoZ3JpZCkge1xuICAgICAgICBsZXQgZGF0YXNldHNEaW1lbnNpb25JZCA9ICdkYXRhc2V0JyxcbiAgICAgICAgICAgIGxhYmVsc0RpbWVuc2lvbklkID0gJ2xhYmVsJyxcbiAgICAgICAgICAgIG1lcmdlZEdyaWQgPSBncmlkLm1lcmdlRGltZW5zaW9ucyh0aGlzLmRhdGFzZXRzRGltZW5zaW9ucy5tYXAoZGltZW5zaW9uID0+IGdyaWQuZ2V0RGltZW5zaW9uKGRpbWVuc2lvbikpLCBkYXRhc2V0c0RpbWVuc2lvbklkKTtcbiAgICAgICAgbWVyZ2VkR3JpZCA9IG1lcmdlZEdyaWQubWVyZ2VEaW1lbnNpb25zKHRoaXMubGFiZWxzRGltZW5zaW9ucy5tYXAoZGltZW5zaW9uID0+IGdyaWQuZ2V0RGltZW5zaW9uKGRpbWVuc2lvbikpLCBsYWJlbHNEaW1lbnNpb25JZCk7XG5cbiAgICAgICAgbGV0IGxhYmVscyA9IFtdO1xuICAgICAgICBtZXJnZWRHcmlkLmdldERpbWVuc2lvblZhbHVlcyhtZXJnZWRHcmlkLmdldERpbWVuc2lvbihsYWJlbHNEaW1lbnNpb25JZCkpLmZvckVhY2gobGFiZWxEViA9PiB7XG4gICAgICAgICAgICBsYWJlbHMucHVzaChsYWJlbERWLmNhcHRpb24pO1xuICAgICAgICB9KTtcblxuICAgICAgICBsZXQgZGF0YXNldHMgPSBbXTtcbiAgICAgICAgbWVyZ2VkR3JpZC5nZXREaW1lbnNpb25WYWx1ZXMobWVyZ2VkR3JpZC5nZXREaW1lbnNpb24oZGF0YXNldHNEaW1lbnNpb25JZCkpLmZvckVhY2goZGF0YXNldERWID0+IHtcbiAgICAgICAgICAgIGxldCBkYXRhc2V0ID0ge1xuICAgICAgICAgICAgICAgIGxhYmVsOiBkYXRhc2V0RFYuY2FwdGlvbixcbiAgICAgICAgICAgICAgICBkYXRhOiBbXVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIG1lcmdlZEdyaWQuZ2V0RGltZW5zaW9uVmFsdWVzKG1lcmdlZEdyaWQuZ2V0RGltZW5zaW9uKGxhYmVsc0RpbWVuc2lvbklkKSkuZm9yRWFjaChsYWJlbERWID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgY2VsbERpbWVuc2lvblZhbHVlcyA9IG5ldyBNYXAoKTtcbiAgICAgICAgICAgICAgICBjZWxsRGltZW5zaW9uVmFsdWVzLnNldChkYXRhc2V0c0RpbWVuc2lvbklkLCBkYXRhc2V0RFYpO1xuICAgICAgICAgICAgICAgIGNlbGxEaW1lbnNpb25WYWx1ZXMuc2V0KGxhYmVsc0RpbWVuc2lvbklkLCBsYWJlbERWKTtcblxuICAgICAgICAgICAgICAgIGxldCBjZWxsID0gbWVyZ2VkR3JpZC5nZXRDZWxsKGNlbGxEaW1lbnNpb25WYWx1ZXMpO1xuICAgICAgICAgICAgICAgIGlmIChjZWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGFzZXQuZGF0YS5wdXNoKGNlbGwudmFsdWUpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGFzZXQuZGF0YS5wdXNoKG51bGwpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZGF0YXNldHMucHVzaChkYXRhc2V0KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIG5ldyBHcmFwaCh0aGlzLmdyYXBoVHlwZSwgbGFiZWxzLCBkYXRhc2V0cywgdGhpcy5oZWlnaHQsIHRoaXMud2lkdGgpO1xuICAgIH1cbn1cbiIsImltcG9ydCB7U2VnbWVudEdyYXBofSBmcm9tICcuLi8uLi9yZXN1bHQvZ3JhcGgvc2VnbWVudEdyYXBoJztcblxuZXhwb3J0IGNsYXNzIFNlZ21lbnRHcmFwaFJlbmRlcmVyIHtcblxuICAgIGNvbnN0cnVjdG9yKGdyYXBoVHlwZSA9ICdwaWUnLCBoZWlnaHQgPSAnYXV0bycsIHdpZHRoID0gJ2F1dG8nKSB7XG4gICAgICAgIHRoaXMuZ3JhcGhUeXBlID0gZ3JhcGhUeXBlO1xuICAgICAgICB0aGlzLmhlaWdodCAgICA9IGhlaWdodDtcbiAgICAgICAgdGhpcy53aWR0aCAgICAgPSB3aWR0aDtcbiAgICB9XG5cbiAgICByZW5kZXIoZ3JpZCkge1xuICAgICAgICBsZXQgZGltZW5zaW9ucyA9IFtdO1xuICAgICAgICBncmlkLmRpbWVuc2lvbnMuZm9yRWFjaChkaW0gPT4geyBkaW1lbnNpb25zLnB1c2goZGltKTsgfSk7XG5cbiAgICAgICAgbGV0IGxhYmVsc0RpbWVuc2lvbklkID0gJ2xhYmVsJyxcbiAgICAgICAgICAgIG1lcmdlZEdyaWQgPSBncmlkLm1lcmdlRGltZW5zaW9ucyhkaW1lbnNpb25zLCBsYWJlbHNEaW1lbnNpb25JZCk7XG5cbiAgICAgICAgbGV0IGxhYmVscyA9IFtdO1xuICAgICAgICBtZXJnZWRHcmlkLmdldERpbWVuc2lvblZhbHVlcyhtZXJnZWRHcmlkLmdldERpbWVuc2lvbihsYWJlbHNEaW1lbnNpb25JZCkpLmZvckVhY2gobGFiZWxEViA9PiB7XG4gICAgICAgICAgICBsZXQgY2VsbERpbWVuc2lvblZhbHVlcyA9IG5ldyBNYXAoKTtcbiAgICAgICAgICAgIGNlbGxEaW1lbnNpb25WYWx1ZXMuc2V0KGxhYmVsc0RpbWVuc2lvbklkLCBsYWJlbERWKTtcbiAgICAgICAgICAgIGxldCBjZWxsID0gbWVyZ2VkR3JpZC5nZXRDZWxsKGNlbGxEaW1lbnNpb25WYWx1ZXMpO1xuXG4gICAgICAgICAgICBsYWJlbHMucHVzaCh7XG4gICAgICAgICAgICAgICAgbGFiZWw6IGxhYmVsRFYuY2FwdGlvbixcbiAgICAgICAgICAgICAgICB2YWx1ZTogY2VsbC52YWx1ZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBuZXcgU2VnbWVudEdyYXBoKHRoaXMuZ3JhcGhUeXBlLCBsYWJlbHMsIHRoaXMuaGVpZ2h0LCB0aGlzLndpZHRoKTtcbiAgICB9XG59XG4iLCJpbXBvcnQge0dyaWRGYWN0b3J5fSBmcm9tICcuLi9kYXRhL2dyaWRGYWN0b3J5JztcbmltcG9ydCB7VGFibGVSZW5kZXJlcn0gZnJvbSAnLi90YWJsZS90YWJsZVJlbmRlcmVyJztcbmltcG9ydCB7R3JhcGhSZW5kZXJlcn0gZnJvbSAnLi9ncmFwaC9ncmFwaFJlbmRlcmVyJztcbmltcG9ydCB7U2VnbWVudEdyYXBoUmVuZGVyZXJ9IGZyb20gJy4vZ3JhcGgvc2VnbWVudEdyYXBoUmVuZGVyZXInO1xuXG5leHBvcnQgY2xhc3MgUmVuZGVyZXIge1xuXG4gICAgcmVuZGVyKG9wdGlvbnMpwqB7XG4gICAgICAgIGxldCBncmlkRmFjdG9yeSA9IG5ldyBHcmlkRmFjdG9yeSgpLFxuICAgICAgICAgICAgZ3JpZCA9IGdyaWRGYWN0b3J5LmJ1aWxkRnJvbUpzb24ob3B0aW9ucy5kYXRhKSxcbiAgICAgICAgICAgIG91dHB1dDtcblxuICAgICAgICBzd2l0Y2ggKG9wdGlvbnMubGF5b3V0LnR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ3RhYmxlJzpcbiAgICAgICAgICAgICAgICBsZXQgdGFibGVSZW5kZXJlciA9IG5ldyBUYWJsZVJlbmRlcmVyKG9wdGlvbnMubGF5b3V0LnJvd3MsIG9wdGlvbnMubGF5b3V0LmNvbHVtbnMsIG9wdGlvbnMubGF5b3V0Lm9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIG91dHB1dCA9IHRhYmxlUmVuZGVyZXIucmVuZGVyKGdyaWQpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnZ3JhcGgnOlxuICAgICAgICAgICAgICAgIGxldCBncmFwaFJlbmRlcmVyID0gbmV3IEdyYXBoUmVuZGVyZXIob3B0aW9ucy5sYXlvdXQuZGF0YXNldHMsIG9wdGlvbnMubGF5b3V0LmxhYmVscywgb3B0aW9ucy5sYXlvdXQuZ3JhcGhUeXBlLCBvcHRpb25zLmxheW91dC5oZWlnaHQsIG9wdGlvbnMubGF5b3V0LndpZHRoKTtcbiAgICAgICAgICAgICAgICBvdXRwdXQgPSBncmFwaFJlbmRlcmVyLnJlbmRlcihncmlkKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3NlZ21lbnRHcmFwaCc6XG4gICAgICAgICAgICAgICAgbGV0IHNlZ21lbnRHcmFwaFJlbmRlcmVyID0gbmV3IFNlZ21lbnRHcmFwaFJlbmRlcmVyKG9wdGlvbnMubGF5b3V0LmdyYXBoVHlwZSwgb3B0aW9ucy5sYXlvdXQuaGVpZ2h0LCBvcHRpb25zLmxheW91dC53aWR0aCk7XG4gICAgICAgICAgICAgICAgb3V0cHV0ID0gc2VnbWVudEdyYXBoUmVuZGVyZXIucmVuZGVyKGdyaWQpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICB0aHJvdyBFcnJvcigndW5rbm93biBsYXlvdXQgdHlwZScpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG91dHB1dDtcbiAgICB9XG5cbn1cbiIsImltcG9ydCB7VGFibGVSb3d9ICBmcm9tICcuLi8uLi9yZXN1bHQvdGFibGUvdGFibGVSb3cnO1xuaW1wb3J0IHtUYWJsZUNlbGx9IGZyb20gJy4uLy4uL3Jlc3VsdC90YWJsZS90YWJsZUNlbGwnO1xuaW1wb3J0IHtNYXBzfSAgICAgIGZyb20gJy4uLy4uL3V0aWxzL21hcHMnO1xuXG5leHBvcnQgY2xhc3MgVGFibGVCb2R5UmVuZGVyZXIge1xuXG4gICAgY29uc3RydWN0b3Iocm93RGltZW5zaW9ucywgY29sdW1uRGltZW5zaW9ucywgb3B0aW9ucyA9IHt9KSB7XG4gICAgICAgIHRoaXMucm93RGltZW5zaW9ucyA9IHJvd0RpbWVuc2lvbnM7XG4gICAgICAgIHRoaXMuY29sdW1uRGltZW5zaW9ucyA9IGNvbHVtbkRpbWVuc2lvbnM7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgfVxuXG4gICAgcmVuZGVyKGdyaWQpIHtcbiAgICAgICAgbGV0IG1hcFV0aWxzID0gbmV3IE1hcHMoKSxcblxuICAgICAgICAgICAgZ2V0Qm9keUNlbGxzID0gZnVuY3Rpb24oY3VycmVudFJvdywgY29sdW1uRGltZW5zaW9ucywgY2VsbHMsIGRpbWVuc2lvblZhbHVlcykge1xuICAgICAgICAgICAgICAgIGxldCBjb2xTZXRzID0gZ3JpZC5nZXREaW1lbmlvblZhbHVlc1NldHMoY29sdW1uRGltZW5zaW9ucy5tYXAoZGltZW5zaW9uID0+IGdyaWQuZ2V0RGltZW5zaW9uKGRpbWVuc2lvbikpKTtcblxuICAgICAgICAgICAgICAgIGNvbFNldHMuZm9yRWFjaChzZXQgPT4ge1xuICAgICAgICAgICAgICAgICAgICBsZXQgY2VsbFNldCA9IG1hcFV0aWxzLnN1bShkaW1lbnNpb25WYWx1ZXMsIHNldCk7XG4gICAgICAgICAgICAgICAgICAgIGxldCBjZWxsID0gZ3JpZC5nZXRDZWxsKGNlbGxTZXQpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoY2VsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudFJvdy5hZGRDZWxsKG5ldyBUYWJsZUNlbGwoY2VsbC52YWx1ZSkpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudFJvdy5hZGRDZWxsKG5ldyBUYWJsZUNlbGwoJycpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgZ2V0Um93cyA9IGZ1bmN0aW9uKHJvd3MsIHJvd0RpbWVuc2lvbnMsIGNvbHVtbkRpbWVuc2lvbnMsIGNlbGxzLCBkaW1lbnNpb25WYWx1ZXMgPSBuZXcgTWFwKCksIHJvdyA9IG51bGwpIHtcbiAgICAgICAgICAgICAgICBpZiAocm93RGltZW5zaW9ucy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgZ2V0Qm9keUNlbGxzKHJvdywgY29sdW1uRGltZW5zaW9ucywgY2VsbHMsIGRpbWVuc2lvblZhbHVlcyk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGxldCBjdXJyZW50RGltZW5zaW9uSWQgICAgID0gcm93RGltZW5zaW9uc1swXSxcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudERpbWVuc2lvbiAgICAgICA9IGdyaWQuZ2V0RGltZW5zaW9uKGN1cnJlbnREaW1lbnNpb25JZCksXG4gICAgICAgICAgICAgICAgICAgIHJlbWFpbmluZ0RpbWVuc2lvbnMgICAgPSByb3dEaW1lbnNpb25zLnNsaWNlKDEpLFxuICAgICAgICAgICAgICAgICAgICBjb3VudENlbGxzICAgICAgICAgICAgID0gMCxcbiAgICAgICAgICAgICAgICAgICAgZmlyc3QgICAgICAgICAgICAgICAgICA9IHRydWU7XG5cbiAgICAgICAgICAgICAgICBncmlkLmdldERpbWVuc2lvblZhbHVlcyhjdXJyZW50RGltZW5zaW9uKS5mb3JFYWNoKGRpbWVuc2lvblZhbHVlID0+IHtcblxuICAgICAgICAgICAgICAgICAgICBsZXQgc3ViQ2VsbHMgPSBjZWxscy5maWx0ZXIoY2VsbCA9PiBjZWxsLmdldERpbWVuc2lvblZhbHVlKGN1cnJlbnREaW1lbnNpb24pID09PSBkaW1lbnNpb25WYWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzdWJDZWxscy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBjdXJyZW50Um93ID0gcm93O1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJvdyA9PT0gbnVsbCB8fCAhZmlyc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50Um93ID0gbmV3IFRhYmxlUm93KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcm93cy5wdXNoKGN1cnJlbnRSb3cpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZmlyc3QgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBjdXJyZW50RGltZW5zaW9uVmFsdWVzID0gbWFwVXRpbHMuY2xvbmUoZGltZW5zaW9uVmFsdWVzKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudERpbWVuc2lvblZhbHVlcy5zZXQoY3VycmVudERpbWVuc2lvbklkLCBkaW1lbnNpb25WYWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgdGFibGVDZWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzLm9wdGlvbnMuaGlkZUhlYWRlcnMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YWJsZUNlbGwgPSBuZXcgVGFibGVDZWxsKGRpbWVuc2lvblZhbHVlLmNhcHRpb24sIHsgaGVhZGVyOiB0cnVlIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRSb3cuYWRkQ2VsbCh0YWJsZUNlbGwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGNoaWxkQ2VsbHNDb3VudCA9IGdldFJvd3MuY2FsbCh0aGlzLCByb3dzLCByZW1haW5pbmdEaW1lbnNpb25zLCBjb2x1bW5EaW1lbnNpb25zLCBzdWJDZWxscywgY3VycmVudERpbWVuc2lvblZhbHVlcywgY3VycmVudFJvdyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXRoaXMub3B0aW9ucy5oaWRlSGVhZGVycykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhYmxlQ2VsbC5zZXRPcHRpb24oJ3Jvd3NwYW4nLCBjaGlsZENlbGxzQ291bnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgY291bnRDZWxscyArPSBjaGlsZENlbGxzQ291bnQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICAgICAgcmV0dXJuIGNvdW50Q2VsbHM7XG4gICAgICAgIH07XG5cbiAgICAgICAgbGV0IHJvd3MgPSBbXTtcbiAgICAgICAgZ2V0Um93cy5jYWxsKHRoaXMsIHJvd3MsIHRoaXMucm93RGltZW5zaW9ucywgdGhpcy5jb2x1bW5EaW1lbnNpb25zLCBncmlkLmNlbGxzKTtcblxuICAgICAgICByZXR1cm4gcm93cztcbiAgICB9XG5cbiAgICBnZXRIZWFkZXJDZWxscygpIHtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5oaWRlSGVhZGVycykge1xuICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICBuZXcgVGFibGVDZWxsKCcnLCB7XG4gICAgICAgICAgICAgICAgY29sc3BhbjogdGhpcy5yb3dEaW1lbnNpb25zLmxlbmd0aCxcbiAgICAgICAgICAgICAgICBoZWFkZXI6IHRydWVcbiAgICAgICAgICAgIH0pXG4gICAgICAgIF07XG5cbiAgICB9XG59XG4iLCJpbXBvcnQge1RhYmxlUm93fSAgZnJvbSAnLi4vLi4vcmVzdWx0L3RhYmxlL3RhYmxlUm93JztcbmltcG9ydCB7VGFibGVDZWxsfSBmcm9tICcuLi8uLi9yZXN1bHQvdGFibGUvdGFibGVDZWxsJztcbmltcG9ydCB7TWFwc30gICAgICBmcm9tICcuLi8uLi91dGlscy9tYXBzJztcblxuZXhwb3J0IGNsYXNzIFRhYmxlSGVhZGVyUmVuZGVyZXIge1xuXG4gICAgY29uc3RydWN0b3IoY29sdW1uRGltZW5zaW9ucywgb3B0aW9ucyA9IHt9KSB7XG4gICAgICAgIHRoaXMuY29sdW1uRGltZW5zaW9ucyA9IGNvbHVtbkRpbWVuc2lvbnM7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgfVxuXG4gICAgcmVuZGVyKGdyaWQsIGhlYWRlckNlbGxzID0gW10pIHtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5oaWRlSGVhZGVycykge1xuICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IG1hcFV0aWxzID0gbmV3IE1hcHMoKSxcbiAgICAgICAgICAgIGdldEhlYWRlclJvd3MgPSBmdW5jdGlvbihyb3dzLCBkaW1lbnNpb25zLCBjZWxscywgZGltZW5zaW9uVmFsdWVzID0gbmV3IE1hcCgpKSB7XG4gICAgICAgICAgICAgICAgaWYgKGRpbWVuc2lvbnMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGxldCBjdXJyZW50RGltZW5zaW9uSWQgICAgID0gZGltZW5zaW9uc1swXSxcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudERpbWVuc2lvbiAgICAgICA9IGdyaWQuZ2V0RGltZW5zaW9uKGN1cnJlbnREaW1lbnNpb25JZCksXG4gICAgICAgICAgICAgICAgICAgIHJlbWFpbmluZ0RpbWVuc2lvbnMgICAgPSBkaW1lbnNpb25zLnNsaWNlKDEpLFxuICAgICAgICAgICAgICAgICAgICBjb3VudENlbGxzICAgICAgICAgICAgID0gMCxcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudFJvdztcbiAgICAgICAgICAgICAgICBpZiAocm93cy5oYXMoY3VycmVudERpbWVuc2lvbklkKSkge1xuICAgICAgICAgICAgICAgICAgICBjdXJyZW50Um93ID0gcm93cy5nZXQoY3VycmVudERpbWVuc2lvbklkKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjdXJyZW50Um93ID0gbmV3IFRhYmxlUm93KCk7XG4gICAgICAgICAgICAgICAgICAgIHJvd3Muc2V0KGN1cnJlbnREaW1lbnNpb25JZCwgY3VycmVudFJvdyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGdyaWQuZ2V0RGltZW5zaW9uVmFsdWVzKGN1cnJlbnREaW1lbnNpb24pLmZvckVhY2goZGltZW5zaW9uVmFsdWUgPT4ge1xuICAgICAgICAgICAgICAgICAgICBsZXQgc3ViQ2VsbHMgPSBjZWxscy5maWx0ZXIoY2VsbCA9PiBjZWxsLmdldERpbWVuc2lvblZhbHVlKGN1cnJlbnREaW1lbnNpb24pID09PSBkaW1lbnNpb25WYWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzdWJDZWxscy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBjdXJyZW50RGltZW5zaW9uVmFsdWVzID0gbWFwVXRpbHMuY2xvbmUoZGltZW5zaW9uVmFsdWVzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnREaW1lbnNpb25WYWx1ZXMuc2V0KGN1cnJlbnREaW1lbnNpb25JZCwgZGltZW5zaW9uVmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGNoaWxkQ2VsbHNDb3VudCA9IGdldEhlYWRlclJvd3Mocm93cywgcmVtYWluaW5nRGltZW5zaW9ucywgc3ViQ2VsbHMsIGN1cnJlbnREaW1lbnNpb25WYWx1ZXMpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50Um93LmFkZENlbGwobmV3IFRhYmxlQ2VsbChkaW1lbnNpb25WYWx1ZS5jYXB0aW9uLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sc3BhbjogY2hpbGRDZWxsc0NvdW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhlYWRlcjogdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgfSkpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBjb3VudENlbGxzICs9IGNoaWxkQ2VsbHNDb3VudDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvdW50Q2VsbHM7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgIGxldCByb3dzTWFwID0gbmV3IE1hcCgpO1xuICAgICAgICBpZiAodGhpcy5jb2x1bW5EaW1lbnNpb25zLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIGhlYWRlckNlbGxzLmNvbmNhdChbbmV3IFRhYmxlUm93KFsgbmV3IFRhYmxlQ2VsbCgnJywgeyBoZWFkZXI6IHRydWUgfSkgXSldKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGdldEhlYWRlclJvd3Mocm93c01hcCwgdGhpcy5jb2x1bW5EaW1lbnNpb25zLCBncmlkLmNlbGxzKTtcbiAgICAgICAgICAgIGxldCByb3dzID0gW107XG4gICAgICAgICAgICByb3dzTWFwLmZvckVhY2gocm93ID0+IHtcbiAgICAgICAgICAgICAgICByb3cuY2VsbHMgPSBoZWFkZXJDZWxscy5jb25jYXQocm93LmNlbGxzKTtcbiAgICAgICAgICAgICAgICByb3dzLnB1c2gocm93KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHJvd3M7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJpbXBvcnQge1RhYmxlfSBmcm9tICcuLi8uLi9yZXN1bHQvdGFibGUvdGFibGUnO1xuaW1wb3J0IHtUYWJsZUhlYWRlclJlbmRlcmVyfSBmcm9tICcuLi8uLi9yZW5kZXJlci90YWJsZS90YWJsZUhlYWRlclJlbmRlcmVyJztcbmltcG9ydCB7VGFibGVCb2R5UmVuZGVyZXJ9IGZyb20gJy4uLy4uL3JlbmRlcmVyL3RhYmxlL3RhYmxlQm9keVJlbmRlcmVyJztcblxuZXhwb3J0IGNsYXNzIFRhYmxlUmVuZGVyZXIge1xuXG4gICAgY29uc3RydWN0b3Iocm93RGltZW5zaW9ucywgY29sdW1uRGltZW5zaW9ucywgb3B0aW9ucyA9IHt9KSB7XG4gICAgICAgIHRoaXMucm93RGltZW5zaW9ucyAgICA9IHJvd0RpbWVuc2lvbnM7XG4gICAgICAgIHRoaXMuY29sdW1uRGltZW5zaW9ucyA9IGNvbHVtbkRpbWVuc2lvbnM7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgfVxuXG4gICAgcmVuZGVyKGdyaWQpIHtcbiAgICAgICAgbGV0IHRhYmxlID0gbmV3IFRhYmxlKCksXG4gICAgICAgICAgICB0YWJsZUhlYWRlclJlbmRlcmVyID0gbmV3IFRhYmxlSGVhZGVyUmVuZGVyZXIodGhpcy5jb2x1bW5EaW1lbnNpb25zLCB7XG4gICAgICAgICAgICAgICAgaGlkZUhlYWRlcnM6IHRoaXMub3B0aW9ucy5oaWRlQ29sdW1uSGVhZGVyc1xuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICB0YWJsZUJvZHlSZW5kZXJlciA9IG5ldyBUYWJsZUJvZHlSZW5kZXJlcih0aGlzLnJvd0RpbWVuc2lvbnMsIHRoaXMuY29sdW1uRGltZW5zaW9ucywge1xuICAgICAgICAgICAgICAgIGhpZGVIZWFkZXJzOiB0aGlzLm9wdGlvbnMuaGlkZVJvd0hlYWRlcnNcbiAgICAgICAgICAgIH0pLFxuXG4gICAgICAgICAgICBoZWFkZXJSb3dzID0gdGFibGVIZWFkZXJSZW5kZXJlci5yZW5kZXIoZ3JpZCwgdGFibGVCb2R5UmVuZGVyZXIuZ2V0SGVhZGVyQ2VsbHMoKSksXG4gICAgICAgICAgICBib2R5Um93cyA9IHRhYmxlQm9keVJlbmRlcmVyLnJlbmRlcihncmlkKTtcblxuICAgICAgICBoZWFkZXJSb3dzLmZvckVhY2gocm93ID0+IHsgdGFibGUuYWRkUm93KHJvdyk7IH0pO1xuICAgICAgICBib2R5Um93cy5mb3JFYWNoKHJvdyA9PiB7IHRhYmxlLmFkZFJvdyhyb3cpOyB9KTtcblxuICAgICAgICByZXR1cm4gdGFibGU7XG4gICAgfVxufVxuIiwiZXhwb3J0IGNsYXNzIEdyYXBoIHtcblxuICAgIGNvbnN0cnVjdG9yKGdyYXBoVHlwZSwgbGFiZWxzID0gW10sIGRhdGFzZXRzID0gW10sIGhlaWdodCA9ICdhdXRvJywgd2lkdGggPSAnYXV0bycpIHtcbiAgICAgICAgdGhpcy5ncmFwaFR5cGUgPSBncmFwaFR5cGU7XG4gICAgICAgIHRoaXMubGFiZWxzICAgPSBsYWJlbHM7XG4gICAgICAgIHRoaXMuZGF0YXNldHMgPSBkYXRhc2V0cztcbiAgICAgICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgICAgIHRoaXMud2lkdGggPSB3aWR0aDtcbiAgICB9XG5cbiAgICBhZGREYXRhc2V0KGRhdGFzZXQpIHtcbiAgICAgICAgdGhpcy5kYXRhc2V0cy5wdXNoKGRhdGFzZXQpO1xuICAgIH1cbn1cbiIsImV4cG9ydCBjbGFzcyBTZWdtZW50R3JhcGgge1xuXG4gICAgY29uc3RydWN0b3IoZ3JhcGhUeXBlLCBsYWJlbHMgPSBbXSwgaGVpZ2h0ID0gJ2F1dG8nLCB3aWR0aCA9ICdhdXRvJykge1xuICAgICAgICB0aGlzLmdyYXBoVHlwZSA9IGdyYXBoVHlwZTtcbiAgICAgICAgdGhpcy5sYWJlbHMgICA9IGxhYmVscztcbiAgICAgICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgICAgIHRoaXMud2lkdGggPSB3aWR0aDtcbiAgICB9XG5cbn1cbiIsImV4cG9ydCBjbGFzcyBUYWJsZSB7XG5cbiAgICBjb25zdHJ1Y3Rvcihyb3dzID0gW10pIHtcbiAgICAgICAgdGhpcy5yb3dzID0gcm93cztcbiAgICB9XG5cbiAgICBhZGRSb3cocm93KSB7XG4gICAgICAgIHRoaXMucm93cy5wdXNoKHJvdyk7XG4gICAgfVxuXG4gICAgZ2V0SHRtbCgpIHtcbiAgICAgICAgbGV0IGh0bWwgPSAnJztcbiAgICAgICAgdGhpcy5yb3dzLmZvckVhY2gocm93ID0+IHtcbiAgICAgICAgICAgIGxldCByb3dIdG1sID0gJyc7XG4gICAgICAgICAgICByb3cuY2VsbHMuZm9yRWFjaChjZWxsID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgY2VsbEF0dHJpYnV0ZXMgPSBbXTtcbiAgICAgICAgICAgICAgICBpZiAoY2VsbC5vcHRpb25zLnJvd3NwYW4gIT09IHVuZGVmaW5lZCAmJiBjZWxsLm9wdGlvbnMucm93c3BhbiA+IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgY2VsbEF0dHJpYnV0ZXMucHVzaCgncm93c3Bhbj1cIicrY2VsbC5vcHRpb25zLnJvd3NwYW4rJ1wiJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChjZWxsLm9wdGlvbnMuY29sc3BhbiAhPT0gdW5kZWZpbmVkICYmIGNlbGwub3B0aW9ucy5jb2xzcGFuID4gMSkge1xuICAgICAgICAgICAgICAgICAgICBjZWxsQXR0cmlidXRlcy5wdXNoKCdjb2xzcGFuPVwiJytjZWxsLm9wdGlvbnMuY29sc3BhbisnXCInKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBsZXQgdGFnID0gY2VsbC5vcHRpb25zLmhlYWRlciA9PT0gdW5kZWZpbmVkIHx8ICFjZWxsLm9wdGlvbnMuaGVhZGVyID8gJ3RkJyA6ICd0aCc7XG4gICAgICAgICAgICAgICAgcm93SHRtbCArPSAnPCcgKyB0YWcgKyAoY2VsbEF0dHJpYnV0ZXMubGVuZ3RoID8gJyAnICsgY2VsbEF0dHJpYnV0ZXMuam9pbignICcpIDogJycpICsgJz4nICsgY2VsbC52YWx1ZSArICc8LycgKyB0YWcgKyAnPic7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcm93SHRtbCA9ICc8dHI+JyArIHJvd0h0bWwgKyAnPC90cj4nO1xuICAgICAgICAgICAgaHRtbCArPSByb3dIdG1sO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gJzx0YWJsZT4nICsgaHRtbCArICc8L3RhYmxlPic7XG4gICAgfVxufVxuIiwiZXhwb3J0IGNsYXNzIFRhYmxlQ2VsbCB7XG5cbiAgICBjb25zdHJ1Y3Rvcih2YWx1ZSwgb3B0aW9ucyA9IHt9KSB7XG4gICAgICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgICB9XG5cbiAgICBzZXRPcHRpb24oa2V5LCB2YWx1ZSkge1xuICAgICAgICB0aGlzLm9wdGlvbnNba2V5XSA9IHZhbHVlO1xuICAgIH1cbn1cbiIsImV4cG9ydCBjbGFzcyBUYWJsZVJvdyB7XG5cbiAgICBjb25zdHJ1Y3RvcihjZWxscyA9IFtdKSB7XG4gICAgICAgIHRoaXMuY2VsbHMgPSBjZWxscztcbiAgICB9XG5cbiAgICBhZGRDZWxsKGNlbGwpIHtcbiAgICAgICAgdGhpcy5jZWxscy5wdXNoKGNlbGwpO1xuICAgIH1cblxufVxuIiwiZXhwb3J0IGNsYXNzIENvbG9ycyB7XG5cbiAgICBoZXhUb1JnYihoZXgpIHtcbiAgICAgICAgbGV0IHJlc3VsdCA9IC9eIz8oW2EtZlxcZF17Mn0pKFthLWZcXGRdezJ9KShbYS1mXFxkXXsyfSkkL2kuZXhlYyhoZXgpO1xuICAgICAgICBpZiAoIXJlc3VsdCkge1xuICAgICAgICAgICAgdGhyb3cgRXJyb3IoJ1wiJyArIGhleCArICdcIiBpcyBub3QgYSB2YWxpZCBoZXggY29sb3InKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcjogcGFyc2VJbnQocmVzdWx0WzFdLCAxNiksXG4gICAgICAgICAgICBnOiBwYXJzZUludChyZXN1bHRbMl0sIDE2KSxcbiAgICAgICAgICAgIGI6IHBhcnNlSW50KHJlc3VsdFszXSwgMTYpXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcmdiVG9TdHJpbmcocmdiLCBhbHBoYSA9IDEpIHtcbiAgICAgICAgcmV0dXJuICdyZ2JhKCcgKyAoW3JnYi5yLCByZ2IuZywgcmdiLmIsIGFscGhhXS5qb2luKCcsJykpICsnKSc7XG4gICAgfVxuXG4gICAgZGVmYXVsdFNjaGVtZSgpIHtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgICcjOTdiYmNkJyxcbiAgICAgICAgICAgICcjZGNkY2RjJyxcbiAgICAgICAgICAgICcjRjc0NjRBJyxcbiAgICAgICAgICAgICcjNDZCRkJEJyxcbiAgICAgICAgICAgICcjOTQ5RkIxJyxcbiAgICAgICAgICAgICcjRkRCNDVDJyxcbiAgICAgICAgICAgICcjNEQ1MzYwJyxcbiAgICAgICAgICAgICcjN2NiNWVjJyxcbiAgICAgICAgICAgICcjOTBlZDdkJyxcbiAgICAgICAgICAgICcjZjdhMzVjJyxcbiAgICAgICAgICAgICcjODA4NWU5JyxcbiAgICAgICAgICAgICcjZjE1YzgwJyxcbiAgICAgICAgICAgICcjZTRkMzU0JyxcbiAgICAgICAgICAgICcjODA4NWU4JyxcbiAgICAgICAgICAgICcjOGQ0NjUzJyxcbiAgICAgICAgICAgICcjOTFlOGUxJ1xuICAgICAgICBdO1xuICAgIH1cbn1cbiIsImV4cG9ydCBjbGFzcyBNYXBzIHtcblxuICAgIGNsb25lKG1hcCkge1xuICAgICAgICBsZXQgbmV3TWFwID0gbmV3IE1hcCgpO1xuICAgICAgICBtYXAuZm9yRWFjaCgodmFsdWUsIGtleSkgPT4ge1xuICAgICAgICAgICAgbmV3TWFwLnNldChrZXksIHZhbHVlKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIG5ld01hcDtcbiAgICB9XG5cbiAgICBzdW0obWFwMSwgbWFwMikge1xuICAgICAgICBsZXQgbmV3TWFwID0gbmV3IE1hcCgpO1xuICAgICAgICBtYXAxLmZvckVhY2goKHZhbHVlLCBrZXkpID0+IHtcbiAgICAgICAgICAgIG5ld01hcC5zZXQoa2V5LCB2YWx1ZSk7XG4gICAgICAgIH0pO1xuICAgICAgICBtYXAyLmZvckVhY2goKHZhbHVlLCBrZXkpID0+IHtcbiAgICAgICAgICAgIG5ld01hcC5zZXQoa2V5LCB2YWx1ZSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBuZXdNYXA7XG4gICAgfVxufVxuIiwid2luZG93LnJlcG9ydGpzID0gcmVxdWlyZSgnLi4vc3JjL2luZGV4LmpzJyk7XG4iXX0=
