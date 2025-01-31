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
        this._id = id;
        this._day = day;
        this._shift = shift;
        this._data = data; //масив от обекти от класа Abcent или Room
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

    static createFromResultSet(rs) {
        return new Table(
            rs.getString('id'),
            rs.getString('day'),
            rs.getString('shift'),
            rs.getString('data')
        );
    }
}
