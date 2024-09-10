const { ActivityType } = require('discord.js');
const axios = require('axios');
require('dotenv/config');

module.exports = (client) => {let info;
    axios.get(`https://top.gg/api/bots/${process.env.CLIENT_ID}/stats`, {
        headers: {
            'Authorization': 'Bearer ' + `${process.env.TOKEN_TOPGG}`
          }
    })
        .then((res) => {
            let info = res.data;
            client.user.setPresence({
              activities: [{ name: `3,107 Servers | #help`, type: ActivityType.Playing }],
              status: 'online',
            });
        })
        .catch(error => {
          client.user.setPresence({
            activities: [{ name: `#help`, type: ActivityType.Playing }],
            status: 'online',
          });
        });
    
};