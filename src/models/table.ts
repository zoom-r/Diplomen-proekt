/**
 * Представлява таблица с данни за отсъствия, стаи или седмично разписание.
 * @class
 */
class Table {
    /**
     * Дните от седмицата.
     * @enum {string}
     */
    static Days = {
        Monday: 'monday',
        Tuesday: 'tuesday',
        Wednesday: 'wednesday',
        Thursday: 'thursday',
        Friday: 'friday'
    };

    /**
     * Смените през деня.
     * @enum {string}
     */
    static Shifts = {
        First: 'first',
        Second: 'second'
    };

    /**
     * Уникалният идентификатор на таблицата.
     * @private
     * @type {string}
     */
    private _id: string;

    /**
     * Денят от седмицата.
     * @private
     * @type {keyof typeof Table.Days}
     */
    private _day: keyof typeof Table.Days;

    /**
     * Данните в таблицата.
     * @private
     * @type {Absent[] | Room[] | Classes[]}
     */
    private _data: Absent[] | Room[] | Classes[];

    /**
     * Създава нова инстанция на Table.
     * @param {string} id - Уникалният идентификатор на таблицата.
     * @param {keyof typeof Table.Days} day - Денят от седмицата.
     * @param {Absent[] | Room[] | Classes[]} data - Данните в таблицата.
     */
    constructor(id: string, day: keyof typeof Table.Days, data: Absent[] | Room[] | Classes[]) {
        this._id = id;
        this._day = day;
        this._data = data;
    }

    /**
     * Връща уникалния идентификатор на таблицата.
     * @returns {string} Уникалният идентификатор на таблицата.
     */
    get id() {
        return this._id;
    }

    /**
     * Връща деня от седмицата.
     * @returns {keyof typeof Table.Days} Денят от седмицата.
     */
    get day() {
        return this._day;
    }

    /**
     * Връща данните в таблицата.
     * @returns {Absent[] | Room[] | Classes[]} Данните в таблицата.
     */
    get data() {
        return this._data;
    }

    /**
     * Задава нови данни в таблицата.
     * @param {Absent[] | Room[] | Classes[]} data - Новите данни в таблицата.
     * @throws {Error} Ако данните са невалидни.
     */
    set data(data: Absent[] | Room[] | Classes[]) {
        if (!data)
            throw new Error('Invalid data value');
        this._data = data;
    }

    /**
     * Създава нова инстанция на Table от резултатен набор.
     * @param {GoogleAppsScript.JDBC.JdbcResultSet} rs - Резултатният набор, съдържащ данни за таблицата.
     * @returns {Table} Новата инстанция на Table.
     */
    static createFromResultSet(rs: GoogleAppsScript.JDBC.JdbcResultSet): Table {
        return new Table(
            rs.getString('id'),
            rs.getString('day') as keyof typeof Table.Days,
            rs.getObject('data')
        );
    }
}
