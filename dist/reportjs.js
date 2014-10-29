(function(globals) {
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
  function createPrivateName() {
    var s = newUniqueString();
    privateNames[s] = true;
    return s;
  }
  function isSymbol(symbol) {
    return typeof symbol === 'object' && symbol instanceof SymbolValue;
  }
  function typeOf(v) {
    if (isSymbol(v))
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
  Symbol.iterator = Symbol();
  freeze(SymbolValue.prototype);
  function toProperty(name) {
    if (isSymbol(name))
      return name[symbolInternalProperty];
    return name;
  }
  function getOwnPropertyNames(object) {
    var rv = [];
    var names = $getOwnPropertyNames(object);
    for (var i = 0; i < names.length; i++) {
      var name = names[i];
      if (!symbolValues[name] && !privateNames[name])
        rv.push(name);
    }
    return rv;
  }
  function getOwnPropertyDescriptor(object, name) {
    return $getOwnPropertyDescriptor(object, toProperty(name));
  }
  function getOwnPropertySymbols(object) {
    var rv = [];
    var names = $getOwnPropertyNames(object);
    for (var i = 0; i < names.length; i++) {
      var symbol = symbolValues[names[i]];
      if (symbol)
        rv.push(symbol);
    }
    return rv;
  }
  function hasOwnProperty(name) {
    return $hasOwnProperty.call(this, toProperty(name));
  }
  function getOption(name) {
    return global.traceur && global.traceur.options[name];
  }
  function setProperty(object, name, value) {
    var sym,
        desc;
    if (isSymbol(name)) {
      sym = name;
      name = name[symbolInternalProperty];
    }
    object[name] = value;
    if (sym && (desc = $getOwnPropertyDescriptor(object, name)))
      $defineProperty(object, name, {enumerable: false});
    return value;
  }
  function defineProperty(object, name, descriptor) {
    if (isSymbol(name)) {
      if (descriptor.enumerable) {
        descriptor = $create(descriptor, {enumerable: {value: false}});
      }
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
    Object.getOwnPropertySymbols = getOwnPropertySymbols;
  }
  function exportStar(object) {
    for (var i = 1; i < arguments.length; i++) {
      var names = $getOwnPropertyNames(arguments[i]);
      for (var j = 0; j < names.length; j++) {
        var name = names[j];
        if (privateNames[name])
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
  function assertObject(x) {
    if (!isObject(x))
      throw $TypeError(x + ' is not an Object');
    return x;
  }
  function setupGlobals(global) {
    global.Symbol = Symbol;
    global.Reflect = global.Reflect || {};
    global.Reflect.global = global.Reflect.global || global;
    polyfillObject(global.Object);
  }
  setupGlobals(global);
  global.$traceurRuntime = {
    assertObject: assertObject,
    createPrivateName: createPrivateName,
    exportStar: exportStar,
    getOwnHashObject: getOwnHashObject,
    privateNames: privateNames,
    setProperty: setProperty,
    setupGlobals: setupGlobals,
    toObject: toObject,
    isObject: isObject,
    toProperty: toProperty,
    type: types,
    typeof: typeOf,
    defineProperties: $defineProperties,
    defineProperty: $defineProperty,
    getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
    getOwnPropertyNames: $getOwnPropertyNames,
    keys: $keys
  };
})(typeof global !== 'undefined' ? global : this);
(function() {
  'use strict';
  function spread() {
    var rv = [],
        j = 0,
        iterResult;
    for (var i = 0; i < arguments.length; i++) {
      var valueToSpread = arguments[i];
      if (!$traceurRuntime.isObject(valueToSpread)) {
        throw new TypeError('Cannot spread non-object.');
      }
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
    throw $TypeError("super has no setter '" + name + "'.");
  }
  function getDescriptors(object) {
    var descriptors = {},
        name,
        names = $getOwnPropertyNames(object);
    for (var i = 0; i < names.length; i++) {
      var name = names[i];
      descriptors[name] = $getOwnPropertyDescriptor(object, name);
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
    throw new $TypeError('Super expression must either be null or a function');
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
  var $__2 = $traceurRuntime.assertObject($traceurRuntime),
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
    this.message = this.constructor.name + (cause ? ': \'' + cause + '\'' : '') + ' in ' + erroneousModuleName;
  };
  ($traceurRuntime.createClass)(ModuleEvaluationError, {loadedBy: function(moduleName) {
      this.message += '\n loaded by ' + moduleName;
    }}, {}, Error);
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
System.register("traceur-runtime@0.0.51/src/runtime/polyfills/utils", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.51/src/runtime/polyfills/utils";
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
    }
  };
});
System.register("traceur-runtime@0.0.51/src/runtime/polyfills/Array", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.51/src/runtime/polyfills/Array";
  var $__3 = System.get("traceur-runtime@0.0.51/src/runtime/polyfills/utils"),
      isCallable = $__3.isCallable,
      isConstructor = $__3.isConstructor,
      checkIterable = $__3.checkIterable,
      toInteger = $__3.toInteger,
      toLength = $__3.toLength,
      toObject = $__3.toObject;
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
      for (var $__4 = items[Symbol.iterator](),
          $__5; !($__5 = $__4.next()).done; ) {
        var item = $__5.value;
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
        arr[k] = mapFn.call(thisArg, items[k], k);
      } else {
        arr[k] = items[k];
      }
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
      if (i in object) {
        var value = object[i];
        if (predicate.call(thisArg, value, i, object)) {
          return returnIndex ? i : value;
        }
      }
    }
    return returnIndex ? -1 : undefined;
  }
  return {
    get from() {
      return from;
    },
    get fill() {
      return fill;
    },
    get find() {
      return find;
    },
    get findIndex() {
      return findIndex;
    }
  };
});
System.register("traceur-runtime@0.0.51/src/runtime/polyfills/ArrayIterator", [], function() {
  "use strict";
  var $__8;
  var __moduleName = "traceur-runtime@0.0.51/src/runtime/polyfills/ArrayIterator";
  var $__6 = System.get("traceur-runtime@0.0.51/src/runtime/polyfills/utils"),
      toObject = $__6.toObject,
      toUint32 = $__6.toUint32;
  var ARRAY_ITERATOR_KIND_KEYS = 1;
  var ARRAY_ITERATOR_KIND_VALUES = 2;
  var ARRAY_ITERATOR_KIND_ENTRIES = 3;
  var ArrayIterator = function ArrayIterator() {};
  ($traceurRuntime.createClass)(ArrayIterator, ($__8 = {}, Object.defineProperty($__8, "next", {
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
  }), Object.defineProperty($__8, Symbol.iterator, {
    value: function() {
      return this;
    },
    configurable: true,
    enumerable: true,
    writable: true
  }), $__8), {});
  function createArrayIterator(array, kind) {
    var object = toObject(array);
    var iterator = new ArrayIterator;
    iterator.iteratorObject_ = object;
    iterator.arrayIteratorNextIndex_ = 0;
    iterator.arrayIterationKind_ = kind;
    return iterator;
  }
  function createIteratorResultObject(value, done) {
    return {
      value: value,
      done: done
    };
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
System.register("traceur-runtime@0.0.51/src/runtime/polyfills/Map", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.51/src/runtime/polyfills/Map";
  var isObject = System.get("traceur-runtime@0.0.51/src/runtime/polyfills/utils").isObject;
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
      for (var $__11 = iterable[Symbol.iterator](),
          $__12; !($__12 = $__11.next()).done; ) {
        var $__13 = $traceurRuntime.assertObject($__12.value),
            key = $__13[0],
            value = $__13[1];
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
      }
    },
    clear: function() {
      initMap(this);
    },
    forEach: function(callbackFn) {
      var thisArg = arguments[1];
      for (var i = 0,
          len = this.entries_.length; i < len; i += 2) {
        var key = this.entries_[i];
        var value = this.entries_[i + 1];
        if (key === deletedSentinel)
          continue;
        callbackFn.call(thisArg, value, key, this);
      }
    },
    entries: $traceurRuntime.initGeneratorFunction(function $__14() {
      var i,
          len,
          key,
          value;
      return $traceurRuntime.createGeneratorInstance(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              i = 0, len = this.entries_.length;
              $ctx.state = 12;
              break;
            case 12:
              $ctx.state = (i < len) ? 8 : -2;
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
      }, $__14, this);
    }),
    keys: $traceurRuntime.initGeneratorFunction(function $__15() {
      var i,
          len,
          key,
          value;
      return $traceurRuntime.createGeneratorInstance(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              i = 0, len = this.entries_.length;
              $ctx.state = 12;
              break;
            case 12:
              $ctx.state = (i < len) ? 8 : -2;
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
      }, $__15, this);
    }),
    values: $traceurRuntime.initGeneratorFunction(function $__16() {
      var i,
          len,
          key,
          value;
      return $traceurRuntime.createGeneratorInstance(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              i = 0, len = this.entries_.length;
              $ctx.state = 12;
              break;
            case 12:
              $ctx.state = (i < len) ? 8 : -2;
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
      }, $__16, this);
    })
  }, {});
  Object.defineProperty(Map.prototype, Symbol.iterator, {
    configurable: true,
    writable: true,
    value: Map.prototype.entries
  });
  return {get Map() {
      return Map;
    }};
});
System.register("traceur-runtime@0.0.51/src/runtime/polyfills/Number", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.51/src/runtime/polyfills/Number";
  var $__17 = System.get("traceur-runtime@0.0.51/src/runtime/polyfills/utils"),
      isNumber = $__17.isNumber,
      toInteger = $__17.toInteger;
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
    }
  };
});
System.register("traceur-runtime@0.0.51/src/runtime/polyfills/Object", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.51/src/runtime/polyfills/Object";
  var $__18 = $traceurRuntime.assertObject($traceurRuntime),
      defineProperty = $__18.defineProperty,
      getOwnPropertyDescriptor = $__18.getOwnPropertyDescriptor,
      getOwnPropertyNames = $__18.getOwnPropertyNames,
      keys = $__18.keys,
      privateNames = $__18.privateNames;
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
        if (privateNames[name])
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
      if (privateNames[name])
        continue;
      descriptor = getOwnPropertyDescriptor(source, props[p]);
      defineProperty(target, props[p], descriptor);
    }
    return target;
  }
  return {
    get is() {
      return is;
    },
    get assign() {
      return assign;
    },
    get mixin() {
      return mixin;
    }
  };
});
System.register("traceur-runtime@0.0.51/node_modules/rsvp/lib/rsvp/asap", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.51/node_modules/rsvp/lib/rsvp/asap";
  function asap(callback, arg) {
    var length = queue.push([callback, arg]);
    if (length === 1) {
      scheduleFlush();
    }
  }
  var $__default = asap;
  ;
  var browserGlobal = (typeof window !== 'undefined') ? window : {};
  var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
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
  function useSetTimeout() {
    return function() {
      setTimeout(flush, 1);
    };
  }
  var queue = [];
  function flush() {
    for (var i = 0; i < queue.length; i++) {
      var tuple = queue[i];
      var callback = tuple[0],
          arg = tuple[1];
      callback(arg);
    }
    queue = [];
  }
  var scheduleFlush;
  if (typeof process !== 'undefined' && {}.toString.call(process) === '[object process]') {
    scheduleFlush = useNextTick();
  } else if (BrowserMutationObserver) {
    scheduleFlush = useMutationObserver();
  } else {
    scheduleFlush = useSetTimeout();
  }
  return {get default() {
      return $__default;
    }};
});
System.register("traceur-runtime@0.0.51/src/runtime/polyfills/Promise", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.51/src/runtime/polyfills/Promise";
  var async = System.get("traceur-runtime@0.0.51/node_modules/rsvp/lib/rsvp/asap").default;
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
    cast: function(x) {
      if (x instanceof this)
        return x;
      if (isPromise(x)) {
        var result = getDeferred(this);
        chain(x, result.resolve, result.reject);
        return result.promise;
      }
      return this.resolve(x);
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
  return {get Promise() {
      return Promise;
    }};
});
System.register("traceur-runtime@0.0.51/src/runtime/polyfills/Set", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.51/src/runtime/polyfills/Set";
  var isObject = System.get("traceur-runtime@0.0.51/src/runtime/polyfills/utils").isObject;
  var Map = System.get("traceur-runtime@0.0.51/src/runtime/polyfills/Map").Map;
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
      for (var $__25 = iterable[Symbol.iterator](),
          $__26; !($__26 = $__25.next()).done; ) {
        var item = $__26.value;
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
      return this.map_.set(key, key);
    },
    delete: function(key) {
      return this.map_.delete(key);
    },
    clear: function() {
      return this.map_.clear();
    },
    forEach: function(callbackFn) {
      var thisArg = arguments[1];
      var $__23 = this;
      return this.map_.forEach((function(value, key) {
        callbackFn.call(thisArg, key, key, $__23);
      }));
    },
    values: $traceurRuntime.initGeneratorFunction(function $__27() {
      var $__28,
          $__29;
      return $traceurRuntime.createGeneratorInstance(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              $__28 = this.map_.keys()[Symbol.iterator]();
              $ctx.sent = void 0;
              $ctx.action = 'next';
              $ctx.state = 12;
              break;
            case 12:
              $__29 = $__28[$ctx.action]($ctx.sentIgnoreThrow);
              $ctx.state = 9;
              break;
            case 9:
              $ctx.state = ($__29.done) ? 3 : 2;
              break;
            case 3:
              $ctx.sent = $__29.value;
              $ctx.state = -2;
              break;
            case 2:
              $ctx.state = 12;
              return $__29.value;
            default:
              return $ctx.end();
          }
      }, $__27, this);
    }),
    entries: $traceurRuntime.initGeneratorFunction(function $__30() {
      var $__31,
          $__32;
      return $traceurRuntime.createGeneratorInstance(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              $__31 = this.map_.entries()[Symbol.iterator]();
              $ctx.sent = void 0;
              $ctx.action = 'next';
              $ctx.state = 12;
              break;
            case 12:
              $__32 = $__31[$ctx.action]($ctx.sentIgnoreThrow);
              $ctx.state = 9;
              break;
            case 9:
              $ctx.state = ($__32.done) ? 3 : 2;
              break;
            case 3:
              $ctx.sent = $__32.value;
              $ctx.state = -2;
              break;
            case 2:
              $ctx.state = 12;
              return $__32.value;
            default:
              return $ctx.end();
          }
      }, $__30, this);
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
  return {get Set() {
      return Set;
    }};
});
System.register("traceur-runtime@0.0.51/src/runtime/polyfills/String", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.51/src/runtime/polyfills/String";
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
    }
  };
});
System.register("traceur-runtime@0.0.51/src/runtime/polyfills/polyfills", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.51/src/runtime/polyfills/polyfills";
  var Map = System.get("traceur-runtime@0.0.51/src/runtime/polyfills/Map").Map;
  var Set = System.get("traceur-runtime@0.0.51/src/runtime/polyfills/Set").Set;
  var Promise = System.get("traceur-runtime@0.0.51/src/runtime/polyfills/Promise").Promise;
  var $__36 = System.get("traceur-runtime@0.0.51/src/runtime/polyfills/String"),
      codePointAt = $__36.codePointAt,
      contains = $__36.contains,
      endsWith = $__36.endsWith,
      fromCodePoint = $__36.fromCodePoint,
      repeat = $__36.repeat,
      raw = $__36.raw,
      startsWith = $__36.startsWith;
  var $__37 = System.get("traceur-runtime@0.0.51/src/runtime/polyfills/Array"),
      fill = $__37.fill,
      find = $__37.find,
      findIndex = $__37.findIndex,
      from = $__37.from;
  var $__38 = System.get("traceur-runtime@0.0.51/src/runtime/polyfills/ArrayIterator"),
      entries = $__38.entries,
      keys = $__38.keys,
      values = $__38.values;
  var $__39 = System.get("traceur-runtime@0.0.51/src/runtime/polyfills/Object"),
      assign = $__39.assign,
      is = $__39.is,
      mixin = $__39.mixin;
  var $__40 = System.get("traceur-runtime@0.0.51/src/runtime/polyfills/Number"),
      MAX_SAFE_INTEGER = $__40.MAX_SAFE_INTEGER,
      MIN_SAFE_INTEGER = $__40.MIN_SAFE_INTEGER,
      EPSILON = $__40.EPSILON,
      isFinite = $__40.isFinite,
      isInteger = $__40.isInteger,
      isNaN = $__40.isNaN,
      isSafeInteger = $__40.isSafeInteger;
  var getPrototypeOf = $traceurRuntime.assertObject(Object).getPrototypeOf;
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
  function polyfillPromise(global) {
    if (!global.Promise)
      global.Promise = Promise;
  }
  function polyfillCollections(global, Symbol) {
    if (!global.Map)
      global.Map = Map;
    var mapPrototype = global.Map.prototype;
    maybeAddIterator(mapPrototype, mapPrototype.entries, Symbol);
    maybeAddIterator(getPrototypeOf(new global.Map().values()), function() {
      return this;
    }, Symbol);
    if (!global.Set)
      global.Set = Set;
    var setPrototype = global.Set.prototype;
    maybeAddIterator(setPrototype, setPrototype.values, Symbol);
    maybeAddIterator(getPrototypeOf(new global.Set().values()), function() {
      return this;
    }, Symbol);
  }
  function polyfillString(String) {
    maybeAddFunctions(String.prototype, ['codePointAt', codePointAt, 'contains', contains, 'endsWith', endsWith, 'startsWith', startsWith, 'repeat', repeat]);
    maybeAddFunctions(String, ['fromCodePoint', fromCodePoint, 'raw', raw]);
  }
  function polyfillArray(Array, Symbol) {
    maybeAddFunctions(Array.prototype, ['entries', entries, 'keys', keys, 'values', values, 'fill', fill, 'find', find, 'findIndex', findIndex]);
    maybeAddFunctions(Array, ['from', from]);
    maybeAddIterator(Array.prototype, values, Symbol);
    maybeAddIterator(getPrototypeOf([].values()), function() {
      return this;
    }, Symbol);
  }
  function polyfillObject(Object) {
    maybeAddFunctions(Object, ['assign', assign, 'is', is, 'mixin', mixin]);
  }
  function polyfillNumber(Number) {
    maybeAddConsts(Number, ['MAX_SAFE_INTEGER', MAX_SAFE_INTEGER, 'MIN_SAFE_INTEGER', MIN_SAFE_INTEGER, 'EPSILON', EPSILON]);
    maybeAddFunctions(Number, ['isFinite', isFinite, 'isInteger', isInteger, 'isNaN', isNaN, 'isSafeInteger', isSafeInteger]);
  }
  function polyfill(global) {
    polyfillPromise(global);
    polyfillCollections(global, global.Symbol);
    polyfillString(global.String);
    polyfillArray(global.Array, global.Symbol);
    polyfillObject(global.Object);
    polyfillNumber(global.Number);
  }
  polyfill(this);
  var setupGlobals = $traceurRuntime.setupGlobals;
  $traceurRuntime.setupGlobals = function(global) {
    setupGlobals(global);
    polyfill(global);
  };
  return {};
});
System.register("traceur-runtime@0.0.51/src/runtime/polyfill-import", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.51/src/runtime/polyfill-import";
  System.get("traceur-runtime@0.0.51/src/runtime/polyfills/polyfills");
  return {};
});
System.get("traceur-runtime@0.0.51/src/runtime/polyfill-import" + '');

var define, requireModule;

(function() {
  var registry = {}, seen = {};

  define = function(name, deps, callback) {
    registry[name] = { deps: deps, callback: callback };
  };

  requireModule = function(name) {
    if (seen[name]) { return seen[name]; }
    seen[name] = {};

    var mod = registry[name];
    if (!mod) {
      throw new Error('Module "' + name + '" not found.');
    }

    var deps = mod.deps,
        callback = mod.callback,
        reified = [],
        exports;

    for (var i=0, l=deps.length; i<l; i++) {
      if (deps[i] === 'exports') {
        reified.push(exports = {});
      } else {
        reified.push(requireModule(deps[i]));
      }
    }

    var value = callback.apply(this, reified);
    return seen[name] = exports || value;
  };
})();

define("adapter/chartjsAdapter", ['utils/colors'], function($__0) {
  "use strict";
  var __moduleName = "adapter/chartjsAdapter";
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  var Colors = $__0.Colors;
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
                rgbColor = colors.hexToRgb(colorScheme[$traceurRuntime.toProperty(colorIndex)]);
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
      element.prepend('<canvas width="' + element.width() + '" height="400"></canvas>');
      var context = element.find('canvas:first').get(0).getContext('2d'),
          chart = new Chart(context);
      switch (graph.graphType) {
        case 'line':
          chart.Line(getChartData(graph));
          break;
        case 'bar':
          chart.Bar(getChartData(graph));
          break;
        case 'radar':
          chart.Radar(getChartData(graph));
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
              rgbColor = colors.hexToRgb(colorScheme[$traceurRuntime.toProperty(colorIndex)]);
          label.color = colors.rgbToString(rgbColor, 0.8);
          label.highlight = colors.rgbToString(rgbColor, 1);
          index++;
          return label;
        }));
      };
      element.prepend('<canvas width="' + element.width() + '" height="400"></canvas>');
      var context = element.find('canvas:first').get(0).getContext('2d'),
          chart = new Chart(context);
      switch (graph.graphType) {
        case 'pie':
          chart.Pie(getChartData(graph));
          break;
        case 'polarArea':
          chart.PolarArea(getChartData(graph));
          break;
        case 'doughnut':
          chart.Doughnut(getChartData(graph));
          break;
        default:
          throw Error('Unknown segment graph type "' + graph.graphType + '"');
      }
    }
  }, {});
  return {
    get ChartjsAdapter() {
      return ChartjsAdapter;
    },
    __esModule: true
  };
});

define("data/cell", [], function() {
  "use strict";
  var __moduleName = "data/cell";
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
  return {
    get Cell() {
      return Cell;
    },
    __esModule: true
  };
});

define("data/dimension", [], function() {
  "use strict";
  var __moduleName = "data/dimension";
  var Dimension = function Dimension(id, caption) {
    this.id = id;
    this.caption = caption === undefined ? id : caption;
  };
  ($traceurRuntime.createClass)(Dimension, {}, {});
  return {
    get Dimension() {
      return Dimension;
    },
    __esModule: true
  };
});

define("data/dimensionValue", [], function() {
  "use strict";
  var __moduleName = "data/dimensionValue";
  var DimensionValue = function DimensionValue(id, caption) {
    this.id = id;
    this.caption = caption === undefined ? id : caption;
  };
  ($traceurRuntime.createClass)(DimensionValue, {}, {});
  return {
    get DimensionValue() {
      return DimensionValue;
    },
    __esModule: true
  };
});

define("data/grid", ['utils/maps', 'data/dimension', 'data/dimensionValue', 'data/cell'], function($__0,$__2,$__4,$__6) {
  "use strict";
  var __moduleName = "data/grid";
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  if (!$__4 || !$__4.__esModule)
    $__4 = {default: $__4};
  if (!$__6 || !$__6.__esModule)
    $__6 = {default: $__6};
  var Maps = $__0.Maps;
  var Dimension = $__2.Dimension;
  var DimensionValue = $__4.DimensionValue;
  var Cell = $__6.Cell;
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
            var $__8 = this;
            if (dimensions.length === 0) {
              sets.push(set);
              return;
            }
            var currentDimension = dimensions[0],
                remainingDimensions = dimensions.slice(1);
            this.getDimensionValues(currentDimension).forEach((function(dimensionValue) {
              var currentSet$__10;
              var subCells = cells.filter((function(cell) {
                return cell.getDimensionValue(currentDimension) === dimensionValue;
              }));
              if (subCells.length) {
                currentSet$__10 = mapUtils.clone(set);
                currentSet$__10.set(currentDimension.id, dimensionValue);
                getSets.call($__8, sets, remainingDimensions, subCells, currentSet$__10);
              }
            }), this);
          };
      var sets = [];
      getSets.call(this, sets, dimensions, this.cells);
      return sets;
    },
    getCell: function(dimensionValues) {
      var $__8 = this;
      return this.cells.find((function(cell) {
        var found = true;
        dimensionValues.forEach((function(dimensionValue, dimensionId) {
          if (dimensionValue.id !== cell.getDimensionValue($__8.getDimension(dimensionId)).id) {
            found = false;
          }
        }), $__8);
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
  return {
    get Grid() {
      return Grid;
    },
    __esModule: true
  };
});

define("data/gridFactory", ['data/dimension', 'data/dimensionValue', 'data/cell', 'data/grid'], function($__0,$__2,$__4,$__6) {
  "use strict";
  var __moduleName = "data/gridFactory";
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  if (!$__4 || !$__4.__esModule)
    $__4 = {default: $__4};
  if (!$__6 || !$__6.__esModule)
    $__6 = {default: $__6};
  var Dimension = $__0.Dimension;
  var DimensionValue = $__2.DimensionValue;
  var Cell = $__4.Cell;
  var Grid = $__6.Grid;
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
        gridData.dimensionValues[$traceurRuntime.toProperty(index)].forEach((function(dimensionValue, dimensionValueIndex) {
          dimensionValuesByDimensions.get(dimensionId).set(dimensionValue.id, new DimensionValue(dimensionValue.id, dimensionValue.caption));
          dimensionValuePositions.get(dimensionId).set(dimensionValueIndex, dimensionValue.id);
        }));
      }));
      gridData.cells.forEach((function(cell) {
        var cellDimensionValues = new Map();
        dimensionPositions.forEach((function(index, dimensionId) {
          var dimensionValue = dimensionValuesByDimensions.get(dimensionId).get(dimensionValuePositions.get(dimensionId).get(cell.dimensionValues[$traceurRuntime.toProperty(index)]));
          cellDimensionValues.set(dimensionId, dimensionValue);
        }));
        cells.push(new Cell(cellDimensionValues, cell.value));
      }));
      return new Grid(dimensions, dimensionValuesByDimensions, cells);
    }}, {});
  return {
    get GridFactory() {
      return GridFactory;
    },
    __esModule: true
  };
});

define("renderer/graph/graphRenderer", ['result/graph/graph'], function($__0) {
  "use strict";
  var __moduleName = "renderer/graph/graphRenderer";
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  var Graph = $__0.Graph;
  var GraphRenderer = function GraphRenderer(datasetsDimensions, labelsDimensions) {
    var graphType = arguments[2] !== (void 0) ? arguments[2] : 'line';
    this.datasetsDimensions = datasetsDimensions;
    this.labelsDimensions = labelsDimensions;
    this.graphType = graphType;
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
      return new Graph(this.graphType, labels, datasets);
    }}, {});
  return {
    get GraphRenderer() {
      return GraphRenderer;
    },
    __esModule: true
  };
});

define("renderer/graph/segmentGraphRenderer", ['result/graph/segmentGraph'], function($__0) {
  "use strict";
  var __moduleName = "renderer/graph/segmentGraphRenderer";
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  var SegmentGraph = $__0.SegmentGraph;
  var SegmentGraphRenderer = function SegmentGraphRenderer() {
    var graphType = arguments[0] !== (void 0) ? arguments[0] : 'pie';
    this.graphType = graphType;
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
      return new SegmentGraph(this.graphType, labels);
    }}, {});
  return {
    get SegmentGraphRenderer() {
      return SegmentGraphRenderer;
    },
    __esModule: true
  };
});

define("renderer/table/tableBodyRenderer", ['result/table/tableRow', 'result/table/tableCell', 'utils/maps'], function($__0,$__2,$__4) {
  "use strict";
  var __moduleName = "renderer/table/tableBodyRenderer";
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  if (!$__4 || !$__4.__esModule)
    $__4 = {default: $__4};
  var TableRow = $__0.TableRow;
  var TableCell = $__2.TableCell;
  var Maps = $__4.Maps;
  var TableBodyRenderer = function TableBodyRenderer(rowDimensions, columnDimensions) {
    this.rowDimensions = rowDimensions;
    this.columnDimensions = columnDimensions;
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
              var currentRow$__7;
              var currentDimensionValues$__8;
              var tableCell$__9;
              var childCellsCount$__10;
              var subCells = cells.filter((function(cell) {
                return cell.getDimensionValue(currentDimension) === dimensionValue;
              }));
              if (subCells.length) {
                currentRow$__7 = row;
                if (row === null || !first) {
                  currentRow$__7 = new TableRow();
                  rows.push(currentRow$__7);
                }
                first = false;
                currentDimensionValues$__8 = mapUtils.clone(dimensionValues);
                currentDimensionValues$__8.set(currentDimensionId, dimensionValue);
                tableCell$__9 = new TableCell(dimensionValue.caption, {header: true});
                currentRow$__7.addCell(tableCell$__9);
                childCellsCount$__10 = getRows(rows, remainingDimensions, columnDimensions, subCells, currentDimensionValues$__8, currentRow$__7);
                tableCell$__9.setOption('rowspan', childCellsCount$__10);
                countCells += childCellsCount$__10;
              }
            }));
            return countCells;
          };
      var rows = [];
      getRows(rows, this.rowDimensions, this.columnDimensions, grid.cells);
      return rows;
    },
    getHeaderCells: function() {
      return [new TableCell('', {
        colspan: this.rowDimensions.length,
        header: true
      })];
    }
  }, {});
  return {
    get TableBodyRenderer() {
      return TableBodyRenderer;
    },
    __esModule: true
  };
});

define("renderer/table/tableHeaderRenderer", ['result/table/tableRow', 'result/table/tableCell', 'utils/maps'], function($__0,$__2,$__4) {
  "use strict";
  var __moduleName = "renderer/table/tableHeaderRenderer";
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  if (!$__4 || !$__4.__esModule)
    $__4 = {default: $__4};
  var TableRow = $__0.TableRow;
  var TableCell = $__2.TableCell;
  var Maps = $__4.Maps;
  var TableHeaderRenderer = function TableHeaderRenderer(columnDimensions) {
    this.columnDimensions = columnDimensions;
  };
  ($traceurRuntime.createClass)(TableHeaderRenderer, {render: function(grid) {
      var rows$__9;
      var headerCells = arguments[1] !== (void 0) ? arguments[1] : [];
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
              var currentDimensionValues$__7;
              var childCellsCount$__8;
              var subCells = cells.filter((function(cell) {
                return cell.getDimensionValue(currentDimension) === dimensionValue;
              }));
              if (subCells.length) {
                currentDimensionValues$__7 = mapUtils.clone(dimensionValues);
                currentDimensionValues$__7.set(currentDimensionId, dimensionValue);
                childCellsCount$__8 = getHeaderRows(rows, remainingDimensions, subCells, currentDimensionValues$__7);
                currentRow.addCell(new TableCell(dimensionValue.caption, {
                  colspan: childCellsCount$__8,
                  header: true
                }));
                countCells += childCellsCount$__8;
              }
            }));
            return countCells;
          };
      var rowsMap = new Map();
      if (this.columnDimensions.length === 0) {
        return headerCells.concat([new TableRow([new TableCell('', {header: true})])]);
      } else {
        getHeaderRows(rowsMap, this.columnDimensions, grid.cells);
        rows$__9 = [];
        rowsMap.forEach((function(row) {
          row.cells = headerCells.concat(row.cells);
          rows$__9.push(row);
        }));
        return rows$__9;
      }
    }}, {});
  return {
    get TableHeaderRenderer() {
      return TableHeaderRenderer;
    },
    __esModule: true
  };
});

define("renderer/table/tableRenderer", ['result/table/table', 'renderer/table/tableHeaderRenderer', 'renderer/table/tableBodyRenderer'], function($__0,$__2,$__4) {
  "use strict";
  var __moduleName = "renderer/table/tableRenderer";
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  if (!$__4 || !$__4.__esModule)
    $__4 = {default: $__4};
  var Table = $__0.Table;
  var TableHeaderRenderer = $__2.TableHeaderRenderer;
  var TableBodyRenderer = $__4.TableBodyRenderer;
  var TableRenderer = function TableRenderer(rowDimensions, columnDimensions) {
    this.rowDimensions = rowDimensions;
    this.columnDimensions = columnDimensions;
  };
  ($traceurRuntime.createClass)(TableRenderer, {render: function(grid) {
      var table = new Table(),
          tableHeaderRenderer = new TableHeaderRenderer(this.columnDimensions),
          tableBodyRenderer = new TableBodyRenderer(this.rowDimensions, this.columnDimensions),
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
  return {
    get TableRenderer() {
      return TableRenderer;
    },
    __esModule: true
  };
});

define("reportjs", ['data/gridFactory', 'renderer/table/tableRenderer', 'renderer/graph/graphRenderer', 'renderer/graph/segmentGraphRenderer', 'adapter/chartjsAdapter'], function($__0,$__2,$__4,$__6,$__8) {
  "use strict";
  var __moduleName = "reportjs";
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  if (!$__2 || !$__2.__esModule)
    $__2 = {default: $__2};
  if (!$__4 || !$__4.__esModule)
    $__4 = {default: $__4};
  if (!$__6 || !$__6.__esModule)
    $__6 = {default: $__6};
  if (!$__8 || !$__8.__esModule)
    $__8 = {default: $__8};
  var GridFactory = $__0.GridFactory;
  var TableRenderer = $__2.TableRenderer;
  var GraphRenderer = $__4.GraphRenderer;
  var SegmentGraphRenderer = $__6.SegmentGraphRenderer;
  var ChartjsAdapter = $__8.ChartjsAdapter;
  var Renderer = function Renderer() {};
  ($traceurRuntime.createClass)(Renderer, {renderTo: function(element, options) {
      var tableRenderer$__11,
          table$__12;
      var graphRenderer$__13,
          graph$__14,
          adapter$__15;
      var graphRenderer$__16,
          graph$__17,
          adapter$__18;
      var gridFactory = new GridFactory(),
          grid = gridFactory.buildFromJson(options.data);
      if (options.layout.type === 'table') {
        tableRenderer$__11 = new TableRenderer(options.layout.rows, options.layout.columns);
        table$__12 = tableRenderer$__11.render(grid);
        element.html(table$__12.getHtml());
      } else if (options.layout.type === 'graph') {
        graphRenderer$__13 = new GraphRenderer(options.layout.datasets, options.layout.labels, options.layout.graphType);
        graph$__14 = graphRenderer$__13.render(grid);
        adapter$__15 = new ChartjsAdapter();
        adapter$__15.renderGraphTo(element, graph$__14);
      } else if (options.layout.type === 'segmentGraph') {
        graphRenderer$__16 = new SegmentGraphRenderer(options.layout.graphType);
        graph$__17 = graphRenderer$__16.render(grid);
        adapter$__18 = new ChartjsAdapter();
        adapter$__18.renderSegmentGraphTo(element, graph$__17);
      }
    }}, {});
  return {
    get Renderer() {
      return Renderer;
    },
    __esModule: true
  };
});

define("result/graph/graph", [], function() {
  "use strict";
  var __moduleName = "result/graph/graph";
  var Graph = function Graph(graphType) {
    var labels = arguments[1] !== (void 0) ? arguments[1] : [];
    var datasets = arguments[2] !== (void 0) ? arguments[2] : [];
    this.graphType = graphType;
    this.labels = labels;
    this.datasets = datasets;
  };
  ($traceurRuntime.createClass)(Graph, {addDataset: function(dataset) {
      this.datasets.push(dataset);
    }}, {});
  return {
    get Graph() {
      return Graph;
    },
    __esModule: true
  };
});

define("result/graph/segmentGraph", [], function() {
  "use strict";
  var __moduleName = "result/graph/segmentGraph";
  var SegmentGraph = function SegmentGraph(graphType) {
    var labels = arguments[1] !== (void 0) ? arguments[1] : [];
    this.graphType = graphType;
    this.labels = labels;
  };
  ($traceurRuntime.createClass)(SegmentGraph, {}, {});
  return {
    get SegmentGraph() {
      return SegmentGraph;
    },
    __esModule: true
  };
});

define("result/result", [], function() {
  "use strict";
  var __moduleName = "result/result";
  var Result = function Result() {
    this.results = [];
  };
  ($traceurRuntime.createClass)(Result, {addResult: function(result) {
      this.results.push(result);
    }}, {});
  return {
    get Result() {
      return Result;
    },
    __esModule: true
  };
});

define("result/table/table", [], function() {
  "use strict";
  var __moduleName = "result/table/table";
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
  return {
    get Table() {
      return Table;
    },
    __esModule: true
  };
});

define("result/table/tableCell", [], function() {
  "use strict";
  var __moduleName = "result/table/tableCell";
  var TableCell = function TableCell(value) {
    var options = arguments[1] !== (void 0) ? arguments[1] : {};
    this.value = value;
    this.options = options;
  };
  ($traceurRuntime.createClass)(TableCell, {setOption: function(key, value) {
      $traceurRuntime.setProperty(this.options, key, value);
    }}, {});
  return {
    get TableCell() {
      return TableCell;
    },
    __esModule: true
  };
});

define("result/table/tableRow", [], function() {
  "use strict";
  var __moduleName = "result/table/tableRow";
  var TableRow = function TableRow() {
    var cells = arguments[0] !== (void 0) ? arguments[0] : [];
    this.cells = cells;
  };
  ($traceurRuntime.createClass)(TableRow, {addCell: function(cell) {
      this.cells.push(cell);
    }}, {});
  return {
    get TableRow() {
      return TableRow;
    },
    __esModule: true
  };
});

define("utils/colors", [], function() {
  "use strict";
  var __moduleName = "utils/colors";
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
  return {
    get Colors() {
      return Colors;
    },
    __esModule: true
  };
});

define("utils/maps", [], function() {
  "use strict";
  var __moduleName = "utils/maps";
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
  return {
    get Maps() {
      return Maps;
    },
    __esModule: true
  };
});

window.reportjs = requireModule("reportjs");
})(window);