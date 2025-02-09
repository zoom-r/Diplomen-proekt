/**
 * Представлява час на отсъстващ учител.
 * @class
 */
class Substitute extends Classes {
    /**
     * Имейл на заместващия учител (null, ако няма заместващ учител).
     * @private
     * @type {string}
     */
    private _substitute: string;

    /**
     * Създава нова инстанция на Substitute.
     * @param {keyof typeof Table.Shifts} shift - Смяна, в която учителят отсъства.
     * @param {string} time - Час, в който учителят отсъства.
     * @param {string} group - Клас, в който учителят преподава.
     * @param {string} substitute - Имейл на заместващия учител (null, ако няма заместващ учител).
     */
    constructor(shift: keyof typeof Table.Shifts, time: string, group: string, substitute: string) {
        super(shift, time, group);
        this._substitute = substitute;
    }

    /**
     * Връща имейла на заместващия учител.
     * @returns {string} Имейлът на заместващия учител.
     */
    get substitute() {
        return this._substitute;
    }
}