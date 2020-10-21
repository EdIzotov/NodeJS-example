const WebSocket = require("ws");
const winston = require("winston");
const logger = new winston.Logger({
    transports: [
        new winston.transports.Console({ level: process.env.LOG_LEVEL })
    ]
});

module.exports = class ws {
    constructor(url) {
        this.error = null;
        this.messageHandlers = [];
        this.conn = new WebSocket(url);
    }

    sendWithPromise(data) {
        return new Promise((done, reject) => {
            this.send(data, (err, res) => {
                if (err) reject(err);
                else done(res);
            });
        });
    }

    /**
     * For send 1 message and close connection after receiving a response
     * @param {string} data
     * @param {function} done
     */
    send(data, done, nonCloseAfter) {
        logger.debug("Request: ", data);

        this.conn.on("open", () => {
            try {
                this.conn.send(data);
            } catch (e) {
                return done(e);
            }
        });
        this.conn.on("error", err => {
            if (err) {
                if (done) {
                    logger.error("Connection error: ", err);
                    done(err);
                    done = null;
                }
            }
        });
        this.conn.on("message", (res, flags) => {
            if (!nonCloseAfter) {
                this.conn.close();
            }
            logger.debug("Response: ", res);
            if (done) {
                if (this._parseResponse(res) !== false) {
                    done(null, this._parseResponse(res));
                } else {
                    done(this.error);
                }
                done = null;
            }
        });
    }

    /**
     * Bind events for send over sendKeepAlive method
     * @param {function} isOpen
     */
    onMessage(isOpen) {
        this.conn.on("message", (res, flags) => {
            var handler = this.messageHandlers.shift();
            if (handler) {
                handler(null, this._parseResponse(res));
            }
        });
        this.conn.on("error", err => {
            if (err) console.error("Connection error: ", err);
        });
        this.conn.on("open", err => {
            isOpen();
        });
    }

    /**
     * For send messages over existing connection
     * @param {string} data
     * @param {function} asyncDone
     */
    sendKeepAlive(data, asyncDone) {
        this.messageHandlers.push(asyncDone);
        this.conn.send(data, err => {
            if (err) {
                console.error(
                    "Can't send message. Connection ",
                    err.message,
                    "\n" +
                        "Probable cause the number of connections(concurrency) more than the server allows"
                );
                asyncDone(err);
            }
        });
    }

    _parseResponse(res) {
        try {
            return JSON.parse(res);
        } catch (e) {
            this.error = "Can't parse response.";
            return false;
        }
    }
};
