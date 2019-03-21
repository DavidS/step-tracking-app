import chalk from 'chalk';
import fs from 'fs';
import util from 'util';

const style = {
  error: chalk.white.underline.bold.bgRed,
  warn: chalk.black.bgKeyword('orange'),
  info: chalk.green,
};

/**
 * Handles logging in console if global NODE_LOGGING variable is true.
 * If you pass the string 'ERROR', 'WARN:', 'INFO:' at start different coloring
 * will be used .
 * Defaults to 'info' if you dont pass anything or it doesnt match to INFO:, WARN: or ERROR:.
 *
 * @method log
 * @public
 * @param {*}  ...params  Anything we need to log to the console
 *
 * @example
 *          log('ERROR: Connecting to backend failed');
 *            Displays 'ERROR: 09:22:23 Connecting to backend failed' at console Error level with  stack.
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
  const args = Array.prototype.slice.call(params);
  args.forEach((arg, index) => {
    if (typeof arg === 'object') {
      args[index] = util.inspect(arg, false, null);
    }
  });

  // Check if we have to log to stdout.
  if (process.env.NODE_LOGGING === 'true') {
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

    console.log(style[call](...args)); //eslint-disable-line
  }
}
