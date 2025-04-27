// Инициализация на кеш с ObjectStore (в режим "manual persist")
// @ts-ignore
const userStore = ObjectStore.create('user', { manual: true });
// @ts-ignore
const scriptStore = ObjectStore.create('script', { manual: true });
// Зареждане на LodashGS библиотеката
// @ts-ignore
const _ = LodashGS.load();

/**
 * Връща обекта с настройки от кеша (ObjectStore) за текущото работно пространство.
 */
function getSettings(): Settings {
  const data: Settings = scriptStore.get(getCurrentUser_().workspace_id);
  if (!data) {
    throw new Error("Настройките не са намерени!");
  }

  return new Settings(data.id, data.school, data.shift, data.max_classes, data.classes, data.rooms, data.declaration_templates, data.substitute_key);
}

/**
 * Запазва настройките в базата данни и обновява кеша.
 */
function saveSettings(shift, max_classes, declaration_templates, classes, rooms) {
  const conn = getConnection_();
  try {
    const stmt = conn.prepareStatement('UPDATE workspace SET shifts = ?, max_classes = ?, declaration_templates = ?, classes = ?, rooms = ? WHERE id = ?');
    stmt.setString(1, shift);
    stmt.setInt(2, parseInt(max_classes));
    stmt.setString(3, JSON.stringify(declaration_templates));
    stmt.setString(4, JSON.stringify(classes));
    stmt.setString(5, JSON.stringify(rooms));
    stmt.setString(6, getCurrentUser_().workspace_id);
    const rs = stmt.executeUpdate();

    // Ако записът е успешен, обновяваме кеша
    if (rs > 0) {
      let settings = getSettings();
      settings.shift = shift;
      settings.max_classes = max_classes;
      settings.declaration_templates = declaration_templates;
      settings.classes = classes;
      settings.rooms = rooms;
      updateSettings(settings);
    }
  } catch (e) {
    throw new Error('Грешка при запазване на настройките: ' + e.message);
  } finally {
    closeConnection_();
  }
}

/**
 * Обновява кеша с нов обект Settings.
 */
function updateSettings(settings: Settings): void {
  scriptStore.set(getCurrentUser_().workspace_id, settings);
  scriptStore.persist(false);
}

/**
 * Изтрива настройките от ObjectStore за текущото работно пространство.
 */
function deleteSettings_(): void {
  scriptStore.delete(getCurrentUser_().workspace_id);
  scriptStore.persist(false);
}

/**
 * Проверява дали има разлика между кеша и базата, и ако има — обновява кеша.
 * Връща true, ако настройките са валидни и синхронизирани.
 */
function checkSettings_(): boolean {
  const conn = getConnection_();
  let success = false;
  try {
    const settingsData = scriptStore.get(getCurrentUser_().workspace_id);
    let settings = settingsData
      ? new Settings(
        settingsData.id,
        settingsData.school,
        settingsData.shift,
        settingsData.max_classes,
        settingsData.classes,
        settingsData.rooms,
        settingsData.declaration_templates,
        settingsData.substitute_key
      )
      : null;
    const stmt = conn.prepareStatement('SELECT * FROM workspace WHERE id = ?');
    stmt.setString(1, getCurrentUser_().workspace_id);

    if (!settings) {
      // Ако няма кеш, зареждаме от базата и кешираме
      const rs = stmt.executeQuery();
      if (rs.next()) {
        settings = Settings.createFromResultSet(rs);
        scriptStore.set(getCurrentUser_().workspace_id, settings);
        success = true;
        scriptStore.persist(false);
      } else {
        throw new Error('Настройките не са намерени!');
      }
    } else {
      // Има кеш — сравняваме с базата
      const rs = stmt.executeQuery();
      if (rs.next()) {
        const newSettings = Settings.createFromResultSet(rs);
        if (!_.isEqual(settings, newSettings)) {
          scriptStore.set(getCurrentUser_().workspace_id, newSettings);
          scriptStore.persist(false);
        }
        success = true;
      }
    }

    closeConnection_();
    return success;
  } catch (e) {
    throw new Error('Грешка при проверка на настройките: ' + e.message);
  }
}
