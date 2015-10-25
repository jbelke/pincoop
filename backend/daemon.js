var ipfsAPI = require('ipfs-api')
var Options = require('./options')

var Daemon = function(multiaddr) {
	if(multiaddr === undefined) {
		throw new Error('You need to define a multiaddr!')
	}
	this.multiaddr = multiaddr
	this.id = "XXXXXXXXXXXXXXXX"
	this.ipfs = ipfsAPI(this.multiaddr)
	this.alive = false
	this.tries = 0
	this.pinned = [] // already pinned
	// while pinning
	this.to_pin = [] // to be pinned
}

Daemon.prototype = {
	pin_unpinned_hashes: function() {
		if(this.to_pin.length > 0) {
			this.to_pin.forEach((hash_to_pin) => {
				this.ipfs.pin.add(hash_to_pin, (err, res) => {
					if(err !== null) throw err
					if(err === null && res.Pinned) {
						var pinned_hash = res.Pinned[0]
						var index_of_hash = this.to_pin.indexOf(pinned_hash)
						this.to_pin.splice(index_of_hash, 1)
						this.pinned.push(pinned_hash)
					}
				})
			})
		}
	},
	is_alive: function(callback) {
		//TODO TIMEOUT HACK AHEAD!
		//waiting for https://github.com/ipfs/node-ipfs-api/issues/71
		//var interval = setTimeout(() => {
		//	this.alive = false
		//	this.tries++
		//	callback(this.alive)
		//}, Options.daemon_api_calls_timeout)
		this.ipfs.id(function(err, res) {
			if(err) {
				this.alive = false
				this.tries++
				callback(this.alive, this.id)
				return
			}
			if(res.ID !== undefined) {
				this.alive = true
				this.id = res.ID
				this.tries = 0
				callback(this.alive, this.id)
				return
			}
		})
	}
}

module.exports = Daemon
