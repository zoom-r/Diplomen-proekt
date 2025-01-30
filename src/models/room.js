class Room {

    constructor(name, shedules) {
        this._name = name; //Наименование на стаята
        this._shedules = shedules; //Масив от обекти Shedule -> кой час и с кой клас е в стаята 
    }

    get name(){
        return this._name;
    }
    get shedules(){
        return this._shedules;
    }
}

class Shedule{

    constructor(time, group){
        this._time = time; //час
        this._group = group; //клас
    }

    get time(){
        return this._time;
    }
    get group(){
        return this._group;
    }
}