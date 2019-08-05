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

//listWebHooks()
//deleteWebHooks(60473)
//addWebHook('https://c2d02891.ngrok.io/recharge/failed','charge/failed')
//testWebHooks(60304)

module.exports = {
  'addWebHook': addWebHook,
  'listWebHooks': listWebHooks,
  'deleteWebHooks': deleteWebHooks,
  'testWebHooks': testWebHooks,
  'getCustomerByID': getCustomerByID,
  'listCustomers': listCustomers
}