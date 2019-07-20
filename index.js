const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const sgMail = require('@sendgrid/mail');
require('dotenv').config();
const discord = require('discord.js')
const client = new discord.Client();
const mongoose = require('mongoose')
const auth = require('./libs/auth.js')
const recharge = require('./libs/recharge.js')
const Key = require('./models/keys.js')
const mongoserver = process.env.MONGO_SERVER
const db = process.env.MONGO_DB

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const PORT = process.env.PORT || 3000;
// let server = {
//   serverID: '562032626450432002',
//   adminRoles: ['576467488343326731', '601007347250233344'],
//   memberRoles: [],
//   unverifiedRoles: '578826529677508628',
//   verifiedRole: '578826510325121024',
//   monitorChannel: '569592855581032478',
//   icon_url: 'https://cdn.discordapp.com/icons/531536073428434944/c55abcb219aa214286b8ae3c5ea88d97.png?size=128',
//   botName: "DC SUPPLY KEYBOT",
//   prefix: '.'
// }

let server = {
  serverID: '531536073428434944',
  adminRoles: ['573701616948084748', '573377365258797086'],
  memberRoles: [],
  unverifiedRoles: '578826529677508628',
  verifiedRole: '533677332242759690',
  monitorChannel: '601967900664004654',
  icon_url: 'https://cdn.discordapp.com/icons/531536073428434944/c55abcb219aa214286b8ae3c5ea88d97.png?size=128',
  botName: "DC SUPPLY KEYBOT",
  prefix: '.'
}

app.use(bodyParser.json());

// Automatically sends keys when an order is fulfilled
app.post('/shopify', async (req, res) => {
  try {
    let details = req.body
    //console.log(details.customer.email)
    let foundPurchased = await Key.findOne({
      purchasedBy: details.customer.email
    })
    let found = await Key.findOne({
      purchasedBy: null,
      registeredUserID: null,
      dateExpires: null
    })
    //console.log(details)
    if (!foundPurchased) {
      if (found) {
        found.purchasedBy = details.customer.email
        await found.save()
        const msg = {
          to: details.customer.email,
          from: 'dcsply@gmail.com',
          templateId: "d-92e2c5e09d2847ed8b11f5c7b32f72e4",

          dynamic_template_data: {
            subject: 'DCSPLY Key',
            auth_key: found.key
          },
        };
        sgMail.send(msg);

      } else {
        let s = await auth.createKeys(1, '~Woof~#1001 (System)')
        let found2 = await Key.findOne({
          key: s,
        })
        found2.purchasedBy = details.customer.email
        await found2.save()
        const msg = {
          to: details.customer.email,
          from: 'dcsply@gmail.com',
          templateId: "d-92e2c5e09d2847ed8b11f5c7b32f72e4",

          dynamic_template_data: {
            subject: 'DCSPLY Key',
            auth_key: key
          },
        };
        sgMail.send(msg);
      }
    }
    res.status(200)
    res.send("OK")
  } catch (err) {
    res.status(401)
  }
})

// app.post('/recharge/sub_created', async (req, res) => {
//   try {
//     let details = req.body
//     //console.log(details.customer.email)
//     let {
//       customer_id
//     } = details.subscription
//     let customer = await recharge.getCustomerByID(customer_id)
//     console.log(customer)
//     let email = customer.email
//     let found = await Key.findOne({
//       purchasedBy: null,
//       registeredUserID: null,
//       dateExpires: null
//     })
//     console.log(details)

//     if (found) {
//       found.purchasedBy = email
//       await found.save()
//       const msg = {
//         to: email,
//         from: 'dcsply@gmail.com',
//         templateId: "d-92e2c5e09d2847ed8b11f5c7b32f72e4",

//         dynamic_template_data: {
//           subject: 'DCSPLY Key',
//           auth_key: found.key
//         },
//       };
//       sgMail.send(msg);

//     } else {
//       let s = await auth.createKeys(1, '~Woof~#1001 (System)')
//       let found2 = await Key.findOne({
//         key: s,
//       })
//       found2.purchasedBy = email
//       await found2.save()
//       const msg = {
//         to: email,
//         from: 'dcsply@gmail.com',
//         templateId: "d-92e2c5e09d2847ed8b11f5c7b32f72e4",

//         dynamic_template_data: {
//           subject: 'DCSPLY Key',
//           auth_key: key
//         },
//       };
//       sgMail.send(msg);
//     }

//     res.status(200)
//     res.send("OK")
//   } catch (err) {
//     console.log(err)
//     res.status(401)
//     res.send("NOT OK")
//   }
// })

// If failed send a message to user and cancel subscription
app.post('/recharge/failed', async (req, res) => {
  try {
    let details = req.body
    console.log(details)
    let {
      email,
      error_type
    } = details.charge
    console.log(details)
    let found = await Key.findOne({
      purchasedBy: email
    })
    if (found) {
      found.dateExpires = +new Date() + 24 * 60 * 60 * 1000
      found.save()
      // Send discord message to user here
      let user = client.guilds.get(server.serverID).members.get(found.registeredUserID)
      if (user) {
        let emb = {
          color: 0xff0000,
          author: {
            name: server.botName,
            icon_url: server.icon_url
          },
          title: "Problem processing payment ❌",
          description: "There was a problem processing payment for your card. Please use another payment method or contact lackingg#1010 or ~Woof~#1001"
        }
        user.send({
          embed: emb
        })
      } else {
        let emb = {
          color: 0x00ff00,
          author: {
            name: server.botName,
            icon_url: server.icon_url
          },
          title: "No registered user ❗️",
          description: `There was a problem with a failed payment notification`,
          fields: [{
              name: "Email",
              value: email
            },
            {
              name: "Key",
              value: found.key
            },
            {
              name: "Customer Name",
              value: details.charge.shipping_address.first_name + ' ' + details.charge.shipping_address.last_name
            }
          ]
        }
        client.channels.get(server.monitorChannel).send({
          embed: emb
        })
      }
    } else {
      let emb = {
        color: 0x00ff00,
        author: {
          name: server.botName,
          icon_url: server.icon_url
        },
        title: "No registered key ❗️",
        description: `There is no key assigned for the following customer`,
        fields: [{
            name: "Email",
            value: email
          },
          {
            name: "Customer Name",
            value: `${details.charge.shipping_address.first_name} ${details.charge.shipping_address.last_name}`
          }
        ]
      }
      client.channels.get(server.monitorChannel).send({
        embed: emb
      })
    }
    res.status(200)
    res.send("OK")
  } catch (err) {
    console.log(err)
    res.status(400)
    res.send("NOT OK")
  }
})

// If failed send a message to user and cancel subscription
app.post('/recharge/failed_max', async (req, res) => {
  try {
    let details = req.body
    let {
      email,
      error_type
    } = details.charge

    console.log(details)
    let found = await Key.findOne({
      purchasedBy: email
    })
    if (found) {
      found.dateExpires = +new Date() + 2 * 60 * 60 * 1000
      found.save()
      // Send discord message to user here
      let user = client.guilds.get(server.serverID).members.get(found.registeredUserID)
      if (user) {
        let emb = {
          color: 0x00ff00,
          author: {
            name: server.botName,
            icon_url: server.icon_url
          },
          title: "Problem processing payment ❌",
          description: "There was a problem processing payment for your card. \nYour membership will end in 2 hours.\nPlease contact lackingg#1010 or ~Woof~#1001"
        }
        user.send({
          embed: emb
        })
      } else {
        let emb = {
          color: 0x00ff00,
          author: {
            name: server.botName,
            icon_url: server.icon_url
          },
          title: "No registered user ❗️",
          description: `There was a problem with a failed payment notification`,
          fields: [{
              name: "Email",
              value: email
            },
            {
              name: "Key",
              value: found.key
            },
            {
              name: "Customer Name",
              value: details.charge.shipping_address.first_name + ' ' + details.charge.shipping_address.last_name
            }
          ]
        }
        client.channels.get(server.monitorChannel).send({
          embed: emb
        })
      }
    } else {
      let emb = {
        color: 0x00ff00,
        author: {
          name: server.botName,
          icon_url: server.icon_url
        },
        title: "No registered key ❗️",
        description: `There is not key assigned for the following customer`,
        fields: [{
            name: "Email",
            value: email
          },
          {
            name: "Customer Name",
            value: `${details.charge.shipping_address.first_name} ${details.charge.shipping_address.last_name}`
          }
        ]
      }
      client.channels.get(server.monitorChannel).send({
        embed: emb
      })
    }
    res.status(200)
    res.send("OK")
  } catch (err) {
    res.status(400)
    res.send("NOT OK")
  }
})

// If charged extend membership 30 days
app.post('/recharge/paid', async (req, res) => {
  try {
    let details = req.body
    let email = details.charge.email
    let found = await Key.findOne({
      purchasedBy: email
    })
    if (found) {
      found.dateExpires = +new Date() + 30 * 25 * 60 * 60 * 1000
      found.save()
      // Send discord message to user here
      let user = client.guilds.get(server.serverID).members.get(found.registeredUserID)
      if (user) {
        let emb = {
          color: 0x00ff00,
          author: {
            name: server.botName,
            icon_url: server.icon_url
          },
          title: "Successfully charged card! ✔️",
          description: "Your membership has been renewed. Thank you for choosing DC Supply and we look forward to another successful month with you!"
        }
        user.send({
          embed: emb
        })
      } else {
        console.log("None found")
        let emb = {
          color: 0x00ff00,
          author: {
            name: server.botName,
            icon_url: server.icon_url
          },
          title: "No registered user ❗️",
          description: `There is no user registered for the following renewal`,
          fields: [{
              name: "Email",
              value: email
            },
            {
              name: "Customer Name",
              value: `${details.charge.shipping_address.first_name} ${details.charge.shipping_address.last_name}`
            },
            {
              name: "Key",
              value: found.key
            }
          ]
        }
        client.channels.get(server.monitorChannel).send({
          embed: emb
        })
      }
      console.log("FOUND")
      res.status(200)
      res.send("OK")
    }
    res.status(200)
    res.send("OK")
  } catch (err) {
    console.log(err)
    res.status(400)
    res.send("NOT OK")
  }
})


app.get('/', (req, res) => {
  res.send('Hello')
})

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`)
  mongoose.connect(`mongodb://${mongoserver}/${db}`, {
    useNewUrlParser: true
  })
})

// client.on('guildMemberAdd', member => {
//   member.addRole(server.unverifiedRoles);
// })

client.on('message', async message => {
  if (message.author.bot) return
  if (message.content[0] !== server.prefix) return
  //Grab our admin roles from db
  //Grab our servers from
  let admin = false;
  for (i in server.adminRoles) {
    if (client.guilds.get(server.serverID).members.get(message.author.id).roles.find(r => r.id === server.adminRoles[i])) {
      admin = true
    }
  }
  let args = message.content.split(' ');
  let cmd = args[0].slice(1, args[0].length);

  // ADMIN COMMANDS
  if (admin && message.channel.type == 'dm') {
    // CREATE KEY
    if (cmd == "createKey") {
      let numKeys = args[1]
      if (!isNaN(numKeys)) {
        if (numKeys == 1) {
          let key = await auth.genkey(message.author.tag);
          let emb = {
            color: 0x00ff00,
            author: {
              name: server.botName,
              icon_url: server.icon_url
            },
            title: "Key Created 🔑 ",
            fields: [{
              name: "Key",
              value: key.key
            }]
          }
          message.author.send({
            embed: emb
          })
        } else if (numKeys <= 100) {
          let keyObjs = await auth.createKeys(numKeys, message.author.tag);
          let keys = []
          for (let k in keyObjs) {
            keys.push(keyObjs[k].key)
          }
          let keystrings = []
          for (let i = 0, j = keys.length; i < j; i += 90) {
            let tmp = keys.slice(i, i + 90);
            keystrings.push(tmp.join('\n'))
          }
          message.author.send("Keys Created 🔑 ")
          for (let i in keystrings) {
            message.author.send(`\`\`\`${keystrings[i]}\`\`\``)
          }
        } else {
          let emb = {
            color: 0xff0000,
            title: "❌ Too Many Keys"
          }
          message.author.send({
            embed: emb
          })
        }
      } else {
        let emb = {
          color: 0xff0000,
          title: "❌ Invalid Number of Keys"
        }
        message.author.send({
          embed: emb
        })
      }
    }
    // GET KEY
    if (cmd == 'getKey') {
      let key = await auth.getKey(args[1])
      if (key) {
        let emb = {
          color: 0x800080,
          title: "KEY DETAILS",
          fields: [{
              name: "Key",
              value: key.key
            },
            {
              name: "Register User",
              value: key.registeredUser
            },
            {
              name: "Created By",
              value: key.createdBy
            },
            {
              name: "Date Created",
              value: new Date(key.dateCreated).toLocaleString()
            },
            {
              name: "Date Registered",
              value: key.dateRegistered == null ? "Not Registered" : new Date(key.dateRegistered).toLocaleString() + 'EST'
            },
            {
              name: "Date Expires",
              value: key.dateExpires == null ? "Not active" : new Date(key.dateExpires).toLocaleString() + 'EST'
            },
            {
              name: "Registered Email",
              value: key.purchasedBy == null ? "No registered email" : key.purchasedBy
            }
          ]
        }
        message.author.send({
          embed: emb
        })
      } else {
        let emb = {
          color: 0xff0000,
          author: {
            name: server.botName,
            icon_url: server.icon_url
          },
          title: "User or Key not found! ❌"
        }
        message.author.send({
          embed: emb
        })
      }
    }

    // REVOKE KEY
    if (cmd == 'revoke') {
      let key = await auth.getKey(args[1])
      console.log(args[1])
      if (key) {
        let e1 = {
          color: 0x800080,
          title: "Are you sure you want to revoke this key?"
        }
        let msg1 = await message.author.send({
          embed: e1
        })
        await msg1.react("✅");
        await msg1.react("❌");
        const filter = (reaction, user) => {
          return ['✅', '❌'].includes(reaction.emoji.name) && user.id == message.author.id;
        }
        msg1.awaitReactions(filter, {
          max: 1,
          time: 6000
        }).then(async collected => {
          const reaction = collected.first()

          if (reaction.emoji.name === '✅') {
            let emb = {
              color: 0x800080,
              title: "Key Revoked!",
              author: {
                name: server.botName,
                icon_url: server.icon_url
              },
              description: `Key for ${key.registeredUser} has been revoked`
            }
            auth.revokeKey(args[1])
            let user = client.guilds.get(server.serverID).members.get(args[1])
            if (user != undefined) {
              await user.removeRoles(user.roles)
              //await user.addRole(server.unverifiedRoles)
            }
            message.author.send({
              embed: emb
            })
          } else {
            let emb = {
              color: 0x800080,
              title: "Cancelled!",
              author: {
                name: server.botName,
                icon_url: server.icon_url
              },
              description: `Cancelled revoking key for ${key.registeredUser}`
            }
            message.author.send({
              embed: emb
            })
          }

        })

      } else {
        let emb = {
          color: 0xff0000,
          author: {
            name: server.botName,
            icon_url: server.icon_url
          },
          title: "User or Key not found! ❌"
        }
        message.author.send({
          embed: emb
        })
      }
    }
    if (cmd == 'listKeys') {
      let allKeys = await Key.find({});
      console.log(allKeys)
      if (allKeys) {
        let keyfields = []
        for (let i in allKeys) {
          //let dateRegistered = allKeys[i].dateRegistered == null ? 'Not registered' : new Date(allKeys[i].dateRegistered).toLocaleString()
          let dateExpires = allKeys[i].dateExpires == null ? 'Not Registered' : new Date(allKeys[i].dateExpires).toString()
          keyfields.push(`key: ${allKeys[i].key} | registeredUser: ${allKeys[i].registeredUser} | dateExpires: ${dateExpires}`)
        }
        let i, j, temparray, chunk = 20;
        for (i = 0, j = keyfields.length; i < j; i += chunk) {
          temparray = keyfields.slice(i, i + chunk);
          let msgstring = temparray.join('\n')
          message.author.send(`\`\`\`${msgstring}\`\`\``)
        }
      }
    }

    if (cmd == 'extendKey') {
      let taggeduser = client.guilds.get(server.serverID).members.get(args[1])
      if (taggeduser) {
        if (!isNaN(parseInt(args[2]))) {
          let s = await auth.extendKey(taggeduser.user.tag, args[1], args[2])
          if (s) {
            let emb = {
              color: 0x00ff00,
              author: {
                name: server.botName,
                icon_url: server.icon_url
              },
              title: `${taggeduser.user.tag}'s membership had been extend ${args[2]} days ✔️`
            }
            message.author.send({
              embed: emb
            })
          } else {
            let emb = {
              color: 0xff0000,
              author: {
                name: server.botName,
                icon_url: server.icon_url
              },
              title: "Problem extending membership. ❌",
              description: "User ID not found"
            }
            message.author.send({
              embed: emb
            })
          }
        } else {
          let emb = {
            color: 0xff0000,
            author: {
              name: server.botName,
              icon_url: server.icon_url
            },
            title: "Problem extending membership. ❌",
            description: "Please provide a valid number of days"
          }
          message.author.send({
            embed: emb
          })
        }

      } else {
        let emb = {
          color: 0xff0000,
          author: {
            name: server.botName,
            icon_url: server.icon_url
          },
          title: "User not found! ❌"
        }
        message.author.send({
          embed: emb
        })
      }

    }

    if (cmd == 'getEmail') {
      let key = await await Key.findOne({
        purchasedBy: args[1]
      });
      console.log(key)
      if (key) {
        let emb = {
          color: 0x800080,
          title: "KEY DETAILS",
          fields: [{
              name: "Key",
              value: key.key
            },
            {
              name: "Register User",
              value: key.registeredUser == null ? "Not Registered" : key.registeredUser
            },
            {
              name: "Created By",
              value: key.createdBy
            },
            {
              name: "Date Created",
              value: new Date(key.dateCreated).toLocaleString()
            },
            {
              name: "Date Registered",
              value: key.dateRegistered == null ? "Not Registered" : new Date(key.dateRegistered).toLocaleString() + 'EST'
            },
            {
              name: "Date Expires",
              value: key.dateExpires == null ? "Not active" : new Date(key.dateExpires).toLocaleString() + 'EST'
            },
            {
              name: "Registered Email",
              value: key.purchasedBy == null ? "No registered email" : key.purchasedBy
            }
          ]
        }
        message.author.send({
          embed: emb
        })
      } else {
        let emb = {
          color: 0xff0000,
          author: {
            name: server.botName,
            icon_url: server.icon_url
          },
          title: "Email not found! ❌"
        }
        message.author.send({
          embed: emb
        })
      }
    }
    // END OF ADMIN COMMANDS
  }
  // HELP MESSAGE
  if (cmd == "help") {
    let emb = {
      color: 0x9932CC,
      title: "Help",
      fields: [{
          name: "key",
          value: "Shows key info"
        },
        {
          name: "bind <key>",
          value: "Binds key to account"
        },
        {
          name: "help",
          value: "Shows this help screen"
        }
      ]
    }
    message.author.send({
      embed: emb
    })
    if (admin) {
      emb = {
        color: 0x9932CC,
        title: "Admin Commands",
        fields: [{
            name: "createKey <number>",
            value: "Creates 0 - 100 keys"
          },
          {
            name: "getKey <userID>",
            value: "Shows key info for specific user"
          },
          {
            name: "getEmail  <registeredEmail>",
            value: "Shows key info for specific email"
          },
          {
            name: "revokeKey  <userID>",
            value: "Revokes key for specific user"
          },
          {
            name: "extendKey  <userID> <days>",
            value: "Extends key for specific user"
          }
        ]
      }
      message.author.send({
        embed: emb
      })
    }

  }
  // GET OWN KEY
  if (cmd == "key" && message.channel.type == 'dm') {
    let key = await auth.getKey(message.author.id)
    if (key) {
      let emb = {
        color: 0x800080,
        author: {
          name: server.botName,
          icon_url: server.icon_url
        },
        title: "KEY DETAILS",
        fields: [{
            name: "Key",
            value: key.key
          },
          {
            name: "Register User",
            value: key.registeredUser
          },
          {
            name: "Date Registered",
            value: new Date(key.dateRegistered).toLocaleString() + 'EST'
          },
          {
            name: "Date Expires",
            value: new Date(key.dateExpires).toLocaleString() + 'EST'
          }
        ]
      }
      message.author.send({
        embed: emb
      })
    } else {
      let emb = {
        color: 0xff0000,
        author: {
          name: server.botName,
          icon_url: server.icon_url
        },
        title: "No key binded ❌"
      }
      message.author.send({
        embed: emb
      })
    }
  }

  // BIND KEY
  if (cmd == 'bind' && message.channel.type == 'dm') {
    let found = await auth.getKey(message.author.id)
    if (found) {
      let emb = {
        color: 0xff0000,
        author: {
          name: server.botName,
          icon_url: server.icon_url
        },
        title: "You already have a key binded ❌",
        description: "Use .key to check your key"
      }
      message.author.send({
        embed: emb
      })
    } else {
      let foundKey = await Key.findOne({
        key: args[1]
      })
      if (foundKey.purchasedBy == null) {
        if (args[2].includes('@')) {
          let activated = await auth.activateKey(message.author.tag, message.author.id, args[1])
          if (activated) {
            let emb = {
              color: 0x00ff00,
              author: {
                name: server.botName,
                icon_url: server.icon_url
              },
              title: "Key Binded ✔️",
              description: "Key successfully binded to account"
            }
            let user = client.guilds.get(server.serverID).members.get(message.author.id)
            await user.addRole(server.verifiedRole)
            //await user.removeRole(server.unverifiedRoles)
            message.author.send({
              embed: emb
            })
          } else {
            let emb = {
              color: 0xff0000,
              author: {
                name: server.botName,
                icon_url: server.icon_url
              },
              title: "Invalid Key ❌",
              description: "Use .checkKey to check your key"
            }
            message.author.send({
              embed: emb
            })
          }
        } else {
          let emb = {
            color: 0xff0000,
            author: {
              name: server.botName,
              icon_url: server.icon_url
            },
            title: "Please provide email ❌",
            description: "Provide the email the purchase was made with.\n.bind <key> <email>"
          }
          message.author.send({
            embed: emb
          })
        }

      } else {
        let activated = await auth.activateKey(message.author.tag, message.author.id, args[1])
        if (activated) {
          let emb = {
            color: 0x00ff00,
            author: {
              name: server.botName,
              icon_url: server.icon_url
            },
            title: "Key Binded ✔️",
            description: "Key successfully binded to account"
          }
          let user = client.guilds.get(server.serverID).members.get(message.author.id)
          await user.addRole(server.verifiedRole)
          //await user.removeRole(server.unverifiedRoles)
          message.author.send({
            embed: emb
          })
        } else {
          let emb = {
            color: 0xff0000,
            author: {
              name: server.botName,
              icon_url: server.icon_url
            },
            title: "Invalid Key ❌",
            description: "Use .checkKey to check your key"
          }
          message.author.send({
            embed: emb
          })
        }
      }
    }
  }
})

async function monitorKeys() {
  try {
    let es = await auth.checkExpiringSoon()
    let s = await auth.checkExpired()
    console.log("Keys expired:")
    console.log(s)
    for (let i in s) {
      let user = client.users.get(s[i].registeredUserID)
      if (user != undefined) {
        user.send({
          embed: {
            color: 0xff0000,
            author: {
              name: server.botName,
              icon_url: server.icon_url
            },
            fields: [{
              name: "Key has expired!",
              value: "Please contact Woof#1001 or lackingg#1010 to renew"
            }]
          }
        })
      }
      await auth.revokeKey(s[i].registeredUserID)
      let toRemove = client.guilds.get(server.serverID).members.get(s[i].registeredUserID)
      if (toRemove != undefined) {
        await toRemove.removeRoles(toRemove.roles)
        //await toRemove.addRole(server.unverifiedRoles)
      }
    }
    console.log("Keys expiring soon:")
    console.log(es)
    for (let j in es) {
      let user = client.users.get(es[j].registeredUserID)
      if (user != undefined) {
        user.send({
          embed: {
            color: 0xff0000,
            author: {
              name: server.botName,
              icon_url: server.icon_url
            },
            fields: [{
              name: "Renewal soon!",
              value: "You will be charged for renewal within the next 24 hours"
            }]
          }
        })
      }
    }
    setTimeout(() => {
      monitorKeys()
    }, 24 * 60 * 60 * 1000) //24 * 60 * 60 * 1000)
  } catch (err) {
    console.log(err)
    setTimeout(() => {
      monitorKeys()
    }, 24 * 60 * 60 * 1000) //24 * 60 * 60 * 1000)
  }
}

let productionToken = "NTc4ODI5NTA1NTQ0ODQ3MzYx.XS54hA.0slxG09SthjUoFRqyy2BTFAMEz4";
client.login(process.env.BOT_TOKEN).then(() => {
  console.log("Logged in")
  monitorKeys()
})