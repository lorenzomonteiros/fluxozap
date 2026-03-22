"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authResponseSchema = exports.refreshBodySchema = exports.loginBodySchema = exports.registerBodySchema = void 0;
exports.registerBodySchema = {
    type: 'object',
    required: ['name', 'email', 'password'],
    properties: {
        name: { type: 'string', minLength: 2, maxLength: 100 },
        email: { type: 'string', format: 'email' },
        password: { type: 'string', minLength: 8 },
    },
};
exports.loginBodySchema = {
    type: 'object',
    required: ['email', 'password'],
    properties: {
        email: { type: 'string', format: 'email' },
        password: { type: 'string', minLength: 1 },
    },
};
exports.refreshBodySchema = {
    type: 'object',
    required: ['refreshToken'],
    properties: {
        refreshToken: { type: 'string' },
    },
};
exports.authResponseSchema = {
    200: {
        type: 'object',
        properties: {
            user: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    email: { type: 'string' },
                    name: { type: 'string' },
                    avatarUrl: { type: 'string', nullable: true },
                    createdAt: { type: 'string' },
                },
            },
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' },
        },
    },
};
