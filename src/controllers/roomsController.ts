/**
 * Обрабтва GET заявката за страницата за стаи
 * @param req 
 * @param res 
 */
function getRoomsPage_(req, res) {
    res.set('Content-Type', 'text/html');
    const role = getCurrentUser_().role;
    let html;
    html = HtmlService.createTemplateFromFile('public/html/rooms');
    html.url = req.url;
    res.send(html.evaluate().setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL).getContent());
    res.end();
}

function getRoomUsageGrid(): any {
    const user = getCurrentUser_();
    const settings = getSettings();
    const conn = getConnection_();
  
    const stmt = conn.prepareStatement(
      "SELECT timetable FROM users WHERE workspace_id = ? AND timetable IS NOT NULL AND timetable != '[]'"
    );
    stmt.setString(1, user.workspace_id);
    const rs = stmt.executeQuery();
  
    const result: any = {
      monday: { first: {}, second: {} },
      tuesday: { first: {}, second: {} },
      wednesday: { first: {}, second: {} },
      thursday: { first: {}, second: {} },
      friday: { first: {}, second: {} }
    };
  
    const rooms = settings.rooms;
    const shifts = settings.shift === "second" ? ["first", "second"] : ["first"];
  
    while (rs.next()) {
      const timetable = JSON.parse(rs.getString("timetable"));
      timetable.forEach((entry: any) => {
        const { day, time, shift, room, group } = entry;
        if (!result[day] || !result[day][shift]) return;
        if (!result[day][shift][room]) result[day][shift][room] = [];
        result[day][shift][room].push({ time, group });
      });
    }
  
    // Добавяме празни стаи при нужда
    for (const day of Object.keys(result)) {
      for (const shift of shifts) {
        rooms.forEach(room => {
          if (!result[day][shift][room]) result[day][shift][room] = [];
        });
      }
    }
  
    return { grid: result, settings };
  }
  

