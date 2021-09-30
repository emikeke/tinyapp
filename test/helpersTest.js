const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const users = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", users)
    const expectedOutput = "userRandomID";
    // Write your assert statement here
    assert(user, expectedOutput);
  });

  it('should return undefined when we pass an email that is not in our database', function() {
    const user = getUserByEmail("user@example.com", users)
    const expectedOutput = "emily@lighthouse.com"
    assert(user, expectedOutput);
  });
});