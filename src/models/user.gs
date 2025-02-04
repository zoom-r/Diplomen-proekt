class User {
  constructor(id, name, email, phone, role, position, timetable, workspace_id, declarations_key, notifications_key){
      this._id = id; // uuid -> varhcar(36)
      this._name = name; // varchar
      this._email = email; // varchar
      this._phone = phone; // varchar
      this._role = role; // varchar
      this._position = position; // varchar
      this._timetable = timetable; // json
      this._workspace_id = workspace_id; // uuid -> varchar(36)
      this._declarations_key = declarations_key; // uuid -> varchar(36)
      this._notifications_key = notifications_key; // uuid -> varchar(36)
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
    try{
      if(phone.length !== 10 || phone.length !== 13){
        throw new Error('Invalid phone number');
      }
      this._phone = phone;
    }catch(e){
      console.error(e.message);
      this._phone = null;
    }
  }
  get role(){
    return this._role;
  }
  get position(){
    return this._position;
  }
  get timetable(){
    return this._timetable;
  }
  set timetable(timetable){
    this._timetable = timetable;
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

  static createFromResultSet(rs){
    let user = new User(
      rs.getString('id'),
      rs.getString('names'),
      rs.getString('email'),
      rs.getString('phone'),
      rs.getString('role'),
      rs.getString('position'),
      rs.getObject('timetable'),
      rs.getString('workspace_id'),
      rs.getString('declarations_key'),
      rs.getString('notifications_key')
    );
    return user
  }
}