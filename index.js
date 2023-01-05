const dotenv = require('dotenv');
dotenv.config();
const axios = require('axios');

async function is_active_peer(peer_rpc) {
    return new Promise((resolve, reject) => {
        let body = {
            "id": 1,
            "jsonrpc": "2.0",
            "method": "info_get_status",
            "params": [],
        }

        axios.post(peer_rpc, body, { timeout: 5000 })
            .then(function (response) {
                try {
                    resolve(response.data);
                } catch (err) {
                    reject(err);
                }
            })
            .catch(function (error) {
                reject(error)
            });

    })
}

async function get_peers(rpc) {
    return new Promise((resolve, reject) => {
        let body = {
            "id": 1,
            "jsonrpc": "2.0",
            "method": "info_get_peers",
            "params": [],
        }

        axios.post(rpc, body)
            .then(function (response) {
                try {
                    resolve(response.data);
                } catch (err) {
                    reject(err);
                }
            })
            .catch(function (error) {
                reject(error)
            });

    })
}

async function get_api_location(api) {
    return new Promise((resolve, reject) => {
        let request = `http://ip-api.com/json/${api}`;

        axios.get(request)
            .then(function (response) {
                try {
                    resolve(response.data.country);
                } catch (err) {
                    reject(err);
                }
            })
            .catch(function (error) {
                reject(error)
            });
    })
}

async function get_active_peers(rpc) {
    let peers = (await get_peers(rpc)).result.peers;
    let active_peers = [];
    for (let i = 0; i < peers.length; i++) {
        let peer_address = peers[i].address;

        let peer_api = peer_address.replace(":35000", "")
        let peer_rpc = "http://" + peer_address.replace("35000", "7777/rpc");

        try {
            let peer = await is_active_peer(peer_rpc);
            let location = await get_api_location(peer_api);

            console.log(`Peer ${peer_rpc} in ${location} GOOD!`);
            active_peers.push(peer);
        } catch (err) {
            console.log(`Peer ${peer_rpc} DEAD!`);
            console.log(`Err ${err.message}`);
        }
    }
    return active_peers;
}

get_active_peers(process.env.RPC_API).then(result => {
    console.log("result: ", result);
})