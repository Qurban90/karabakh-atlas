/** OpenAPI 3.0 spec for Qarabağ Dirçəliş Xəritəsi API — served at /api/docs. */

const err = (description) => ({
  description,
  content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } }
});

const bearer = [{ bearerAuth: [] }];

const yearParam = {
  name: 'year',
  in: 'query',
  description: 'Timeline year (2023–2026); drives marker visibility and status',
  schema: { type: 'integer', minimum: 2023, maximum: 2026 }
};

export const openapiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Qarabağ Dirçəliş Xəritəsi API',
    version: '1.0.0',
    description:
      'REST API for the Karabakh Revival Map — interactive locations of Şuşa & Xankəndi (2023–2026), reviews & ratings, community feed, revival analytics and the “Qarabağ Pasportu” check-in tracker.\n\n**Demo accounts:** `admin@qdx.az / Admin123!` (admin), `aysel@demo.az / Demo123!` (user). Login, copy the token, press **Authorize**.'
  },
  servers: [{ url: '/api' }],
  tags: [
    { name: 'Auth', description: 'Registration, login, current profile (JWT)' },
    { name: 'Locations', description: 'Map locations with per-year status; admin CRUD' },
    { name: 'Reviews', description: '5-star ratings and written reviews' },
    { name: 'Posts', description: 'Community feed: posts, likes, comments' },
    { name: 'Timeline', description: 'Milestone events 2023–2026' },
    { name: 'Analytics', description: '“Dirçəliş İndeksi” revival dashboard' },
    { name: 'Passport', description: 'Check-ins, visited progress, badges' }
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'object',
            properties: {
              code: { type: 'string', example: 'BAD_REQUEST' },
              message: { type: 'string', example: 'Doğrulama xətası' },
              details: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: { field: { type: 'string' }, message: { type: 'string' } }
                }
              }
            }
          }
        }
      },
      PublicUser: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string', example: 'Aysel Məmmədova' },
          role: { type: 'string', enum: ['user', 'moderator', 'admin'] },
          joinedAt: { type: 'string', format: 'date-time' },
          avatarHue: { type: 'integer', example: 32 }
        }
      },
      AuthResponse: {
        type: 'object',
        properties: {
          token: { type: 'string', description: 'JWT — send as `Authorization: Bearer <token>`' },
          user: { $ref: '#/components/schemas/PublicUser' }
        }
      },
      LocationStatus: {
        type: 'object',
        nullable: true,
        properties: {
          year: { type: 'integer', example: 2024 },
          status: {
            type: 'string',
            enum: ['damaged', 'restoring', 'construction', 'restored', 'active', 'planned']
          },
          note: { type: 'string' }
        }
      },
      Location: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'yuxari-govhar-aga' },
          name: { type: 'string', example: 'Yuxarı Gövhər Ağa məscidi' },
          city: { type: 'string', enum: ['shusha', 'khankendi'] },
          category: {
            type: 'string',
            enum: ['heritage', 'infrastructure', 'energy_roads', 'culture_tourism', 'education', 'smart_village']
          },
          lat: { type: 'number', example: 39.76095 },
          lng: { type: 'number', example: 46.74905 },
          shortDescription: { type: 'string' },
          builtInfo: { type: 'string' },
          visibleFrom: { type: 'integer', example: 2023 },
          tags: { type: 'array', items: { type: 'string' } },
          status: { $ref: '#/components/schemas/LocationStatus' },
          rating: {
            type: 'object',
            properties: { average: { type: 'number', example: 4.8 }, count: { type: 'integer' } }
          },
          checkinCount: { type: 'integer' }
        }
      },
      LocationFull: {
        allOf: [
          { $ref: '#/components/schemas/Location' },
          {
            type: 'object',
            properties: {
              history: { type: 'string' },
              timeline: {
                type: 'object',
                additionalProperties: {
                  type: 'object',
                  properties: { status: { type: 'string' }, note: { type: 'string' } }
                }
              },
              audioGuide: {
                type: 'object',
                properties: {
                  durationSec: { type: 'integer' },
                  lines: { type: 'array', items: { type: 'string' } }
                }
              }
            }
          }
        ]
      },
      Review: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          locationId: { type: 'string' },
          rating: { type: 'integer', minimum: 1, maximum: 5 },
          text: { type: 'string' },
          visitYear: { type: 'integer' },
          createdAt: { type: 'string', format: 'date-time' },
          user: { $ref: '#/components/schemas/PublicUser' }
        }
      },
      Post: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          text: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          user: { $ref: '#/components/schemas/PublicUser' },
          location: {
            type: 'object',
            nullable: true,
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              city: { type: 'string' },
              category: { type: 'string' }
            }
          },
          likeCount: { type: 'integer' },
          likedByMe: { type: 'boolean' },
          comments: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                text: { type: 'string' },
                createdAt: { type: 'string', format: 'date-time' },
                user: { $ref: '#/components/schemas/PublicUser' }
              }
            }
          }
        }
      },
      TimelineEvent: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          year: { type: 'integer' },
          month: { type: 'integer' },
          city: { type: 'string', enum: ['shusha', 'khankendi', 'region'] },
          category: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' }
        }
      },
      Badge: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'susa-tedqiqatcisi' },
          name: { type: 'string', example: 'Şuşa Tədqiqatçısı' },
          description: { type: 'string' },
          icon: { type: 'string' },
          earned: { type: 'boolean' },
          progress: {
            type: 'object',
            properties: { current: { type: 'integer' }, target: { type: 'integer' } }
          }
        }
      }
    }
  },
  paths: {
    '/health': {
      get: {
        tags: ['Analytics'],
        summary: 'Service health probe',
        description: '`db` reports the active persistence backend: `postgres` when DATABASE_URL is set and reachable, `json` when running on the local-file fallback.',
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'ok' },
                    env: { type: 'string', example: 'production' },
                    db: { type: 'string', enum: ['postgres', 'json'], example: 'postgres' },
                    time: { type: 'string', format: 'date-time' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string', example: 'Qurban Hüseynzadə' },
                  email: { type: 'string', example: 'qurban@example.az' },
                  password: { type: 'string', example: 'Sifre123!', description: 'Min 8 chars, at least one digit' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Created', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
          400: err('Validation error'),
          409: err('E-mail already registered')
        }
      }
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login and receive a JWT',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'aysel@demo.az' },
                  password: { type: 'string', example: 'Demo123!' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
          401: err('Wrong credentials')
        }
      }
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Current user profile',
        security: bearer,
        responses: { 200: { description: 'OK' }, 401: err('Unauthorized') }
      }
    },
    '/locations': {
      get: {
        tags: ['Locations'],
        summary: 'List locations (filter by year / category / city / text)',
        parameters: [
          yearParam,
          { name: 'category', in: 'query', schema: { type: 'string', enum: ['heritage', 'infrastructure', 'energy_roads', 'culture_tourism', 'education', 'smart_village'] } },
          { name: 'city', in: 'query', schema: { type: 'string', enum: ['shusha', 'khankendi'] } },
          { name: 'q', in: 'query', description: 'Free-text search', schema: { type: 'string' } }
        ],
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    year: { type: 'integer' },
                    count: { type: 'integer' },
                    items: { type: 'array', items: { $ref: '#/components/schemas/Location' } }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Locations'],
        summary: 'Create location (admin)',
        security: bearer,
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/LocationFull' } } } },
        responses: { 201: { description: 'Created' }, 401: err('Unauthorized'), 403: err('Admin only') }
      }
    },
    '/locations/meta': {
      get: {
        tags: ['Locations'],
        summary: 'Enumerations (years, categories, cities)',
        responses: { 200: { description: 'OK' } }
      }
    },
    '/locations/{id}': {
      get: {
        tags: ['Locations'],
        summary: 'Location detail (history, timeline, audio guide)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }, yearParam],
        responses: {
          200: { description: 'OK', content: { 'application/json': { schema: { type: 'object', properties: { item: { $ref: '#/components/schemas/LocationFull' } } } } } },
          404: err('Not found')
        }
      },
      put: {
        tags: ['Locations'],
        summary: 'Update location (admin)',
        security: bearer,
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'OK' }, 403: err('Admin only'), 404: err('Not found') }
      },
      delete: {
        tags: ['Locations'],
        summary: 'Delete location (admin)',
        security: bearer,
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 204: { description: 'Deleted' }, 403: err('Admin only'), 404: err('Not found') }
      }
    },
    '/locations/{locationId}/reviews': {
      get: {
        tags: ['Reviews'],
        summary: 'Reviews + rating distribution for a location',
        parameters: [{ name: 'locationId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'OK' }, 404: err('Location not found') }
      },
      post: {
        tags: ['Reviews'],
        summary: 'Submit a review (authenticated)',
        security: bearer,
        parameters: [{ name: 'locationId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['rating', 'text'],
                properties: {
                  rating: { type: 'integer', minimum: 1, maximum: 5 },
                  text: { type: 'string', minLength: 10, maxLength: 600 },
                  visitYear: { type: 'integer', minimum: 2023, maximum: 2026 }
                }
              }
            }
          }
        },
        responses: { 201: { description: 'Created', content: { 'application/json': { schema: { type: 'object', properties: { item: { $ref: '#/components/schemas/Review' } } } } } }, 400: err('Validation error'), 401: err('Unauthorized') }
      }
    },
    '/reviews/{id}': {
      delete: {
        tags: ['Reviews'],
        summary: 'Delete review (owner or admin/moderator)',
        security: bearer,
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 204: { description: 'Deleted' }, 403: err('Forbidden'), 404: err('Not found') }
      }
    },
    '/posts': {
      get: {
        tags: ['Posts'],
        summary: 'Community feed (paginated)',
        parameters: [
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10, maximum: 50 } },
          { name: 'offset', in: 'query', schema: { type: 'integer', default: 0 } }
        ],
        responses: { 200: { description: 'OK', content: { 'application/json': { schema: { type: 'object', properties: { total: { type: 'integer' }, hasMore: { type: 'boolean' }, items: { type: 'array', items: { $ref: '#/components/schemas/Post' } } } } } } } }
      },
      post: {
        tags: ['Posts'],
        summary: 'Create a post (authenticated)',
        security: bearer,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['text'],
                properties: {
                  text: { type: 'string', minLength: 5, maxLength: 600 },
                  locationId: { type: 'string', description: 'Optional location tag' }
                }
              }
            }
          }
        },
        responses: { 201: { description: 'Created' }, 401: err('Unauthorized') }
      }
    },
    '/posts/{id}/like': {
      post: {
        tags: ['Posts'],
        summary: 'Toggle like (authenticated)',
        security: bearer,
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'OK' }, 404: err('Not found') }
      }
    },
    '/posts/{id}/comments': {
      post: {
        tags: ['Posts'],
        summary: 'Add a comment (authenticated)',
        security: bearer,
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', required: ['text'], properties: { text: { type: 'string', minLength: 2, maxLength: 300 } } } } }
        },
        responses: { 201: { description: 'Created' }, 404: err('Not found') }
      }
    },
    '/posts/{id}': {
      delete: {
        tags: ['Posts'],
        summary: 'Delete post (owner or admin/moderator)',
        security: bearer,
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 204: { description: 'Deleted' }, 403: err('Forbidden') }
      }
    },
    '/timeline': {
      get: {
        tags: ['Timeline'],
        summary: 'Milestone events (filter by year / city)',
        parameters: [
          yearParam,
          { name: 'city', in: 'query', schema: { type: 'string', enum: ['shusha', 'khankendi', 'region'] } }
        ],
        responses: { 200: { description: 'OK', content: { 'application/json': { schema: { type: 'object', properties: { items: { type: 'array', items: { $ref: '#/components/schemas/TimelineEvent' } } } } } } } }
      }
    },
    '/analytics/revival-index': {
      get: {
        tags: ['Analytics'],
        summary: '“Dirçəliş İndeksi” dashboard data',
        description: 'Cumulative indicators per year (roads km, green MW, monuments, residents), live per-status marker counts and community totals.',
        responses: { 200: { description: 'OK' } }
      }
    },
    '/checkins': {
      post: {
        tags: ['Passport'],
        summary: 'Check in at a location (GPS validated ≤5 km, or manual)',
        security: bearer,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['locationId'],
                properties: {
                  locationId: { type: 'string' },
                  method: { type: 'string', enum: ['gps', 'manual'], default: 'manual' },
                  lat: { type: 'number' },
                  lng: { type: 'number' }
                }
              }
            }
          }
        },
        responses: { 201: { description: 'Created' }, 400: err('Too far for GPS check-in'), 409: err('Already checked in') }
      }
    },
    '/users/me/passport': {
      get: {
        tags: ['Passport'],
        summary: '“Qarabağ Pasportu” — visited places, % progress, badges',
        security: bearer,
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    totalLocations: { type: 'integer' },
                    visitedCount: { type: 'integer' },
                    percent: { type: 'integer', example: 21 },
                    badges: { type: 'array', items: { $ref: '#/components/schemas/Badge' } }
                  }
                }
              }
            }
          },
          401: err('Unauthorized')
        }
      }
    }
  }
};
