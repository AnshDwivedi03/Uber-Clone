module.exports = {
  // Provide test user credentials
  beforeScenario: (context, events, done) => {
    context.vars.email = "test@example.com";
    context.vars.password = "123456";
    return done();
  }
};
