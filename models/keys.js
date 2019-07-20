const mongoose = require('mongoose')

let keySchema = mongoose.Schema({
  key: String,
  createdBy: String,
  dateCreated: {type: Date, default: new Date()},
  dateExpires: {type: Date, default: null},
  dateRegistered: {type: Date, default: null},
  registeredUser: {type: String, default: null},
  registeredUserID: {type: String, default: null},
  purchasedBy: {type: String, default: null}
})
//new Date(+new Date() + 30*24*60*60*1000)
module.exports = mongoose.model('Key',keySchema)