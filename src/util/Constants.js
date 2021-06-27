'use strict';

exports.WhatsWebURL = 'https://web.skype.com/';

exports.DefaultOptions = {
    puppeteer: {
        headless: true,
        defaultViewport: null
    },
    session: false,
    qrTimeoutMs: 45000,
    qrRefreshIntervalMs: 20000,
    authTimeoutMs: 45000,
    takeoverOnConflict: false,
    takeoverTimeoutMs: 0,
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.109 Safari/537.36',
    ffmpegPath: 'ffmpeg',
    bypassCSP: false
};