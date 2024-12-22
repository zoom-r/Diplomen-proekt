class User {
    #name;
    #email;
    #phone;
    #role;
    #position;

    constructor(name, email, phone, role, position){
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.role = role;
        this.position = position;
    }

    get name(){
        return this.#name;
    }
    get email(){
        return this.#email;
    }
    get phone(){
        return this.#phone;
    }
    set phone(phone){
        if(phone.length !== 10 || phone.length !== 13){
            throw new Error('Invalid phone number');
        }
        this.#phone = phone;
    }
}