"use strict";

const EventEmitter = require("events");
const puppeteer = require("puppeteer");

const Util = require('./util/Util');
const { DefaultOptions } = require("./util/Constants");

class Client extends EventEmitter {
  constructor(options = {}) {
    super();

    this.options = Util.mergeDefault(DefaultOptions, options);

    this.pupBrowser = null;
    this.pupPage = null;

    Util.setFfmpegPath(this.options.ffmpegPath);
  }
}

module.exports = Client;
