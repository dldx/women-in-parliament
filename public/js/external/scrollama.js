(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.scrollama = factory());
}(this, (function () { 'use strict';

// DOM helper functions

// private
function selectionToArray(selection) {
  var len = selection.length;
  var result = [];
  for (var i = 0; i < len; i += 1) {
    result.push(selection[i]);
  }
  return result;
}

// public
function select(selector) {
  if (selector instanceof Element) { return selector; }
  else if (typeof selector === 'string')
    { return document.querySelector(selector); }
  return null;
}

function selectAll(selector, parent) {
  if ( parent === void 0 ) parent = document;

  if (typeof selector === 'string') {
    return selectionToArray(parent.querySelectorAll(selector));
  } else if (selector instanceof NodeList) {
    return selectionToArray(selector);
  } else if (selector instanceof Array) {
    return selector;
  }
  return [];
}

function getStepId(ref) {
  var id = ref.id;
  var i = ref.i;

  return ("scrollama__debug-step--" + id + "-" + i);
}

function getOffsetId(ref) {
  var id = ref.id;

  return ("scrollama__debug-offset--" + id);
}

// SETUP
function setupStep(ref) {
  var id = ref.id;
  var i = ref.i;

  var idVal = getStepId({ id: id, i: i });

  var elA = document.createElement('div');
  elA.setAttribute('id', (idVal + "_above"));
  elA.setAttribute('class', 'scrollama__debug-step');
  elA.style.position = 'fixed';
  elA.style.left = '0';
  elA.style.width = '100%';
  // elA.style.backgroundColor = 'green';
  elA.style.backgroundImage =
    'repeating-linear-gradient(45deg, green 0, green 2px, white 0, white 40px)';
  elA.style.border = '2px solid green';
  elA.style.opacity = '0.33';
  elA.style.zIndex = '9999';
  elA.style.display = 'none';

  document.body.appendChild(elA);

  var elB = document.createElement('div');
  elB.setAttribute('id', (idVal + "_below"));
  elB.setAttribute('class', 'scrollama__debug-step');
  elB.style.position = 'fixed';
  elB.style.left = '0';
  elB.style.width = '100%';
  // elB.style.backgroundColor = 'orange';
  elB.style.backgroundImage =
    'repeating-linear-gradient(135deg, orange 0, orange 2px, white 0, white 40px)';
  elB.style.border = '2px solid orange';
  elB.style.opacity = '0.33';
  elB.style.zIndex = '9999';
  elB.style.display = 'none';
  document.body.appendChild(elB);
}

function setupOffset(ref) {
  var id = ref.id;
  var offsetVal = ref.offsetVal;
  var stepClass = ref.stepClass;

  var el = document.createElement('div');
  el.setAttribute('id', getOffsetId({ id: id }));
  el.setAttribute('class', 'scrollama__debug-offset');

  el.style.position = 'fixed';
  el.style.left = '0';
  el.style.width = '100%';
  el.style.height = '0px';
  el.style.borderTop = '2px dashed black';
  el.style.zIndex = '9999';

  var text = document.createElement('p');
  text.innerText = "\"." + stepClass + "\" trigger: " + offsetVal;
  text.style.fontSize = '12px';
  text.style.fontFamily = 'monospace';
  text.style.color = 'black';
  text.style.margin = '0';
  text.style.padding = '6px';
  el.appendChild(text);
  document.body.appendChild(el);
}

function setup(ref) {
  var id = ref.id;
  var offsetVal = ref.offsetVal;
  var stepEl = ref.stepEl;

  var stepClass = stepEl[0].getAttribute('class');
  stepEl.forEach(function (s, i) { return setupStep({ id: id, i: i }); });
  setupOffset({ id: id, offsetVal: offsetVal, stepClass: stepClass });
}

// UPDATE
function updateOffset(ref) {
  var id = ref.id;
  var offsetMargin = ref.offsetMargin;
  var offsetVal = ref.offsetVal;

  var idVal = getOffsetId({ id: id });
  var el = document.querySelector(("#" + idVal));
  el.style.top = offsetMargin + "px";
}

function updateStep(ref) {
  var id = ref.id;
  var h = ref.h;
  var i = ref.i;
  var offsetMargin = ref.offsetMargin;

  var idVal = getStepId({ id: id, i: i });
  var elA = document.querySelector(("#" + idVal + "_above"));
  elA.style.height = h + "px";
  elA.style.top = (offsetMargin - h) + "px";

  var elB = document.querySelector(("#" + idVal + "_below"));
  elB.style.height = h + "px";
  elB.style.top = offsetMargin + "px";
}

function update(ref) {
  var id = ref.id;
  var stepOffsetHeight = ref.stepOffsetHeight;
  var offsetMargin = ref.offsetMargin;
  var offsetVal = ref.offsetVal;

  stepOffsetHeight.forEach(function (h, i) { return updateStep({ id: id, h: h, i: i, offsetMargin: offsetMargin }); });
  updateOffset({ id: id, offsetMargin: offsetMargin });
}

function notifyStep(ref) {
  var id = ref.id;
  var index = ref.index;
  var state = ref.state;

  var idVal = getStepId({ id: id, i: index });
  var elA = document.querySelector(("#" + idVal + "_above"));
  var elB = document.querySelector(("#" + idVal + "_below"));
  var display = state === 'enter' ? 'block' : 'none';

  if (elA) { elA.style.display = display; }
  if (elB) { elB.style.display = display; }
}

function scrollama() {
  var ZERO_MOE = 1; // zero with some rounding margin of error
  var callback = {};
  var io = {};

  var containerEl = null;
  var graphicEl = null;
  var stepEl = null;

  var id = null;
  var offsetVal = 0;
  var offsetMargin = 0;
  var vh = 0;
  var ph = 0;
  var stepOffsetHeight = null;
  var stepOffsetTop = null;
  var bboxGraphic = null;

  var isReady = false;
  var isEnabled = false;
  var debugMode = false;
  var progressMode = false;
  var progressThreshold = 0;
  var preserveOrder = false;
  var triggerOnce = false;

  var stepStates = null;
  var containerState = null;
  var previousYOffset = -1;
  var direction = null;

  var exclude = [];

  // HELPERS
  function generateId() {
    var a = 'abcdefghijklmnopqrstuv';
    var l = a.length;
    var t = new Date().getTime();
    var r = [0, 0, 0].map(function (d) { return a[Math.floor(Math.random() * l)]; }).join('');
    return ("" + r + t);
  }

  //www.gomakethings.com/how-to-get-an-elements-distance-from-the-top-of-the-page-with-vanilla-javascript/
  function getOffsetTop(el) {
    // Set our distance placeholder
    var distance = 0;

    // Loop up the DOM
    if (el.offsetParent) {
      do {
        distance += el.offsetTop;
        el = el.offsetParent;
      } while (el);
    }

    // Return our distance
    return distance < 0 ? 0 : distance;
  }

  function getPageHeight() {
    var body = document.body;
    var html = document.documentElement;

    return Math.max(
      body.scrollHeight,
      body.offsetHeight,
      html.clientHeight,
      html.scrollHeight,
      html.offsetHeight
    );
  }

  function getIndex(element) {
    return +element.getAttribute('data-scrollama-index');
  }

  function updateDirection() {
    if (window.pageYOffset > previousYOffset) { direction = 'down'; }
    else if (window.pageYOffset < previousYOffset) { direction = 'up'; }
    previousYOffset = window.pageYOffset;
  }

  function handleResize() {
    vh = window.innerHeight;
    ph = getPageHeight();

    bboxGraphic = graphicEl ? graphicEl.getBoundingClientRect() : null;

    offsetMargin = offsetVal * vh;

    stepOffsetHeight = stepEl ? stepEl.map(function (el) { return el.offsetHeight; }) : [];

    stepOffsetTop = stepEl ? stepEl.map(getOffsetTop) : [];

    if (isEnabled && isReady) { updateIO(); }

    if (debugMode)
      { update({ id: id, stepOffsetHeight: stepOffsetHeight, offsetMargin: offsetMargin, offsetVal: offsetVal }); }
  }

  function handleEnable(enable) {
    if (enable && !isEnabled) {
      if (isReady) { updateIO(); }
      isEnabled = true;
    } else if (!enable) {
      if (io.top) { io.top.disconnect(); }
      if (io.bottom) { io.bottom.disconnect(); }
      if (io.stepAbove) { io.stepAbove.forEach(function (d) { return d.disconnect(); }); }
      if (io.stepBelow) { io.stepBelow.forEach(function (d) { return d.disconnect(); }); }
      if (io.stepProgress) { io.stepProgress.forEach(function (d) { return d.disconnect(); }); }
      if (io.viewportAbove) { io.viewportAbove.forEach(function (d) { return d.disconnect(); }); }
      if (io.viewportBelow) { io.viewportBelow.forEach(function (d) { return d.disconnect(); }); }
      isEnabled = false;
    }
  }

  function createThreshold(height) {
    var count = Math.ceil(height / progressThreshold);
    var t = [];
    var ratio = 1 / count;
    for (var i = 0; i < count; i++) {
      t.push(i * ratio);
    }
    return t;
  }

  // NOTIFY CALLBACKS
  function notifyOthers(index, location) {
    if (location === 'above') {
      // check if steps above/below were skipped and should be notified first
      for (var i = 0; i < index; i++) {
        var ss = stepStates[i];
        if (ss.state === 'enter') { notifyStepExit(stepEl[i], 'down'); }
        if (ss.direction === 'up') {
          notifyStepEnter(stepEl[i], 'down', false);
          notifyStepExit(stepEl[i], 'down');
        }
      }
    } else if (location === 'below') {
      for (var i$1 = stepStates.length - 1; i$1 > index; i$1--) {
        var ss$1 = stepStates[i$1];
        if (ss$1.state === 'enter') {
          notifyStepExit(stepEl[i$1], 'up');
        }
        if (ss$1.direction === 'down') {
          notifyStepEnter(stepEl[i$1], 'up', false);
          notifyStepExit(stepEl[i$1], 'up');
        }
      }
    }
  }

  function notifyStepEnter(element, check) {
    if ( check === void 0 ) check = true;

    var index = getIndex(element);
    var resp = { element: element, index: index, direction: direction };

    // store most recent trigger
    stepStates[index].direction = direction;
    stepStates[index].state = 'enter';

    if (preserveOrder && check && direction === 'down')
      { notifyOthers(index, 'above'); }

    if (preserveOrder && check && direction === 'up')
      { notifyOthers(index, 'below'); }

    if (
      callback.stepEnter &&
      typeof callback.stepEnter === 'function' &&
      !exclude[index]
    ) {
      callback.stepEnter(resp, stepStates);
      if (debugMode) { notifyStep({ id: id, index: index, state: 'enter' }); }
      if (triggerOnce) { exclude[index] = true; }
    }

    if (progressMode) {
      if (direction === 'down') { notifyStepProgress(element, 0); }
      else { notifyStepProgress(element, 1); }
    }
  }

  function notifyStepExit(element) {
    var index = getIndex(element);
    var resp = { element: element, index: index, direction: direction };

    // store most recent trigger
    stepStates[index].direction = direction;
    stepStates[index].state = 'exit';

    if (progressMode) {
      if (direction === 'down') { notifyStepProgress(element, 1); }
      else { notifyStepProgress(element, 0); }
    }

    if (callback.stepExit && typeof callback.stepExit === 'function') {
      callback.stepExit(resp, stepStates);
      if (debugMode) { notifyStep({ id: id, index: index, state: 'exit' }); }
    }
  }

  function notifyStepProgress(element, progress) {
    var index = getIndex(element);
    var resp = { element: element, index: index, progress: progress };
    if (callback.stepProgress && typeof callback.stepProgress === 'function')
      { callback.stepProgress(resp); }
  }

  function notifyContainerEnter() {
    var resp = { direction: direction };
    containerState.direction = direction;
    containerState.state = 'enter';
    if (
      callback.containerEnter &&
      typeof callback.containerEnter === 'function'
    )
      { callback.containerEnter(resp); }
  }

  function notifyContainerExit() {
    var resp = { direction: direction };
    containerState.direction = direction;
    containerState.state = 'exit';
    if (callback.containerExit && typeof callback.containerExit === 'function')
      { callback.containerExit(resp); }
  }

  // OBSERVER - INTERSECT HANDLING

  // if TOP edge of step crosses threshold,
  // bottom must be > 0 which means it is on "screen" (shifted by offset)
  function intersectStepAbove(entries) {
    updateDirection();
    entries.forEach(function (entry) {
      var isIntersecting = entry.isIntersecting;
      var boundingClientRect = entry.boundingClientRect;
      var target = entry.target;

      // bottom is how far bottom edge of el is from top of viewport
      var bottom = boundingClientRect.bottom;
      var height = boundingClientRect.height;
      var bottomAdjusted = bottom - offsetMargin;
      var index = getIndex(target);
      var ss = stepStates[index];

      if (bottomAdjusted >= -ZERO_MOE) {
        if (isIntersecting && direction === 'down' && ss.state !== 'enter')
          { notifyStepEnter(target, direction); }
        else if (!isIntersecting && direction === 'up' && ss.state === 'enter')
          { notifyStepExit(target, direction); }
        else if (
          !isIntersecting &&
          bottomAdjusted >= height &&
          direction === 'down' &&
          ss.state === 'enter'
        ) {
          notifyStepExit(target, direction);
        }
      }
    });
  }

  function intersectStepBelow(entries) {
    updateDirection();
    entries.forEach(function (entry) {
      var isIntersecting = entry.isIntersecting;
      var boundingClientRect = entry.boundingClientRect;
      var target = entry.target;

      var bottom = boundingClientRect.bottom;
      var height = boundingClientRect.height;
      var bottomAdjusted = bottom - offsetMargin;
      var index = getIndex(target);
      var ss = stepStates[index];

      if (
        bottomAdjusted >= -ZERO_MOE &&
        bottomAdjusted < height &&
        isIntersecting &&
        direction === 'up' &&
        ss.state !== 'enter'
      ) {
        notifyStepEnter(target, direction);
      } else if (
        bottomAdjusted <= ZERO_MOE &&
        !isIntersecting &&
        direction === 'down' &&
        ss.state === 'enter'
      ) {
        notifyStepExit(target, direction);
      }
    });
  }

  /*
	if there is a scroll event where a step never intersects (therefore
	skipping an enter/exit trigger), use this fallback to detect if it is
	in view
	*/
  function intersectViewportAbove(entries) {
    updateDirection();
    entries.forEach(function (entry) {
      var isIntersecting = entry.isIntersecting;
      var target = entry.target;
      var index = getIndex(target);
      var ss = stepStates[index];
      if (
        isIntersecting &&
        direction === 'down' &&
        ss.state !== 'enter' &&
        ss.direction !== 'down'
      ) {
        notifyStepEnter(target, 'down');
        notifyStepExit(target, 'down');
      }
    });
  }

  function intersectViewportBelow(entries) {
    updateDirection();
    entries.forEach(function (entry) {
      var isIntersecting = entry.isIntersecting;
      var target = entry.target;
      var index = getIndex(target);
      var ss = stepStates[index];
      if (
        isIntersecting &&
        direction === 'up' &&
        ss.state !== 'enter' &&
        ss.direction !== 'up'
      ) {
        notifyStepEnter(target, 'up');
        notifyStepExit(target, 'up');
      }
    });
  }

  function intersectStepProgress(entries) {
    updateDirection();
    entries.forEach(
      function (ref) {
        var isIntersecting = ref.isIntersecting;
        var intersectionRatio = ref.intersectionRatio;
        var boundingClientRect = ref.boundingClientRect;
        var target = ref.target;

        var bottom = boundingClientRect.bottom;
        var bottomAdjusted = bottom - offsetMargin;

        if (isIntersecting && bottomAdjusted >= -ZERO_MOE) {
          notifyStepProgress(target, +intersectionRatio.toFixed(3));
        }
      }
    );
  }

  function intersectTop(entries) {
    updateDirection();
    var ref = entries[0];
    var isIntersecting = ref.isIntersecting;
    var boundingClientRect = ref.boundingClientRect;
    var top = boundingClientRect.top;
    var bottom = boundingClientRect.bottom;

    if (bottom > -ZERO_MOE) {
      if (isIntersecting) { notifyContainerEnter(direction); }
      else if (containerState.state === 'enter') { notifyContainerExit(direction); }
    }
  }

  function intersectBottom(entries) {
    updateDirection();
    var ref = entries[0];
    var isIntersecting = ref.isIntersecting;
    var boundingClientRect = ref.boundingClientRect;
    var top = boundingClientRect.top;

    if (top < ZERO_MOE) {
      if (isIntersecting) { notifyContainerEnter(direction); }
      else if (containerState.state === 'enter') { notifyContainerExit(direction); }
    }
  }

  // OBSERVER - CREATION

  function updateTopIO() {
    if (io.top) { io.top.unobserve(containerEl); }

    var options = {
      root: null,
      rootMargin: (vh + "px 0px -" + vh + "px 0px"),
      threshold: 0
    };

    io.top = new IntersectionObserver(intersectTop, options);
    io.top.observe(containerEl);
  }

  function updateBottomIO() {
    if (io.bottom) { io.bottom.unobserve(containerEl); }
    var options = {
      root: null,
      rootMargin: ("-" + (bboxGraphic.height) + "px 0px " + (bboxGraphic.height) + "px 0px"),
      threshold: 0
    };

    io.bottom = new IntersectionObserver(intersectBottom, options);
    io.bottom.observe(containerEl);
  }

  // top edge
  function updateStepAboveIO() {
    if (io.stepAbove) { io.stepAbove.forEach(function (d) { return d.disconnect(); }); }

    io.stepAbove = stepEl.map(function (el, i) {
      var marginTop = stepOffsetHeight[i];
      var marginBottom = -vh + offsetMargin;
      var rootMargin = marginTop + "px 0px " + marginBottom + "px 0px";

      var options = {
        root: null,
        rootMargin: rootMargin,
        threshold: 0
      };

      var obs = new IntersectionObserver(intersectStepAbove, options);
      obs.observe(el);
      return obs;
    });
  }

  // bottom edge
  function updateStepBelowIO() {
    if (io.stepBelow) { io.stepBelow.forEach(function (d) { return d.disconnect(); }); }

    io.stepBelow = stepEl.map(function (el, i) {
      var marginTop = -offsetMargin;
      var marginBottom = ph - vh + stepOffsetHeight[i] + offsetMargin;
      var rootMargin = marginTop + "px 0px " + marginBottom + "px 0px";

      var options = {
        root: null,
        rootMargin: rootMargin,
        threshold: 0
      };

      var obs = new IntersectionObserver(intersectStepBelow, options);
      obs.observe(el);
      return obs;
    });
  }

  // jump into viewport
  function updateViewportAboveIO() {
    if (io.viewportAbove) { io.viewportAbove.forEach(function (d) { return d.disconnect(); }); }
    io.viewportAbove = stepEl.map(function (el, i) {
      var marginTop = stepOffsetTop[i];
      var marginBottom = -(vh - offsetMargin + stepOffsetHeight[i]);
      var rootMargin = marginTop + "px 0px " + marginBottom + "px 0px";
      var options = {
        root: null,
        rootMargin: rootMargin,
        threshold: 0
      };

      var obs = new IntersectionObserver(intersectViewportAbove, options);
      obs.observe(el);
      return obs;
    });
  }

  function updateViewportBelowIO() {
    if (io.viewportBelow) { io.viewportBelow.forEach(function (d) { return d.disconnect(); }); }
    io.viewportBelow = stepEl.map(function (el, i) {
      var marginTop = -(offsetMargin + stepOffsetHeight[i]);
      var marginBottom =
        ph - stepOffsetTop[i] - stepOffsetHeight[i] - offsetMargin;
      var rootMargin = marginTop + "px 0px " + marginBottom + "px 0px";
      var options = {
        root: null,
        rootMargin: rootMargin,
        threshold: 0
      };

      var obs = new IntersectionObserver(intersectViewportBelow, options);
      obs.observe(el);
      return obs;
    });
  }

  // progress progress tracker
  function updateStepProgressIO() {
    if (io.stepProgress) { io.stepProgress.forEach(function (d) { return d.disconnect(); }); }

    io.stepProgress = stepEl.map(function (el, i) {
      var marginTop = stepOffsetHeight[i] - offsetMargin;
      var marginBottom = -vh + offsetMargin;
      var rootMargin = marginTop + "px 0px " + marginBottom + "px 0px";

      var threshold = createThreshold(stepOffsetHeight[i]);
      var options = {
        root: null,
        rootMargin: rootMargin,
        threshold: threshold
      };

      var obs = new IntersectionObserver(intersectStepProgress, options);
      obs.observe(el);
      return obs;
    });
  }

  function updateIO() {
    updateViewportAboveIO();
    updateViewportBelowIO();
    updateStepAboveIO();
    updateStepBelowIO();

    if (progressMode) { updateStepProgressIO(); }

    if (containerEl && graphicEl) {
      updateTopIO();
      updateBottomIO();
    }
  }

  // SETUP FUNCTIONS

  function indexSteps() {
    stepEl.forEach(function (el, i) { return el.setAttribute('data-scrollama-index', i); });
  }

  function setupStates() {
    stepStates = stepEl.map(function () { return ({
      direction: null,
      state: null
    }); });

    containerState = { direction: null, state: null };
  }

  function addDebug() {
    if (debugMode) { setup({ id: id, stepEl: stepEl, offsetVal: offsetVal }); }
  }

  var S = {};

  S.setup = function (ref) {
    var container = ref.container;
    var graphic = ref.graphic;
    var step = ref.step;
    var offset = ref.offset; if ( offset === void 0 ) offset = 0.5;
    var progress = ref.progress; if ( progress === void 0 ) progress = false;
    var threshold = ref.threshold; if ( threshold === void 0 ) threshold = 4;
    var debug = ref.debug; if ( debug === void 0 ) debug = false;
    var order = ref.order; if ( order === void 0 ) order = true;
    var once = ref.once; if ( once === void 0 ) once = false;

    id = generateId();
    // elements
    stepEl = selectAll(step);
    containerEl = container ? select(container) : null;
    graphicEl = graphic ? select(graphic) : null;

    // error if no step selected
    if (!stepEl.length) {
      console.error('scrollama error: no step elements');
      return S;
    }

    // options
    debugMode = debug;
    progressMode = progress;
    preserveOrder = order;
    triggerOnce = once;

    S.offsetTrigger(offset);
    progressThreshold = Math.max(1, +threshold);

    isReady = true;

    // customize
    addDebug();
    indexSteps();
    setupStates();
    handleResize();
    handleEnable(true);
    return S;
  };

  S.resize = function () {
    handleResize();
    return S;
  };

  S.enable = function () {
    handleEnable(true);
    return S;
  };

  S.disable = function () {
    handleEnable(false);
    return S;
  };

  S.destroy = function () {
    handleEnable(false);
    Object.keys(callback).forEach(function (c) { return (callback[c] = null); });
    Object.keys(io).forEach(function (i) { return (io[i] = null); });
  };

  S.offsetTrigger = function(x) {
    if (x && typeof !isNaN(x)) {
      offsetVal = Math.min(Math.max(0, x), 1);
      return S;
    }
    return offsetVal;
  };

  S.onStepEnter = function (cb) {
    callback.stepEnter = cb;
    return S;
  };

  S.onStepExit = function (cb) {
    callback.stepExit = cb;
    return S;
  };

  S.onStepProgress = function (cb) {
    callback.stepProgress = cb;
    return S;
  };

  S.onContainerEnter = function (cb) {
    callback.containerEnter = cb;
    return S;
  };

  S.onContainerExit = function (cb) {
    callback.containerExit = cb;
    return S;
  };

  return S;
}

return scrollama;

})));
