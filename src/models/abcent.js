class Abcent {

    constructor(name, classes) {
        this._name = name; //Имена на отсъстващ учител
        this._classes = classes; //Масив от обекти, съдържащи часовете на отсъстващия учител -> час, клас, заместващ учител

    }

    get abcent(){
        return this._abcent;
    }
    get classes(){
        return this._classes;
    }
}

class Classes {

    constructor(time, group, substitute) {
        this._time = time;
        this._group = group;
        this._substitute = substitute;
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