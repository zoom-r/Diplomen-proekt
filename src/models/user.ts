/**
 * Представлява потребител в системата.
 * @class
 */
class User {
  /**
   * Уникалният идентификатор на потребителя.
   * @property {string}
   */
  private _id: string;

  /**
   * Имената на потребителя.
   * @property {string}
   */
  private _names: string;

  /**
   * Имейлът на потребителя.
   * @property {string}
   */
  private _email: string;

  /**
   * Телефонният номер на потребителя.
   * @property {string}
   */
  private _phone: string;

  /**
   * Ролята на потребителя.
   * @property {string}
   */
  private _role: string;

  /**
   * Длъжността на потребителя.
   * @property {string}
   */
  private _position: string;

  /**
   * Разписанието на потребителя.
   * @property {Table}
   */
  private _timetable?: Table;

  /**
   * Идентификаторът на работното пространство на потребителя.
   * @property {string}
   */
  private _workspace_id?: string;

  /**
   * Ключът за декларации на потребителя.
   * @property {string}
   */
  private _declarations_key?: string;

  /**
   * Ключът за известия на потребителя.
   * @property {string}
   */
  private _notifications_key?: string;

  /**
   * Конструктор за създаване на потребители в users в локалното хранилище.
   * @param {string} id - Уникалният идентификатор на потребителя.
   * @param {string} email - Имейлът на потребителя.
   * @param {string} names - Трите имена на потребителя.
   * @param {string} phone - Телефонният номер на потребителя.
   * @param {string} role - Ролята на потребителя.
   * @param {string} position - Длъжността на потребителя.
   */
  constructor(email: string, names: string, role: string, position: string, id: string, phone: string)

  /**
   * Конструктор за създаване на инстанция за текущ потребител.
   * @param {string} id - Уникалният идентификатор на потребителя.
   * @param {string} email - Имейлът на потребителя.
   * @param {string} names - Трите имена на потребителя.
   * @param {string} phone - Телефонният номер на потребителя.
   * @param {string} role - Ролята на потребителя.
   * @param {string} position - Длъжността на потребителя.
   * @param {Table} timetable - Разписанието на потребителя.
   * @param {string} workspace_id - Идентификаторът на работното пространство на потребителя.
   * @param {string} declarations_key - Ключът за декларации на потребителя.
   * @param {string} notifications_key - Ключът за известия на потребителя.
   */
  constructor(email: string, names: string, role: string, position: string, id: string, phone: string, timetable: Table, workspace_id: string, declarations_key: string, notifications_key: string);
  
  /** 
   * Конструктор за създаване на нов потребител от администратора. (createUser_)
   * @param {string} email - Имейлът на потребителя.
   * @param {string} names - Трите имена на потребителя.
   * @param {string} role - Ролята на потребителя.
   * @param {string} position - Длъжността на потребителя.
   */ 
  constructor(email: string, names: string, role: string, position: string);
  
  // Единствена инициализация на конструктора
  constructor(email: string, names: string, role: string, position: string, id?: string, phone?: string, timetable?: Table, workspace_id?: string, declarations_key?: string, notifications_key?: string) {
    if (arguments.length === 6) {
      this._id = id;
      this._email = email;
      this._names = names!;
      this._phone = phone;
      this._role = role!;
      this._position = position!;
    }else if(arguments.length === 4){
      this._id = Utilities.getUuid();
      this._names = names!;
      this._email = email!;
      this._role = role!;
      this._phone = null;
      this._position = position!;
      this._workspace_id = Utilities.getUuid();
      this._declarations_key = Utilities.getUuid();
      this._notifications_key = Utilities.getUuid();
    } else {
      this._id = id!;
      this._names = names!;
      this._email = email!;
      this._phone = phone;
      this._role = role!;
      this._position = position!;
      this._timetable = timetable; //|| new Table();
      this._workspace_id = workspace_id!;
      this._declarations_key = declarations_key!;
      this._notifications_key = notifications_key!;
    }
  }

  /**
   * Връща уникалния идентификатор на потребителя.
   * @returns {string} Уникалният идентификатор на потребителя.
   */
  get id() {
    return this._id;
  }

  /**
   * Връща имената на потребителя.
   * @returns {string} Имената на потребителя.
   */
  get names() {
    return this._names;
  }

  /**
   * Връща имейла на потребителя.
   * @returns {string} Имейла на потребителя.
   */
  get email() {
    return this._email;
  }

  /**
   * Връща телефонния номер на потребителя.
   * @returns {string} Телефонния номер на потребителя.
   */
  get phone() {
    return this._phone;
  }

  /**
   * Задава телефонния номер на потребителя.
   * @param {string} phone - Новият телефонен номер на потребителя.
   * @throws Грешка, ако телефонният номер е невалиден.
   */
  set phone(phone: string) {
    try {
      if (phone.length !== 10 && phone.length !== 13) {
        throw new Error('Invalid phone number');
      }
      this._phone = phone;
    } catch (e) {
      console.error(e.message);
      this._phone = null;
    }
  }

  /**
   * Връща ролята на потребителя.
   * @returns {string} Ролята на потребителя.
   */
  get role() {
    return this._role;
  }

  /**
   * Връща длъжността на потребителя.
   * @returns {string} Длъжността на потребителя.
   */
  get position() {
    return this._position;
  }

  /**
   * Връща разписанието на потребителя.
   * @returns {Table} Разписанието на потребителя.
   */
  get timetable() {
    return this._timetable;
  }

  /**
   * Задава разписанието на потребителя.
   * @param {Table} timetable - Новото разписание на потребителя.
   */
  set timetable(timetable: Table) {
    this._timetable = timetable;
  }

  /**
   * Връща идентификатора на работното пространство на потребителя.
   * @returns {string} Идентификатора на работното пространство на потребителя.
   */
  get workspace_id() {
    return this._workspace_id;
  }

  /**
   * Връща ключа за декларации на потребителя.
   * @returns {string} Ключа за декларации на потребителя.
   */
  get declarations_key() {
    return this._declarations_key;
  }

  /**
   * Връща ключа за известия на потребителя.
   * @returns {string} Ключа за известия на потребителя.
   */
  get notifications_key() {
    return this._notifications_key;
  }

  /**
   * Създава инстанция на User от извлечени данни от базата данни.
   * @param {GoogleAppsScript.JDBC.JdbcResultSet} rs - Резултатният набор, съдържащ данни за потребителя.
   * @returns {User} Нова инстанция на User.
   */
  static createFromResultSet(rs: GoogleAppsScript.JDBC.JdbcResultSet): User {
    return rs.getMetaData().getColumnCount() === 10 ? new User(
      rs.getString('id'), 
      rs.getString('email'), 
      rs.getString('names'), 
      rs.getString('phone'), 
      rs.getString('role'), 
      rs.getString('position'), 
      rs.getObject('timetable'), 
      rs.getString('workspace_id'), 
      rs.getString('declarations_key'), 
      rs.getString('notifications_key')
    ) : new User(
      rs.getString('id'),
      rs.getString('email'), 
      rs.getString('names'), 
      rs.getString('phone'), 
      rs.getString('role'), 
      rs.getString('position')
    );
  }
}