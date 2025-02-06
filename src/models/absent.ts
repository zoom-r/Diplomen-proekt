class Absent {
    private _email: string;//Имена на отсъстващ учител
    private _classes: Classes[];

    constructor(email: string, classes: Classes[]) {
        this._email = email; 
        this._classes = classes; //Масив от обекти, съдържащи часовете на отсъстващия учител -> сямна, час, клас, заместващ учител

    }

    get email(){
        return this._email;
    }
    get classes(){
        return this._classes;
    }
}

class Classes {
    private _shift: keyof typeof Table.Shifts;// Смяна, в която учителят отсъства
    private _time: string;// Час, в който учителят отсъства
    private _group: string;// Клас, в който учителят преподава
    private _substitute: string;// Имейл на заместващия учител (за да може да се вземем инфомация за него чрез getUserInfo_(email)) -> null, ако няма заместващ учител

    constructor(shift: keyof typeof Table.Shifts, time: string, group: string, substitute: string) {
        this.shift = shift; 
        this._time = time; 
        this._group = group; 
        this._substitute = substitute; 
    }

    get shift() {
        return this._shift;
    }
    set shift(value) {
        if(value === Table.Shifts.First || value === Table.Shifts.Second) {
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