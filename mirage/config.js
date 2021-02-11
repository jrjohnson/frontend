import moment from 'moment';
import Mirage from 'ember-cli-mirage';
import ENV from 'ilios/config/environment';

const { apiVersion } = ENV;

import setupMirage from './setup';

export default function () {
  this.timing = 100;
  this.namespace = '/';
  this.passthrough('/write-coverage');
  setupMirage(this);

  this.post('auth/login', function (schema, request) {
    const errors = [];
    var attrs = JSON.parse(request.requestBody);
    if (!('username' in attrs) || !attrs.username) {
      errors.push('missingUsername');
    }
    if (!('password' in attrs) || !attrs.password) {
      errors.push('missingPassword');
    }
    const username = attrs.username.toLowerCase();
    if (errors.length === 0) {
      if (username === 'demo' && attrs.password === 'demo') {
        const now = moment();
        const nextWeek = now.clone().add(1, 'week');
        const header = '{"alg":"none"}';
        const body = `{"iss": "ilios","aud": "ilios","iat": "${now.format(
          'X'
        )}","exp": "${nextWeek.format('X')}","user_id": 4136}`;

        const encodedData = window.btoa(header) + '.' + window.btoa(body) + '.';
        return {
          jwt: encodedData,
        };
      } else {
        errors.push('badCredentials');
      }
    }
    return new Mirage.Response(400, {}, { errors: errors });
  });

  this.get('auth/logout', function () {
    return new Mirage.Response(200);
  });

  this.get('auth/whoami', function () {
    return {
      userId: 4136,
    };
  });

  this.get('application/config', function () {
    return {
      config: {
        type: 'form',
        apiVersion,
      },
    };
    // return { config: {
    //   type: 'shibboleth',
    //   shibbolethLoginUrl: '/fakeshiblogin'
    // }};
  });

  this.get('auth/token', function () {
    //un comment to send unauthenticated user data
    // return {
    //   jwt: null
    // };
    const now = moment();
    const nextWeek = now.clone().add(1, 'week');
    const header = '{"alg":"none"}';
    const body = `{"iss": "ilios","aud": "ilios","iat": "${now.format(
      'X'
    )}","exp": "${nextWeek.format('X')}","user_id": 4136}`;

    const encodedData = window.btoa(header) + '.' + window.btoa(body) + '.';
    return {
      jwt: encodedData,
    };
  });

  this.post('errors', function () {
    //doesn't do anything, just swallows errors
  });
}
