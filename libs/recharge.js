const axios = require('axios')
const crypto = require('crypto')
const utf8 = require('utf8');
var sha256 = require('js-sha256')
require('dotenv').config()


async function addWebHook(webhookUrl, topic) {
  try {
    let headers = {
      "X-Recharge-Access-Token": process.env.RECHARGE_TOKEN,
      "Accept": "application/json",
      "Content-Type": "application/json"
    }
    let url = "https://api.rechargeapps.com/webhooks"
    let data = {
      "address": webhookUrl,
      "topic": topic
    }

    let s = await axios({
      method: 'post',
      headers: headers,
      url: url,
      data: data
    })
    console.log(s.data)
  } catch (err) {
    console.log(err.message)
    console.log(err.response.data)
  }
}

async function listWebHooks() {
  try {
    let headers = {
      "X-Recharge-Access-Token": process.env.RECHARGE_TOKEN
    }
    let url = "https://api.rechargeapps.com/webhooks"
    let data = {
      "address": 'https://67965eef.ngrok.io/recharge',
      "topic": "subscription/created"
    }

    let s = await axios({
      method: 'get',
      headers: headers,
      url: url
    })
    console.log(s.data)
  } catch (err) {
    console.log(err.message)
    console.log(err.response.data)
  }
}

async function testWebHooks(webHookID) {
  try {
    let headers = {
      "X-Recharge-Access-Token": process.env.RECHARGE_TOKEN,
      "Accept": "application/json",
      "Content-Type": "application/json"
    }
    let url = `https://api.rechargeapps.com/webhooks/${webHookID}/test`
    let data = {}

    let s = await axios({
      method: 'post',
      headers: headers,
      url: url,
      data: data
    })
    console.log(s.data)
  } catch (err) {
    console.log(err.message)
    console.log(err.response.data)
  }
}

async function deleteWebHooks(webHookID) {
  try {
    let headers = {
      "X-Recharge-Access-Token": process.env.RECHARGE_TOKEN,
      "Accept": "application/json",
      "Content-Type": "application/json"
    }
    let url = `https://api.rechargeapps.com/webhooks/${webHookID}`

    let s = await axios({
      method: 'delete',
      headers: headers,
      url: url
    })
    console.log(s.data)
  } catch (err) {
    console.log(err.message)
    console.log(err.response.data)
  }
}

async function getCustomerByID(customerID) {
  try {
    let headers = {
      "X-Recharge-Access-Token": process.env.RECHARGE_TOKEN,
      "Accept": "application/json",
      "Content-Type": "application/json"
    }
    let url = `https://api.rechargeapps.com/customers/${customerID}`

    let s = await axios({
      method: 'get',
      headers: headers,
      url: url
    })
    return s.data
  } catch (err) {
    console.log(err.message)
    console.log(err.response.data)
  }
}

async function listCustomers() {
  try {
    let headers = {
      "X-Recharge-Access-Token": process.env.RECHARGE_TOKEN
    }
    let url = `https://api.rechargeapps.com/customers/`

    let s = await axios({
      method: 'get',
      headers: headers,
      url: url
    })
    return s.data
  } catch (err) {
    console.log(err.message)
    console.log(err.response.data)
  }
}

async function getProducts()
{
  try {
    let headers = {
      "X-Recharge-Access-Token": process.env.RECHARGE_TOKEN,
      "Accept":"application/json",
      "Content-Type":"application/json"
    }
    let url = `https://api.rechargeapps.com/products`

    let s = await axios({
      method: 'get',
      headers: headers,
      url: url
    })
    return s.data
  } catch (err) {
    console.log(err.message)
    console.log(err.response.data)
  }
}

async function getCustomerByHash(userHash)
{
  try {
    let headers = {
      "X-Recharge-Access-Token": process.env.RECHARGE_TOKEN
    }
    let url = `https://api.rechargeapps.com/customers/`

    let s = await axios({
      method: 'get',
      headers: headers,
      url: url
    })
    let {customers} = s.data
    for(let i in customers)
    {
      if(customers[i].hash == userHash)
      {
        customer = customers[i]
      }
    }
    return customer
  } catch (err) {
    console.log(err.message)
    console.log(err.response.data)
  }
}

async function getCustomerByEmail(email)
{
  try {
    let headers = {
      "X-Recharge-Access-Token": process.env.RECHARGE_TOKEN
    }
    let url = `https://api.rechargeapps.com/customers/`

    let s = await axios({
      method: 'get',
      headers: headers,
      url: url
    })
    let {customers} = s.data
    for(let i in customers)
    {
      if(customers[i].email == email)
      {
        customer = customers[i]
      }
    }
    return customer
  } catch (err) {
    console.log(err.message)
    console.log(err.response.data)
  }
}

async function listSubscriptions()
{
  try {
    let headers = {
      "X-Recharge-Access-Token": process.env.RECHARGE_TOKEN,
      "Accept":"application/json",
      "Content-Type":"application/json" 
    }
    let url = `https://api.rechargeapps.com/subscriptions?customer_id=30918566`

    let s = await axios({
      method: 'get',
      headers: headers,
      url: url
    })
    console.log(s.data)
  } catch (err) {
    console.log(err.message)
    console.log(err.response.data)
  }
}

async function findSubscription(customerID)
{
  try {
    let headers = {
      "X-Recharge-Access-Token": process.env.RECHARGE_TOKEN,
      "Accept":"application/json",
      "Content-Type":"application/json" 
    }
    let url = `https://api.rechargeapps.com/subscriptions?customer_id=${customerID}`

    let s = await axios({
      method: 'get',
      headers: headers,
      url: url
    })
    return s.data
  } catch (err) {
    console.log(err.message)
    console.log(err.response.data)
  }
}


async function updateSubscription(subID, chargeDate)
{
  try {
    let headers = {
      "X-Recharge-Access-Token": process.env.RECHARGE_TOKEN,
      "Accept":"application/json",
      "Content-Type":"application/json" 
    }
    let url = `https://api.rechargeapps.com/subscriptions/${subID}/set_next_charge_date`
    let data = {
      "date": chargeDate
    }
    let s = await axios({
      method: 'post',
      headers: headers,
      url: url,
      data: data
    })
    return true
  } catch (err) {
    console.log(err.message)
    console.log(err.response.data)
  }
}

//listWebHooks()
//deleteWebHooks(62858)
//addWebHook('https://6ed9adcb.ngrok.io/recharge/paid','charge/paid')
//testWebHooks(60304)
//listSubscriptions()
//updateSubscription(46933611, `2019-08-18`)
// getCustomerByEmail('nicolas13brito@gmail.com').then(c=>{
//   findSubscription(c.id).then(d=>{
//     let subs = d.subscriptions
//     let activeSub
//     for(let i in subs)
//     {
//       if(subs[i].status == 'ACTIVE')
//       {
//         activeSub = subs[i]
//         break
//       }
//     }
//     if(activeSub != undefined)
//     {
//       console.log()
//       updateSubscription(activeSub.id, '2019-8-22')
//     }
//   })
// })

module.exports = {
  'addWebHook': addWebHook,
  'listWebHooks': listWebHooks,
  'deleteWebHooks': deleteWebHooks,
  'testWebHooks': testWebHooks,
  'getCustomerByID': getCustomerByID,
  'listCustomers': listCustomers,
  'getCustomerByEmail': getCustomerByEmail,
  'findSubscription': findSubscription,
  'updateSubscription': updateSubscription

}