module.exports = class Grid {
    constructor (row, col) {
        this.row = row;
        this.col = col;
        this.Horizontal = {};
        this.Vertical = {};
        this.Diagonal = {};
        this.Diagonal_Back = {};
        this.availability = {};
    }
    get_position (){
        return [this.row, this.col];
    }
    update_surrondings (cells){
        //Row size: cells[0].length, col size: cells.length
        // cells is passing by parameter, indicating the location of the words
        this.Horizontal = {"Horizontal": this.max_empty(cells, 'Horizontal'),
            "HorizontalBack": this.max_empty(cells, 'HorizontalBack')};
        this.Vertical = {"Vertical": this.max_empty(cells, 'Vertical'),
            "VerticalUp": this.max_empty(cells, 'VerticalUp')};
        this.Diagonal = {"Diagonal": this.max_empty(cells,'Diagonal'),
            "DiagonalUp": this.max_empty(cells, 'DiagonalUp')};
        this.Diagonal_Back = {"DiagonalBack": this.max_empty(cells, "DiagonalBack"),
            "DiagonalBack_Up": this.max_empty(cells, "DiagonalBack_Up")};

        //store to all variables to a JSON structure for returning result
        this.availability.Horizontal = this.Horizontal;
        this.availability.Vertical = this.Vertical;
        this.availability.Diagonal = this.Diagonal;
        this.availability.DiagonalBack = this.Diagonal_Back;

        return this.availability;
    }

    max_empty(cells, direction) {

        let num_Spots = 0;
        let i =1;
        // finding out the max length in each direction: need to pay attention to the limit
        if (direction == 'Horizontal') {
            while ( this.col + i <cells.length) {
                if (cells[this.row][this.col + i] != null)
                    return num_Spots; // return the max letters can be fitted in this direction including the current spot
                num_Spots ++;
                i++;
            }
        }
        else if (direction == 'HorizontalBack') {
            while (this.col - i >= 0) {
                if (cells[this.row][this.col - i] != null)
                    return num_Spots;
                num_Spots++;
                i++;
            }
        }
        else if (direction == 'Vertical') {
            while (this.row + i <cells[0].length) {
                if (cells[this.row + i][this.col] != null)
                    return num_Spots;
                num_Spots++;
                i++
            }
        }
        else if (direction == 'VerticalUp') {
            while (this.row - i >= 0) {
                if (cells[this.row - i][this.col] != null)
                    return num_Spots;
                num_Spots++;
                i++;
            }
        }
        else if (direction == 'Diagonal') {
            while (this.row + i < cells[0].length && this.col + i <cells.length) {
                if (cells[this.row + i][this.col + i] != null)
                    return num_Spots;
                i++;
                num_Spots++;
            }
        }
        else if (direction == 'DiagonalUp') {
            while (this.row - i >= 0 && this.col - i >= 0) {
                if (cells[this.row - i][this.col - i] != null)
                    return num_Spots;
                i++;
                num_Spots++;
            }
        }
        else if (direction == 'DiagonalBack') {
            while (this.row + i < cells[0].length && this.col - i >= 0) {
                if (cells[this.row + i][this.col - i] != null)
                    return num_Spots;
                i++;
                num_Spots++;
            }
        }
        else if (direction == 'DiagonalBack_Up') {
             while (this.row - i >= 0 && this.col + i <cells.length) {
                 if (cells[this.row - i][this.col + i] != null)
                     return num_Spots;
                 i++;
                 num_Spots++;
             }
        }
        return num_Spots;
    }
}