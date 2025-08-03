# Water Billing Management System - Backend API

Laravel-based REST API for the Water Billing Management System. This backend provides authentication, customer management, billing, and payment processing capabilities.

## Overview

This Laravel application serves as the backend API for a comprehensive water billing management system with role-based access control and real-time data processing.

### Key Features

- **Multi-role Authentication**: Admin, Operator, and Kasir (Cashier) with Laravel Sanctum
- **RESTful API**: Standardized API endpoints for all operations
- **Real-time Dashboard**: Live statistics and activity tracking
- **Customer Management**: Complete CRUD with bulk Excel import
- **Automated Billing**: Meter-based billing calculation
- **Payment Processing**: Multi-method payment handling
- **Data Validation**: Comprehensive input validation and error handling

## Technical Specifications

- **Laravel Version**: 12.x
- **PHP Version**: 8.2+
- **Database**: MySQL 8.0+
- **Authentication**: Laravel Sanctum
- **API Format**: JSON REST API

## Database Schema

### Core Models

#### User Model
```php
- id, name, email, role (admin|operator|kasir)
- email_verified_at, password, remember_token
- timestamps
```

#### Customer Model
```php
- id, nomor_langganan (unique), nama, alamat, telepon
- status (aktif|nonaktif), tarif_per_m3, meteran_terakhir
- tanggal_baca_terakhir, timestamps
```

#### Bill Model
```php
- id, customer_id, periode (YYYY-MM)
- meteran_awal, meteran_akhir, pemakaian
- tarif_per_m3, jumlah_tagihan
- status (belum_bayar|sudah_bayar)
- tanggal_jatuh_tempo, timestamps
```

#### Payment Model
```php
- id, bill_id, user_id, jumlah_bayar
- metode_pembayaran (tunai|transfer|kartu)
- keterangan, tanggal_bayar, timestamps
```

#### Tariff Model
```php
- id, golongan, daya_listrik, harga_per_m3
- timestamps
```

## API Endpoints

### Authentication Endpoints

```http
POST /api/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password"
}

Response: {
  "access_token": "token_string",
  "token_type": "Bearer",
  "message": "Login successful"
}
```

```http
POST /api/logout
Authorization: Bearer {token}

Response: {
  "message": "Successfully logged out"
}
```

### Admin Endpoints (`/api/admin/*`)

#### Dashboard
```http
GET /api/admin/dashboard/stats
Authorization: Bearer {token}

Response: {
  "totalCustomers": 150,
  "activeCustomers": 145,
  "totalBills": 1200,
  "unpaidBills": 25,
  "todayPayments": 15,
  "todayPaymentsAmount": 750000,
  "monthlyPaymentsAmount": 15000000
}
```

#### Customer Management
```http
GET /api/admin/customers
POST /api/admin/customers
PUT /api/admin/customers/{id}
DELETE /api/admin/customers/{id}
POST /api/admin/customers/import
```

#### Bill Management
```http
GET /api/admin/bills
POST /api/admin/bills
PUT /api/admin/bills/{id}
DELETE /api/admin/bills/{id}
POST /api/admin/bills/generate
```

### Kasir Endpoints (`/api/kasir/*`)

```http
POST /api/kasir/cek-tagihan
Content-Type: application/json

{
  "nomor_pelanggan": "PLG001"
}

Response: {
  "customer": {
    "id": 1,
    "name": "John Doe",
    "nomor_pelanggan": "PLG001"
  },
  "bill": {
    "id": 15,
    "periode": "2024-01",
    "jumlah_tagihan": 125000,
    "status": "belum_bayar"
  }
}
```

### Operator Endpoints (`/api/operator/*`)

```http
POST /api/operator/catat-meteran
Content-Type: application/json

{
  "nomor_pelanggan": "PLG001",
  "meteran_baru": 150
}

Response: {
  "message": "Meteran berhasil dicatat",
  "data": {
    "customer": "John Doe",
    "pemakaian": 25,
    "jumlah_tagihan": 125000
  }
}
```

## Controllers Architecture

### AuthController
- Handles login/logout functionality
- Token management with Sanctum
- User authentication and session management

### Admin Controllers

#### CustomerController
```php
- index(): Get all customers (no pagination)
- store(): Create new customer
- show(): Get single customer
- update(): Update customer data
- destroy(): Delete customer
- import(): Bulk import from Excel
```

#### BillController
```php
- index(): Get paginated bills with customer data
- store(): Create manual bill
- update(): Update bill information
- destroy(): Delete bill
- generateBills(): Auto-generate monthly bills
```

#### PaymentController
```php
- index(): Get paginated payments
- store(): Record new payment
- update(): Update payment details
- destroy(): Delete payment (reverts bill status)
- stats(): Payment statistics
- recent(): Recent payment activities
```

#### DashboardController
```php
- stats(): Dashboard statistics
- recentActivities(): Recent system activities
```

### KasirController
```php
- cekTagihan(): Check customer bill status
- bayar(): Process payment transaction
```

### OperatorController
```php
- catatMeteran(): Record meter readings
- getCustomerInfo(): Get customer information
```

## Data Validation Rules

### Customer Validation
```php
'nomor_langganan' => 'required|string|unique:customers',
'nama' => 'required|string|max:255',
'alamat' => 'required|string',
'telepon' => 'nullable|string',
'status' => 'required|in:aktif,nonaktif',
'tarif_per_m3' => 'required|numeric|min:0',
'meteran_terakhir' => 'required|integer|min:0'
```

### Bill Validation
```php
'customer_id' => 'required|exists:customers,id',
'periode' => 'required|string',
'meteran_awal' => 'required|integer|min:0',
'meteran_akhir' => 'required|integer|min:0',
'tarif_per_m3' => 'required|numeric|min:0',
'tanggal_jatuh_tempo' => 'required|date'
```

## Installation & Setup

1. **Install Dependencies**
   ```bash
   composer install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

3. **Database Configuration**
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=water_billing
   DB_USERNAME=root
   DB_PASSWORD=
   ```

4. **Run Migrations & Seeders**
   ```bash
   php artisan migrate:fresh --seed
   ```

5. **Start Development Server**
   ```bash
   php artisan serve
   ```

## Seeders & Demo Data

### UserSeeder
Creates default accounts for testing:
- admin@example.com (Admin)
- operator@example.com (Operator)
- kasir@example.com (Kasir)

### CustomerSeeder
Creates 20 sample customers with realistic Indonesian data:
- Complete customer information
- Various tariff rates
- Different meter readings

### BillSeeder
Generates sample bills for demonstration

### TariffSeeder
Sets up default water tariff rates

## Security Features

- **Sanctum Authentication**: Token-based API authentication
- **CORS Configuration**: Properly configured for frontend access
- **Input Validation**: Comprehensive validation for all endpoints
- **SQL Injection Protection**: Eloquent ORM protection
- **Mass Assignment Protection**: Fillable attributes defined
- **Role-based Access**: Middleware for route protection

## Error Handling

### Standard Error Response Format
```json
{
  "message": "Validation failed",
  "errors": {
    "field_name": ["Error message"]
  }
}
```

### HTTP Status Codes
- 200: Success
- 201: Created
- 204: No Content (Delete)
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 422: Validation Error
- 500: Server Error

## Performance Optimizations

- **Eager Loading**: Relationships loaded efficiently
- **Database Indexing**: Optimized query performance
- **Query Optimization**: Reduced N+1 problems
- **Pagination**: Large datasets handled properly

## API Testing

Use tools like Postman or Thunder Client with these example requests:

### Authentication Test
```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'
```

### Protected Route Test
```bash
curl -X GET http://localhost:8000/api/admin/customers \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Development Commands

```bash
# Run migrations
php artisan migrate

# Fresh migration with seeders
php artisan migrate:fresh --seed

# Create new migration
php artisan make:migration create_table_name

# Create new controller
php artisan make:controller ControllerName

# Create new model
php artisan make:model ModelName

# Clear application cache
php artisan cache:clear
php artisan config:clear
php artisan route:clear
```

## Contributing

1. Follow PSR-12 coding standards
2. Write comprehensive tests
3. Document API changes
4. Use meaningful commit messages
5. Update documentation as needed

## Code of Conduct

In order to ensure that the Laravel community is welcoming to all, please review and abide by the [Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct).

## Security Vulnerabilities

If you discover a security vulnerability within Laravel, please send an e-mail to Taylor Otwell via [taylor@laravel.com](mailto:taylor@laravel.com). All security vulnerabilities will be promptly addressed.

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
