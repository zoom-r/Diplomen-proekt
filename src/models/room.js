class Room {
    #name; //Наименование на стаята
    #shedules; //Масив от обекти Shedule -> кой час и с кой клас е в стаята 

    constructor(name, shedules) {
        this.#name = name;
        this.#shedules = shedules;
    }

    get name(){
        return this.#name;
    }
    get shedules(){
        return this.#shedules;
    }
}

class Shedule{
    #time; //час
    #group; //клас

    constructor(time, group){
        this.#time = time;
        this.#group = group;
    }

    get time(){
        return this.#time;
    }
    get group(){
        return this.#group;
    }
}