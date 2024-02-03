const app = require("./App");
const dotenv = require("dotenv");

//configure the dotenv
dotenv.config({ path: "" });

const port = process.env.PORT || 3000; //port listening to calls

//listen on the server calls
app.listen(port, () => {
  console.log(`The server is listening on port: ${port}`);
});
