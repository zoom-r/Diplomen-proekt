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

    constructor(id, day, data) {
        this._id = id;
        this.day = day;
        this._data = data; //масив от обекти от класа Abcent или Room
    }

    get id(){
      return this._id;
    }
    get day() {
        return this._day;
    }
    set day(value) {
        if(Table.days[value]) {
            this._day = value;
        } else {
            throw new Error('Invalid day value');
        }
    }
    get data() {
        return this._data;
    }

    static createFromResultSet(rs) {
        return new Table(
            rs.getString('id'),
            rs.getString('day'),
            rs.getString('data')
        );
    }
}
