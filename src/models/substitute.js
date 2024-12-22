class Substitute {
    #abcent; //Имена на отсъстващ учител
    #classes; //Масив от обекти, съдържащи часовете на отсъстващия учител -> час, клас, заместващ учител

    constructor(abcent, classes) {
        this.#abcent = abcent;
        this.#classes = classes;
    }

    get abcent(){
        return this.#abcent;
    }
    get classes(){
        return this.#classes;
    }
}

class Classes {
    #time;
    #group;
    #substitute;

    constructor(time, group, substitute) {
        this.#time = time;
        this.#group = group;
        this.#substitute = substitute;
    }

    get time() {
        return this.#time;
    }
    get group() {
        return this.#group;
    }
    get substitute() {
        return this.#substitute;
    }
}