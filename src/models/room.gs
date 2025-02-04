class Room {
    constructor(name, shedules) {
        this._name = name; //Наименование на стаята
        this._shedules = shedules; //Масив от обекти Shedule -> смяна, час, клас
    }

    get name(){
        return this._name;
    }
    get shedules(){
        return this._shedules;
    }
}

class Shedule{

    constructor(shift, time, group){
        this.shift = shift; //смяна
        this._time = time; //час
        this._group = group; //клас
    }

    get shift(){
        return this._shift;
    }
    set shift(value){
        if(value === Table.shifts.first || value === Table.shifts.second){
            this._shift = value;
        }else{
            throw new Error('Invalid shift value');
        }
    }
    get time(){
        return this._time;
    }
    get group(){
        return this._group;
    }
}