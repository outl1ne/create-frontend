/**
 * This is the app config file. It's defined on the server so you can access process.env.
 * It will be exposed to the client-side as well. In React, AppDataContext can be
 * used to gain access to this configuration on both the client and server.
 */
module.exports = () => ({
  APP_NAME: 'New app',
});
