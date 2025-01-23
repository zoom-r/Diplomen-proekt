class Declaration {

    constructor(id, title, link, status, user_key) {
        this._id = id;
        this._title = title;
        try {
            let url = new URL(link);
            this._link = url;
        } catch {
            throw new Error('Invalid link');
        }
        this.status = status; // маркира документа като завършен или не: true - завършен, false - незавършен
    }

    get id(){
      return this._id;
    }
    get title() {
        return this._title;
    }
    get link() {
        return this._link;
    }
    get status() {
        return this._status;
    }
    set status(status) {
        if (status !== true && status !== false) {
            throw new Error('Invalid status');
        }
        this._status = status;
    }
}
