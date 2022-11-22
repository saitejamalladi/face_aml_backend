const jwt = require('jsonwebtoken');
const config = require('../config');

class AuthService {
	async getTokenInfo (token) {
		return new Promise((resolve, reject) => {
			jwt.verify(token, config.jwt.secret, async (error, tokenInfo) => {
				if (error)
					resolve(false);
				else
					resolve(tokenInfo);
			});
		});
	};
}
module.exports = new AuthService();