const jwt = require('jsonwebtoken');

module.exports = {
    authorized: (req, res, next) => {
        
        const bearerHeader = req.headers['authorization'];

        if (typeof bearerHeader !== 'undefined') {
            const bearer = bearerHeader.split(' ');
            const bearerToken = bearer[1];
            req.token = bearerToken;

            jwt.verify(req.token, '20061995', (err, authData) => {
                
                if (err) {
                    res.status(403).send('Authentication needed');
                } else {
                    req.body = { ...req.body, ...authData };
                    next();
                }
            });

            
        } else {
            res.status(403).send('Authentication needed');
        }
    }
}