/**
 * Представлява отсъстващ учител в системата.
 * @class
 */
class Absent {
    /**
     * Имейл на отсъстващия учител.
     * @private
     * @type {string}
     */
    private _email: string;

    /**
     * Масив от обекти Substitute.
     * @private
     * @type {Substitute[]}
     */
    private _classes: Substitute[];

    /**
     * Създава нова инстанция на Absent.
     * @param {string} email - Имейл на отсъстващия учител.
     * @param {Substitute[]} classes - Масив от обекти Substitute.
     */
    constructor(email: string, classes: Substitute[]) {
        this._email = email;
        this._classes = classes;
    }

    /**
     * Връща имейла на отсъстващия учител.
     * @returns {string} Имейлът на отсъстващия учител.
     */
    get email() {
        return this._email;
    }

    /**
     * Връща масива от обекти Substitute.
     * @returns {Substitute[]} Масив от обекти Substitute.
     */
    get classes() {
        return this._classes;
    }
}