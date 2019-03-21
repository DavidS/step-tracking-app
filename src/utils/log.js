/**
 * Handles logging in browser's console if global LOGGING variable is true.
 * If you pass the string 'ERROR', 'WARN:', 'INFO:' at start different console fn
 * will be used ( console.error, console.warn, console.info ).
 * Defaults to console.info if you dont pass anything or it doesnt match to INFO:, WARN: or ERROR:.
 *
 * @method log
 * @public
 * @param {*}  ...params  Anything we need to log to the console
 *
 * @example
 *          log('ERROR: Connecting to backend failed');
 *            Displays 'ERROR: 09:22:23 Connecting to backend failed' at console Error level with
 *            stack.
 * @example
 *         log('WARN: Connecting to backend failed');
 *              Displays 'WARN: 09:23:37 Connecting to backend failed' at Warn level with stack
 *  @example
 *        log('INFO: Connecting to backend failed'); or  log('Connecting to backend failed');
 *              Displays 'INFO: 09:24:50 Connecting to backend failed' at Info level without stack.
 * @example
 *       log('INFO:', 1, 2, {test: 123, hello: 'world'}, 'Love Monday Morning');
 *              Displays 'INFO: 09:26:16  1 2 {test: 123, hello: "world"} Love Monday Morning'
 */
export default function log(...params) {
  if (
    (typeof window !== 'undefined' && window.LOGGING) ||
    process.env.NODE_LOGGING
  ) {
    const args = Array.prototype.slice.call(params);
    const found = args.join('').match(/^(\w)*:/g);
    const logKnownMethods = ['info', 'warn', 'error'];
    let call = Array.isArray(found) && found[0];

    if (typeof call === 'string') {
      call = call.substring(0, call.length - 1).toLowerCase();
      if (logKnownMethods.indexOf(call) < 0) {
        call = 'info';
      }
    } else {
      call = 'info';
    }

    if (typeof args[0] === 'string') {
      args[0] = args[0].replace(/^(\w)*:/g, '').trim();
    }
    args.unshift(
      `${call.toUpperCase()}: ${new Date().toISOString().slice(11, -5)}`,
    );
    console[call](...args); //eslint-disable-line
  }
}
