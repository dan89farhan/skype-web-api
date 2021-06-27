"use strict";

const EventEmitter = require("events");
const puppeteer = require("puppeteer");

const Util = require('./util/Util');
const { DefaultOptions, SkypeWebUrl, Events } = require("./util/Constants");

class Client extends EventEmitter {
    constructor(options = {}) {
        super();

        this.options = Util.mergeDefault(DefaultOptions, options);

        this.pupBrowser = null;
        this.pupPage = null;

    Util.setFfmpegPath(this.options.ffmpegPath);
    }
    /**
     * Sets up events and requirements, kicks off authentication request
     */
    async initialize() {
        const browser = await puppeteer.launch(this.options.puppeteer);
        const page = (await browser.pages())[0];
        page.setUserAgent(this.options.userAgent);

        this.pupBrowser = browser;
        this.pupPage = page;

        if (this.options.session) {
            await page.evaluateOnNewDocument(
                session => {
                    localStorage.clear();
                    // localStorage.setItem('WABrowserId', session.WABrowserId);
                    // localStorage.setItem('WASecretBundle', session.WASecretBundle);
                    // localStorage.setItem('WAToken1', session.WAToken1);
                    // localStorage.setItem('WAToken2', session.WAToken2);
                }, this.options.session);
        }

        if(this.options.bypassCSP) {
            await page.setBypassCSP(true);
        }

        await page.goto(SkypeWebUrl, {
            waitUntil: 'load',
            timeout: 0,
        });

        // aria-label="Select profile picture"
        // const KEEP_PHONE_CONNECTED_IMG_SELECTOR = '[data-asset-intro-image-light="true"], [data-asset-intro-image-dark="true"]';
        const WELCOME_SCREEN_SKYPE = '[aria-label="Select profile picture"]';

        if (this.options.session) {
            // Check if session restore was successfull 
            try {
                await page.waitForSelector(WELCOME_SCREEN_SKYPE, { timeout: this.options.authTimeoutMs });
            } catch (err) {
                if (err.name === 'TimeoutError') {
                    /**
                     * Emitted when there has been an error while trying to restore an existing session
                     * @event Client#auth_failure
                     * @param {string} message
                     */
                    this.emit(Events.AUTHENTICATION_FAILURE, 'Unable to log in. Are the session details valid?');
                    browser.close();
                    if (this.options.restartOnAuthFail) {
                        // session restore failed so try again but without session to force new authentication
                        this.options.session = null;
                        this.initialize();
                    }
                    return;
                }

                throw err;
            }

        } else {
            /**
              * Emitted when there has been an error while trying to restore an existing session
              * @event Client#auth_failure
              * @param {string} message
              */
            this.emit(Events.SESSION_FILE_MISSING, 'Please provide the session config file');
            // browser.close();
        }

        // await page.evaluate(ExposeStore, moduleRaid.toString());

        // // Get session tokens
        // const localStorage = JSON.parse(await page.evaluate(() => {
        //     return JSON.stringify(window.localStorage);
        // }));

        // const session = {
        //     WABrowserId: localStorage.WABrowserId,
        //     WASecretBundle: localStorage.WASecretBundle,
        //     WAToken1: localStorage.WAToken1,
        //     WAToken2: localStorage.WAToken2
        // };

        // /**
        //  * Emitted when authentication is successful
        //  * @event Client#authenticated
        //  * @param {object} session Object containing session information. Can be used to restore the session.
        //  * @param {string} session.WABrowserId
        //  * @param {string} session.WASecretBundle
        //  * @param {string} session.WAToken1
        //  * @param {string} session.WAToken2
        //  */
        // this.emit(Events.AUTHENTICATED, session);

        // // Check window.Store Injection
        // await page.waitForFunction('window.Store != undefined');

        // //Load util functions (serializers, helper functions)
        // await page.evaluate(LoadUtils);

        // // Expose client info
        // /**
        //  * Current connection information
        //  * @type {ClientInfo}
        //  */
        // this.info = new ClientInfo(this, await page.evaluate(() => {
        //     return window.Store.Conn.serialize();
        // }));

        // // Add InterfaceController
        // this.interface = new InterfaceController(this);

        // // Register events
        // await page.exposeFunction('onAddMessageEvent', msg => {
        //     if (!msg.isNewMsg) return;

        //     if (msg.type === 'gp2') {
        //         const notification = new GroupNotification(this, msg);
        //         if (msg.subtype === 'add' || msg.subtype === 'invite') {
        //             /**
        //              * Emitted when a user joins the chat via invite link or is added by an admin.
        //              * @event Client#group_join
        //              * @param {GroupNotification} notification GroupNotification with more information about the action
        //              */
        //             this.emit(Events.GROUP_JOIN, notification);
        //         } else if (msg.subtype === 'remove' || msg.subtype === 'leave') {
        //             /**
        //              * Emitted when a user leaves the chat or is removed by an admin.
        //              * @event Client#group_leave
        //              * @param {GroupNotification} notification GroupNotification with more information about the action
        //              */
        //             this.emit(Events.GROUP_LEAVE, notification);
        //         } else {
        //             /**
        //              * Emitted when group settings are updated, such as subject, description or picture.
        //              * @event Client#group_update
        //              * @param {GroupNotification} notification GroupNotification with more information about the action
        //              */
        //             this.emit(Events.GROUP_UPDATE, notification);
        //         }
        //         return;
        //     }

        //     const message = new Message(this, msg);

        //     /**
        //      * Emitted when a new message is created, which may include the current user's own messages.
        //      * @event Client#message_create
        //      * @param {Message} message The message that was created
        //      */
        //     this.emit(Events.MESSAGE_CREATE, message);

        //     if (msg.id.fromMe) return;

        //     /**
        //      * Emitted when a new message is received.
        //      * @event Client#message
        //      * @param {Message} message The message that was received
        //      */
        //     this.emit(Events.MESSAGE_RECEIVED, message);
        // });

        // let last_message;

        // await page.exposeFunction('onChangeMessageTypeEvent', (msg) => {

        //     if (msg.type === 'revoked') {
        //         const message = new Message(this, msg);
        //         let revoked_msg;
        //         if (last_message && msg.id.id === last_message.id.id) {
        //             revoked_msg = new Message(this, last_message);
        //         }

        //         /**
        //          * Emitted when a message is deleted for everyone in the chat.
        //          * @event Client#message_revoke_everyone
        //          * @param {Message} message The message that was revoked, in its current state. It will not contain the original message's data.
        //          * @param {?Message} revoked_msg The message that was revoked, before it was revoked. It will contain the message's original data. 
        //          * Note that due to the way this data is captured, it may be possible that this param will be undefined.
        //          */
        //         this.emit(Events.MESSAGE_REVOKED_EVERYONE, message, revoked_msg);
        //     }

        // });

        // await page.exposeFunction('onChangeMessageEvent', (msg) => {

        //     if (msg.type !== 'revoked') {
        //         last_message = msg;
        //     }

        // });

        // await page.exposeFunction('onRemoveMessageEvent', (msg) => {

        //     if (!msg.isNewMsg) return;

        //     const message = new Message(this, msg);

        //     /**
        //      * Emitted when a message is deleted by the current user.
        //      * @event Client#message_revoke_me
        //      * @param {Message} message The message that was revoked
        //      */
        //     this.emit(Events.MESSAGE_REVOKED_ME, message);

        // });

        // await page.exposeFunction('onMessageAckEvent', (msg, ack) => {

        //     const message = new Message(this, msg);

        //     /**
        //      * Emitted when an ack event occurrs on message type.
        //      * @event Client#message_ack
        //      * @param {Message} message The message that was affected
        //      * @param {MessageAck} ack The new ACK value
        //      */
        //     this.emit(Events.MESSAGE_ACK, message, ack);

        // });

        // await page.exposeFunction('onMessageMediaUploadedEvent', (msg) => {

        //     const message = new Message(this, msg);

        //     /**
        //      * Emitted when media has been uploaded for a message sent by the client.
        //      * @event Client#media_uploaded
        //      * @param {Message} message The message with media that was uploaded
        //      */
        //     this.emit(Events.MEDIA_UPLOADED, message);
        // });

        // await page.exposeFunction('onAppStateChangedEvent', (state) => {

        //     /**
        //      * Emitted when the connection state changes
        //      * @event Client#change_state
        //      * @param {WAState} state the new connection state
        //      */
        //     this.emit(Events.STATE_CHANGED, state);

        //     const ACCEPTED_STATES = [WAState.CONNECTED, WAState.OPENING, WAState.PAIRING, WAState.TIMEOUT];

        //     if (this.options.takeoverOnConflict) {
        //         ACCEPTED_STATES.push(WAState.CONFLICT);

        //         if (state === WAState.CONFLICT) {
        //             setTimeout(() => {
        //                 this.pupPage.evaluate(() => window.Store.AppState.takeover());
        //             }, this.options.takeoverTimeoutMs);
        //         }
        //     }

        //     if (!ACCEPTED_STATES.includes(state)) {
        //         /**
        //          * Emitted when the client has been disconnected
        //          * @event Client#disconnected
        //          * @param {WAState|"NAVIGATION"} reason reason that caused the disconnect
        //          */
        //         this.emit(Events.DISCONNECTED, state);
        //         this.destroy();
        //     }
        // });

        // await page.exposeFunction('onBatteryStateChangedEvent', (state) => {
        //     const { battery, plugged } = state;

        //     if (battery === undefined) return;

        //     /**
        //      * Emitted when the battery percentage for the attached device changes
        //      * @event Client#change_battery
        //      * @param {object} batteryInfo
        //      * @param {number} batteryInfo.battery - The current battery percentage
        //      * @param {boolean} batteryInfo.plugged - Indicates if the phone is plugged in (true) or not (false)
        //      */
        //     this.emit(Events.BATTERY_CHANGED, { battery, plugged });
        // });

        // await page.evaluate(() => {
        //     window.Store.Msg.on('add', (msg) => { if (msg.isNewMsg) window.onAddMessageEvent(window.WWebJS.getMessageModel(msg)); });
        //     window.Store.Msg.on('change', (msg) => { window.onChangeMessageEvent(window.WWebJS.getMessageModel(msg)); });
        //     window.Store.Msg.on('change:type', (msg) => { window.onChangeMessageTypeEvent(window.WWebJS.getMessageModel(msg)); });
        //     window.Store.Msg.on('change:ack', (msg,ack) => { window.onMessageAckEvent(window.WWebJS.getMessageModel(msg), ack); });
        //     window.Store.Msg.on('change:isUnsentMedia', (msg, unsent) => { if (msg.id.fromMe && !unsent) window.onMessageMediaUploadedEvent(window.WWebJS.getMessageModel(msg)); });
        //     window.Store.Msg.on('remove', (msg) => { if (msg.isNewMsg) window.onRemoveMessageEvent(window.WWebJS.getMessageModel(msg)); });
        //     window.Store.AppState.on('change:state', (_AppState, state) => { window.onAppStateChangedEvent(state); });
        //     window.Store.Conn.on('change:battery', (state) => { window.onBatteryStateChangedEvent(state); });
        // });

        // /**
        //  * Emitted when the client has initialized and is ready to receive messages.
        //  * @event Client#ready
        //  */
        // this.emit(Events.READY);

        // // Disconnect when navigating away
        // // Because WhatsApp Web now reloads when logging out from the device, this also covers that case
        // this.pupPage.on('framenavigated', async () => {
        //     this.emit(Events.DISCONNECTED, 'NAVIGATION');
        //     await this.destroy();
        // });
    }
}

module.exports = Client;
