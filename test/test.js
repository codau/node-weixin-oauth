'use strict';
var assert = require('assert');

var nwc = require('node-weixin-config');
var util = require('node-weixin-util');

var nodeWeixinOauth = require('../');
var app = {
  id: 'wx0201661ce8fb3e11',
  secret: '483585a84eacd76693855485cb88dc8a',
  token: 'c9be82f386afdb214b0285e96cb9cb82'
};
var urls = {
  access: 'http://oauth.domain.com/weixin/access',
  redirect: 'http://oauth.domain.com/weixin/back',
  success: 'http://oauth.domain.com/weixin/success'
};

nwc.app.init(app);
nwc.urls.oauth.init(urls);

describe('node-weixin-oauth node module', function () {
  it('should be able to build oauth url', function () {
    var params = {
      a: 'a',
      b: 'b',
      c: 123,
      '中国': 'nodd'
    };
    var url = nodeWeixinOauth.buildUrl(params);
    var result = 'https://open.weixin.qq.com/connect/oauth2/authorize?a=a&b=b&c=123&%E4%B8%AD%E5%9B%BD=nodd#wechat_redirect';
    assert.equal(true, url === result);

  });

  it('should create oauth url ', function () {
    var url = nodeWeixinOauth.createURL(nwc.app.id, nwc.urls.oauth.redirect, 'init', 1, 1);
    var genUrl =
      'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx0201661ce8fb3e11&redirect_uri=http%3A%2F%2Foauth.domain.com%2Fweixin%2Fback&response_type=code&scope=snsapi_userinfo&state=init#wechat_redirect';
    assert(genUrl === url);
  });

  it('should be able to send a tokenize request', function (done) {

    var code = 'sosos';
    var params = {
      appid: app.id,
      secret: app.secret,
      grant_type: 'authorization_code',
      code: code
    };
    var accessToken = "hsosos";

    params['access_token'] = accessToken;
    var nock = require('nock');
    var url = 'https://api.weixin.qq.com';
    //var query = util.toParam(params) + '#wechat_redirect';
    nock(url)
      .post('/sns/oauth2/access_token')
      .query(params)
      .reply(200, params);
    nodeWeixinOauth.onAuthorized(app, accessToken, code, function (error, body) {
      assert.equal(true, !error);
      assert.equal(true, !!body);
      done();
    });
  });


  it('should be able to refresh', function (done) {
    var refreshToken = "hsosos";
    var nock = require('nock');
    var params = {
      appId: nwc.app.id,
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    };
    var url = 'https://api.weixin.qq.com';

    nock(url)
      .post('/sns/oauth2/refresh_token')
      .query(params)
      .reply(200, params);
    nodeWeixinOauth.refresh(nwc.app.id, refreshToken, function (error, body) {
      assert.equal(true, !error);
      assert.equal(true, !!body);
      done();
    });
  });

  it('should be able to request info', function (done) {
    var accessToken = "hsosos";
    var openId = 'aaaa';
    var nock = require('nock');
    var params = {
      access_token: accessToken,
      openid: openId,
      lang: 'zh_CN'
    };
    var url = 'https://api.weixin.qq.com';

    nock(url)
      .post('/sns/userinfo')
      .query(params)
      .reply(200, params);
    nodeWeixinOauth.profile(openId, accessToken, function (error, body) {
      assert.equal(true, !error);
      assert.equal(true, !!body);
      done();
    });
  });

  it('should be able to profile a user info', function (done) {
    var accessToken = 'aa';
    var openId = 'ssoos';
    var nock = require('nock');

    var params = {
      access_token: accessToken,
      openid: openId,
      lang: 'zh_CN'
    };
    var url = 'https://api.weixin.qq.com';

    nock(url)
      .post('/sns/userinfo')
      .query(params)
      .reply(200, params);
    nodeWeixinOauth.profile(openId, accessToken, function (error, body) {
      assert.equal(true, !error);
      assert.equal(true, !!body);
      done();
    });
  });

  it('should be able to validate a token', function (done) {
    var accessToken = 'aa';
    var openId = 'ssoos';
    var nock = require('nock');

    var params = {
      access_token: accessToken,
      openid: openId,
    };
    var url = 'https://api.weixin.qq.com';

    nock(url)
      .post('/sns/auth')
      .query(params)
      .reply(200, {
        errcode: 1
      });
    nodeWeixinOauth.validate(openId, accessToken, function (error, body) {
      assert.equal(true, !error);
      done();
    });
  });

  it('should fail to validate a token', function (done) {
    var accessToken = 'aa';
    var openId = 'ssoos';
    var nock = require('nock');

    var params = {
      access_token: accessToken,
      openid: openId,
    };
    var url = 'https://api.weixin.qq.com';

    nock(url)
      .post('/sns/auth')
      .query(params)
      .reply(200, {
        errcode: 0
      });
    nodeWeixinOauth.validate(openId, accessToken, function (error, body) {
      assert.equal(true, error);
      done();
    });
  });

});
