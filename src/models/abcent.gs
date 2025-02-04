class Abcent {

    constructor(name, classes) {
        this._name = name; //Имена на отсъстващ учител
        this._classes = classes; //Масив от обекти, съдържащи часовете на отсъстващия учител -> сямна, час, клас, заместващ учител

    }

    get name(){
        return this._name;
    }
    get classes(){
        return this._classes;
    }
}

class Classes {

    constructor(shift, time, group, substitute) {
        this.shift = shift; // Смяна, в която учителят отсъства
        this._time = time; // Час, в който учителят отсъства
        this._group = group; // Клас, в който учителят преподава
        this._substitute = substitute; // Имейл на заместващия учител (за да може да се вземем инфомация за него чрез getUserInfo_(email)) -> null, ако няма заместващ учител
    }

    get shift() {
        return this._shift;
    }
    set shift(value) {
        if(value === Table.shifts.first || value === Table.shifts.second) {
            this._shift = value;
        } else {
            throw new Error('Invalid shift value');
        }
    }
    get time() {
        return this._time;
    }
    get group() {
        return this._group;
    }
    get substitute() {
        return this._substitute;
    }
}