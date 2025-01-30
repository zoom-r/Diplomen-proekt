class User {

    constructor(id, name, email, phone, role, position, workspace_id, declarations_key, notifications_key){
        this._id = id;
        this._name = name;
        this._email = email;
        this._phone = phone;
        this._role = role;
        this._position = position;
        this._workspace_id = workspace_id;
        this._declarations_key = declarations_key;
        this._notifications_key = notifications_key;
    }

    get id(){
      return this._id;
    }
    get name(){
        return this._name;
    }
    get email(){
        return this._email;
    }
    get phone(){
        return this._phone;
    }
    set phone(phone){
        if(phone.length !== 10 || phone.length !== 13){
            throw new Error('Invalid phone number');
        }
        this._phone = phone;
    }
    get role(){
      return this._role;
    }
    get position(){
      return this._position;
    }
    get workspace_id(){
      return this._workspace_id;
    }
    get declarations_key(){
      return this._declarations_key;
    }
    get notifications_key(){
      return this._notifications_key;
    }
}