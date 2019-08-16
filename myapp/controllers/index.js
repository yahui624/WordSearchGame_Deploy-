

exports.enter_input = function(req, res, next) {
  console.log("get request received");
  console.log(req.query);
  console.log(req);
  res.render('index', { title: 'Puzzle maker'});
};

exports.post_request = function (req,res) {
  console.log("post request received");
  res.render('index');
};

exports.direct_result  =function (req, res) {
  console.log("post request received 0000");
  //console.log(req.query);
  // computation, we want to hide from the user
  //parse the input string info
  parse_words = req.body.parse_words.toString().replace(/[^a-zA-Z ]/g, " ")
      .split(/(\s+)/).filter( function(e) { return e.trim().length > 0; }); // deal with special characters inside
  // console.log (parse_words);
  const Puzzle = require('./Puzzle.js'); // creating wordSearch class
  const puzzle = new Puzzle(req.body.Title, req.body.Row, req.body.Col, req.body.parse_Option,
      req.body.output_Type, parse_words);


  puzzle.puzzle_make();
  let answer = puzzle.answer();
  puzzle.finalize_Puzzle();
  // // store the variable into html display
  let result = '';
  result += "<table><tr>";
  // console.log(puzzle.size.row, puzzle.size.col);
  for (let i = 0; i < puzzle.size.row; i++) {
    for (let j = 0; j < puzzle.size.col; j++) {
        result += "<td >" + puzzle.cells[i][j] + "</td>";
    }
    result += "</tr><tr>";
  }
  result += "</tr><table>";

  puzzle.finalize_Puzzle();

  res.render('output', {title: puzzle.title, body: result, row: puzzle.size.row, col: puzzle.size.col, answer: answer});

};