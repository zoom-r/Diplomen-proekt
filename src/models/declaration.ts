class Declaration {
    private _id: string;
    private _title: string;
    private _link: string;
    private _status: boolean;
    private _user_key: string;

    constructor(id: string, title: string, link: string, status: boolean, user_key: string) {
        this._id = id;
        this._title = title;
        this._link = link;
        this._user_key = user_key;
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
    set status(status: boolean) {
        this._status = status;
    }
    get user_key() {
        return this._user_key;
    }
    
    static createFromResultSet(rs) {
        let content = JSON.parse(rs.getString('content'));
        return new Declaration(
            rs.getString('id'),
            content.title,
            content.link,
            content.status,
            rs.getString('user_key')
        );
    }
}
