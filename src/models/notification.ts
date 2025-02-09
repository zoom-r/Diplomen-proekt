/**
 * Представлява известие в системата.
 * @class
 */
class Notification {
    /**
     * Уникалният идентификатор на известието.
     * @private
     * @type {string}
     */
    private _id: string;

    /**
     * Заглавието на известието.
     * @private
     * @type {string}
     */
    private _title: string;

    /**
     * Съобщението на известието.
     * @private
     * @type {string}
     */
    private _message: string;

    /**
     * Датата на известието.
     * @private
     * @type {Date}
     */
    private _date: Date;

    /**
     * Имейлът на изпращача на известието.
     * @private
     * @type {string}
     */
    private _sender: string;

    /**
     * Ключът на потребителя, който получава известието.
     * @private
     * @type {string}
     */
    private _user_key: string;

    /**
     * Създава нова инстанция на Notification.
     * @param {string} id - Уникалният идентификатор на известието.
     * @param {string} title - Заглавието на известието.
     * @param {string} message - Съобщението на известието.
     * @param {Date} date - Датата на известието.
     * @param {string} sender - Имейлът на изпращача на известието.
     * @param {string} user_key - Ключът на потребителя, който получава известието.
     */
    constructor(id: string, title: string, message: string, date: Date, sender: string, user_key: string) {
        this._id = id;
        this._title = title;
        this._message = message;
        this._date = date;
        this._sender = sender;
        this._user_key = user_key;
    }

    /**
     * Връща уникалния идентификатор на известието.
     * @returns {string} Уникалният идентификатор на известието.
     */
    get id() {
        return this._id;
    }

    /**
     * Връща заглавието на известието.
     * @returns {string} Заглавието на известието.
     */
    get title() {
        return this._title;
    }

    /**
     * Връща съобщението на известието.
     * @returns {string} Съобщението на известието.
     */
    get message() {
        return this._message;
    }

    /**
     * Връща датата на известието.
     * @returns {Date} Датата на известието.
     */
    get date() {
        return this._date;
    }

    /**
     * Връща имейла на изпращача на известието.
     * @returns {string} Имейлът на изпращача на известието.
     */
    get sender() {
        return this._sender;
    }

    /**
     * Връща ключа на потребителя, който получава известието.
     * @returns {string} Ключът на потребителя, който получава известието.
     */
    get user_key() {
        return this._user_key;
    }

    /**
     * Създава нова инстанция на Notification от резултатен набор.
     * @param {GoogleAppsScript.JDBC.JdbcResultSet} rs - Резултатният набор, съдържащ данни за известието.
     * @returns {Notification} Новата инстанция на Notification.
     */
    static createFromResultSet(rs: GoogleAppsScript.JDBC.JdbcResultSet): Notification {
        let content = rs.getObject('content');
        return new Notification(
            rs.getString('id'),
            content.title,
            content.message,
            new Date(content.date),
            content.sender,
            rs.getString('user_key')
        );
    }
}