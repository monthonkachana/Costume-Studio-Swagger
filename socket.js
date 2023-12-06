let io;

module.exports = {
    init: httpServer => {
        io = require ('socket.io')(httpServer, {
            cors: {
            origin: '*',
            methods: ['GET', 'POST', 'DELTE', 'PUT']
           }});
        return io;
    }
}