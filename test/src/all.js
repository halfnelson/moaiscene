var req = require.context('./', true, /\.(js|ts)$/);
req.keys().forEach(req);