'use strict'

const PrettyError = require('pretty-error');
const pe = new PrettyError();

(() => {
    pe.skipNodeFiles();
    pe.skipPackage('express');
    pe.skipPath('internal/process/next_tick.js')
    pe.skipPath('bootstrap_node.js')
})()

module.exports = pe;