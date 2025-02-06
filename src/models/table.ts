class Table {
    static Days = {
        Monday: 'monday',
        Tuesday: 'tuesday',
        Wednesday: 'wednesday',
        Thursday: 'thursday',
        Friday: 'friday'
    };

    static Shifts = {
        First: 'first',
        Second: 'second'
    };

    private _id: string;
    private _day: keyof typeof Table.Days;
    private _data: Absent[] | Room[];

    constructor(id: string, day: keyof typeof Table.Days, data: Absent[] | Room[]) {
        this._id = id;
        this._day = day;
        this._data = data;
    }

    get id() {
        return this._id;
    }

    get day() {
        return this._day;
    }

    get data() {
        return this._data;
    }

    set data(data: Absent[] | Room[]) {
        if (!data)
            throw new Error('Invalid data value');
        this._data = data;
    }

    static createFromResultSet(rs) {
        return new Table(
            rs.getString('id'),
            rs.getString('day'),
            rs.getArray('data')
        );
    }
}
