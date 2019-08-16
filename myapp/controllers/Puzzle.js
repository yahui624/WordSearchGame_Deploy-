class Puzzle {
    constructor(title, row, col, parse_option, display_option, string_array) {
        this.title = title;
        this.size = {
            row: row,
            col: col
        }
        this.parse_option = parse_option;
        this.display_option = display_option;

        for (let i=0; i<string_array.length; i++)
            string_array[i]=string_array[i].toLowerCase();
        this.string_array = this.sort_Ascending(string_array);
    }

    sort_Ascending (string){
        return Object.values(string).sort((x,y) => x.length - y.length); //ascending order of input work
    }

    sort_Descending (string) {
        return Object.values(string).sort((x,y) => y.length - x.length);
    }
}

module.exports = class WordSearch extends Puzzle {
    constructor(title, row, col, parse_option, display_option, string_array) {
        super(title, row, col, parse_option, display_option, string_array); // call and allow access to parent method
        //creating the Grid
        // this.cells = Array(this.size.row-1+1).fill(' ').map(() => Array(this.size.col-1+1));
        this.creating_cells();
        const Victor = require('victor');
        // this.boundary = new Victor(this.size.col-1, this.size.row-1);
        this.orientation = ['horizontal','horizontalBack','vertical','verticalUp',
            'diagonal','diagonalUp','diagonalBack','diagonalBack_Up'];
        this.my_JSON = {}; //Creating a JSON object
        this.starting_points = [];
        this.empty_sets = []; // an array that stores empty points as individual objects
        this.abandoned_words = []; //an array storing abandoned words at the first try
    }

    creating_cells (){
        const Victor = require('victor');
        this.cells = Array(this.size.row-1+1).fill(' ').map(() => Array(this.size.col-1+1));
        this.boundary = new Victor(this.size.col-1, this.size.row-1);
    }


    update_Info () {
        this.size.col++;
        this.size.row++;
        // update the cells and boundary if increases the size of the puzzle
        // this.cells = Array(this.size.row - 1 + 1).fill(' ').map(() => Array(this.size.col - 1 + 1));
        const Victor = require('victor');
        // increase the size of this.cells by one col and row
        // expand to have the correct amount of row
        for (let i= this.cells.length; i<= this.size.row; i++)
            this.cells.push([]);
        for (let i=0; i<this.size.row; i++) {
            for (let j = 0; j < this.size.col; j++) {
                if (this.cells[i][j] != null)
                    this.cells[i][j] == this.cells[i][j];
                else
                    this.cells[i][j] == "";
            }
        }
        this.boundary = new Victor(this.size.col - 1, this.size.row - 1);
    }


    get_EmptyPoints () {
        const Grid = require('./grid');
        for (let i=0; i<this.cells.length; i++) {
            for (let j = 0; j < this.cells[0].length; j++) {
                if (this.cells[i][j] == null) {
                    let grid = new Grid(i, j);
                    let JSON = grid.update_surrondings(this.cells);
                    this.empty_sets.push({
                        position: [i, j], H: Object.values(JSON)[0], V: Object.values(JSON)[1],
                        D: Object.values(JSON)[2], D_B: Object.values(JSON)[3]});
                }
            }
        }
    }

    puzzle_make (){
        let longest_string = this.sort_Descending(this.string_array)[0];
        console.log(longest_string);
        if (longest_string > this.size.row && longest_string > this.size.col) {
            // need to set the row equals to the longest length
            this.size.row = longest_string.length;
            this.size.col = longest_string.length;
            console.log(this.size.row);
            this.creating_cells();
        }

        if (this.parse_option == 1) //Use each letter only once
            this.first_option();
        else if (this.parse_option == 2) { // Share letters occasionally
            this.second_option();
            this.remove_empty_Rows_Cols();
            // this.storing_abandoned_words();
        }
        else if (this.parse_option == 3) {// Share letters as much as possible
            this.third_option();
            this.remove_empty_Rows_Cols();
        }
        //finalize the puzzle
        // this.finalize_Puzzle();
    }

    first_option () {
        let sorted_array = this.string_array; // make a copy of the array
        while ( sorted_array.length != 0) {
            //default failure times can be 100 times
            let word = sorted_array.pop();
            this.one_word_Placement (word);
        }
    }

    one_word_Placement (word) {
        const Victor = require('victor');
        let new_spot;
        let available = false;
        let attempts = 0;
        let direction = this.orientation[Math.floor(Math.random() * this.orientation.length)]  //generate a random dir
        while (!available) {// if not available to store all chars, keep trying
            if (attempts >= 200)
                direction = this.orientation[Math.floor(Math.random() * this.orientation.length)]  //generate a random dir

            // This function stores chars to grid, return true for successfully store-in; otherwise return false
            if (direction === 'horizontal') {
                const original_Point = new Victor(0,0); // original point
                // calculate the available spots for that words (x, y + word.length)
                let new_bounding = this.boundary.clone().subtractX(new Victor(word.length-1, 0)) // represents all possible region
                console.log(this.boundary, new_bounding);
                new_spot = original_Point.randomize(original_Point, new_bounding); //randomize a spot for word
                console.log(new_spot, word.length, direction);
                available = this.one_word_Available(direction, word, new_spot);

            } else if (direction === 'horizontalBack') {
                const original_Point = new Victor(0,0); // original point
                let low_Left = original_Point.clone().addScalarX(word.length-1);
                console.log(low_Left);
                new_spot = original_Point.randomize(low_Left, this.boundary);
                console.log(new_spot, word.length, direction);
                available = this.one_word_Available(direction, word, new_spot);

            } else if (direction === 'vertical') {
                const original_Point = new Victor(0,0); // original point
                let low_Left = original_Point.clone().addScalarY(word.length-1);
                console.log(low_Left, this.boundary);
                new_spot = original_Point.randomize(low_Left, this.boundary);
                console.log(new_spot, word.length, direction);
                available = this.one_word_Available(direction, word, new_spot);

            } else if (direction === 'verticalUp') {
                const original_Point = new Victor(0,0); // original point
                let up_right = this.boundary.clone().subtractScalarY(word.length-1);
                console.log(original_Point, up_right);
                new_spot = original_Point.randomize(original_Point, up_right);
                console.log(new_spot, word.length, direction);
                available = this.one_word_Available(direction, word, new_spot);

            } else if (direction === 'diagonal') {
                const original_Point = new Victor(0,0); // original point
                let low_left = original_Point.clone().addScalarY(word.length-1);
                let up_right = this.boundary.clone().subtractScalarX(word.length-1);
                console.log(original_Point, low_left, up_right);
                new_spot = original_Point.randomize(low_left, up_right);
                console.log(new_spot, word.length, direction);
                available = this.one_word_Available(direction, word, new_spot);

            } else if (direction === 'diagonalUp') {
                const original_Point = new Victor(0,0); // original point
                const limit = new Victor(word.length-1, word.length-1);
                let up_right = this.boundary.clone().subtract(limit);
                console.log(original_Point, up_right);
                new_spot = original_Point.randomize(original_Point, up_right);
                console.log(new_spot, word.length, direction);
                available = this.one_word_Available(direction, word, new_spot);

            } else if (direction === 'diagonalBack') {
                const original_Point = new Victor(0,0); // original point
                const limit = new Victor(word.length-1, word.length-1);
                let low_left = original_Point.clone().add(limit);
                console.log(limit, low_left, this.boundary);
                new_spot = original_Point.randomize(low_left, this.boundary);
                console.log(new_spot, word.length, direction);
                available = this.one_word_Available(direction, word, new_spot);

            } else if (direction === 'diagonalBack_Up') {
                const original_Point = new Victor(0,0); // original point
                const limit = new Victor(word.length-1, word.length-1);
                let up_right = this.boundary.clone().subtract(limit);
                console.log(original_Point, up_right);
                new_spot = original_Point.randomize(original_Point, up_right);
                console.log(new_spot, word.length, direction);
                available = this.one_word_Available(direction, word, new_spot);

            }
            attempts++;
        }
        // store char into corresponding cells
        this.store_One_Word(direction, word, new_spot);
    }

    one_word_Available (direction, word, new_spot) {
        let num_row = this.size.row - Object.values(new_spot)[1] -1 ;
        let num_col = Object.values(new_spot)[0];
        console.log(num_row, num_col);
        console.log(word);
        for (let i = 0; i < word.length; i++) {
            if (direction === 'horizontal') {
                if (this.cells[num_row][num_col + i] != null) {
                    return false;
                }
            }
            else if (direction === 'horizontalBack') {
                if (this.cells[num_row][num_col - i] != null) {
                    return false;
                }
            }
            else if (direction === 'vertical') {
                if (this.cells[num_row + i][num_col] != null) {
                    return false;
                }
            }
            else if (direction === 'verticalUp') {
                if (this.cells[num_row - i][num_col] != null) {
                    return false;
                }
            }
            else if (direction === 'diagonal') {
                if (this.cells[num_row + i][num_col + i] != null) {
                    return false;
                }
            }
            else if (direction === 'diagonalUp') {
                if (this.cells[num_row - i][num_col - i] != null)
                    return false;
            }
            else if (direction === 'diagonalBack') {
                if (this.cells[num_row + i][num_col - i] != null)
                    return false;
            }
            else if (direction === 'diagonalBack_Up') {
                if (this.cells[num_row - i][num_col + i] != null)
                     return false;
            }
        }
        return true;
    }

    store_One_Word(direction, word, new_spot) {
        let num_row = this.size.row - 1 - Object.values(new_spot)[1];
        let num_col = Object.values(new_spot)[0];
        for (let i = 0; i < word.length; i++) {
            if (direction === 'horizontal')
                this.cells[num_row][num_col + i] = word[i];
            else if (direction === 'horizontalBack')
                this.cells[num_row][num_col - i] = word[i];
            else if (direction === 'vertical')
                this.cells[num_row + i][num_col] = word[i];
            else if (direction === 'verticalUp')
                this.cells[num_row - i][num_col] = word[i];
            else if (direction === 'diagonal')
                this.cells[num_row + i][num_col + i] = word[i];
            else if (direction === 'diagonalUp')
                this.cells[num_row - i][num_col - i] = word[i];
            else if (direction === 'diagonalBack')
                this.cells[num_row + i][num_col - i] = word[i];
            else if (direction === 'diagonalBack_Up')
                this.cells[num_row - i][num_col + i] = word[i];
        }
        // console.log("I store the words ")
    }


    places_Available (direction, word, new_spot) {
        // console.log(new_spot);
        let spot = Object.values(Object.values(Object.values(new_spot))[0]); //(x, y)
        let num_row = this.size.row - 1 - spot[1];
        let num_col = spot[0];
        // console.log(word, direction);
        // console.log(num_row, num_col);
         for (let i = 0; i < word.length; i++) {
             // console.log(word[i], direction);
             // console.log(this.cells[num_row][num_col]);
           if (direction === 'horizontal') {
                if (this.cells[num_row][num_col + i] != null && this.cells[num_row][num_col + i] !== word[i] ) {
                    // console.log(this.cells[num_row][num_col + i], "I dont know why I am here");
                    return false;
                }
            }
            else if (direction === 'horizontalBack') {
                if (this.cells[num_row][num_col - i] != null && this.cells[num_row][num_col - i] !== word[i]) {
                    // console.log(this.cells[num_row][num_col - i], "I dont know why I am here");
                    return false;
                }
            }
            else if (direction === 'vertical') {
                if (this.cells[num_row + i][num_col] != null && this.cells[num_row + i][num_col] !== word[i]) {
                    // console.log(this.cells[num_row + i][num_col], "I dont know why I am here");
                    return false;
                }
            }
            else if (direction === 'verticalUp') {
                if (this.cells[num_row - i][num_col] != null && this.cells[num_row - i][num_col] !== word[i]) {
                    // console.log(this.cells[num_row - i][num_col], "I dont know why I am here");
                    return false;
                }
            }
            else if (direction === 'diagonal') {
                if (this.cells[num_row + i][num_col + i] != null && this.cells[num_row + i][num_col + i] !== word[i] ) {
                    // console.log(this.cells[num_row + i][num_col + i], "I dont know why I am here");
                    return false;
                }
            }
            else if (direction === 'diagonalUp') {
                if (this.cells[num_row - i][num_col - i] != null && this.cells[num_row - i][num_col - i] !== word[i]) {
                    // console.log(this.cells[num_row - i][num_col - i], "I dont know why I am here");
                    return false;
                }
            }
            else if (direction === 'diagonalBack') {
                if (this.cells[num_row + i][num_col - i] != null && this.cells[num_row + i][num_col - i] !== word[i]) {
                    // console.log(this.cells[num_row + i][num_col - i], "I dont know why I am here");
                    return false;
                }

            }
            else if (direction === 'diagonalBack_Up') {
                if (this.cells[num_row - i][num_col + i] != null && this.cells[num_row - i][num_col + i] !== word[i]) {
                    // console.log(this.cells[num_row - i][num_col + i], "I dont know why I am here");
                     return false;
                }
            }
        }
        return true;

    }

    store_Chars (direction, word, new_spot) {
        //convent from Victor to 2D array: # row = this.size.row-1-victor.y; # col = victor.x;
        let spot = Object.values(Object.values(Object.values(new_spot))[0]); //(x, y)
        let num_row = this.size.row-1-spot[1];
        let num_col = spot[0];
        for (let i = 0; i < word.length; i++) {
            if (direction == 'horizontal')
                this.cells[num_row][num_col + i] = word[i];
            else if (direction == 'horizontalBack')
                this.cells[num_row][num_col - i] = word[i];
            else if (direction == 'vertical')
                this.cells[num_row + i][num_col] = word[i];
            else if (direction == 'verticalUp')
                this.cells[num_row - i][num_col] = word[i];
            else if (direction == 'diagonal')
                this.cells[num_row + i][num_col + i] = word[i];
            else if (direction == 'diagonalUp')
                this.cells[num_row - i][num_col - i] = word[i];
            else if (direction == 'diagonalBack')
                this.cells[num_row + i][num_col - i] = word[i];
            else if (direction == 'diagonalBack_Up')
                this.cells[num_row - i][num_col + i] = word[i];
        }
    }

    second_option () {
        // console.log(this.size.row, this.size.col);
        //share the common first letter of the string array
        let sort_array = this.string_array.sort();
        let grouped_Collection = {};

        for (let i = 0; i < sort_array.length; i++) {
            let first_letter = sort_array[i].charAt(0);
            if (grouped_Collection[first_letter] == undefined) //put into an object
                grouped_Collection[first_letter] = [];
            grouped_Collection[first_letter].push(sort_array[i]);
        }
        const entries = Object.entries(grouped_Collection); //keys and values


        for (let [character, words] of entries) {
            let num_attempts = 0; //set a threshold
            let available_intersects = false;
            //pair each word with a direction and store them in a JSON object
            while (!available_intersects && num_attempts <= 1000) {
                let directions = this.get_Random(this.orientation, words.length); // based on how many words, get the # of orientations
                this.my_JSON = {};
                for (let i = 0; i < words.length; i++) {
                    // if exist, do thing; but if doesnt, create a new empty object
                    words[i] = words[i] || {};
                    this.my_JSON[character] = this.my_JSON[character] || {};
                    this.my_JSON[character][words[i]] = directions[i];
                }
                available_intersects = this.share_Captial(); // updates if there can be available spots saving the words
                num_attempts++;

            }
            try {
                let start_point = this.get_Random(this.starting_points, 1); // decide one possible point among the available points
                this.organize_Words(start_point);
            } catch (RangeError) { //if this.starting_points is empty, means no available spots found
                // if return the error, increase the size
                this.update_Info(); // update also the cells and boundary info for future calculations
                this.second_option(); //recall the function with the increasing size
            }
            if (this.abandoned_words.length >= 1) {
                //means there are words left
                this.string_array = this.abandoned_words;
                this.update_Info();
                this.abandoned_words = [];
                this.second_option();
            }

        }
    }


    share_Captial () {
        let word_input = [];
        let direction_input = [];
        const entries = Object.entries(this.my_JSON); //keys and values
        const Rectangular = require('./rectangular.js');
        let rectangular = {};
        for (const [character, words] of entries) {
            word_input = Object.keys(words);
            direction_input = Object.values(words);
            if (word_input.length > 1) {
                for (let i = 0; i < word_input.length; i++) {
                    let values = this.find_Region(word_input[i], direction_input[i]);
                    rectangular[i] = new Rectangular(word_input[i], values[0], values[1]);
                }
                return (this.check_Intersection(rectangular)); //false: there is no available intersection point
            }
            else if (word_input.length == 1){
                let values = this.find_Region(word_input[0], direction_input[0]);
                rectangular[0] = new Rectangular(word_input[0], values[0], values[1]);
                this.starting_points = rectangular[0].included_point();
                return true;
            }
                
        }
    }

    check_Intersection (rectangular) {
        let inter_rects = [];

        //generating all possible combinations of 2 in the rectangular array
        let permutation = Object.keys(rectangular).reduce((acc, v, i) =>
            acc.concat(Object.keys(rectangular).slice(i + 1).map(w => v + ' ' + w)), []);
        for (let i = 0; i < permutation.length; i++) {
            let result = rectangular[permutation[i].charAt(0)]
                .check_overLap(rectangular[permutation[i].charAt(2)]);
            // console.log(result);
            if (result == false)
                return false;
            // console.log(rectangular[permutation[i].charAt(0)]);
            inter_rects.push(rectangular[permutation[i].charAt(0)].intersection(rectangular[permutation[i].charAt(2)]));
        }

        //find the the intersections point
        let final_intersect = inter_rects[0];
        // console.log(final_intersect);
        for (let i = 1; i < inter_rects.length; i++) {
            final_intersect = final_intersect.intersection(inter_rects[i]);
        }
        this.starting_points = final_intersect.included_point(); // save the points that are in the region
        return true; //true means overlapping each other; collision means at least two rectangulars are not overlapping
    }

    get_Random (arr, n) {
        let result = new Array(n), len = arr.length, taken = new Array(len);
        if (n > len)
            throw new RangeError("getRandom: more elements taken than available");
        while (n--) {
            let x = Math.floor(Math.random() * len);
            result[n] = arr[x in taken ? taken[x] : x];
            taken[x] = --len in taken ? taken[len] : len;
        }
        return result;
    }

    find_Region (word, direction) {
        const Victor = require('victor');
        let low_left = new Victor(0,0);
        let new_Low_left;
        let new_Top_right;
        if (direction == 'horizontal') {
            new_Top_right = this.boundary.clone().subtractScalarX(word.length - 1);
            new_Low_left = low_left;
        }
        else if (direction == 'horizontalBack') {
            new_Low_left = low_left.clone().addScalarX(word.length - 1);
            new_Top_right = this.boundary;
        }
        else if (direction == 'vertical') {
            new_Low_left = low_left.clone().addScalarY(word.length - 1);
            new_Top_right = this.boundary;
        }
        else if (direction == 'verticalUp') {
            new_Low_left = low_left;
            new_Top_right = this.boundary.clone().subtractScalarY(word.length-1);
        }
        else if (direction == 'diagonal') {
            new_Low_left = low_left.clone().addScalarY(word.length-1);
            new_Top_right = this.boundary.clone().subtractScalarX(word.length-1);
        }
        else if (direction == 'diagonalUp') {
            new_Low_left = low_left.clone().addScalarX(word.length-1);
            new_Top_right = this.boundary.clone().subtractScalarY(word.length-1);
        }
        else if (direction == 'diagonalBack') {
            new_Low_left = low_left.clone().addScalar(word.length - 1);
            new_Top_right = this.boundary;
        }
        else if (direction == 'diagonalBack_Up') {
            new_Low_left = low_left;
            new_Top_right = this.boundary.clone().subtractScalar(word.length-1);
        }
        return [new_Low_left, new_Top_right];
    }

    organize_Words (start_point) {
        // take out the word and direction
        // Place words to the corresponding positions
        for (let i=0; i<Object.keys(Object.values(this.my_JSON)[0]).length; i++) {
            let word = Object.keys(Object.values(this.my_JSON)[0])[i];
            let direction = Object.values(Object.values(this.my_JSON)[0])[i];
            let truth = this.places_Available(direction, word, start_point); // check if all needed spots are
            if (truth) //all spots are not occupied
                this.store_Chars(direction, word, start_point); //place the chars into spots
            else {
                // take out this word and see where can it be fit,
                this.abandoned_words.push(word);
                this.storing_abandoned_words();
                // this.get_EmptyPoints();
            }
        }
    }

    storing_abandoned_words () {
        //not finished yet
        // console.log ("The abandoned words are: ", this.abandoned_words);

    }

    third_option () {
        let words = this.string_array.reduce((acc, v, i) =>
            acc.concat(this.string_array.slice(i + 1).map(w => v + ' ' + w)), []);
        this.check_Substring(words);
        this.connect_strings(words);
        this.count_occurrences();
        this.second_option();
    }

    check_Substring (words) {
        // when one word is completely stored in another word, delete it
        let include;
        for (let i=0; i<words.length; i++) {
            let temp = this.sort_Descending(words[i].split(" ")); // temp[0] is the longer string; temp[1] is the shorter string
            include = (temp[0].indexOf(temp[1]) !== -1); // compare the substring
            if (include) {
                for (let i=0; i<this.string_array.length; i++) {
                    if (this.string_array[i] === temp[1])
                        this.string_array.splice(temp[1], 1);
                }
            }
        }
    }

    connect_strings (words) {
        // when two words can connect with each others; Four cases total
        for (let i = 0; i < words.length; i++) {
            let temp = this.sort_Ascending(words[i].split(" "));
            let common_words = temp[0].length;
            for (let j = 0; j < temp[0].length; j++) {
                if (temp[0].substring(j, temp[0].length) == temp[1].substring(0, common_words)) {
                    this.short_common_word(common_words, temp[0], temp[1]);
                    if (common_words >= 3)
                        break;
                } else {
                    common_words--;
                }
            }
            // reverse the order of two words and see if some common words
            common_words = temp[0].length;
            for (let j = 0; j < temp[0].length; j++) {
                if (temp[1].substring(j, temp[0].length) == temp[0].substring(0, common_words)) {
                    this.short_common_word(common_words, temp[1], temp[0]);
                    if (common_words >= 3)
                        break;
                } else {
                    common_words--;
                }
            }

            //try in backward order
            let back_word = temp[0].split("").reverse().join(""); //reverse the words
            common_words = temp[0].length;
            for (let j = 0; j < back_word.length; j++) {
                if (back_word.substring(j, back_word.length) == temp[1].substring(0, common_words)) {
                    this.short_common_word(common_words, back_word, temp[1]);
                    if (common_words >= 3)
                        break;
                } else {
                    common_words--;
                }
            }
            // reverse the order of two words and see if some common words
            common_words = temp[0].length;
            back_word = temp[1].split("").reverse().join("");
            for (let j = 0; j < temp[0].length; j++) {
                if (back_word.substring(j, temp[0].length) == temp[0].substring(0, common_words)) {
                    this.short_common_word(common_words, back_word, temp[0]);
                    if (common_words >= 3)
                        break;
                } else {
                    common_words--;
                }
            }
        }
    }

    short_common_word (num, first_word, second_word) {
        // if there are more than 2 common chars, combine them
        // console.log(num, first_word, second_word);
        if (num >= 3) {
            let new_string = first_word + second_word.substring(num, second_word.length); //combine the two strings
            for (let i = 0; i < this.string_array.length; i++) {
                if (this.string_array[i] === first_word) {
                    this.string_array.splice(i, 1); // find the "Substring" and remove it by index
                }
                if (this.string_array[i] === second_word) {
                    this.string_array.splice(i,1);
                }
            }
            this.string_array.push(new_string);
        }
    }

    count_occurrences () {
        let char, count;
        let counts = {};
        for (let i = 0; i < this.string_array.length; i++) {
            for (let j = 0; j < this.string_array[i].length; j++) {
                char = this.string_array[i].charAt(j);
                count = counts[char];
                counts[char] = count ? count + 1 : 1;
            }
        }
        let sorted_Counts = this.sort_occurrences(counts);
    }


    sort_occurrences (counts) {
        // sorting each char based on the frequency: most -> least
        let sortable = [];
        let sorted_counts = {};
        for (let char in counts) {
            sortable.push([char, counts[char]]);
        }
        sortable.sort(function (a,b) {
            return b[1] - a[1];
        });

        for (let i=0; i < sortable.length; i++)
            sorted_counts[sortable[i][0]] = sortable[i][1];

        return sorted_counts;
    }

    remove_empty_Rows_Cols () {

        console.log(this.cells);
        // rows
        this.cells = this.cells.filter(element => element.join("") != "");
        // columns

        let empty_COLS = [];
        let max_Col_Len = 0;
        let i, j;
        for (j = 0; j < this.size.col; j++) {
            let empty_col = true;
            for (i = 0; i < this.cells.length; i++) {
                if (this.cells[i][j] != undefined)
                    empty_col = false;
            }
            if (empty_col === true) {// this col is empty
                empty_COLS.push(j);
            }
        }
        // console.log(this.cells.length, empty_COLS);


        if (empty_COLS.length>0) {
            for (let m = 0; m < empty_COLS.length; m++) {
                for (let n = 0; n < this.cells.length; n++) {
                    this.cells[n].splice(empty_COLS[m], 1)
                    console.log(this.cells[n].length);
                    if (this.cells[n].length > max_Col_Len)
                        max_Col_Len = this.cells[n].length;
                }

            }
            this.size.col = max_Col_Len;
        }
        this.size.row = this.cells.length; // update the row and col size
        // console.log(this.cells);

    }

    finalize_Puzzle () {
        // fill empty spots with random letters
        const LETTERS = 'abcdefghijklmnopqrstuvwxyz';
        for (let i = 0; i < this.size.row; i++) {
            for (let j = 0; j < this.size.col; j++) {
                if (this.cells[i][j] == null)
                    this.cells[i][j] = LETTERS[Math.floor(Math.random() * LETTERS.length)];
            }
        }
    }

    answer() {
        // store the variable into html display
        let result = '';
        result += "<table><tr>";
        // console.log(this.size.row, this.size.col);
        for (let i = 0; i < this.size.row; i++) {
            for (let j = 0; j < this.size.col; j++) {
                if (this.cells[i][j] != undefined)
                    result += "<td bgcolor=\"#d2691e\">" + this.cells[i][j] + "</td>";
                else
                    result += "<td >" + " "+ "</td>";
            }
            result += "</tr><tr>";
        }
        result += "</tr><table>";
        return result;
    }


    display() {
        this.cells.forEach(function (row) {
            // console.log(row.join(' '));
        });
    }
}
