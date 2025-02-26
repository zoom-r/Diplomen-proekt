/**
 * Настройки на училището.
 * @class Settings
 */
class Settings {
    /**
     * Смените през деня.
     * @enum {string}
     */
    static Shifts = {
        First: 'first',
        Second: 'second'
    };

    /**
     * Смените, с които работи училището.
     * @private
     * @type {keyof typeof Settings.Shifts}
     * @memberof Settings
     */
    private _shift: keyof typeof Settings.Shifts;
    /**
     * Максималният брой на часовете.
     * @private
     * @type {number}
     * @memberof Settings
     */
    private _max_classes: number;

    /**
     * ID-та на шаблоните на декларациите.
     * @private
     * @type {string[]}
     * @memberof Settings
     */
    private _templates: string[];

    /**
     * Имената на стаите в училището.
     * @private
     * @type {string[]}
     * @memberof Settings
     */
    private _rooms: string[];
    /**
     * Имената на класовете в училището.
     * @private
     * @type {string[]}
     * @memberof Settings
     */
    private _classes: string[];

    /**
     * Ключ за таблицата със заместванията.
     * @private
     * @type {string}
     * @memberof Settings
     */
    private _substitute_table_key: string;

    /**
     * Ключ за таблицата със стаите.
     * @private
     * @type {string}
     * @memberof Settings
     */
    private _rooms_table_key: string;

    /**
     * Създава нова инстанция на Settings.
     * @param {keyof typeof Settings.Shifts} shift
     * @param {number} max_classes
     * @param {string[]} templates
     * @param {string[]} rooms
     * @param {string[]} classes
     * @param {string} substitute_table_key
     * @param {string} rooms_table_key
     * @memberof Settings
     */
    constructor(shift: keyof typeof Settings.Shifts, max_classes: number, templates: string[], rooms: string[], classes: string[], substitute_table_key: string, rooms_table_key: string) {
        this._shift = shift;
        this._max_classes = max_classes;
        this._templates = templates;
        this._rooms = rooms;
        this._classes = classes;
        this._substitute_table_key = substitute_table_key;
        this._rooms_table_key = rooms_table_key;
    }

    /**
     * Връща смените, с които работи училището.
     * @type {keyof typeof Settings.Shifts}
     * @readonly
     * @memberof Settings
     */
    get shift() {
        return this._shift;
    }
    /**
     * Връща максималният брой на часовете.
     * @type {number}
     * @readonly
     * @memberof Settings
     */
    get max_classes() {
        return this._max_classes;
    }
    /**
     * Връща ID-та на шаблоните на декларациите.
     * @type {string[]}
     * @readonly
     * @memberof Settings
     */
    get templates() {
        return this._templates;
    }
    /**
     * Връща имената на стаите в училището.
     * @type {string[]}
     * @readonly
     * @memberof Settings
     */
    get rooms() {
        return this._rooms;
    }
    /**
     * Връща имената на класовете в училището.
     * @type {string[]}
     * @readonly
     * @memberof Settings
     */
    get classes() {
        return this._classes;
    }
    /**
     * Връща ключа за таблицата със заместванията.
     * @type {string}
     * @readonly
     * @memberof Settings
     */
    get substitute_table_key() {
        return this._substitute_table_key;
    }
    /**
     * Връща ключа за таблицата със стаите.
     * @type {string}
     * @readonly
     * @memberof Settings
     */
    get rooms_table_key() {
        return this._rooms_table_key;
    }

    static createFromResultSet(rs: GoogleAppsScript.JDBC.JdbcResultSet): Settings {
        return new Settings(
            rs.getString('shifts') as keyof typeof Settings.Shifts, 
            rs.getInt('max_classes'), 
            Object.values(rs.getObject('templates')), 
            Object.values(rs.getString('rooms')),
            Object.values(rs.getString('classes')), 
            rs.getString('substitute_key'), 
            rs.getString('rooms_key')
        );
    }
}