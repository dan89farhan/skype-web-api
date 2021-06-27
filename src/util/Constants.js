'use strict';

exports.SkypeWebUrl = 'https://web.skype.com/';

exports.DefaultOptions = {
    puppeteer: {
        headless: true,
        defaultViewport: null
    },
    session: false,
    authTimeoutMs: 45000,
    takeoverOnConflict: false,
    takeoverTimeoutMs: 0,
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.109 Safari/537.36',
    ffmpegPath: 'ffmpeg',
    bypassCSP: false
};

/**
 * Events that can be emitted by the client
 * @readonly
 * @enum {string}
 */
exports.Events = {
    AUTHENTICATED: 'authenticated',
    AUTHENTICATION_FAILURE: 'auth_failure',
    SESSION_FILE_MISSING: "session_file_missing",
    READY: 'ready',
    MESSAGE_RECEIVED: 'message',
    MESSAGE_CREATE: 'message_create',
    MESSAGE_REVOKED_EVERYONE: 'message_revoke_everyone',
    MESSAGE_REVOKED_ME: 'message_revoke_me',
    MESSAGE_ACK: 'message_ack',
    MEDIA_UPLOADED: 'media_uploaded',
    GROUP_JOIN: 'group_join',
    GROUP_LEAVE: 'group_leave',
    GROUP_UPDATE: 'group_update',
    DISCONNECTED: 'disconnected',
};