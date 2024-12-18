class Declaration {
    #title;
    #link;
    #status; //маркира документа като завършен или не: true - завършен, false - незавършен

    constructor(title, link, status) {
        this.#title = title;
        
        this.#link = link;
        this.#status = status;
    }

    get title() {
        return this.title;
    }
    get link() {
        return this.link;
    }
    get status() {
        return this.status;
    }
    set status(status) {
        this.status = status;
    }
}