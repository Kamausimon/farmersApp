const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
   sender:{
     type:mongoose.Schema.ObjectId,
     ref:"user",
     required:[true, 'a message must have the senders input']
   },
   receiver:{
    type:mongoose.Schema.ObjectId,
    ref:"User",
    required:[true. 'a message must have a receiver']
   },
   content:{
       type:String,
       required:true
   },
   timestamp:{
    type:Date,
    default:Date.now()
   }
});

const Message = mongoose.model("Message", messageSchema)

module.exports = Message;
