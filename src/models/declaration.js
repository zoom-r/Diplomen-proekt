class Declaration {
    #title;
    #link;
    #status; //маркира документа като завършен или не: true - завършен, false - незавършен

    constructor(title, link, status) {
        this.#title = title;
        try{
            let url = new URL(link);
            this.#link = url;
        }catch{
            throw new Error('Invalid link');
        }
        this.status = status;
    }

    get title() {
        return this.#title;
    }
    get link() {
        return this.#link;
    }
    get status() {
        return this.#status;
    }
    set status(status) {
        if(this.#status !== true && this.#status !== false){
            throw new Error('Invalid status');
        }
        this.#status = status;
    }
}