/**
 * Обрабтва GET заявката за страницата за декларации
 * @param req 
 * @param res 
 */
function getDeclarationsPage_(req, res) {
    res.set('Content-Type', 'text/html');
    const role = getCurrentUser_().role;
    let html;
    if(role == 'admin'){
        html = HtmlService.createTemplateFromFile('public/html/admin/declarations');
        html.url = req.url;
    }else if(role == 'teacher'){
        html = HtmlService.createTemplateFromFile('public/html/teacher/declarations');
        html.url = req.url;
    }
    res.send(html.evaluate().setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL).getContent());
    res.end();
}

function getDeclarations(): any[] {
    const conn = getConnection_();
    const user = getCurrentUser_();
    const isAdmin = user.role === "admin";
  
    const stmt = isAdmin
      ? conn.prepareStatement("SELECT id, content FROM declarations WHERE workspace_id = ?")
      : conn.prepareStatement("SELECT id, content FROM declarations WHERE substitute_id = ?");
  
    if (isAdmin) stmt.setString(1, user.workspace_id);
    else stmt.setString(1, user.id);
  
    const rs = stmt.executeQuery();
    const result: any[] = [];
  
    while (rs.next()) {
      const id = rs.getString("id");
      const contentRaw = rs.getString("content");
      try {
        const content = JSON.parse(contentRaw);
        try {
            const file = DriveApp.getFileById(content.doc_id);
            if (!file.isTrashed()) {
              result.push({ id, ...content });
            } else {
              // изтриваме от базата
              const del = conn.prepareStatement("DELETE FROM declarations WHERE id = ?");
              del.setString(1, id);
              del.executeUpdate();
            }
        } catch (e) {
          // ако файлът липсва – трием от базата
          const del = conn.prepareStatement("DELETE FROM declarations WHERE id = ?");
          del.setString(1, id);
          del.executeUpdate();
        }
      } catch (_) {}
    }
  
    return result;
  }

  function deleteDeclaration(id: string, docId: string) {
    const user = getCurrentUser_();
    if (user.role !== "admin") throw new Error("Нямате права да триете декларации.");
  
    try {
      DriveApp.getFileById(docId).setTrashed(true);
    } catch (_) {}
  
    const conn = getConnection_();
    const stmt = conn.prepareStatement("DELETE FROM declarations WHERE id = ?");
    stmt.setString(1, id);
    stmt.executeUpdate();
  }

  function getDeclarationsWithUser(): { declarations: any[], user: any } {
    const user = getCurrentUser_();
    const declarations = getDeclarations(); // твоята реална функция
    return { declarations, user };
  }

  function updateDeclarationStatus(id: string, newStatus: boolean) {
    const conn = getConnection_();
    const stmt = conn.prepareStatement("SELECT content FROM declarations WHERE id = ?");
    stmt.setString(1, id);
    const rs = stmt.executeQuery();
  
    if (!rs.next()) return;
  
    const content = JSON.parse(rs.getString("content"));
    content.submitted = newStatus;
  
    const update = conn.prepareStatement("UPDATE declarations SET content = ? WHERE id = ?");
    update.setString(1, JSON.stringify(content));
    update.setString(2, id);
    update.executeUpdate();
  }
  