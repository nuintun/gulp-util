/**
 * @module md5
 * @license MIT
 * @version 2018/03/16
 */

import crypto from 'crypto';

export default function md5(string) {
  return crypto
    .createHash('md5')
    .update(string)
    .digest('hex');
}