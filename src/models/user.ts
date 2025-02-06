class User {
  private _id?: string;
  private _names: string;
  private _email: string;
  private _phone: string;
  private _role: string;
  private _position: string;
  private _timetable?: Table;
  private _workspace_id?: string;
  private _declarations_key?: string;
  private _notifications_key?: string;

  // Constructor overloads
  constructor(email: string, names: string, phone: string, role: string, position: string);
  constructor(id: string, names: string, email: string, phone: string, role: string, position: string, timetable: Table, workspace_id: string, declarations_key: string, notifications_key: string);

  // Single constructor implementation
  constructor(idOrEmail: string, names: string, emailOrPhone: string, phoneOrRole: string, roleOrPosition: string, position?: string, timetable?: Table, workspace_id?: string, declarations_key?: string, notifications_key?: string) {
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
      this._position = position!;
      this._timetable = timetable!;
      this._workspace_id = workspace_id!;
      this._declarations_key = declarations_key!;
      this._notifications_key = notifications_key!;
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

  set phone(phone: string) {
    try {
      if (phone.length !== 10 && phone.length !== 13) {
        throw new Error('Invalid phone number');
      }
      this._phone = phone;
    } catch (e) {
      console.error(e.message);
      this._phone = null!;
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

  set timetable(timetable: Table) {
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

  static createFromResultSet(rs: any) {
    return rs.getMetaData().getColumnCount() === 10 ? new User(
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
  }
}
