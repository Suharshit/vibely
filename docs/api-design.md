# API Design

## Base URL

- **Production**: `https://vibely.vercel.app/api`
- **Development**: `http://localhost:3000/api`

## Authentication

### Methods

1. **JWT Token** (Registered users)
```
   Authorization: Bearer <token>
```

2. **Guest Session Token** (Guest uploads)
```
   X-Guest-Token: <session_token>
```

## Endpoints

### Authentication

#### POST /api/auth/signup
Create new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "session": {
    "access_token": "jwt_token",
    "refresh_token": "refresh_token"
  }
}
```

#### POST /api/auth/login
Login existing user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

#### POST /api/auth/google
OAuth login with Google.

#### POST /api/auth/logout
Logout current user.

#### POST /api/auth/refresh
Refresh access token.

---

### Events

#### POST /api/events
Create new event.

**Auth Required**: Yes

**Request:**
```json
{
  "title": "Wedding Reception",
  "description": "John & Jane's wedding",
  "event_date": "2024-06-15T18:00:00Z",
  "expires_at": "2024-06-22T23:59:59Z",
  "upload_permission": "open"
}
```

**Response:**
```json
{
  "id": "uuid",
  "title": "Wedding Reception",
  "invite_token": "abc123xyz",
  "qr_code_url": "https://...",
  "created_at": "2024-05-01T10:00:00Z"
}
```

#### GET /api/events/:id
Get event details.

**Auth**: Optional (public with invite token)

#### PATCH /api/events/:id
Update event details.

**Auth Required**: Yes (host only)

#### DELETE /api/events/:id
Delete event.

**Auth Required**: Yes (host only)

#### GET /api/events/:id/gallery
Get all photos for event.

**Auth**: Optional

**Query Params:**
- `page`: number (default: 1)
- `limit`: number (default: 20)

#### POST /api/events/:id/join
Join event as member.

**Auth Required**: Yes

---

### Photos

#### POST /api/photos/upload
Upload photo to event.

**Auth**: User token OR guest token

**Request:**
```multipart/form-data
file: <image_file>
event_id: <uuid>
```

**Response:**
```json
{
  "id": "uuid",
  "url": "https://ik.imagekit.io/...",
  "thumbnail_url": "https://ik.imagekit.io/.../tr:w-300",
  "uploaded_at": "2024-05-01T10:00:00Z"
}
```

#### DELETE /api/photos/:id
Delete photo.

**Auth Required**: Yes (uploader or event host)

#### POST /api/photos/:id/save
Save photo to personal vault.

**Auth Required**: Yes

---

### Guest Sessions

#### POST /api/guest/session
Create guest upload session.

**Request:**
```json
{
  "event_id": "uuid",
  "display_name": "Guest User",
  "invite_token": "abc123xyz"
}
```

**Response:**
```json
{
  "session_token": "guest_token_xyz",
  "display_name": "Guest User",
  "expires_at": "2024-06-22T23:59:59Z"
}
```

---

## Error Responses

All errors follow this format:
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": {}
  }
}
```

### Error Codes

- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `429` - Too Many Requests
- `500` - Internal Server Error

## Rate Limits

- **Authenticated**: 100 requests/minute
- **Guest**: 50 requests/minute
- **Upload**: 10 uploads/minute

## File Upload Limits

- **Max file size**: 10MB
- **Supported formats**: JPEG, PNG, HEIC, WebP
- **Max dimensions**: 8000x8000px