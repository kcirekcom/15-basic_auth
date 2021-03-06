'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const mongoose = require('mongoose');
const Promise = require('bluebird');

const User = require('../model/user.js');
const Publisher = require('../model/publisher.js');

mongoose.Promise = Promise;

require('../server.js');

const url = `http://localhost:${process.env.PORT}`;

const testUser = {
  username: 'testuser',
  password: '55555',
  email: 'testuser@test.com'
};

const testPublisher = {
  name: 'test publisher',
  desc: 'test publisher description'
};

describe('Publisher Routes', function() {
  afterEach(done => {
    Promise.all([
      User.remove({}),
      Publisher.remove({})
    ])
    .then(() => done())
    .catch(done);
  });

  describe('POST: /api/publisher', () => {
    before(done => {
      new User(testUser)
      .generatePasswordHash(testUser.password)
      .then(user => user.save())
      .then(user => {
        this.tempUser = user;
        return user.generateToken();
      })
      .then(token => {
        this.tempToken = token;
        done();
      })
      .catch(done);
    });

    it('should return a publisher', done => {
      request.post(`${url}/api/publisher`)
      .send(testPublisher)
      .set({
        Authorization: `Bearer ${this.tempToken}`
      })
      .end((err, res) => {
        if (err) return done(err);
        let date = new Date(res.body.created).toString();
        expect(res.status).to.equal(200);
        expect(res.body.name).to.equal(testPublisher.name);
        expect(res.body.desc).to.equal(testPublisher.desc);
        expect(res.body.userID).to.equal(this.tempUser._id.toString());
        expect(date).to.not.equal('Invalid Date');
        done();
      });
    });

    it('should return a 400 error for an invalid body', done => {
      request.post(`${url}/api/publisher`)
      .send({name: 'invalid publisher'})
      .set({
        Authorization: `Bearer ${this.tempToken}`
      })
      .end(res => {
        expect(res.status).to.equal(400);
        expect(res.body).to.equal(undefined);
        done();
      });
    });

    it('should return a 401 error for unauthorized user', done => {
      request.post(`${url}/api/publisher`)
      .send(testPublisher)
      .set({
        Authorization: 'Bearer '
      })
      .end(res => {
        expect(res.status).to.equal(401);
        done();
      });
    });

    it('should return a 404 error for unregistered route', done => {
      request.post(`${url}/api/publish-unregistered`)
      .send(testPublisher)
      .set({
        Authorization: `Bearer ${this.tempToken}`
      })
      .end(res => {
        expect(res.status).to.equal(404);
        done();
      });
    });
  });

  describe('GET: /api/publisher/:id', () => {
    before(done => {
      new User(testUser)
      .generatePasswordHash(testUser.password)
      .then(user => user.save())
      .then(user => {
        this.tempUser = user;
        return user.generateToken();
      })
      .then(token => {
        this.tempToken = token;
        done();
      })
      .catch(done);
    });

    before(done => {
      testPublisher.userID = this.tempUser._id.toString();
      new Publisher(testPublisher).save()
      .then(publisher => {
        this.tempPublisher = publisher;
        done();
      })
      .catch(done);
    });

    after(() => {
      delete testPublisher.userID;
    });

    it('should return a publisher', done => {
      request.get(`${url}/api/publisher/${this.tempPublisher._id}`)
      .set({
        Authorization: `Bearer ${this.tempToken}`
      })
      .end((err, res) => {
        if (err) return done(err);
        let date = new Date(res.body.created).toString();
        expect(res.status).to.equal(200);
        expect(res.body.name).to.equal(testPublisher.name);
        expect(res.body.desc).to.equal(testPublisher.desc);
        expect(res.body.userID).to.equal(this.tempUser._id.toString());
        expect(date).to.not.equal('Invalid Date');
        done();
      });
    });

    it('should return a 401 error for unauthorized user', done => {
      request.get(`${url}/api/publisher/${this.tempPublisher._id}`)
      .set({})
      .end(res => {
        expect(res.status).to.equal(401);
        done();
      });
    });

    it('should return a 404 error for unregistered route', done => {
      request.get(`${url}/api/unregistered-route/${this.tempPublisher._id}`)
      .set({
        Authorization: `Bearer ${this.tempToken}`
      })
      .end(res => {
        expect(res.status).to.equal(404);
        done();
      });
    });
  });

  describe('PUT: /api/publisher/:id', () => {
    before(done => {
      new User(testUser)
      .generatePasswordHash(testUser.password)
      .then(user => user.save())
      .then(user => {
        this.tempUser = user;
        return user.generateToken();
      })
      .then(token => {
        this.tempToken = token;
        done();
      })
      .catch(done);
    });

    before(done => {
      testPublisher.userID = this.tempUser._id.toString();
      new Publisher(testPublisher).save()
      .then(publisher => {
        this.tempPublisher = publisher;
        done();
      })
      .catch(done);
    });

    after(() => {
      delete testPublisher.userID;
    });

    it('should return a new publisher', done => {
      request.put(`${url}/api/publisher/${this.tempPublisher._id}`)
      .set({
        Authorization: `Bearer ${this.tempToken}`
      })
      .send({
        name: 'new publisher name',
        desc: 'new publisher description'
      })
      .end((err, res) => {
        if (err) return done(err);
        let date = new Date(res.body.created).toString();
        expect(res.status).to.equal(200);
        expect(res.body.name).to.equal('new publisher name');
        expect(res.body.desc).to.equal('new publisher description');
        expect(date).to.not.equal('Invalid Date');
        done();
      });
    });

    it('should return a 401 error for unauthorized user', done => {
      request.put(`${url}/api/publisher/${this.tempPublisher._id}`)
      .set({
        Authorization: 'Bearer '
      })
      .send({
        name: 'new publisher name',
        desc: 'new publisher description'
      })
      .end(res => {
        expect(res.status).to.equal(401);
        done();
      });
    });

    it('should return a 400 error for an invalid body', done => {
      request.put(`${url}/api/publisher/${this.tempPublisher._id}`)
      .set({
        Authorization: `Bearer ${this.tempToken}`
      })
      .send({name: 'invalid publisher'})
      .end(res => {
        expect(res.status).to.equal(400);
        expect(res.body).to.equal(undefined);
        done();
      });
    });

    it('should return a 404 error for unregistered route', done => {
      request.put(`${url}/api/unregistered-route/${this.tempPublisher._id}`)
      .set({
        Authorization: `Bearer ${this.tempToken}`
      })
      .send({
        name: 'new publisher name',
        desc: 'new publisher description'
      })
      .end(res => {
        expect(res.status).to.equal(404);
        done();
      });
    });
  });
});
