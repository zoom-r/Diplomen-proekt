/**
 * Представлява стая с график.
 * @class
 */
class Room {
    /**
     * Наименование на стаята.
     * @private
     * @type {string}
     */
    private _name: string;

    /**
     * Масив от обекти Shedule.
     * @private
     * @type {Classes[]}
     */
    private _shedules: Classes[];

    /**
     * Създава нова инстанция на Room.
     * @param {string} name - Наименование на стаята.
     * @param {Shedule[]} shedules - Масив от обекти Shedule.
     */
    constructor(name: string, shedules: Classes[]) {
        this._name = name;
        this._shedules = shedules;
    }

    /**
     * Връща наименованието на стаята.
     * @returns {string} Наименованието на стаята.
     */
    get name() {
        return this._name;
    }

    /**
     * Връща масива от обекти Shedule.
     * @returns {Classes[]} Масив от обекти Shedule.
     */
    get shedules() {
        return this._shedules;
    }
}