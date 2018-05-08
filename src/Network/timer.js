class MyTimer {
  constructor(time, callback, callbackContext, ...args) {
    this.timeStart = totalTime;
    this.duration = time;
    this.callback = callback.bind(callbackContext);
    this.callbackContext = callbackContext
    this.args = args;
    this.expired = false;
    this.timersAdd(this);
  }

  check() {
    if (this.timeStart + this.duration <= totalTime) {
      this.callback.apply(this.callbackContext, this.args);
      this.expired = true;
      return (this.expired);
    }
  }

  timersAdd(item) {
    timers.push(item);
    var i = timers.length - 1;
    var n = Math.floor((i-1)/2)
    while ((i > 0) && (this.duration < timers[n].remainingTime())) {
      var s = timers[n]
      timers[n] = timers[i];
      timers[i] = s;
      i = n;
      n = Math.floor((i-1)/2);
    }
  }

  remainingTime() {
    return (this.duration - (totalTime - this.timeStart))
  }
}

function removeTopTimer() {
  timers[0] = timers[timers.length - 1];
  timers.pop();
  var i = 0;
  var swap = true;
  while (swap && ((2*i + 1) < timers.length)) {
    var min = i;
    if (timers[2*i + 1].remainingTime() < timers[i].remainingTime()) {
      min = 2*i + 1;
    }
    if (((2*i + 2) < timers.length) && (timers[2*i + 2].remainingTime() < timers[min].remainingTime())) {
      min = 2*i + 2;
    }
    if (i == min) {
      swap = false
    } else {
      var s = timers[min]
      timers[min] = timers[i];
      timers[i] = s;
      i = min;
    }
  }
}
