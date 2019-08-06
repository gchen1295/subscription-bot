const cryptoRandomString = require('crypto-random-string');
const mongoose = require('mongoose')
const Key = require('../models/keys')
const server = '127.0.0.1:27017'; // REPLACE WITH YOUR DB SERVER
const database = 'authbot'; // REPLACE WITH YOUR DB NAME

async function genkey(userTag) {
  try {
    let key = cryptoRandomString({
      length: 20,
      type: 'base64'
    });
    let found = await Key.findOne({
      key: key
    });
    while (found) {
      key = cryptoRandomString({
        length: 20,
        type: 'base64'
      });
      found = await Key.findOne({
        key: key
      });
    }
    let keyObj = {
      key: key,
      createdBy: userTag,
      dateCreated: new Date()
    }
    let newKey = new Key(keyObj);
    await newKey.save()
    return keyObj
  } catch (error) {
    console.log(error)
    throw error
  }
}

async function createKeys(numKeys, userTag) {
  let keys = []
  for (let i = 0; i < numKeys; ++i) {
    let s = await genkey(userTag);
    keys.push(s)
  }
  return keys;
}

async function getKey(userID) {
  let found
  if (userID != undefined) {
    found = await Key.findOne({
      registeredUserID: userID
    })
  }

  return found;
}

async function findUnregistered() {
  let found = await Key.find({
    dateRegistered: null
  });
  return found;
}

async function activateKey(userTag, userID, key) {
  try {
    let found = await Key.findOne({
      key: key
    });
    if (found && found.registeredUserID == null) {
      found.dateRegistered = new Date()
      found.dateExpires = +new Date() + 30 * 25 * 60 * 60 * 1000
      found.registeredUser = userTag
      found.registeredUserID = userID
      found.purchased = true
      await found.save();
      return true
    } else {
      console.log("Key registered")
      return false
    }
  } catch (err) {

  }
}

async function activateKeyEmail(userTag, userID, key, email) {
  try {
    let found = await Key.findOne({
      key: key
    });
    //console.log(email)
    if (found && found.registeredUserID == null) {
      found.dateRegistered = new Date()
      found.dateExpires = +new Date() + 30 * 25 * 60 * 60 * 1000
      found.registeredUser = userTag
      found.registeredUserID = userID
      found.purchasedBy = email
      await found.save();
      return true
    } else {
      console.log("Key registered")
      return false
    }
  } catch (err) {

  }
}

async function extendKey(userTag, userID, days) {
  try {
    //console.log({userTag, userID})
    let found = await Key.findOne({
      registeredUser: userTag,
      registeredUserID: userID
    });
    if (found) {
      found.dateExpires = +new Date(found.dateExpires) + days * 24 * 60 * 60 * 1000
      await found.save();
      return found
    } else {
      console.log("Key not found")
      return false
    }
  } catch (err) {
    console.log(err)
    return false
  }
}

async function checkExpired() {
  try {
    let time = new Date();
    let found = await Key.find({
      dateExpires: {
        $lt: time
      }
    });
    return found;
  } catch (err) {

  }
}

async function checkExpiringSoon() {
  try {
    let time24 = +new Date() + 24 * 60 * 60 * 1000;
    let time = new Date()
    let found = await Key.find({
      dateExpires: {
        $lt: time24,
        $gt: time
      }
    });
    return found;
  } catch (err) {

  }
}



async function revokeKey(userID) {
  try {
    let found
    if (userID != undefined) {
      found = await Key.findOne({
        registeredUserID: userID
      })
      await found.remove()
    }
    
  } catch (err) {
    console.log(err)
  }
}

async function deleteKey(key) {
  try {
    let found = await Key.findOne({
      key: key
    });
    await found.remove()
  } catch (err) {
    console.log(err)
  }
}

async function checkDate(userTag, userID) {
  try {
    console.log({userTag, userID})
    let found = await Key.findOne({
      registeredUser: userTag,
      registeredUserID: userID
    });
    if (found) {
      let ex = +new Date(found.dateExpires)  + 30 * 24 * 60 * 60 * 1000
      ex = new Date(ex).toLocaleDateString()
      ex = ex.split("/")
      ex = ex[2] + '-' + ex[0] + '-' + ex[1]
      return ex
    } else {
      console.log("Key not found")
      return false
    }
  } catch (err) {
    console.log(err)
    return false
  }
}

async function test() {
  try {
    mongoose.connect(`mongodb://${server}/${database}`, {
      useNewUrlParser: true
    })
    let expired = await checkDate("~Woof~#1001", "163541234793709568")
    console.log(expired)
    //await deleteKey(expired[0].key)
    mongoose.disconnect()
  } catch (err) {
    console.log(err)
    mongoose.disconnect()
  }
}

module.exports = {
  'genkey': genkey,
  'createKeys': createKeys,
  'findUnregistered': findUnregistered,
  'activateKey': activateKey,
  'checkExpired': checkExpired,
  'checkExpiringSoon': checkExpiringSoon,
  'deleteKey': deleteKey,
  'getKey': getKey,
  'revokeKey': revokeKey,
  'activateKeyEmail': activateKeyEmail,
  'extendKey': extendKey
}