'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    const now = new Date();
    return queryInterface.bulkInsert('Users', [
      { name: 'taro',  email: 'taro@example.com', password: 'taro-password', createdAt: now, updatedAt: now},
      { name: 'jiro',  email: 'jiro@example.com', password: 'jiro-password', createdAt: now, updatedAt: now},
      { name: 'saburo',  email: 'saburo@example.com', password: 'saburo-password', createdAt: now, updatedAt: now},
      { name: 'siro',  email: 'shiro@example.com', password: 'shiro-password', createdAt: now, updatedAt: now},
      { name: 'goro',  email: 'goro@example.com', password: 'goro-password', createdAt: now, updatedAt: now},
    ], {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Users', null, {});
  }
};