class Room {
    private _name: string;//Наименование на стаята
    private _shedules: Shedule[];//Масив от обекти Shedule -> смяна, час, клас

    constructor(name: string, shedules: Shedule[]){
        this._name = name; 
        this._shedules = shedules; 
    }

    get name(){
        return this._name;
    }
    get shedules(){
        return this._shedules;
    }
}

class Shedule{
    private _shift: keyof typeof Table.Shifts;//смяна
    private _time: string;//час
    private _group: string;//клас

    constructor(shift: keyof typeof Table.Shifts, time, group){
        this.shift = shift; 
        this._time = time; 
        this._group = group; 
    }

    get shift(){
        return this._shift;
    }
    set shift(value: keyof typeof Table.Shifts){
        if(!value)
            throw new Error('Invalid shift value');
        this._shift = value;
    }
    get time(){
        return this._time;
    }
    get group(){
        return this._group;
    }
}