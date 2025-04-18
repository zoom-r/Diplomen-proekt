/**
 * Обрабтва GET заявката за страницата за потребители
 * @param req 
 * @param res 
 */
function getUsersPage_(req, res) {
    res.set('Content-Type', 'text/html');
    const role = getCurrentUser_().role;
    let html;
    if(role == 'admin'){
        html = HtmlService.createTemplateFromFile('public/html/admin/users');
        html.settings = getSettings();
        html.url = req.url;
        //TODO: Add data to the template
    }else if(role == 'teacher'){
        html = HtmlService.createTemplateFromFile('public/html/teacher/users');
        //TODO: Add data to the template
    }
    res.send(html.evaluate().getContent());
    res.end();
}

/**
 * Проверява дали даден клас или стая са свободни.
 * @param {string} day - Ден от седмицата
 * @param {number} hour - Час
 * @param {string} shift - Смяна ("first" или "second")
 * @param {string} className - Име на класа
 * @param {string} room - Номер на стаята
 * @returns {Object} - Обект с информация за наличността
 */
function checkAvailability(day: string, hour: number, shift: string, className: string, room: string): { classAvailable: boolean, roomAvailable: boolean } {
    // TODO: Добавете логика за проверка в базата данни или текущите разписания
    const isClassAvailable = checkClassAvailability(day, hour, shift, className);
    const isRoomAvailable = checkRoomAvailability(day, hour, shift, room);

    return {
        classAvailable: isClassAvailable,
        roomAvailable: isRoomAvailable,
    };
}

/**
 * Проверява дали даден клас е свободен.
 */
function checkClassAvailability(day: string, hour: number, shift: string, className: string): boolean {
    // Fetch all users and their timetables
    const users = getAllUsers(); // Assume this function retrieves all users from the database

    // Check if any user is busy in the given class at the specified time
    return !users.some(user => {
        return user.timetable?.data.some(entry => 
            entry.day === day && 
            entry.shift === shift && 
            entry.time === hour.toString() && 
            entry.group === className
        );
    });
}

/**
 * Проверява дали дадена стая е свободна.
 */
function checkRoomAvailability(day: string, hour: number, shift: string, room: string): boolean {
    // Fetch all room schedules
    const roomSchedules = getRoomSchedules(); // Assume this function retrieves room schedules from the database

    // Check if the room is occupied at the specified time
    return !roomSchedules.some(schedule => 
        schedule.day === day && 
        schedule.shift === shift && 
        schedule.time === hour.toString() && 
        schedule.room === room
    );
}
