class User {
  constructor(idOrEmail, names, emailOrPhone, phoneOrRole, roleOrPosition, position, timetable, workspace_id, declarations_key, notifications_key) {
    if (arguments.length === 5) {
      // Limited constructor
      this._email = idOrEmail;
      this._names = names;
      this._phone = emailOrPhone;
      this._role = phoneOrRole;
      this._position = roleOrPosition;
    } else {
      // Full constructor
      this._id = idOrEmail;
      this._names = names;
      this._email = emailOrPhone;
      this._phone = phoneOrRole;
      this._role = roleOrPosition;
      this._position = position;
      this._timetable = timetable;
      this._workspace_id = workspace_id;
      this._declarations_key = declarations_key;
      this._notifications_key = notifications_key;
    }
  }

  get id() {
    return this._id;
  }
  get names() {
    return this._names;
  }
  get email() {
    return this._email;
  }
  get phone() {
    return this._phone;
  }
  set phone(phone) {
    try {
      if (phone.length !== 10 || phone.length !== 13) {
        throw new Error('Invalid phone number');
      }
      this._phone = phone;
    } catch (e) {
      console.error(e.message);
      this._phone = null;
    }
  }
  get role() {
    return this._role;
  }
  get position() {
    return this._position;
  }
  get timetable() {
    return this._timetable;
  }
  set timetable(timetable) {
    this._timetable = timetable;
  }
  get workspace_id() {
    return this._workspace_id;
  }
  get declarations_key() {
    return this._declarations_key;
  }
  get notifications_key() {
    return this._notifications_key;
  }

  static createFromResultSet(rs) {
    let user = rs.getMetaData().getColumnCount() === 10 ? new User(
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
    ) : new User(
      rs.getString('email'),
      rs.getString('names'),
      rs.getString('phone'),
      rs.getString('role'),
      rs.getString('position')
    );
    return user
  }
}