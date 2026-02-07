# API Documentation

## Base URL

```
http://localhost:5000/api
```

## Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Endpoints

### Health Check

**GET** `/health`

Check if the API is running.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.45
}
```

### Users

#### Get All Users

**GET** `/api/users`

Get a list of all users.

**Response:**
```json
{
  "message": "Users endpoint",
  "users": []
}
```

#### Get User by ID

**GET** `/api/users/:id`

Get a specific user by ID.

**Parameters:**
- `id` (path) - User ID

**Response:**
```json
{
  "message": "Get user by ID",
  "id": "user-id-here"
}
```

#### Create User

**POST** `/api/users`

Create a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "message": "Create user",
  "body": { ... }
}
```

## Error Responses

All errors follow this format:

```json
{
  "message": "Error message here"
}
```

### Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error
