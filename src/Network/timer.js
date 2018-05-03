class MyTimer {
  constructor(time, callback, callbackContext, ...args) {
    this.timeStart = totalTime;
    this.duration = time;
    this.callback = callback.bind(callbackContext);
    this.callbackContext = callbackContext
    this.args = args;
    this.expired = false;
    timers.push(this);
  }

  check() {
    if (this.timeStart + this.duration <= totalTime) {
      this.callback.apply(this.callbackContext, this.args);
      this.expired = true;
    }
  }
}
