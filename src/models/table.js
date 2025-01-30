class Table {
    static get days() {
        return {
            monday: 'monday',
            tuesday: 'tuesday',
            wednesday: 'wednesday',
            thursday: 'thursday',
            friday: 'friday'
        };
    }

    static get shifts() {
        return {
            first: 'first',
            second: 'second'
        };
    }

    constructor(id, day, shift, data) {
        if (!Object.values(Table.days).includes(day)) {
            throw new Error(`Invalid day: ${day}`);
        }
        if (!Object.values(Table.shifts).includes(shift)) {
            throw new Error(`Invalid shift: ${shift}`);
        }
        this._id = id;
        this._day = day;
        this._shift = shift;
        this._data = data;
    }

    get id(){
      return this._id;
    }

    get day() {
        return this._day;
    }

    get shift() {
        return this._shift;
    }

    get data() {
        return this._data;
    }
}
