/**
 * Връща всички работни пространства (училища).
 */
function getAllWorkspaces(): Settings[] {
    const conn = getConnection_();
    const stmt = conn.prepareStatement('SELECT * FROM workspace');
    const rs = stmt.executeQuery();
  
    const workspaces: Settings[] = [];
    while (rs.next()) {
      workspaces.push(Settings.createFromResultSet(rs));
    }
  

    closeConnection_();
  
    return workspaces;
  }
  
  /**
 * Създава ново работно пространство (училище) с име.
 */
function createWorkspace(name: string): void {
    const conn = getConnection_();
    const stmt = conn.prepareStatement(`
      INSERT INTO workspace (id, school, shifts, max_classes, classes, rooms, declaration_templates, substitute_key)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
  
    const id = Utilities.getUuid();
    const substituteKey = Utilities.getUuid(); 

    stmt.setString(1, id);
    stmt.setString(2, name);
    stmt.setString(3, 'first'); // По подразбиране една смяна
    stmt.setInt(4, 0); // По подразбиране 0 часа
    stmt.setString(5, JSON.stringify([])); // Празни класове
    stmt.setString(6, JSON.stringify([])); // Празни стаи
    stmt.setString(7, JSON.stringify([])); // Празни шаблони
    stmt.setString(8, substituteKey);
    stmt.executeUpdate();
    const stmt1 = conn.prepareStatement('INSERT INTO substitute (id, monday, tuesday, wednesday, thursday, friday, substitute_key) VALUES (?, ?, ?, ?, ?, ?, ?)');
    stmt1.setString(1, Utilities.getUuid());
    stmt1.setString(2, JSON.stringify([])); // Празен понеделник
    stmt1.setString(3, JSON.stringify([])); // Празен вторник
    stmt1.setString(4, JSON.stringify([])); // Празна сряда
    stmt1.setString(5, JSON.stringify([])); // Празен четвъртък
    stmt1.setString(6, JSON.stringify([])); // Празен петък
    stmt1.setString(7, substituteKey); // Ключ за заместванията
    stmt1.executeUpdate();   
    closeConnection_();
  }

  /**
 * Създава нов потребител с роля "администратор" без седмично разписание.
 */
function createAdminUser(data: { names: string; email: string; phone: string; position: string; workspaceId: string }): void {
    const conn = getConnection_();
    const stmt = conn.prepareStatement(`
      INSERT INTO users (id, email, names, phone, role, position, timetable, workspace_id, notifications_key, declarations_key)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
  
    const id = Utilities.getUuid();
    const notificationsKey = Utilities.getUuid();
    const declarationsKey = Utilities.getUuid();
  
    stmt.setString(1, id);
    stmt.setString(2, data.email);
    stmt.setString(3, data.names);
    stmt.setString(4, data.phone);
    stmt.setString(5, 'admin'); // Винаги администратор
    stmt.setString(6, data.position);
    stmt.setString(7, JSON.stringify([])); // Без разписание
    stmt.setString(8, data.workspaceId);
    stmt.setString(9, notificationsKey);
    stmt.setString(10, declarationsKey);
  
    stmt.execute();
    stmt.close();
    conn.close();
  }
  
  /**
 * Изтрива работно пространство от базата данни.
 */
function deleteWorkspace(workspaceId: string): void {
    const conn = getConnection_();
    const stmt = conn.prepareStatement('DELETE FROM workspace WHERE id = ?');
    stmt.setString(1, workspaceId);
    stmt.executeUpdate();
    closeConnection_();
}
  