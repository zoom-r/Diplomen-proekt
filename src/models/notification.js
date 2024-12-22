class Notification {
    #id;
    #title;
    #message;
    #date;
    #sender;

    constructor(id, title, message, date, sender) {
        this.#id = id;
        this.#title = title;
        this.#message = message;
        this.#date = date;
        this.#sender = sender;
    }

    get title() {
        return this.#title;
    }
    get message() {
        return this.#message;
    }
    get date() {
        return this.#date;
    }
    get sender() {
        return this.#sender;
    }
}