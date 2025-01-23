class Notification {

    constructor(id, title, message, date, sender, user_key) {
        this._id = id;
        this._title = title;
        this._message = message;
        this._date = date;
        this._sender = sender;
    }

    get id(){
      return this._id;
    }
    get title() {
        return this._title;
    }
    get message() {
        return this._message;
    }
    get date() {
        return this._date;
    }
    get sender() {
        return this._sender;
    }
}