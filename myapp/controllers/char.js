module.exports = class Char {
    constructor(name) {
        this.name = name; // char
        this.position = new Array(); // locations that the char exists
        this.from_word = new Array(); // from word
    }
    add_Location (pos_Vec) {
        this.position.push(pos_Vec);
    }
    add_Word (word) {
        this.from_word.push(word);
    }
    get_Char () {
        return this.name;
    }

    get_Location (){
        return this.position;
    }
}