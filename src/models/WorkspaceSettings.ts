/**
 * Модел на настройки за училището (работното пространство).
 */
class Settings {
    constructor(
      public id: string,
      public school: string,
      public shift: 'first' | 'second',
      public max_classes: number,
      public classes: string[],
      public rooms: string[],
      public declaration_templates: string[],
      public substitute_key: string,
    ) {}
  
    static createFromResultSet(rs: GoogleAppsScript.JDBC.JdbcResultSet): Settings {
      return new Settings(
        rs.getString('id'),
        rs.getString('school'),
        rs.getString('shifts') as 'first' | 'second',
        rs.getInt('max_classes'),
        JSON.parse(rs.getString('classes') || '[]'),
        JSON.parse(rs.getString('rooms') || '[]'),
        JSON.parse(rs.getString('declaration_templates') || '[]'),
        rs.getString('substitute_key')
      );
    }
  }
  