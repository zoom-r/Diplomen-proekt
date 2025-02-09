/**
 * Представлява декларация в системата.
 * @class
 */
class Declaration {
    /**
     * Уникалният идентификатор на декларацията.
     * @private
     * @type {string}
     */
    private _id: string;

    /**
     * Заглавието на декларацията.
     * @private
     * @type {string}
     */
    private _title: string;

    /**
     * Линк към декларацията.
     * @private
     * @type {string}
     */
    private _link: string;

    /**
     * Статусът на декларацията (завършена или не).
     * @private
     * @type {boolean}
     */
    private _status: boolean;

    /**
     * Ключът на потребителя, който е свързан с декларацията.
     * @private
     * @type {string}
     */
    private _user_key: string;

    /**
     * Създава нова инстанция на Declaration.
     * @param {string} id - Уникалният идентификатор на декларацията.
     * @param {string} title - Заглавието на декларацията.
     * @param {string} link - Линк към декларацията.
     * @param {boolean} status - Статусът на декларацията (завършена или не).
     * @param {string} user_key - Ключът на потребителя, който е свързан с декларацията.
     */
    constructor(id: string, title: string, link: string, status: boolean, user_key: string) {
        this._id = id;
        this._title = title;
        this._link = link;
        this._user_key = user_key;
        this.status = status;
    }

    /**
     * Връща уникалния идентификатор на декларацията.
     * @returns {string} Уникалният идентификатор на декларацията.
     */
    get id() {
        return this._id;
    }

    /**
     * Връща заглавието на декларацията.
     * @returns {string} Заглавието на декларацията.
     */
    get title() {
        return this._title;
    }

    /**
     * Връща линка към декларацията.
     * @returns {string} Линкът към декларацията.
     */
    get link() {
        return this._link;
    }

    /**
     * Връща статуса на декларацията (завършена или не).
     * @returns {boolean} Статусът на декларацията.
     */
    get status() {
        return this._status;
    }

    /**
     * Задава статуса на декларацията (завършен или не).
     * @param {boolean} status - Новият статус на декларацията.
     */
    set status(status: boolean) {
        this._status = status;
    }

    /**
     * Връща ключа на потребителя, който е свързан с декларацията.
     * @returns {string} Ключът на потребителя.
     */
    get user_key() {
        return this._user_key;
    }

    /**
     * Създава нова инстанция на Declaration от резултатен набор.
     * @param {GoogleAppsScript.JDBC.JdbcResultSet} rs - Резултатният набор, съдържащ данни за декларацията.
     * @returns {Declaration} Новата инстанция на Declaration.
     */
    static createFromResultSet(rs: GoogleAppsScript.JDBC.JdbcResultSet): Declaration {
        let content = rs.getObject('content');
        return new Declaration(
            rs.getString('id'),
            content.title,
            content.link,
            content.status,
            rs.getString('user_key')
        );
    }
}
