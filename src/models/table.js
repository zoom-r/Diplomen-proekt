class Table {
    static #days = {
        monday: 'monday',
        tuesday: 'tuesday',
        wednesday: 'wednesday',
        thursday: 'thursday',
        friday: 'friday'
    }
    static #shifts = {
        first: 'first',
        second: 'second'
    }
    static get shifts() {
        return this.#shifts;
    }
    static get days() {
        return this.#days;
    }

    #day;
    #shift;
    #data;

    constructor(day, shift, data) {
        if (!Object.values(Table.days).includes(day)) {
            throw new Error(`Invalid day: ${day}`);
        }
        if (!Object.values(Table.shifts).includes(shift)) {
            throw new Error(`Invalid shift: ${shift}`);
        }
        this.#day = day;
        this.#shift = shift;
        this.#data = data;
    }

    get day() {
        return this.#day;
    }
    get shift() {
        return this.#shift;
    }
    get data() {
        return this.#data;
    }

}