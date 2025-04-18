// TODO Implement the settings model
class Settings{
    private _id: string;
    private _name: string;
    private _shift: string;
    private _max_classes: number;
    private _classes: Array<string>;
    private _rooms: Array<string>;
    private _substitute_key: string;
    private _rooms_key: string;
    private _declarations_templates: Array<string>;
    constructor(id, name, shift, max_classes, classes, rooms, substitute_key, rooms_key, declarations_templates){
        this._id = id;
        this._name = name;
        this._shift = shift;
        this._max_classes = max_classes;
        this._classes = classes;
        this._rooms = rooms;
        this._substitute_key = substitute_key;
        this._rooms_key = rooms_key;
        this._declarations_templates = declarations_templates;
    }
    public get id(){
        return this._id;
    }
    public get name(){
        return this._name;
    }
    public get shift(){
        return this._shift;
    }
    public set shift(shift: string){
        this._shift = shift;
    }
    public get max_classes(){
        return this._max_classes;
    }
    public set max_classes(max_classes: number){
        this._max_classes = max_classes;
    }
    public get classes(){
        return this._classes;
    }
    public set classes(classes: Array<string>){
        this._classes = classes;
    }
    public get rooms(){
        return this._rooms;
    }
    public set rooms(rooms: Array<string>){
        this._rooms = rooms;
    }
    public get substitute_key(){
        return this._substitute_key;
    }
    public get rooms_key(){
        return this._rooms_key;
    }
    public get declarations_templates(){
        return this._declarations_templates;
    }
    public set declarations_templates(declarations_templates: Array<string>){
        this._declarations_templates = declarations_templates;
    }

    static createFromResultSet(resultSet: GoogleAppsScript.JDBC.JdbcResultSet): Settings{
        return new Settings(
            resultSet.getString("id"),
            resultSet.getString("school"),
            resultSet.getString("shifts"),
            resultSet.getInt("max_classes"),
            JSON.parse(resultSet.getObject("classes")).sort(),
            JSON.parse(resultSet.getObject("rooms")).sort(),
            resultSet.getString("substitute_key"),
            resultSet.getString("rooms_key"),
            JSON.parse(resultSet.getObject("declaration_templates")).sort()
        );
    }
}