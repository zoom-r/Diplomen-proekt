/**
 * Извлича декларациите от базата данни.
 * Връща масив от декларации, като проверява дали файловете са налични в Google Drive.
 * Ако файлът липсва или е изтрит, премахва декларацията от базата.
 * @returns Масив от декларации.
 */
function getDeclarations_(): Declaration[] {
    const conn = getConnection_(); // Взима връзка към базата данни.
    const user = getCurrentUser_(); // Взима текущия потребител.
    const isAdmin = user.role === "admin"; // Проверява дали потребителят е администратор.

    // Подготвя SQL заявка в зависимост от ролята на потребителя.
    const stmt = isAdmin
        ? conn.prepareStatement("SELECT id, content FROM declarations WHERE workspace_id = ?")
        : conn.prepareStatement("SELECT id, content FROM declarations WHERE substitute_id = ?");

    if (isAdmin) stmt.setString(1, user.workspace_id); // Задава workspace_id за администратор.
    else stmt.setString(1, user.id); // Задава substitute_id за учител.

    const rs = stmt.executeQuery(); // Изпълнява заявката.
    const result: any[] = []; // Масив за съхранение на декларациите.

    while (rs.next()) {
        const id = rs.getString("id"); // Взима ID на декларацията.
        const contentRaw = rs.getString("content"); // Взима съдържанието на декларацията.

        try {
            const content: Declaration = JSON.parse(contentRaw) as Declaration; // Парсва съдържанието на декларацията.
            try {
                const file = DriveApp.getFileById(content.doc_id); // Взима файла от Google Drive.
                if (!file.isTrashed()) {
                    result.push({ id, ...content }); // Добавя декларацията към резултата, ако файлът не е изтрит.
                } else {
                    // Ако файлът е изтрит, премахва декларацията от базата данни.
                    const del = conn.prepareStatement("DELETE FROM declarations WHERE id = ?");
                    del.setString(1, id);
                    del.executeUpdate();
                }
            } catch (e) {
                // Ако файлът липсва, премахва декларацията от базата данни.
                const del = conn.prepareStatement("DELETE FROM declarations WHERE id = ?");
                del.setString(1, id);
                del.executeUpdate();
            }
        } catch (_) {
            // Игнорира грешки при парсване на съдържанието.
        }
    }

    return result; // Връща масив от декларации.
}

/**
 * Изтрива декларация от базата данни и Google Drive.
 * @param id - ID на декларацията.
 * @param docId - ID на документа в Google Drive.
 */
function deleteDeclaration(id: string, docId: string) {
    const user = getCurrentUser_(); // Взима текущия потребител.
    if (user.role !== "admin") throw new Error("Нямате права да триете декларации."); // Проверява дали потребителят е администратор.

    try {
        DriveApp.getFileById(docId).setTrashed(true); // Маркира файла като изтрит в Google Drive.
    } catch (_) {
        // Игнорира грешки, ако файлът вече липсва.
    }

    const conn = getConnection_(); // Взима връзка към базата данни.
    const stmt = conn.prepareStatement("DELETE FROM declarations WHERE id = ?"); // Подготвя SQL заявка за изтриване.
    stmt.setString(1, id); // Задава ID на декларацията.
    stmt.executeUpdate(); // Изпълнява заявката.
}

/**
 * Връща декларациите заедно с информация за текущия потребител.
 * @returns Обект с декларациите и информация за потребителя.
 */
function getDeclarationsWithUser(): { declarations: any[], user: any } {
    const user = getCurrentUser_(); // Взима текущия потребител.
    const declarations = getDeclarations_(); // Извиква функцията за извличане на декларации.
    return { declarations, user }; // Връща декларациите и информацията за потребителя.
}

/**
 * Актуализира статуса на декларация (завършена/незавършена).
 * @param id - ID на декларацията.
 * @param newStatus - Новият статус (true/false).
 */
function updateDeclarationStatus(id: string, newStatus: boolean) {
    const conn = getConnection_(); // Взима връзка към базата данни.
    const stmt = conn.prepareStatement("SELECT content FROM declarations WHERE id = ?"); // Подготвя SQL заявка за извличане на съдържанието.
    stmt.setString(1, id); // Задава ID на декларацията.
    const rs = stmt.executeQuery(); // Изпълнява заявката.

    if (!rs.next()) return; // Ако няма резултати, прекратява изпълнението.

    const content: Declaration = JSON.parse(rs.getString("content")); // Парсва съдържанието на декларацията.
    content.submitted = newStatus; // Актуализира статуса на декларацията.

    const update = conn.prepareStatement("UPDATE declarations SET content = ? WHERE id = ?"); // Подготвя SQL заявка за актуализиране.
    update.setString(1, JSON.stringify(content)); // Задава актуализираното съдържание.
    update.setString(2, id); // Задава ID на декларацията.
    update.executeUpdate(); // Изпълнява заявката.
}

/**
 * Връща името на Google документ по ID.
 */
function getGoogleDocName(fileId: string): string {
    return DriveApp.getFileById(fileId).getName();
}

/**
 * Генерира декларация за заместване на учител.
 * Създава копие на шаблона, попълва го с данни и го записва в Google Drive.
 * @param templateUrl - URL на шаблона за декларацията.
 * @param substituteName - Име на заместващия учител.
 * @param absentName - Име на отсъстващия учител.
 * @param day - Ден от седмицата.
 * @param entries - Записи за заместванията.
 * @returns Обект с информация за създадената декларация (ID, URL, заглавие и дата).
 */
function generateDeclarationDoc_(templateUrl: string, substituteName: string, substituteId: string, absentName: string, day: string, entries: any[]) {
    const fileId = extractFileIdFromUrl_(templateUrl); // Извлича ID на файла от URL.
    const template = DriveApp.getFileById(fileId); // Взима шаблона от Google Drive.

    const date = new Date(getDateForWeekday_(day)); // Взима датата за дадения ден от седмицата.
    const folder = getOrCreateFolderByDate_(fileId, date); // Взима или създава папка за датата.
    const copy = template.makeCopy(`Декларация - ${substituteName}`, folder); // Създава копие на шаблона.

    const doc = DocumentApp.openById(copy.getId()); // Отваря копието като Google документ.
    const body = doc.getBody(); // Взима тялото на документа.

    const currentUser = getCurrentUser_(); // Взима текущия потребител.

    // Замества плейсхолдърите в документа с реални данни.
    body.replaceText("{{names}}", substituteName);
    body.replaceText("{{absent}}", absentName);
    body.replaceText("{{position}}", currentUser.position || "");
    body.replaceText("{{names_admin}}", getCurrentUser_().names || "");
    body.replaceText("{{date}}", formatDateForDocument_(date));

    const tables = body.getTables(); // Взима всички таблици в документа.
    if (tables.length > 0) {
        const table = tables[0]; // Взима първата таблица.
        const modelRow = table.getRow(1); // Взима модела на реда (втория ред).

        // Добавя толкова редове, колкото са записите в `entries`.
        for (let i = 1; i < entries.length; i++) {
            table.appendTableRow(modelRow.copy()); // Копира модела на реда и го добавя.
        }
        // Попълва данните за всеки запис в таблицата.
        entries.forEach((e, i) => {
            const row = table.getRow(i + 1); // Взима текущия ред.
            if (row.getNumCells() >= 3) {
                const subject = (e.substitute?.position == e.absentTeacher?.position) ? "" : "Гражданско образование"; // Определя предмета.
                row.getCell(0).setText(String(e.time)); // Попълва часа.
                row.getCell(1).setText(subject); // Попълва предмета.
                row.getCell(2).setText(e.group); // Попълва класа.
                row.getCell(3).setText("1"); // Попълва броя часове.
            }
        });
    }

    doc.saveAndClose(); // Запазва и затваря документа.
    const declaration = new Declaration(`Декларация - ${substituteName}`, copy.getUrl(), copy.getId(), formatDateForDocument_(date), false); // Създава декларация с информация за документа.
    
    const conn = getConnection_(); // Взима връзка към базата данни.
    const stmt = conn.prepareStatement('INSERT INTO declarations (id, workspace_id, substitute_id, content) VALUES (?, ?, ?, ?)');
    stmt.setString(1, Utilities.getUuid());
    stmt.setString(2, currentUser.workspace_id);
    stmt.setString(3, substituteId);
    stmt.setString(4, JSON.stringify(declaration)); // Записва декларацията в базата данни.
    stmt.executeUpdate();
    
    // Споделяне с учителя
    const teacher = getUserById_(substituteId);
    if (teacher?.email) {
        DriveApp.getFileById(copy.getId()).addEditor(teacher.email);
    }
}

/**
 * Форматира дата във формат "dd.MM.yyyy".
 * @param date - Дата за форматиране.
 * @returns Форматирана дата като низ.
 */
function formatDateForDocument_(date: Date): string {
    return Utilities.formatDate(date, Session.getScriptTimeZone(), "dd.MM.yyyy"); // Форматира датата според часовата зона.
}

/**
 * Връща или създава папка за дадена дата в Google Drive.
 * Ако папката за дадената дата не съществува, я създава в родителската папка на шаблона.
 * @param templateId - ID на шаблона.
 * @param date - Дата за създаване на папката.
 * @returns Папка в Google Drive.
 */
function getOrCreateFolderByDate_(templateId: string, date: Date): GoogleAppsScript.Drive.Folder {
    const folderName = formatDateForDocument_(date); // Форматира името на папката според датата.

    const templateFile = DriveApp.getFileById(templateId); // Взима шаблона от Google Drive.
    const parents = templateFile.getParents(); // Взима родителските папки на шаблона.

    if (!parents.hasNext()) throw new Error("Шаблонът няма родителска папка."); // Ако няма родителска папка, хвърля грешка.

    const parentFolder = parents.next(); // Взима първата родителска папка.
    const folders = parentFolder.getFoldersByName(folderName); // Търси папка с даденото име.

    // Връща съществуващата папка или създава нова, ако не съществува.
    return folders.hasNext() ? folders.next() : parentFolder.createFolder(folderName);
}

/**
 * Извлича ID на файл от URL.
 * @param url - URL на файла.
 * @returns ID на файла.
 */
function extractFileIdFromUrl_(url: string): string {
    const match = url.match(/[-\w]{25,}/); // Търси съвпадение за ID на файл в URL.
    return match ? match[0] : ""; // Връща ID или празен низ, ако няма съвпадение.
}
