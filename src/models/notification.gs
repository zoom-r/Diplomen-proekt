class Notification {

    constructor(id, title, message, date, sender, user_key) {
        this._id = id;
        this._title = title;
        this._message = message;
        this._date = date;
        this._sender = sender; //име на изпращача (администратора, от който идва съобщението)
        this._user_key = user_key;
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
    get user_key() {
        return this._user_key;
    }

    static createFromResultSet(rs) {
        let content = JSON.parse(rs.getString('content'));
        return new Notification(
            rs.getString('id'),
            content.title,
            content.message,
            content.date,
            content.sender,
            rs.getString('user_key')
        );
    }
}