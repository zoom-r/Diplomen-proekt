/**
 * Модел на потребител.
 */
class User {
    constructor(
      public id: string,
      public email: string,
      public names: string,
      public phone: string,
      public role: 'admin' | 'teacher',
      public position: string,
      public timetable: ClassEntry[],
      public workspace_id: string,
      public notifications_key: string,
      public declarations_key: string
    ) {}
  
    static createFromResultSet(rs: GoogleAppsScript.JDBC.JdbcResultSet): User {
      return new User(
        rs.getString('id'),
        rs.getString('email'),
        rs.getString('names'),
        rs.getString('phone'),
        rs.getString('role') as 'admin' | 'teacher',
        rs.getString('position'),
        JSON.parse(rs.getString('timetable') || '[]'),
        rs.getString('workspace_id'),
        rs.getString('notifications_key'),
        rs.getString('declarations_key')
      );
    }
  }
  