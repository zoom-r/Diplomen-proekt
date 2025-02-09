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
   private _shift: keyof typeof Table.Shifts;

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

    /**
     * Създава нова инстанция на Classes.
     * @param {keyof typeof Table.Shifts} shift - Смяна, в която учителят отсъства.
     * @param {string} time - Час, в който учителят отсъства.
     * @param {string} group - Клас, в който учителят преподава.
     */
    constructor(shift: keyof typeof Table.Shifts, time: string, group: string) {
        this._shift = shift;
        this._time = time;
        this._group = group;
    }

    /**
     * Връща смяната, в която учителят отсъства.
     * @returns {keyof typeof Table.Shifts} Смяната, в която учителят отсъства.
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
}