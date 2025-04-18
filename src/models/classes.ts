/**
 * Представя час, в който учителят преподава.
 * @class
 */
class Classes{
   /**
    * Смяна, в която учителят отсъства.
    * @private
    * @type {keyof typeof Table.Shifts}
    */
   private _shift: string;

   /**
    * Час, в който учителят отсъства.
    * @private
    * @type {string}
    */
   private _time: string;

   /**
    * Клас, в който учителят преподава.
    * @private
    * @type {string}
    */
   private _group: string;

   private _room: string;

    /**
     * Създава нова инстанция на Classes.
     * @param {string} shift - Смяна, в която учителят отсъства.
     * @param {string} time - Час, в който учителят отсъства.
     * @param {string} group - Клас, в който учителят преподава.
     * @param {string} room - Стаята, в която учителят преподава.
     */
    constructor(shift: string, time: string, group: string, room: string) {
        this._shift = shift;
        this._time = time;
        this._group = group;
        this._room = room;
    }

    /**
     * Връща смяната, в която учителят отсъства.
     * @returns {string} Смяната, в която учителят отсъства.
     */
    get shift() {
        return this._shift;
    }

    /**
     * Връща часа, в който учителят отсъства.
     * @returns {string} Часът, в който учителят отсъства.
     */
    get time() {
        return this._time;
    }

    /**
     * Връща класа, в който учителят преподава.
     * @returns {string} Класът, в който учителят преподава.
     */
    get group() {
        return this._group;
    }    

    get room() {
        return this._room;
    }
}